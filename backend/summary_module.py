"""
Step 8 — Summary Generator Module
Converts unstructured patient input into a structured clinical summary.
Uses Ollama's Meditron model for medical summarization.
Focus: Extraction and organization, NOT diagnosis.
"""

import json
import sys
import requests


from huggingface_hub import InferenceClient

# Hugging Face Inference API
HF_MODEL = "Qwen/Qwen2.5-32B-Instruct"
HF_TOKEN = "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"

# Initialize Client
hf_client = InferenceClient(api_key=HF_TOKEN)

def _call_qwen(system_msg: str, user_msg: str) -> str:
    """Call Qwen2.5-32B-Instruct via Hugging Face Inference Client."""
    print(f"[Summary] Calling Hugging Face API ({HF_MODEL}) for summarization...")

    messages = [
        {"role": "system", "content": system_msg},
        {"role": "user", "content": user_msg}
    ]

    try:
        response = hf_client.chat.completions.create(
            model=HF_MODEL,
            messages=messages,
            max_tokens=300,
            temperature=0.3
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"[Summary] ERROR: Hugging Face API call failed: {e}")
        return "Summary unavailable — API error."


def generate_summary(text: str, features: dict, urgency: dict) -> dict:
    """
    Generate a structured clinical summary from unstructured patient input.

    Args:
        text: Cleaned clinical text.
        features: dict with symptoms, severity, body_parts, duration, onset.
        urgency: dict with urgency level and confidence.

    Returns:
        dict with:
            - "summary": Meditron-generated clinical summary
            - "structured_data": deterministic structured extraction
    """
    # Build structured data
    symptoms_list = features.get("symptoms", [])
    symptoms_str = ", ".join(symptoms_list) or "none identified"
    severity_str = features.get("severity", "") or "not specified"
    duration_str = features.get("duration", "") or "not mentioned"
    onset_str = features.get("onset", "") or "not mentioned"
    body_parts = features.get("body_parts", [])
    body_parts_str = ", ".join(body_parts) or "not specified"
    concerns = features.get("patient_concerns", [])
    urgency_level = urgency.get("urgency", "UNKNOWN")

    # Build deterministic structured output
    structured_data = _build_structured_output(
        symptoms_list, severity_str, duration_str, onset_str,
        body_parts, concerns, urgency
    )

    # Prepare context for Qwen
    system_msg = (
        "You are a professional clinical scribe. Your job is to write a single, perfectly formatted "
        "paragraph summarizing the patient's encounter based exactly on the provided structured triage data. "
        "Do NOT diagnose. Do NOT suggest treatments. Do NOT hallucinate data not present in the input. "
        "Just summarize the symptoms, severity, duration, onset, and triage level into 3-5 clear sentences."
    )

    user_msg = json.dumps(structured_data, indent=2)

    summary = _call_qwen(system_msg, user_msg)

    return {
        "summary": summary,
        "structured_data": structured_data
    }


def _build_structured_output(symptoms, severity, duration, onset,
                              body_parts, concerns, urgency):
    """Build a compact, human-readable structured extraction."""
    return {
        "symptoms": symptoms if symptoms else [],
        "body_parts": body_parts if body_parts else [],
        "severity": severity,
        "duration": duration,
        "onset": onset,
        "patient_concerns": concerns if concerns else [],
        "triage": {
            "level": urgency.get("urgency", "UNKNOWN"),
            "confidence": urgency.get("confidence", 0),
            "reasons": urgency.get("reasons", []),
        },
    }


if __name__ == "__main__":
    test_text = "my tummy feels weird and hurts sometimes. my head also hurts when i look at light. i feel very sleepy. my body felt hot. my throat feels scratchy when i swallow. i want to cough but it doesnt come out. i didnt want to eat breakfast."
    test_features = {
        "symptoms": ["abdominal discomfort", "headache", "photophobia", "fever", "sore throat", "cough", "fatigue", "loss of appetite", "malaise"],
        "severity": "",
        "body_parts": ["abdomen", "head", "throat"],
        "duration": "",
        "onset": "yesterday",
        "patient_concerns": ["my tummy feels weird", "my head also hurts", "i feel very sleepy", "my throat feels scratchy"]
    }
    test_urgency = {"urgency": "MEDIUM", "confidence": 0.65, "reasons": ["Multiple symptoms present (9)"]}

    result = generate_summary(test_text, test_features, test_urgency)
    print(f"SUMMARY:\n{result['summary']}\n")
    print(f"STRUCTURED DATA:\n{json.dumps(result['structured_data'], indent=2)}")
