"""
Step 2 — Embedding Generation & ChromaDB Storage

Embeds disease documents using SentenceTransformers and stores them
in a local ChromaDB persistent collection for fast retrieval.
"""

import os
import hashlib
import json

import chromadb
from sentence_transformers import SentenceTransformer

from rag2.config import EMBEDDING_MODEL, CHROMA_DB_DIR, CHROMA_COLLECTION_NAME
from rag2.knowledge_loader import load_disease_database, disease_to_document


_model_cache = {}


def _get_embedding_model() -> SentenceTransformer:
    if EMBEDDING_MODEL not in _model_cache:
        # print(f"[EmbeddingStore] Loading embedding model: {EMBEDDING_MODEL}")
        _model_cache[EMBEDDING_MODEL] = SentenceTransformer(EMBEDDING_MODEL)
    return _model_cache[EMBEDDING_MODEL]


def _get_chroma_client() -> chromadb.PersistentClient:
    os.makedirs(CHROMA_DB_DIR, exist_ok=True)
    return chromadb.PersistentClient(path=CHROMA_DB_DIR)


def _compute_data_hash(disease_db: dict) -> str:
    serialized = json.dumps(disease_db, sort_keys=True)
    return hashlib.md5(serialized.encode()).hexdigest()


def build_index(force_rebuild: bool = False) -> chromadb.Collection:
    client = _get_chroma_client()
    model = _get_embedding_model()
    disease_db = load_disease_database()
    data_hash = _compute_data_hash(disease_db)

    hash_file = os.path.join(CHROMA_DB_DIR, "data_hash.txt")
    if not force_rebuild and os.path.isfile(hash_file):
        with open(hash_file, "r") as f:
            stored_hash = f.read().strip()
        if stored_hash == data_hash:
            try:
                collection = client.get_collection(name=CHROMA_COLLECTION_NAME)
                if collection.count() > 0:
                    # print(f"[EmbeddingStore] Using cached index ({collection.count()} docs).")
                    return collection
            except Exception:
                pass

    try:
        client.delete_collection(name=CHROMA_COLLECTION_NAME)
    except Exception:
        pass

    print(f"[EmbeddingStore] Building index for {len(disease_db)} diseases...")

    ids = []
    documents = []
    metadatas = []

    for disease_name, disease_data in disease_db.items():
        doc_text = disease_to_document(disease_name, disease_data)
        doc_id = disease_name.lower().replace(" ", "_").replace("/", "_")
        ids.append(doc_id)
        documents.append(doc_text)
        metadatas.append({
            "disease": disease_name,
            "symptom_count": len(disease_data.get("symptoms", [])),
            "has_description": bool(disease_data.get("description")),
            "has_precautions": bool(disease_data.get("precautions")),
        })

    print("[EmbeddingStore] Generating embeddings...")
    embeddings = model.encode(documents, show_progress_bar=True, batch_size=32)
    embeddings_list = [emb.tolist() for emb in embeddings]

    collection = client.create_collection(
        name=CHROMA_COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )

    batch_size = 500
    for i in range(0, len(ids), batch_size):
        end = min(i + batch_size, len(ids))
        collection.add(
            ids=ids[i:end],
            embeddings=embeddings_list[i:end],
            documents=documents[i:end],
            metadatas=metadatas[i:end],
        )

    with open(hash_file, "w") as f:
        f.write(data_hash)

    print(f"[EmbeddingStore] Index built with {collection.count()} documents.")
    return collection


def get_collection() -> chromadb.Collection:
    client = _get_chroma_client()
    try:
        collection = client.get_collection(name=CHROMA_COLLECTION_NAME)
        if collection.count() > 0:
            return collection
    except Exception:
        pass
    return build_index()


def embed_query(query: str) -> list:
    model = _get_embedding_model()
    embedding = model.encode(query)
    return embedding.tolist()
