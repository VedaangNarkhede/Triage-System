"""
RAG2 Pipeline Configuration — DeepSeek R1 via HuggingFace
Centralizes all configurable parameters for the RAG2 system.
"""

import os

# ─── Paths ────────────────────────────────────────────────────────────────────
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(PROJECT_ROOT, "Data")
CHROMA_DB_DIR = os.path.join(PROJECT_ROOT, "rag2", "chroma_db")

# Dataset paths
D1_SYMPTOMS_CSV = os.path.join(DATA_DIR, "d1", "DiseaseAndSymptoms.csv")
D1_PRECAUTIONS_CSV = os.path.join(DATA_DIR, "d1", "Disease precaution.csv")
D2_SYMPTOM2DISEASE_CSV = os.path.join(DATA_DIR, "d2", "Symptom2Disease.csv")
D3_ONEHOT_CSV = os.path.join(DATA_DIR, "d3", "Disease and symptoms dataset.csv")
D4_SYMBIPREDICT_CSV = os.path.join(DATA_DIR, "d4", "symbipredict_2022.csv")
D5_PRECAUTIONS_CSV = os.path.join(DATA_DIR, "d5", "diseases_with_precautions.csv")

# ─── Embedding ────────────────────────────────────────────────────────────────
EMBEDDING_MODEL = os.getenv("RAG_EMBEDDING_MODEL", "BAAI/bge-small-en-v1.5")
CHROMA_COLLECTION_NAME = "disease_knowledge_r1"

# ─── Retrieval ────────────────────────────────────────────────────────────────
TOP_K = int(os.getenv("RAG_TOP_K", "3"))

# ─── LLM (Qwen via HuggingFace) ────────────────────────────────────────────────
HF_TOKEN = os.getenv("HF_TOKEN")
HF_MODEL_ID = "Qwen/Qwen2.5-32B-Instruct"  # Switched from DeepSeek R1 to Qwen
LLM_MAX_TOKENS = int(os.getenv("RAG_LLM_MAX_TOKENS", "2048"))
LLM_TEMPERATURE = float(os.getenv("RAG_LLM_TEMPERATURE", "0.3"))

# ─── Reasoning Agent ─────────────────────────────────────────────────────────
CONFIDENCE_THRESHOLD = float(os.getenv("RAG_CONFIDENCE_THRESHOLD", "0.7"))
MAX_REASONING_ITERATIONS = int(os.getenv("RAG_MAX_ITERATIONS", "3"))
