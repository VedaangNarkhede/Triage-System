"""
Step 4 — Medical Entity Extraction (NER) Module
Extracts symptoms, severity indicators, and body parts from clinical text.
Uses colloquial symptom mapping + medspacy clinical NER + comprehensive keyword matching.
"""

import json
import sys
import re

# --- Colloquial / informal → clinical symptom mappings ---
# Maps informal descriptions (children, non-medical speakers) to clinical terms
COLLOQUIAL_SYMPTOM_MAP = [
    # Fever / temperature
    (r'\b(body\s+felt?\s+hot|feel(?:s|ing)?\s+hot|warm\s+like\s+tea|burning\s+up|feel(?:s|ing)?\s+warm)\b', 'fever'),
    (r'\b(temperature|felt?\s+feverish|feel(?:s|ing)?\s+feverish)\b', 'fever'),
    # Abdominal pain / stomach issues
    (r'\b(tummy\s+(?:hurts?|ache|feels?\s+weird|feels?\s+bad|feels?\s+funny|pain|upset))\b', 'abdominal discomfort'),
    (r'\b(stomach\s+(?:hurts?|ache|feels?\s+weird|feels?\s+bad|feels?\s+funny|upset|turning|twisting))\b', 'abdominal discomfort'),
    (r'\b(belly\s+(?:hurts?|ache|pain|feels?\s+weird|feels?\s+bad))\b', 'abdominal discomfort'),
    (r'\b(it\s+hurts?\s+(?:in\s+)?(?:my\s+)?(?:tummy|stomach|belly))\b', 'abdominal discomfort'),
    # NEW: Broad "not feeling good" patterns for body parts
    (r'\b((?:my\s+)?stomach\s+(?:is\s+)?(?:not\s+)?(?:feeling|doing)\s+(?:good|well|great|right|okay|fine))\b', 'abdominal discomfort'),
    (r'\b((?:my\s+)?stomach\s+(?:is\s+)?(?:not\s+(?:good|well|great|right|okay|fine)))\b', 'abdominal discomfort'),
    (r'\b((?:my\s+)?tummy\s+(?:is\s+)?(?:not\s+)?(?:feeling|doing)\s+(?:good|well|right|okay|fine))\b', 'abdominal discomfort'),
    # NEW: Throat not feeling good
    (r'\b((?:my\s+)?throat\s+(?:is\s+)?(?:not\s+)?(?:feeling|doing)\s+(?:good|well|right|okay|fine))\b', 'sore throat'),
    (r'\b((?:my\s+)?throat\s+(?:is\s+)?(?:not\s+(?:good|well|great|right|okay|fine)))\b', 'sore throat'),
    # NEW: Chest not feeling good
    (r'\b((?:my\s+)?chest\s+(?:is\s+)?(?:not\s+)?(?:feeling|doing)\s+(?:good|well|right|okay))\b', 'chest discomfort'),
    (r'\b((?:my\s+)?chest\s+(?:is\s+)?(?:not\s+(?:good|well|great|right|okay)))\b', 'chest discomfort'),
    # NEW: Generic body part + discomfort ("my X doesn't feel right")
    (r'(?:my\s+)?(\w+)\s+(?:doesn.?t|does\s+not|isn.?t|is\s+not)\s+feel(?:ing)?\s+(?:good|well|right|okay|normal|fine)', '_body_discomfort'),
    # Nausea / vomiting
    (r'\b((?:feel|felt|feeling)\s+(?:like\s+)?(?:throwing\s+up|puking|vomiting|sick\s+to|nauseous))\b', 'nausea'),
    (r'\b((?:feel|felt|feeling)\s+(?:yucky|icky|queasy|gross|nauseous))\b', 'nausea'),
    (r'\b(nausea|nauseous|felt?\s+like\s+throwing\s+up)\b', 'nausea'),
    (r'\b(yucky\s+in\s+(?:my\s+)?mouth|didn.?t\s+want\s+to\s+eat|don.?t\s+want\s+to\s+eat)\b', 'loss of appetite'),
    (r'\b(not\s+(?:feeling\s+)?hungry|no\s+appetite|can.?t\s+eat|won.?t\s+eat|refused?\s+(?:to\s+)?eat)\b', 'loss of appetite'),
    (r'\b(only\s+ate\s+a\s+(?:small|little|tiny)\s+bit)\b', 'loss of appetite'),
    # Headache
    (r'\b(head\s+(?:hurts?|ache|is\s+pounding|is\s+throbbing|feels?\s+heavy))\b', 'headache'),
    (r'\b(hurts?\s+(?:in\s+)?(?:my\s+)?head)\b', 'headache'),
    # Sore throat
    (r'\b(throat\s+(?:hurts?|feels?\s+scratchy|feels?\s+sore|is\s+scratchy|is\s+sore|pokes?|stings?|burns?))\b', 'sore throat'),
    (r'\b(scratchy\s+throat|(?:it\s+)?(?:hurts?|pokes?)\s+(?:when\s+)?(?:i\s+)?swallow)\b', 'sore throat'),
    (r'\b(pain(?:ful)?\s+(?:to\s+)?swallow|swallowing\s+(?:hurts?|is\s+painful))\b', 'sore throat'),
    # Cough
    (r'\b(want\s+to\s+cough|feel(?:s|ing)?\s+like\s+(?:i\s+)?(?:want\s+to\s+)?cough|trying\s+to\s+cough|keeps?\s+coughing)\b', 'cough'),
    (r'\b(dry\s+cough|wet\s+cough|cough(?:ing)?\s+(?:a\s+)? lot)\b', 'cough'),
    # Fatigue / lethargy
    (r'\b((?:feel|felt|feeling)\s+(?:very\s+)?(?:sleepy|tired|exhausted|drowsy|lazy|weak|faint))\b', 'fatigue'),
    (r'\b((?:very\s+)?sleepy|(?:just\s+)?want(?:ed)?\s+to\s+lie\s+down|want(?:ed)?\s+to\s+sleep|no\s+energy|weakness|fainting|faint)\b', 'fatigue'),
    (r'\b(can.?t\s+(?:stay\s+)?awake|hard\s+to\s+(?:stay\s+)?awake|dozing\s+off)\b', 'fatigue'),
    # Photophobia (light sensitivity)
    (r'\b(hurts?\s+(?:when\s+)?(?:i\s+)?(?:look(?:ing)?\s+at\s+)?(?:the\s+)?light|light\s+(?:hurts?|bothers?))\b', 'photophobia'),
    (r'\b(sensitive\s+to\s+light|eyes?\s+hurt\s+(?:in\s+)?light)\b', 'photophobia'),
    # General malaise
    (r'\b((?:i\s+)?(?:feel|felt|was|feeling)\s+(?:not\s+good|not\s+well|unwell|bad|sick|awful|terrible|horrible))\b', 'malaise'),
    (r'\b((?:i\s+)?(?:don.?t\s+)?(?:feel|felt)\s+(?:right|normal|okay|fine))\b', 'malaise'),
    (r'\b(not\s+(?:feeling|felt)\s+(?:good|well|right|myself))\b', 'malaise'),
    # NEW: Broad "not doing well" patterns
    (r'\b((?:i\s+)?(?:am|m)\s+not\s+(?:doing|feeling)\s+(?:good|well|great|okay))\b', 'malaise'),
    (r'\b((?:i\s+)?(?:feel|feeling)\s+(?:off|strange|odd|weird|funny))\b', 'malaise'),
    (r'\b(something\s+(?:is|feels?)\s+(?:wrong|off|not\s+right))\b', 'malaise'),
    # Body aches
    (r'\b(body\s+(?:hurts?|aches?|is\s+(?:sore|achy))|(?:everything|all\s+over)\s+(?:hurts?|aches?))\b', 'body aches'),
    # Chills / shivering
    (r'\b(feel(?:s|ing)?\s+(?:cold|chilly|shivery)|shiver(?:ing)?|teeth\s+chattering)\b', 'chills'),
    # Dizziness
    (r'\b(head\s+(?:is\s+)?spinning|(?:feel|felt|feeling)\s+(?:dizzy|lightheaded|woozy|faint))\b', 'dizziness'),
    (r'\b(room\s+(?:is\s+)?spinning|everything\s+(?:is\s+)?spinning)\b', 'dizziness'),
    # Difficulty breathing
    (r'\b((?:hard|difficult|can.?t)\s+(?:to\s+)?breathe?|(?:out\s+of|short\s+of)\s+breath|shortness\s+of\s+breath|difficulty\s+breathing)\b', 'shortness of breath'),
    # Chest discomfort / Pressure
    (r'\b(chest\s+(?:feels?\s+(?:tight|heavy|weird|funny|bad)|hurts?|ache|pressure|pressing\s+down))\b', 'chest pressure'),
    (r'\b(heavy\s+pressure|heavy\s+pain|tightness\s+in\s+chest|crushing\s+pain)\b', 'chest pressure'),
    # Radiating Pain
    (r'\b(pain\s+spreads|pain\s+radiates|pain\s+moves|pain\s+goes\s+up|pain\s+goes\s+to)\b', 'radiating pain'),
    # Sweating / Diaphoresis
    (r'\b(sweaty|sweating|breaking\s+out\s+in\s+a\s+sweat|clammy|cold\s+sweat)\b', 'sweating'),
    # Runny/stuffy nose
    (r'\b(runny\s+nose|stuffy\s+nose|nose\s+(?:is\s+)?(?:running|blocked|stuffed))\b', 'congestion'),
    # NEW: Ear problems
    (r'\b(ear\s+(?:hurts?|ache|feels?\s+(?:blocked|full|weird|painful))|earache)\b', 'ear pain'),
    # NEW: Eye issues
    (r'\b(eyes?\s+(?:hurt|ache|feel\s+(?:heavy|sore|tired|itchy|burning|watery)))\b', 'eye discomfort'),
    # NEW: Skin issues
    (r'\b(skin\s+(?:feels?\s+(?:itchy|dry|burning|hot|irritated))|(?:itchy|itching)\s+(?:skin|all\s+over))\b', 'skin irritation'),
    # NEW: Sleep issues
    (r'\b(can.?t\s+sleep|trouble\s+sleeping|couldn.?t\s+sleep|not\s+sleeping\s+well)\b', 'insomnia'),
]

