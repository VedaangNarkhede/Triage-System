"""
Step 6 — LangGraph Reasoning Agent (DeepSeek R1 via HuggingFace)

Performs differential diagnosis using a LangGraph stateful agent with
the DeepSeek R1 model via HuggingFace Inference API.
"""

import json
import re
import traceback
from typing import TypedDict

from langgraph.graph import StateGraph, END
from huggingface_hub import InferenceClient

from rag2.config import (
    HF_TOKEN,
    HF_MODEL_ID,
    LLM_MAX_TOKENS,
    LLM_TEMPERATURE,
    CONFIDENCE_THRESHOLD,
    MAX_REASONING_ITERATIONS,
)


# ─── State Definition ────────────────────────────────────────────────────────

class TriageState(TypedDict):
    symptoms: list[str]
    candidate_diseases: list[dict]
    evidence_context: str
    followup_questions: list[str]
    confidence: float
    diagnosis_suggestions: list[dict]
    reasoning_steps: list[str]
    iteration: int


# ─── LLM Interface ───────────────────────────────────────────────────────────

_client = None


def _get_client() -> InferenceClient:
    """Lazy-initialize the HuggingFace InferenceClient."""
    global _client
    if _client is None:
        _client = InferenceClient(token=HF_TOKEN)
    return _client


def _call_llm(prompt: str) -> str:
    """
    Call DeepSeek R1 via HuggingFace Inference API (chat completion).
    Returns the generated text response.
    """
    try:
        client = _get_client()
        messages = [
            {"role": "system", "content": "You are a medical triage expert. Always respond with valid JSON only. No markdown, no explanations outside of the JSON block."},
            {"role": "user", "content": prompt},
        ]
        response = client.chat_completion(
            messages=messages,
            model=HF_MODEL_ID,
            max_tokens=LLM_MAX_TOKENS,
            temperature=LLM_TEMPERATURE,
        )
        # Extract the assistant's message content
        content = response.choices[0].message.content
        return content if content else ""
    except Exception as e:
        print(f"[R1-Agent] LLM call failed: {e}")
        traceback.print_exc()
        return ""


