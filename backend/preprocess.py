"""
Step 3 — Text Cleaning Module
Preprocesses raw transcript/text: lowercase, remove fillers, remove special chars, normalize spacing.
"""

import re
import json
import sys

FILLER_WORDS = [
    "um", "uh", "like", "you know", "basically", "actually",
    "so", "well", "er", "ah", "hmm", "okay so", "i mean",
    "sort of", "kind of", "right", "yeah"
]


def clean_text(text: str) -> dict:
    """
    Clean and normalize text for downstream NLP processing.

    Args:
        text: Raw text string (transcript or user input).

    Returns:
        dict with key "clean_text" containing the cleaned string.
    """
    # Lowercase
    cleaned = text.lower()

    # Remove filler words (as whole words)
    for filler in sorted(FILLER_WORDS, key=len, reverse=True):
        pattern = r'\b' + re.escape(filler) + r'\b'
        cleaned = re.sub(pattern, '', cleaned)

    # Remove special characters (keep letters, numbers, spaces, periods, commas)
    cleaned = re.sub(r'[^a-z0-9\s.,]', '', cleaned)

    # Clean up dangling commas/periods (artifacts from filler removal)
    cleaned = re.sub(r',\s*,', ',', cleaned)       # collapse double commas
    cleaned = re.sub(r'^\s*,\s*', '', cleaned)      # leading comma
    cleaned = re.sub(r'\s*,\s*$', '', cleaned)      # trailing comma
    cleaned = re.sub(r'\.\s*\.+', '.', cleaned)     # collapse multiple periods

    # Normalize whitespace
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()

    return {"clean_text": cleaned}


if __name__ == "__main__":
    test_texts = [
        "Um, I have like SEVERE pain in my chest!!!",
        "Uh, you know, I've been having this headache for 3 days basically...",
        "The patient, er, reports fever since yesterday and, ah, some coughing."
    ]
    for t in test_texts:
        result = clean_text(t)
        print(f"INPUT:  {t}")
        print(f"OUTPUT: {json.dumps(result)}")
        print()
