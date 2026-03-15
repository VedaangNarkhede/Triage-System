"""
Step 5 — Evidence Builder

Constructs a structured evidence context from patient symptoms and
retrieved disease documents for the LLM reasoning agent.
"""


def build_evidence(patient_symptoms: list, retrieved_diseases: list,
                   patient_context: dict = None) -> str:
    """
    Construct an evidence context block for the reasoning LLM.

    Args:
        patient_symptoms: List of symptom strings from the patient.
        retrieved_diseases: List of disease dicts from the retriever.
        patient_context: Optional dict with extra patient info (duration, severity, etc.)

    Returns:
        Formatted evidence string.
    """
    lines = []

    # ── Patient section ──────────────────────────────────────────────────
    lines.append("Patient symptoms:")
    if patient_symptoms:
        for s in patient_symptoms:
            lines.append(f"- {s}")
    else:
        lines.append("- (no specific symptoms identified)")

    if patient_context:
        lines.append("")
        if patient_context.get("duration"):
            lines.append(f"Duration: {patient_context['duration']}")
        if patient_context.get("severity"):
            lines.append(f"Severity: {patient_context['severity']}")
        if patient_context.get("chief_complaint"):
            lines.append(f"Chief complaint: {patient_context['chief_complaint']}")
        if patient_context.get("onset"):
            lines.append(f"Onset: {patient_context['onset']}")
        if patient_context.get("patient_words"):
            lines.append("")
            lines.append(f"Patient's exact words: \"{patient_context['patient_words']}\"")

    # ── Candidate diseases section ───────────────────────────────────────
    lines.append("")
    lines.append("Candidate diseases:")
    lines.append("")

    if not retrieved_diseases:
        lines.append("(no candidate diseases retrieved)")
        return "\n".join(lines)

    # Normalize patient symptoms for matching
    patient_set = {s.lower().strip() for s in patient_symptoms} if patient_symptoms else set()

    for i, disease in enumerate(retrieved_diseases, 1):
        name = disease.get("disease", "Unknown")
        score = disease.get("score", 0.0)
        symptoms = disease.get("symptoms", [])
        description = disease.get("description", "")
        precautions = disease.get("precautions", [])

        lines.append(f"{i}. {name} (relevance: {score:.2f})")

        if symptoms:
            lines.append(f"   Symptoms: {', '.join(symptoms[:15])}")

            # Find matching symptoms
            disease_set = {s.lower().strip() for s in symptoms}
            matching = patient_set & disease_set
            if matching:
                lines.append(f"   Matching symptoms: {', '.join(sorted(matching))}")

        if description:
            lines.append(f"   Description: {description[:200]}")

        if precautions:
            lines.append(f"   Precautions: {', '.join(precautions)}")

        lines.append("")

    return "\n".join(lines)


def extract_patient_symptoms(summary_output) -> tuple:
    """
    Extract patient symptoms and context from the summary output.

    Args:
        summary_output: Dict or string from the summarization module.

    Returns:
        Tuple of (symptom_list, context_dict)
    """
    symptoms = []
    context = {}

    if isinstance(summary_output, str):
        return symptoms, context

    if isinstance(summary_output, dict):
        if "structured_data" in summary_output:
            sd = summary_output["structured_data"]
            symptoms = sd.get("symptoms", []) or sd.get("symptoms_identified", [])
            context = {
                "duration": sd.get("duration", ""),
                "severity": sd.get("severity", ""),
                "chief_complaint": sd.get("chief_complaint", "") or ", ".join(sd.get("patient_concerns", [])),
                "onset": sd.get("onset", ""),
            }
            if "extracted_entities" in summary_output:
                concerns = summary_output["extracted_entities"].get("Symptom/Disease", [])
                if concerns:
                    context["patient_words"] = " ".join(concerns)
        else:
            # Simple JSON format
            symptoms = summary_output.get("symptoms", [])
            context = {
                "duration": summary_output.get("duration", ""),
                "severity": summary_output.get("severity", ""),
                "patient_words": summary_output.get("patient_words", ""),
            }

    # Clean context (remove empty/default values)
    context = {k: v for k, v in context.items()
               if v and v.lower() not in ("not specified", "not mentioned", "none", "")}

    return symptoms, context
