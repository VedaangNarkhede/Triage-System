"""
Differential Diagnosis Module
Maps symptom combinations to possible medical conditions with likelihood indicators.
Rule-based for the prototype; could be replaced with ML/RAG later.
"""

import json
import sys

# Each condition has: name, matching symptoms (need at least N), supporting symptoms, likelihood weight
CONDITION_RULES = [
    {
        "condition": "Upper Respiratory Tract Infection (URTI) / Common Cold",
        "primary_symptoms": ["sore throat", "cough", "congestion"],
        "supporting_symptoms": ["fever", "fatigue", "headache", "malaise", "body aches", "chills"],
        "min_primary": 1,
        "min_total": 2,
        "description": "Viral infection of the upper respiratory tract. Common in children and adults. Usually self-limiting."
    },
    {
        "condition": "Viral Pharyngitis / Tonsillitis",
        "primary_symptoms": ["sore throat", "fever"],
        "supporting_symptoms": ["loss of appetite", "fatigue", "headache", "malaise", "abdominal pain"],
        "min_primary": 1,
        "min_total": 3,
        "description": "Inflammation of the throat, often viral. Presents with sore throat, fever, and difficulty swallowing."
    },
    {
        "condition": "Influenza (Flu)",
        "primary_symptoms": ["fever", "body aches", "fatigue"],
        "supporting_symptoms": ["cough", "sore throat", "headache", "chills", "loss of appetite", "malaise", "congestion"],
        "min_primary": 2,
        "min_total": 3,
        "description": "Systemic viral infection with sudden onset of fever, body aches, and respiratory symptoms."
    },
    {
        "condition": "Gastroenteritis (Stomach Flu)",
        "primary_symptoms": ["abdominal pain", "nausea", "vomiting", "diarrhea"],
        "supporting_symptoms": ["fever", "fatigue", "loss of appetite", "malaise", "chills", "body aches"],
        "min_primary": 1,
        "min_total": 2,
        "description": "Infection of the GI tract causing stomach pain, nausea/vomiting, and/or diarrhea."
    },
    {
        "condition": "Acute Coronary Syndrome (ACS)",
        "primary_symptoms": ["chest pain", "shortness of breath"],
        "supporting_symptoms": ["nausea", "dizziness", "numbness", "fatigue", "palpitations"],
        "min_primary": 1,
        "min_total": 2,
        "description": "Potential cardiac event. Requires immediate medical evaluation."
    },
    {
        "condition": "Migraine",
        "primary_symptoms": ["headache", "photophobia"],
        "supporting_symptoms": ["nausea", "dizziness", "fatigue", "malaise"],
        "min_primary": 1,
        "min_total": 2,
        "description": "Neurological condition causing severe headaches, often with sensitivity to light and nausea."
    },
    {
        "condition": "Pneumonia",
        "primary_symptoms": ["cough", "fever", "shortness of breath"],
        "supporting_symptoms": ["chest pain", "fatigue", "chills", "body aches", "wheezing"],
        "min_primary": 2,
        "min_total": 3,
        "description": "Lung infection causing cough, fever, and breathing difficulty. May require antibiotics."
    },
    {
        "condition": "Strep Throat (Bacterial Pharyngitis)",
        "primary_symptoms": ["sore throat", "fever"],
        "supporting_symptoms": ["headache", "loss of appetite", "abdominal pain", "fatigue", "malaise"],
        "min_primary": 2,
        "min_total": 3,
        "description": "Bacterial throat infection requiring antibiotic treatment. More common in children."
    },
    {
        "condition": "Viral Fever / Non-specific Viral Illness",
        "primary_symptoms": ["fever", "fatigue", "malaise"],
        "supporting_symptoms": ["headache", "body aches", "loss of appetite", "chills", "sore throat"],
        "min_primary": 1,
        "min_total": 2,
        "description": "General viral infection presenting with fever, fatigue, and body aches. Usually self-limiting."
    },
    {
        "condition": "Urinary Tract Infection (UTI)",
        "primary_symptoms": ["burning", "abdominal pain"],
        "supporting_symptoms": ["fever", "chills", "nausea", "fatigue"],
        "min_primary": 1,
        "min_total": 2,
        "description": "Bacterial infection of the urinary tract causing burning sensation and abdominal discomfort."
    },
    {
        "condition": "Asthma Exacerbation",
        "primary_symptoms": ["wheezing", "shortness of breath", "cough"],
        "supporting_symptoms": ["chest pain", "fatigue"],
        "min_primary": 2,
        "min_total": 2,
        "description": "Worsening of asthma symptoms with wheezing, difficulty breathing, and cough."
    },
    {
        "condition": "Anxiety / Panic Attack",
        "primary_symptoms": ["anxiety", "palpitations", "shortness of breath"],
        "supporting_symptoms": ["dizziness", "chest pain", "numbness", "tingling", "nausea", "tremor"],
        "min_primary": 1,
        "min_total": 2,
        "description": "Anxiety episode that can mimic cardiac symptoms. Important to rule out physical causes."
    },
    {
        "condition": "Meningitis (requires urgent evaluation)",
        "primary_symptoms": ["headache", "fever", "stiffness"],
        "supporting_symptoms": ["photophobia", "nausea", "confusion", "malaise", "fatigue"],
        "min_primary": 2,
        "min_total": 3,
        "description": "Serious infection of brain/spinal membranes. URGENT if fever + headache + stiff neck + photophobia."
    },
]


