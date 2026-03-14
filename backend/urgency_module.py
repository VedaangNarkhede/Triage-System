"""
Step 7 — Urgency Classifier Module
Rule-based urgency classification with confidence scoring.
"""

import json
import sys

# High-urgency symptoms
HIGH_URGENCY_SYMPTOMS = {
    "chest pain", "chest discomfort", "chest pressure", "shortness of breath",
    "difficulty breathing", "bleeding", "seizure", "fainting", "syncope",
    "palpitations", "numbness", "confusion", "radiating pain", "sweating",
    "diaphoresis"
}

# High-severity words
HIGH_SEVERITY = {
    "severe", "acute", "critical", "intense", "worsening",
    "excruciating", "unbearable", "extreme", "serious"
}

# Medium-severity words
MEDIUM_SEVERITY = {
    "moderate", "persistent", "progressive", "constant",
    "frequent", "throbbing", "sharp"
}


def classify_urgency(features: dict) -> dict:
    """
    Classify urgency level based on extracted features.

    Args:
        features: dict with keys "symptoms", "severity", "body_parts", "duration", "onset"

    Returns:
        dict with keys:
            - "urgency": "HIGH", "MEDIUM", or "LOW"
            - "confidence": float 0-1
            - "reasons": list of strings explaining the classification
    """
    symptoms = set(features.get("symptoms", []))
    severity = features.get("severity", "").lower()
    body_parts = set(features.get("body_parts", []))

    reasons = []
    urgency = "LOW"
    confidence = 0.50

    # Check for high-urgency symptoms
    high_symptom_matches = symptoms & HIGH_URGENCY_SYMPTOMS
    if high_symptom_matches:
        urgency = "HIGH"
        confidence = 0.90
        reasons.append(f"High-urgency symptom(s): {', '.join(high_symptom_matches)}")

    # Check for high severity indicators
    if severity in HIGH_SEVERITY:
        if urgency == "HIGH":
            confidence = min(confidence + 0.05, 0.99)
        else:
            urgency = "HIGH"
            confidence = 0.85
        reasons.append(f"High severity indicator: {severity}")

    # Check for medium severity / multiple symptoms
    if urgency != "HIGH":
        if severity in MEDIUM_SEVERITY:
            urgency = "MEDIUM"
            confidence = 0.70
            reasons.append(f"Moderate severity indicator: {severity}")
        elif len(symptoms) >= 2:
            urgency = "MEDIUM"
            confidence = 0.65
            reasons.append(f"Multiple symptoms present ({len(symptoms)})")
        elif len(symptoms) == 1:
            urgency = "MEDIUM"
            confidence = 0.55
            reasons.append("Single symptom reported")

    # --- CROSS-SYMPTOM LOGIC ---
    # Specific Rule: Chest pain/pressure + autonomic symptoms (sweating, nausea, dizziness) = HIGH
    autonomic_symptoms = {"sweating", "diaphoresis", "nausea", "nauseous", "dizziness", "faint"}
    chest_symptoms = {"chest pain", "chest pressure", "chest discomfort", "radiating pain"}
    
    if (symptoms & chest_symptoms) and (symptoms & autonomic_symptoms):
        if urgency != "HIGH":
            urgency = "HIGH"
            confidence = 0.95
            reasons.append("High-risk combination: Chest symptoms paired with autonomic distress (sweating/nausea/dizziness)")
        else:
            confidence = max(confidence, 0.98)
            reasons.append("Confirmed high-risk cardiovascular presentation")

    # If no symptoms at all
    if not symptoms:
        urgency = "LOW"
        confidence = 0.50
        reasons = ["No clinical symptoms detected"]

    return {
        "urgency": urgency,
        "confidence": round(confidence, 2),
        "reasons": reasons
    }


if __name__ == "__main__":
    test_cases = [
        {"symptoms": ["chest pain", "shortness of breath"], "severity": "severe", "body_parts": ["chest"], "duration": "2 hours", "onset": "today"},
        {"symptoms": ["fever"], "severity": "mild", "body_parts": [], "duration": "2 days", "onset": "yesterday"},
        {"symptoms": ["headache", "dizziness"], "severity": "moderate", "body_parts": ["head"], "duration": "3 days", "onset": ""},
        {"symptoms": [], "severity": "", "body_parts": [], "duration": "", "onset": ""},
    ]
    for features in test_cases:
        result = classify_urgency(features)
        print(f"INPUT:  {json.dumps(features)}")
        print(f"OUTPUT: {json.dumps(result, indent=2)}")
        print()
