"""
Step 6 — Feature Builder Module
Combines NER and temporal extraction outputs into a unified features JSON.
"""

import json
import sys

# Severity priority order (highest first)
SEVERITY_PRIORITY = [
    "critical", "excruciating", "unbearable", "extreme", "severe", "intense",
    "acute", "serious", "worsening", "progressive", "sharp", "terrible",
    "throbbing", "persistent", "constant", "moderate", "frequent",
    "intermittent", "occasional", "dull", "gradual", "mild", "slight"
]


def build_features(ner_result: dict, temporal_result: dict) -> dict:
    """
    Combine NER and temporal extraction into structured features.

    Args:
        ner_result: dict with keys "symptoms", "severity", "body_parts"
        temporal_result: dict with keys "duration", "onset"

    Returns:
        dict with combined features:
            - "symptoms": list of symptoms
            - "severity": highest severity string
            - "body_parts": list of body parts
            - "duration": duration string
            - "onset": onset string
    """
    symptoms = ner_result.get("symptoms", [])
    severity_list = ner_result.get("severity", [])
    body_parts = ner_result.get("body_parts", [])
    duration = temporal_result.get("duration", "")
    onset = temporal_result.get("onset", "")

    # Pick the highest severity
    highest_severity = ""
    for sev in SEVERITY_PRIORITY:
        if sev in severity_list:
            highest_severity = sev
            break
    if not highest_severity and severity_list:
        highest_severity = severity_list[0]

    return {
        "symptoms": symptoms,
        "severity": highest_severity,
        "body_parts": body_parts,
        "duration": duration,
        "onset": onset,
        "patient_concerns": ner_result.get("patient_concerns", [])
    }


if __name__ == "__main__":
    # Test with mock data
    mock_ner = {
        "symptoms": ["chest pain", "fever"],
        "severity": ["severe", "mild"],
        "body_parts": ["chest"]
    }
    mock_temporal = {
        "duration": "2 days",
        "onset": "yesterday"
    }
    result = build_features(mock_ner, mock_temporal)
    print("INPUT NER:", json.dumps(mock_ner))
    print("INPUT TEMPORAL:", json.dumps(mock_temporal))
    print("OUTPUT:", json.dumps(result, indent=2))