# Body part informal mappings
COLLOQUIAL_BODY_MAP = [
    (r'\btummy\b', 'abdomen'),
    (r'\bbelly\b', 'abdomen'),
    (r'\bthroat\b', 'throat'),
    (r'\bchest\b', 'chest'),
    (r'\bhead\b', 'head'),
    (r'\bmouth\b', 'mouth'),
    (r'\bears?\b', 'ear'),
    (r'\beyes?\b', 'eye'),
    (r'\bnose\b', 'nose'),
    (r'\bskin\b', 'skin'),
]

# Patterns to extract raw patient concern phrases (preserves original wording)
CONCERN_PATTERNS = [
    r'(?:my\s+\w+\s+(?:feels?|is|hurts?|aches?)\s+[\w\s,]+?)(?:\.|,|$|and\s)',
    r'(?:i\s+(?:feel|have|got|am)\s+[\w\s,]+?)(?:\.|,|$|and\s)',
    r'(?:it\s+(?:hurts?|pokes?|burns?|stings?)\s+[\w\s,]+?)(?:\.|,|$|and\s)',
    r'(?:(?:i\s+)?(?:can.?t|couldn.?t|don.?t|didn.?t|won.?t)\s+[\w\s,]+?)(?:\.|,|$|and\s)',
]

