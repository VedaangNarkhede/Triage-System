# RAG2 Pipeline — DeepSeek R1 Retrieval Augmented Generation for Clinical Triage
from dotenv import load_dotenv
load_dotenv()

from rag2.rag_pipeline import run_rag_pipeline, initialize_rag

__all__ = ["run_rag_pipeline", "initialize_rag"]
