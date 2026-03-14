"""
Step 1 — Knowledge Base Loader

Loads CSV datasets from Data/d1–d5, normalizes symptom names,
and merges into a unified disease knowledge base.
"""

import csv
import os
import re
from collections import defaultdict

from rag2.config import (
    D1_SYMPTOMS_CSV,
    D1_PRECAUTIONS_CSV,
    D2_SYMPTOM2DISEASE_CSV,
    D3_ONEHOT_CSV,
    D4_SYMBIPREDICT_CSV,
    D5_PRECAUTIONS_CSV,
)


def _normalize_symptom(symptom: str) -> str:
    s = symptom.strip().lower()
    s = s.replace("_", " ")
    s = re.sub(r"\s+", " ", s)
    return s


def _normalize_disease(name: str) -> str:
    return name.strip().title() if name else ""


def _load_d1_symptoms(path: str) -> dict:
    symptoms_map = defaultdict(set)
    if not os.path.isfile(path):
        print(f"[KnowledgeLoader] WARNING: {path} not found, skipping.")
        return symptoms_map
    with open(path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            disease = _normalize_disease(row.get("Disease", ""))
            if not disease:
                continue
            for key, val in row.items():
                if key.startswith("Symptom") and val and val.strip():
                    sym = _normalize_symptom(val)
                    if sym:
                        symptoms_map[disease].add(sym)
    return symptoms_map


def _load_d1_precautions(path: str) -> dict:
    precaution_map = defaultdict(list)
    if not os.path.isfile(path):
        print(f"[KnowledgeLoader] WARNING: {path} not found, skipping.")
        return precaution_map
    with open(path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            disease = _normalize_disease(row.get("Disease", ""))
            if not disease:
                continue
            for key, val in row.items():
                if key.startswith("Precaution") and val and val.strip():
                    precaution_map[disease].append(val.strip())
    return precaution_map


def _load_d2_descriptions(path: str) -> dict:
    desc_map = defaultdict(list)
    if not os.path.isfile(path):
        print(f"[KnowledgeLoader] WARNING: {path} not found, skipping.")
        return desc_map
    with open(path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            disease = _normalize_disease(row.get("label", ""))
            text = (row.get("text", "") or "").strip()
            if disease and text:
                desc_map[disease].append(text)
    return desc_map


def _load_d3_onehot(path: str) -> dict:
    symptoms_map = defaultdict(set)
    if not os.path.isfile(path):
        print(f"[KnowledgeLoader] WARNING: {path} not found, skipping.")
        return symptoms_map
    with open(path, "r", encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        header = next(reader)
        symptom_names = header[:-1]
        disease_col_idx = len(header) - 1
        for row in reader:
            if len(row) <= disease_col_idx:
                continue
            disease = _normalize_disease(row[disease_col_idx])
            if not disease:
                continue
            for i, val in enumerate(row[:-1]):
                if val.strip() == "1":
                    sym = _normalize_symptom(symptom_names[i])
                    if sym:
                        symptoms_map[disease].add(sym)
    return symptoms_map


def _load_d4_symbipredict(path: str) -> dict:
    symptoms_map = defaultdict(set)
    if not os.path.isfile(path):
        print(f"[KnowledgeLoader] WARNING: {path} not found, skipping.")
        return symptoms_map
    with open(path, "r", encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        header = next(reader)
        symptom_names = header[:-1]
        disease_col_idx = len(header) - 1
        for row in reader:
            if len(row) <= disease_col_idx:
                continue
            disease = _normalize_disease(row[disease_col_idx])
            if not disease:
                continue
            for i, val in enumerate(row[:-1]):
                if val.strip() == "1":
                    sym = _normalize_symptom(symptom_names[i])
                    if sym:
                        symptoms_map[disease].add(sym)
    return symptoms_map


def load_disease_database() -> dict:
    # print("[KnowledgeLoader] Loading datasets...")

    d1_symptoms = _load_d1_symptoms(D1_SYMPTOMS_CSV)
    d1_precautions = _load_d1_precautions(D1_PRECAUTIONS_CSV)
    d2_descriptions = _load_d2_descriptions(D2_SYMPTOM2DISEASE_CSV)
    d3_symptoms = _load_d3_onehot(D3_ONEHOT_CSV)
    d4_symptoms = _load_d4_symbipredict(D4_SYMBIPREDICT_CSV)
    d5_precautions = _load_d1_precautions(D5_PRECAUTIONS_CSV)

    all_diseases = set()
    all_diseases.update(d1_symptoms.keys())
    all_diseases.update(d1_precautions.keys())
    all_diseases.update(d2_descriptions.keys())
    all_diseases.update(d3_symptoms.keys())
    all_diseases.update(d4_symptoms.keys())
    all_diseases.update(d5_precautions.keys())

    disease_database = {}
    for disease in sorted(all_diseases):
        combined_symptoms = set()
        combined_symptoms.update(d1_symptoms.get(disease, set()))
        combined_symptoms.update(d3_symptoms.get(disease, set()))
        combined_symptoms.update(d4_symptoms.get(disease, set()))

        descriptions = d2_descriptions.get(disease, [])
        description = descriptions[0] if descriptions else ""

        precautions_set = set()
        for p in d1_precautions.get(disease, []):
            if p and p.lower() not in ("not specified", "none"):
                precautions_set.add(p)
        for p in d5_precautions.get(disease, []):
            if p and p.lower() not in ("not specified", "none"):
                precautions_set.add(p)
        precautions = sorted(list(precautions_set))

        disease_database[disease] = {
            "symptoms": sorted(combined_symptoms),
            "description": description,
            "precautions": precautions,
        }

    print(f"[KnowledgeLoader] Loaded {len(disease_database)} diseases.")
    return disease_database


def disease_to_document(disease_name: str, disease_data: dict) -> str:
    parts = [f"Disease: {disease_name}"]
    if disease_data.get("symptoms"):
        parts.append(f"Symptoms: {', '.join(disease_data['symptoms'])}")
    if disease_data.get("description"):
        parts.append(f"Description: {disease_data['description']}")
    if disease_data.get("precautions"):
        parts.append(f"Precautions: {', '.join(disease_data['precautions'])}")
    return "\n".join(parts)