# --- Keyword dictionaries ---
SYMPTOMS = [
    "chest pain", "abdominal pain", "back pain", "neck pain", "joint pain",
    "pain", "fever", "cough", "headache", "bleeding", "nausea", "vomiting",
    "dizziness", "fatigue", "shortness of breath", "sore throat", "rash",
    "swelling", "numbness", "tingling", "weakness", "chills", "diarrhea",
    "constipation", "palpitations", "seizure", "fainting", "syncope",
    "wheezing", "congestion", "insomnia", "anxiety", "confusion",
    "difficulty breathing", "loss of appetite", "weight loss", "bruising",
    "itching", "burning", "cramping", "stiffness", "tremor",
    "malaise", "body aches", "photophobia", "chest pressure", "radiating pain",
    "sweating", "diaphoresis", "nauseous", "weak", "faint"
]

SEVERITY = [
    "severe", "mild", "moderate", "acute", "chronic", "intense", "sharp",
    "dull", "persistent", "intermittent", "worsening", "critical", "serious",
    "extreme", "unbearable", "slight", "terrible", "excruciating", "throbbing",
    "constant", "occasional", "frequent", "progressive", "sudden", "gradual"
]

BODY_PARTS = [
    "head", "chest", "abdomen", "back", "arm", "leg", "throat", "neck",
    "shoulder", "knee", "ankle", "wrist", "hip", "stomach", "lungs", "heart",
    "liver", "kidney", "spine", "elbow", "finger", "toe", "foot", "hand",
    "rib", "pelvis", "skull", "jaw", "ear", "eye", "nose", "mouth",
    "forehead", "temple", "lower back", "upper back"
]

# Lazy-loaded medspacy pipeline
_nlp = None


def _get_medspacy():
    """Load medspacy only when needed."""
    global _nlp
    if _nlp is None:
        try:
            import medspacy
            _nlp = medspacy.load()
            print("[NER] medspacy loaded successfully.")
        except Exception as e:
            print(f"[NER] medspacy load failed: {e}. Using keyword-only mode.")
            _nlp = "fallback"
    return _nlp


def _keyword_search(text: str, keyword_list: list) -> list:
    """Search for keywords in text, return matched keywords."""
    found = []
    text_lower = text.lower()
    # Sort by length descending to match multi-word phrases first
    for keyword in sorted(keyword_list, key=len, reverse=True):
        pattern = r'\b' + re.escape(keyword) + r'\b'
        if re.search(pattern, text_lower):
            found.append(keyword)
    return list(set(found))


