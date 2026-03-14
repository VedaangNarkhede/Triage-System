"""
Step 5 — Temporal Extraction Module
Extracts duration and onset information from clinical text using regex patterns.
"""

import re
import json
import sys

# Duration patterns: "3 days", "2 hours", "1 week", etc.
DURATION_PATTERNS = [
    r'(?:for\s+)?(\d+\s*(?:days?|hours?|weeks?|months?|years?|minutes?))',
    r'((?:a\s+)?(?:few|couple(?:\s+of)?)\s+(?:days?|hours?|weeks?|months?))',
    r'(\d+[-–]\d+\s*(?:days?|hours?|weeks?|months?|years?))',
]

# Onset patterns: "since yesterday", "started 2 days ago", "began last week", etc.
ONSET_PATTERNS = [
    r'(?:since|from|for|started|began|starting)\s+(yesterday|today|last\s+(?:night|week|month|year)|this\s+(?:morning|afternoon|evening|week)|\d+\s+\w+\s+ago)',
    r'(yesterday|today|this morning|last night|last week|recently)',
    r'(\d+\s+(?:days?|hours?|weeks?|months?|years?)\s+ago)',
    r'(?:past|last)\s+(\d+\s+(?:days?|hours?|weeks?|months?|years?))',
]


def extract_temporal(text: str) -> dict:
    """
    Extract temporal/timeline information from clinical text.

    Args:
        text: Cleaned clinical text string.

    Returns:
        dict with keys:
            - "duration": extracted duration string or empty
            - "onset": extracted onset string or empty
    """
    text_lower = text.lower()

    # Extract duration
    duration = ""
    for pattern in DURATION_PATTERNS:
        match = re.search(pattern, text_lower)
        if match:
            duration = match.group(1).strip() if match.lastindex else match.group(0).strip()
            break

    # Extract onset
    onset = ""
    for pattern in ONSET_PATTERNS:
        match = re.search(pattern, text_lower)
        if match:
            onset = match.group(1).strip() if match.lastindex else match.group(0).strip()
            break

    return {
        "duration": duration,
        "onset": onset
    }


if __name__ == "__main__":
    test_texts = [
        "I have had chest pain since yesterday for about 3 hours",
        "headache started 2 days ago and is getting worse",
        "persistent cough for a few weeks",
        "fever since last night, feeling very weak today",
        "pain in lower back for the past 5 days",
        "sudden dizziness this morning"
    ]
    for t in test_texts:
        result = extract_temporal(t)
        print(f"INPUT:  {t}")
        print(f"OUTPUT: {json.dumps(result)}")
        print()
