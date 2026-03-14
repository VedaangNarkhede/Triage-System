"""
Step 7 — RAG2 Pipeline Orchestrator (DeepSeek R1)

Connects all RAG2 modules into a single pipeline:
    Query Builder → Retriever → Evidence Builder → Reasoning Agent → Diagnosis
"""

import time

from rag2.query_builder import build_query
from rag2.retriever import retrieve
from rag2.evidence_builder import build_evidence, extract_patient_symptoms
from rag2.reasoning_agent import run_reasoning_agent
from rag2.embedding_store import build_index


def initialize_rag(force_rebuild: bool = False):
    # print("[RAG2] Initializing RAG2 pipeline (DeepSeek R1)...")
    build_index(force_rebuild=force_rebuild)
    # print("[RAG2] Initialization complete.")


def run_rag_pipeline(summary_output, top_k: int = None) -> dict:
    start_time = time.time()

    # Step 1: Build query
    # print("[RAG2] Step 1: Building query from summary...")
    query = build_query(summary_output)
    # print(f"[RAG2]   Query: {query[:120]}{'...' if len(query) > 120 else ''}")

    # Step 2: Retrieve diseases
    # print("[RAG2] Step 2: Retrieving from ChromaDB...")
    retrieved_diseases = retrieve(query, top_k=top_k)
    # print(f"[RAG2]   Retrieved {len(retrieved_diseases)} diseases.")
    # for i, d in enumerate(retrieved_diseases[:3], 1):
    #     print(f"[RAG2]     {i}. {d['disease']} (score: {d['score']:.3f})")

    # Step 3: Extract patient symptoms and context
    # print("[RAG2] Step 3: Extracting patient context...")
    patient_symptoms, patient_context = extract_patient_symptoms(summary_output)
    if not patient_symptoms:
        patient_symptoms = [s.strip() for s in query.replace("symptoms:", "").split()
                          if len(s.strip()) > 2]
    # print(f"[RAG2]   Symptoms: {patient_symptoms[:10]}...")

    # Step 4: Build evidence context
    # print("[RAG2] Step 4: Building evidence context...")
    evidence_context = build_evidence(patient_symptoms, retrieved_diseases, patient_context)

    # Step 5: Run reasoning agent (DeepSeek R1)
    # print("[RAG2] Step 5: Running DeepSeek R1 reasoning agent...")
    reasoning_result = run_reasoning_agent(
        symptoms=patient_symptoms,
        candidate_diseases=retrieved_diseases,
        evidence_context=evidence_context,
    )

    elapsed = round(time.time() - start_time, 2)
    print(f"[RAG2] Pipeline complete in {elapsed}s.")

    return {
        "query": query,
        "retrieved_diseases": retrieved_diseases,
        "evidence_context": evidence_context,
        "diagnosis_suggestions": reasoning_result.get("diagnosis_suggestions", []),
        "confidence": reasoning_result.get("confidence", 0.0),
        "followup_questions": reasoning_result.get("followup_questions", []),
        "reasoning_steps": reasoning_result.get("reasoning_steps", []),
        "processing_time_seconds": elapsed,
    }
