"""
Step 4 — Retriever Module

Uses ChromaDB to retrieve the top-k most relevant disease documents
for a given query string.
"""

from rag2.config import TOP_K
from rag2.embedding_store import get_collection, embed_query
from rag2.knowledge_loader import load_disease_database


_disease_db_cache = None


def _get_disease_db() -> dict:
    global _disease_db_cache
    if _disease_db_cache is None:
        _disease_db_cache = load_disease_database()
    return _disease_db_cache


def retrieve(query: str, top_k: int = None) -> list:
    if top_k is None:
        top_k = TOP_K

    collection = get_collection()
    query_embedding = embed_query(query)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "metadatas", "distances"],
    )

    disease_db = _get_disease_db()
    retrieved = []

    for i in range(len(results["ids"][0])):
        metadata = results["metadatas"][0][i]
        distance = results["distances"][0][i]
        disease_name = metadata.get("disease", results["ids"][0][i])
        score = round(1.0 - distance, 4)
        disease_data = disease_db.get(disease_name, {})

        retrieved.append({
            "disease": disease_name,
            "symptoms": disease_data.get("symptoms", []),
            "description": disease_data.get("description", ""),
            "precautions": disease_data.get("precautions", []),
            "score": score,
        })

    return retrieved