def diagnose(features: dict) -> dict:
    """
    Generate differential diagnosis possibilities based on extracted features.

    Args:
        features: dict with symptoms, severity, body_parts, duration, onset

    Returns:
        dict with:
            - "possible_conditions": list of dicts with condition name, match score, description
            - "recommendation": clinical recommendation string
    """
    patient_symptoms = set(s.lower() for s in features.get("symptoms", []))

    if not patient_symptoms:
        return {
            "possible_conditions": [],
            "recommendation": "Insufficient symptom data for differential diagnosis."
        }

    scored = []

    for rule in CONDITION_RULES:
        primary = set(rule["primary_symptoms"])
        supporting = set(rule["supporting_symptoms"])

        primary_matches = patient_symptoms & primary
        supporting_matches = patient_symptoms & supporting
        total_matches = primary_matches | supporting_matches

        if len(primary_matches) >= rule["min_primary"] and len(total_matches) >= rule["min_total"]:
            # Score: primary matches weighted more + supporting matches
            score = len(primary_matches) * 2 + len(supporting_matches)
            total_possible = len(primary) * 2 + len(supporting)
            match_pct = round(score / total_possible * 100) if total_possible > 0 else 0

            scored.append({
                "condition": rule["condition"],
                "match_score": match_pct,
                "matched_symptoms": sorted(list(total_matches)),
                "description": rule["description"]
            })

    # Sort by match score descending
    scored.sort(key=lambda x: x["match_score"], reverse=True)

    # Top 3 most likely
    top_conditions = scored[:3]

    # Generate recommendation
    if not top_conditions:
        recommendation = "Symptoms do not strongly match common clinical patterns. Consider further evaluation."
    elif top_conditions[0]["match_score"] >= 60:
        recommendation = f"Most likely: {top_conditions[0]['condition']}. Recommend clinical evaluation to confirm."
    else:
        conditions_str = ", ".join(c["condition"] for c in top_conditions)
        recommendation = f"Multiple possibilities: {conditions_str}. Further assessment needed to narrow diagnosis."

    return {
        "possible_conditions": top_conditions,
        "recommendation": recommendation
    }


if __name__ == "__main__":
    test_cases = [
        {"symptoms": ["sore throat", "fever", "headache", "fatigue", "loss of appetite", "cough", "malaise", "abdominal pain"], "severity": "mild", "body_parts": ["throat", "head", "abdomen"], "duration": "", "onset": "yesterday"},
        {"symptoms": ["chest pain", "shortness of breath", "nausea"], "severity": "severe", "body_parts": ["chest"], "duration": "2 hours", "onset": "today"},
        {"symptoms": ["headache", "photophobia", "nausea", "dizziness"], "severity": "moderate", "body_parts": ["head"], "duration": "3 days", "onset": ""},
    ]
    for features in test_cases:
        result = diagnose(features)
        print(f"SYMPTOMS: {features['symptoms']}")
        print(f"OUTPUT: {json.dumps(result, indent=2)}")
        print()
