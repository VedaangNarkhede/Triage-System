"""
Master Pipeline Orchestrator
Converts unstructured clinical input (audio/text) into structured clinical notes.
Pipeline: Input → ASR → Preprocess → NER → Temporal → Features → Urgency → Summary
"""

import json
import sys
import time

from backend.input_handler import handle_input
from backend.asr_module import transcribe_audio
from backend.preprocess import clean_text
from backend.ner_module import extract_entities
from ocr_processing.ocr_module import ocr_from_image, ocr_from_pdf
from backend.temporal_module import extract_temporal
from backend.feature_builder import build_features
from backend.urgency_module import classify_urgency
from backend.summary_module import generate_summary


def run_pipeline(source: str) -> dict:
    """
    Execute the full pipeline on a given input.

    Args:
        source: Either a file path to an audio file or raw text string.

    Returns:
        dict with structured clinical note and all extraction results.
    """
    start_time = time.time()

    # Step 1: Input handling
    print("[Pipeline] Step 1: Input handling...")
    input_result = handle_input(source)
    input_type = input_result["type"]
    content = input_result["content"]

    # Step 2: ASR or OCR
    if input_type == "audio":
        print("[Pipeline] Step 2: Audio-to-Text (ASR)...")
        asr_result = transcribe_audio(content)
        transcript = asr_result["transcript"]
    elif input_type == "image":
        print("[Pipeline] Step 2: Image-to-Text (OCR)...")
        transcript = ocr_from_image(content)
    elif input_type == "pdf":
        print("[Pipeline] Step 2: PDF-to-Text (OCR)...")
        transcript = ocr_from_pdf(content)
    else:
        print("[Pipeline] Step 2: Skipping ASR/OCR (text input)...")
        transcript = content

    # Step 3: Text cleaning
    print("[Pipeline] Step 3: Text cleaning...")
    preprocess_result = clean_text(transcript)
    cleaned = preprocess_result["clean_text"]

    # Step 4: NER
    print("[Pipeline] Step 4: Medical entity extraction (NER)...")
    ner_result = extract_entities(cleaned)

    # Step 5: Temporal extraction
    print("[Pipeline] Step 5: Temporal extraction...")
    temporal_result = extract_temporal(cleaned)

    # Step 6: Feature building
    print("[Pipeline] Step 6: Feature building...")
    features = build_features(ner_result, temporal_result)

    # Step 7: Urgency classification
    print("[Pipeline] Step 7: Urgency classification...")
    urgency = classify_urgency(features)

    # Step 8: Summary generation (structured clinical note)
    print("[Pipeline] Step 8: Generating structured clinical note...")
    summary_result = generate_summary(cleaned, features, urgency)

    elapsed = round(time.time() - start_time, 2)
    print(f"[Pipeline] Complete in {elapsed}s")

    return {
        "input_type": input_type,
        "original_text": transcript,
        "cleaned_text": cleaned,
        "extracted_entities": ner_result,
        "temporal_info": temporal_result,
        "clinical_note": summary_result["summary"],
        "structured_data": summary_result["structured_data"],
        "processing_time_seconds": elapsed
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        source = "I have been having severe chest pain since yesterday, with shortness of breath and dizziness for about 3 hours"
    else:
        source = sys.argv[1]

    print(f"[Pipeline] Running with input: {source[:80]}...")
    print("=" * 60)
    result = run_pipeline(source)
    print("=" * 60)
    print("\nFINAL OUTPUT:")
    print(json.dumps(result, indent=2))