def _parse_json_from_response(text: str, default=None):
    """Try to extract JSON from the LLM response text."""
    if not text:
        return default

    # 1. Try direct parse
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass

    # 2. Try markdown code blocks
    markdown_match = re.search(r'```(?:json)?\s*(\{.*\}|\[.*\])\s*```', text, re.DOTALL)
    if markdown_match:
        try:
            return json.loads(markdown_match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # 3. Try outermost JSON object
    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass

    # 4. Try outermost JSON array
    arr_match = re.search(r'\[.*\]', text, re.DOTALL)
    if arr_match:
        try:
            return json.loads(arr_match.group())
        except json.JSONDecodeError:
            pass

    return default


# ─── Graph Nodes ──────────────────────────────────────────────────────────────

def retrieval_node(state: TriageState) -> dict:
    """Node 1: Validate retrieved data."""
    candidates = state.get("candidate_diseases", [])
    reasoning_steps = state.get("reasoning_steps", [])
    reasoning_steps.append(
        f"Retrieved {len(candidates)} candidate diseases from knowledge base."
    )
    return {
        "reasoning_steps": reasoning_steps,
        "iteration": state.get("iteration", 0),
    }


def hypothesis_generator(state: TriageState) -> dict:
    """
    Node 2: Generate diagnostic hypotheses using DeepSeek R1.
    DeepSeek R1 excels at chain-of-thought reasoning, so we ask it
    to think step-by-step and output structured JSON.
    """
    evidence = state.get("evidence_context", "")

    prompt = f"""You are an expert medical triage assistant performing differential diagnosis.

Based on the following clinical evidence, analyze the patient's symptoms and the candidate diseases retrieved from our knowledge base. Analyze why each of the top 3 candidate diseases might or might not match the patient's condition.

CLINICAL EVIDENCE:
{evidence}

TASK: Provide your analysis as a JSON object with the following structure. You MUST output valid JSON only.

{{
    "hypotheses": [
        {{
            "disease": "disease name from candidates",
            "likelihood": "high or medium or low",
            "supporting_symptoms": ["matching symptom 1", "matching symptom 2"],
            "precautions": ["precaution 1", "precaution 2"],
            "reasoning": "A detailed 2-3 sentence explanation of why this disease matches the patient's exact words and symptoms. Reference the patient's specific descriptions."
        }}
    ],
    "initial_confidence": 0.6
}}

RULES:
1. You MUST include EXACTLY the top 3 diseases from the candidate list provided in the evidence.
2. For each disease, copy the precautions directly from the candidate data.
3. Reasoning must reference the patient's EXACT words.
4. Output ONLY the JSON — no markdown, no explanations."""

    response = _call_llm(prompt)

    # Clean response (remove markdown or thinking tags)
    clean_response = re.sub(r'<think>.*?</think>', '', response, flags=re.DOTALL).strip()
    clean_response = re.sub(r'```json\s*', '', clean_response)
    clean_response = re.sub(r'\s*```', '', clean_response)
    
    parsed = _parse_json_from_response(clean_response)

    reasoning_steps = state.get("reasoning_steps", [])
    diagnosis_suggestions = state.get("diagnosis_suggestions", [])

    if parsed and isinstance(parsed, dict) and "hypotheses" in parsed:
        hypotheses = parsed["hypotheses"]
        confidence = float(parsed.get("initial_confidence", 0.5))
        reasoning_steps.append(
            f"DeepSeek R1 generated {len(hypotheses)} hypotheses with confidence {confidence:.2f}."
        )
        for h in hypotheses:
            diagnosis_suggestions.append({
                "disease": h.get("disease", ""),
                "likelihood": h.get("likelihood", "unknown"),
                "supporting_symptoms": h.get("supporting_symptoms", []),
                "precautions": h.get("precautions", []),
                "reasoning": h.get("reasoning", ""),
            })
    else:
        # Fallback: use retrieved diseases directly
        confidence = 0.3
        candidates = state.get("candidate_diseases", [])
        reasoning_steps.append(
            f"R1 parsing failed, using retrieval scores for {len(candidates)} candidates."
        )
        for c in candidates:
            likelihood = "high" if c.get("score", 0) > 0.7 else (
                "medium" if c.get("score", 0) > 0.5 else "low"
            )
            diagnosis_suggestions.append({
                "disease": c.get("disease", ""),
                "likelihood": likelihood,
                "supporting_symptoms": c.get("symptoms", [])[:5],
                "precautions": c.get("precautions", []),
                "reasoning": f"Retrieval score: {c.get('score', 0):.2f}",
            })

    return {
        "diagnosis_suggestions": diagnosis_suggestions,
        "confidence": confidence,
        "reasoning_steps": reasoning_steps,
    }


def reasoning_node(state: TriageState) -> dict:
    """
    Node 3: Deep reasoning — refine diagnoses with differential analysis.
    """
    evidence = state.get("evidence_context", "")
    suggestions = state.get("diagnosis_suggestions", [])
    iteration = state.get("iteration", 0)

    hypo_text = "\n".join(
        f"- {s.get('disease', 'Unknown')} ({s.get('likelihood', '?')}): {s.get('reasoning', '')[:150]}"
        for s in suggestions
    )

    prompt = f"""You are a medical reasoning system performing differential diagnosis refinement.

PATIENT EVIDENCE:
{evidence}

CURRENT HYPOTHESES (iteration {iteration + 1}):
{hypo_text}

TASK: Refine the diagnosis. For each of the 3 diseases, evaluate:
1. How consistent the symptoms are with the patient's description.
2. What specific evidence supports or contradicts the diagnosis.
3. What precautions should the patient take.

Output your refined analysis as a JSON object. Output ONLY valid JSON.

{{
    "refined_diagnoses": [
        {{
            "disease": "disease name",
            "likelihood": "high or medium or low",
            "precautions": ["precaution 1", "precaution 2"],
            "reasoning": "Detailed 2-3 sentence explanation comparing this disease against others, referencing the patient's exact words."
        }}
    ],
    "confidence": 0.8,
    "ruled_out": ["disease names that were eliminated and why"],
    "reasoning_summary": "One sentence summary of the differential diagnosis conclusion."
}}

RULES:
1. Include reasoning for ALL 3 of the top diseases.
2. Copy precautions from the evidence data.
3. Set confidence between 0.0 and 1.0.
4. Output ONLY the JSON — no markdown, no explanations."""

    response = _call_llm(prompt)
    clean_response = re.sub(r'<think>.*?</think>', '', response, flags=re.DOTALL).strip()
    clean_response = re.sub(r'```json\s*', '', clean_response)
    clean_response = re.sub(r'\s*```', '', clean_response)
    
    parsed = _parse_json_from_response(clean_response)

    reasoning_steps = state.get("reasoning_steps", [])

    if parsed and isinstance(parsed, dict) and parsed.get("refined_diagnoses"):
        confidence = float(parsed.get("confidence", state.get("confidence", 0.5)))
        reasoning_summary = parsed.get("reasoning_summary", "")
        reasoning_steps.append(
            f"Iteration {iteration + 1}: Confidence = {confidence:.2f}. {reasoning_summary}"
        )

        new_suggestions = []
        for r in parsed["refined_diagnoses"]:
            new_suggestions.append({
                "disease": r.get("disease", ""),
                "likelihood": r.get("likelihood", "unknown"),
                "supporting_symptoms": [],
                "precautions": r.get("precautions", []),
                "reasoning": r.get("reasoning", ""),
            })
        return {
            "diagnosis_suggestions": new_suggestions,
            "confidence": confidence,
            "reasoning_steps": reasoning_steps,
            "iteration": iteration + 1,
        }
    else:
        confidence = min(state.get("confidence", 0.3) + 0.15, 0.85)
        reasoning_steps.append(
            f"Iteration {iteration + 1}: Rule-based refinement, confidence = {confidence:.2f}."
        )

    return {
        "confidence": confidence,
        "reasoning_steps": reasoning_steps,
        "iteration": iteration + 1,
    }


def gap_detector(state: TriageState) -> dict:
    """
    Node 4: Detect information gaps and generate follow-up questions.
    """
    symptoms = state.get("symptoms", [])
    suggestions = state.get("diagnosis_suggestions", [])

    symptom_str = ', '.join(symptoms[:10]) if symptoms else 'not specified'
    disease_str = ', '.join(s.get('disease', '') for s in suggestions[:5])

    prompt = f"""You are a clinical information gap detector.

Patient symptoms: {symptom_str}
Candidate diagnoses: {disease_str}

What critical information is missing that would help narrow down the diagnosis?
Generate 3-5 specific clinical questions a doctor should ask the patient.

Output as JSON only — no other text:
{{
    "information_gaps": ["gap 1", "gap 2"],
    "suggested_questions": [
        "Specific clinical question 1?",
        "Specific clinical question 2?"
    ],
    "confidence_impact": "description of how these answers would change confidence"
}}"""

    response = _call_llm(prompt)
    clean_response = re.sub(r'<think>.*?</think>', '', response, flags=re.DOTALL).strip()
    parsed = _parse_json_from_response(clean_response)

    followup_questions = state.get("followup_questions", [])

    if parsed and isinstance(parsed, dict):
        new_questions = parsed.get("suggested_questions", [])
        followup_questions.extend(new_questions)
    else:
        if not followup_questions:
            followup_questions.extend([
                "Do you have any history of heart disease or hypertension?",
                "Are you currently taking any medications?",
                "Have you had any recent travel or exposure to illness?",
                "Is there a family history of cardiovascular disease?",
            ])

    return {"followup_questions": followup_questions}


def question_generator(state: TriageState) -> dict:
    """Node 5: Deduplicate and limit follow-up questions."""
    questions = state.get("followup_questions", [])
    seen = set()
    unique = []
    for q in questions:
        q_lower = q.lower().strip()
        if q_lower not in seen and len(q_lower) > 5:
            seen.add(q_lower)
            unique.append(q)
    return {"followup_questions": unique[:5]}


def final_response_node(state: TriageState) -> dict:
    """Node 6: Assemble the final diagnosis response."""
    suggestions = state.get("diagnosis_suggestions", [])
    confidence = state.get("confidence", 0.0)
    reasoning_steps = state.get("reasoning_steps", [])

    likelihood_rank = {"high": 3, "medium": 2, "low": 1, "unknown": 0}
    suggestions.sort(
        key=lambda x: likelihood_rank.get(x.get("likelihood", "unknown"), 0),
        reverse=True,
    )

    reasoning_steps.append(
        f"Final diagnosis output: {len(suggestions)} suggestions, "
        f"confidence = {confidence:.2f}."
    )

    return {
        "diagnosis_suggestions": suggestions,
        "reasoning_steps": reasoning_steps,
    }


# ─── Graph Routing ───────────────────────────────────────────────────────────

def _should_continue_reasoning(state: TriageState) -> str:
    confidence = state.get("confidence", 0.0)
    iteration = state.get("iteration", 0)
    if confidence >= CONFIDENCE_THRESHOLD:
        return "confident"
    if iteration >= MAX_REASONING_ITERATIONS:
        return "max_iterations"
    return "continue"


# ─── Graph Builder ───────────────────────────────────────────────────────────

def build_reasoning_graph() -> StateGraph:
    graph = StateGraph(TriageState)

    graph.add_node("retrieval", retrieval_node)
    graph.add_node("hypothesis", hypothesis_generator)
    graph.add_node("reasoning", reasoning_node)
    graph.add_node("gap_detector", gap_detector)
    graph.add_node("question_generator", question_generator)
    graph.add_node("final_response", final_response_node)

    graph.set_entry_point("retrieval")
    graph.add_edge("retrieval", "hypothesis")
    graph.add_edge("hypothesis", "reasoning")

    graph.add_conditional_edges(
        "reasoning",
        _should_continue_reasoning,
        {
            "continue": "gap_detector",
            "confident": "final_response",
            "max_iterations": "gap_detector",
        },
    )
    graph.add_edge("gap_detector", "question_generator")

    graph.add_conditional_edges(
        "question_generator",
        lambda state: (
            "final" if state.get("iteration", 0) >= MAX_REASONING_ITERATIONS
            else "loop"
        ),
        {
            "final": "final_response",
            "loop": "reasoning",
        },
    )

    graph.add_edge("final_response", END)
    return graph.compile()


def run_reasoning_agent(
    symptoms: list,
    candidate_diseases: list,
    evidence_context: str,
) -> dict:
    """
    Run the full DeepSeek R1 reasoning agent.
    """
    # print("[R1-Agent] Starting DeepSeek R1 LangGraph reasoning...")

    app = build_reasoning_graph()

    initial_state: TriageState = {
        "symptoms": symptoms,
        "candidate_diseases": candidate_diseases,
        "evidence_context": evidence_context,
        "followup_questions": [],
        "confidence": 0.0,
        "diagnosis_suggestions": [],
        "reasoning_steps": [],
        "iteration": 0,
    }

    final_state = app.invoke(initial_state)

    print(f"[R1-Agent] Complete. Confidence: {final_state.get('confidence', 0):.2f}, "
          f"Iterations: {final_state.get('iteration', 0)}")

    return {
        "diagnosis_suggestions": final_state.get("diagnosis_suggestions", []),
        "confidence": final_state.get("confidence", 0.0),
        "followup_questions": final_state.get("followup_questions", []),
        "reasoning_steps": final_state.get("reasoning_steps", []),
    }