def _colloquial_extract(text: str) -> tuple:
    """
    Extract symptoms and body parts from informal/colloquial descriptions.
    Returns (symptoms_found, body_parts_found) as lists.
    """
    text_lower = text.lower()
    symptoms_found = []
    body_parts_found = []

    # Known body parts for dynamic matching
    known_bodies = {'stomach', 'tummy', 'belly', 'throat', 'chest', 'head',
                    'back', 'arm', 'leg', 'ear', 'eye', 'nose', 'mouth',
                    'shoulder', 'neck', 'knee', 'hand', 'foot', 'hip'}

    for pattern, clinical_term in COLLOQUIAL_SYMPTOM_MAP:
        match = re.search(pattern, text_lower)
        if match:
            if clinical_term == '_body_discomfort':
                # Dynamic: extract the body part from the match and create specific discomfort
                body_word = match.group(1) if match.lastindex else ''
                if body_word in known_bodies:
                    mapped = clinical_term
                    for bp_pat, bp_name in COLLOQUIAL_BODY_MAP:
                        if re.search(bp_pat, body_word):
                            mapped = f"{bp_name} discomfort"
                            break
                    if mapped == '_body_discomfort':
                        mapped = f"{body_word} discomfort"
                    if mapped not in symptoms_found:
                        symptoms_found.append(mapped)
            else:
                if clinical_term not in symptoms_found:
                    symptoms_found.append(clinical_term)

    for pattern, clinical_term in COLLOQUIAL_BODY_MAP:
        if re.search(pattern, text_lower):
            if clinical_term not in body_parts_found:
                body_parts_found.append(clinical_term)

    return symptoms_found, body_parts_found


def _extract_concerns(text: str) -> list:
    """
    Extract raw patient concern phrases preserving original wording.
    These capture what the patient actually said (useful for structured notes).
    """
    text_lower = text.lower()
    concerns = []
    for pattern in CONCERN_PATTERNS:
        for match in re.finditer(pattern, text_lower):
            phrase = match.group(0).strip().rstrip('.,').strip()
            if len(phrase) > 5 and phrase not in concerns:  # skip trivially short
                concerns.append(phrase)
    # Deduplicate and limit
    return concerns[:10]


def extract_entities(text: str) -> dict:
    """
    Extract medical entities from clinical text (supports formal and informal language).

    Args:
        text: Cleaned clinical text string.

    Returns:
        dict with keys:
            - "symptoms": list of symptom strings
            - "severity": list of severity indicator strings
            - "body_parts": list of body part strings
            - "patient_concerns": list of raw patient complaint phrases
    """
    # 1. Colloquial extraction first (catches informal descriptions)
    colloquial_symptoms, colloquial_body = _colloquial_extract(text)

    # 2. Standard keyword extraction
    keyword_symptoms = _keyword_search(text, SYMPTOMS)
    severity = _keyword_search(text, SEVERITY)
    keyword_body = _keyword_search(text, BODY_PARTS)

    # 3. Merge (deduplicate)
    all_symptoms = list(set(colloquial_symptoms + keyword_symptoms))
    all_body = list(set(colloquial_body + keyword_body))

    # 4. Also try medspacy for additional entities
    nlp = _get_medspacy()
    if nlp != "fallback" and nlp is not None:
        try:
            doc = nlp(text)
            for ent in doc.ents:
                ent_text = ent.text.lower().strip()
                if ent_text and ent_text not in all_symptoms:
                    all_symptoms.append(ent_text)
        except Exception as e:
            print(f"[NER] medspacy processing error: {e}")

    # 5. Extract raw patient concern phrases
    concerns = _extract_concerns(text)

    # 6. Finalize severity (take first or default to empty string for the logic)
    severity_str = severity[0] if severity else ""

    return {
        "symptoms": all_symptoms,
        "severity": severity_str,
        "body_parts": all_body,
        "patient_concerns": concerns
    }


if __name__ == "__main__":
    test_texts = [
        "patient has severe chest pain and mild fever since yesterday",
        "moderate headache with occasional dizziness for 3 days",
        "acute shortness of breath with worsening cough and wheezing",
        "my tummy feels weird and my head hurts. i feel very sleepy and my body felt hot. my throat feels scratchy when i swallow. i didn't want to eat breakfast.",
    ]
    for t in test_texts:
        result = extract_entities(t)
        print(f"INPUT:  {t[:80]}...")
        print(f"OUTPUT: {json.dumps(result, indent=2)}")
        print()
