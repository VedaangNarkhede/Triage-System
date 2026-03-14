"""
AI Clinical Note Generator — Unified OCR Runner

Converts unstructured clinical input (text, audio, image, or PDF) into
structured clinical notes.

Usage:
    python ocr_run.py "patient description text"       # text input
    python ocr_run.py path/to/audio.wav                # audio input (.wav, .mp3, .flac, .m4a, .ogg)
    python ocr_run.py path/to/image.jpg                # image input (.jpg, .png, .bmp, .tiff)
    python ocr_run.py path/to/document.pdf             # PDF input
"""

import json
import sys
import os

# Add project root to path so all package imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ocr_processing.pipeline import run_pipeline


def _print_readable(result: dict):
    """Print results in a human-readable format."""
    sd = result["structured_data"]

    print(f"\n{'='*65}")
    print("  STRUCTURED CLINICAL NOTE")
    print(f"{'='*65}")

    print(f"\n  Input Type    : {result['input_type'].upper()}")
    print(f"  Processing    : {result['processing_time_seconds']}s")

    print(f"\n{'─'*65}")
    print("  CHIEF COMPLAINT")
    print(f"{'─'*65}")
    print(f"  {sd['chief_complaint']}")

    print(f"\n{'─'*65}")
    print("  HISTORY OF PRESENT ILLNESS")
    print(f"{'─'*65}")
    print(f"  {sd['history_of_present_illness']}")

    print(f"\n{'─'*65}")
    print("  EXTRACTED SYMPTOMS ({} found)".format(sd['symptom_count']))
    print(f"{'─'*65}")
    for i, s in enumerate(sd["symptoms_identified"], 1):
        print(f"  {i}. {s}")

    if sd.get("affected_body_parts"):
        print(f"\n{'─'*65}")
        print("  AFFECTED BODY PARTS")
        print(f"{'─'*65}")
        for bp in sd["affected_body_parts"]:
            print(f"  • {bp}")

    if sd.get("severity") and sd["severity"] != "not specified":
        print(f"\n  Severity: {sd['severity']}")
    if sd.get("duration") and sd["duration"] != "not mentioned":
        print(f"  Duration: {sd['duration']}")
    if sd.get("onset") and sd["onset"] != "not mentioned":
        print(f"  Onset: {sd['onset']}")

    if sd.get("patient_concerns"):
        print(f"\n{'─'*65}")
        print("  PATIENT'S OWN WORDS (key concerns)")
        print(f"{'─'*65}")
        for c in sd["patient_concerns"]:
            print(f'  → "{c}"')

    print(f"\n{'─'*65}")
    print("  TRIAGE")
    print(f"{'─'*65}")
    print(f"  Level      : {sd['triage_level']}")
    print(f"  Confidence : {sd['triage_confidence']}")
    for r in sd.get("triage_reasons", []):
        print(f"  Reason     : {r}")

    print(f"\n{'─'*65}")
    print("  AI CLINICAL NOTE (LLM-generated)")
    print(f"{'─'*65}")
    print(f"  {result['clinical_note']}")

    print(f"\n{'='*65}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    source = sys.argv[1]
    print(f"\n  INPUT: {source[:100]}{'...' if len(source) > 100 else ''}")

    result = run_pipeline(source)

    # Human-readable output
    _print_readable(result)

    # Also dump raw JSON
    print("\n  RAW JSON OUTPUT:")
    print(json.dumps(result, indent=2))
