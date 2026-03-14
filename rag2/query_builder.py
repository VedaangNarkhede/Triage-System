"""
Step 3 — Query Builder

Transforms the LLM summarization module output into a RAG query string.
Handles both JSON dict and plain sentence formats.
"""


def build_query(summary_output) -> str:
    """
    Convert the summarization module output into a query string for RAG retrieval.

    Handles two formats:

    1. JSON dict format:
        {
            "symptoms": ["fever", "vomiting"],
            "duration": "8 hours",
            "severity": "moderate",
            "notes": "patient reports vomiting after meals",
            ...
        }
       → "symptoms: fever vomiting duration: 8 hours severity: moderate"

    2. Structured pipeline dict (from ocr_processing):
        {
            "structured_data": {
                "symptoms_identified": ["fever", "vomiting"],
                "chief_complaint": "...",
                ...
            },
            "clinical_note": "..."
        }
       → Uses symptoms + chief complaint + clinical note

    3. Plain sentence string:
       → Used directly as the query

    Args:
        summary_output: Either a dict or a string from the summarization module.

    Returns:
        A query string suitable for vector search.
    """
    if isinstance(summary_output, str):
        return summary_output.strip()

    if isinstance(summary_output, dict):
        parts = []

        # Handle full pipeline output (from ocr_processing)
        if "structured_data" in summary_output:
            sd = summary_output["structured_data"]

            # Extract symptoms
            symptoms = sd.get("symptoms_identified", [])
            if symptoms:
                parts.append(f"symptoms: {' '.join(symptoms)}")

            # Chief complaint
            cc = sd.get("chief_complaint", "")
            if cc and cc.lower() not in ("not specified", "none", ""):
                parts.append(f"complaint: {cc}")

            # Duration
            duration = sd.get("duration", "")
            if duration and duration.lower() not in ("not mentioned", "none", ""):
                parts.append(f"duration: {duration}")

            # Severity
            severity = sd.get("severity", "")
            if severity and severity.lower() not in ("not specified", "none", ""):
                parts.append(f"severity: {severity}")

            # Fall back to clinical note if no symptoms found
            if not parts:
                note = summary_output.get("clinical_note", "")
                if note:
                    return note.strip()

        # Handle simple JSON summary format
        else:
            symptoms = summary_output.get("symptoms", [])
            if symptoms:
                if isinstance(symptoms, list):
                    parts.append(f"symptoms: {' '.join(symptoms)}")
                else:
                    parts.append(f"symptoms: {symptoms}")

            duration = summary_output.get("duration", "")
            if duration:
                parts.append(f"duration: {duration}")

            severity = summary_output.get("severity", "")
            if severity:
                parts.append(f"severity: {severity}")

            notes = summary_output.get("notes", "")
            if notes:
                parts.append(notes)
                
            raw_words = summary_output.get("patient_words", "")
            if raw_words:
                parts.append(raw_words)

        if parts:
            return " ".join(parts)

    # Fallback: convert to string
    return str(summary_output).strip()
