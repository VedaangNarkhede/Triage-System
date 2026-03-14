"""
AI Clinical Triage Assistant — Unified Runner

Converts unstructured clinical input (text, audio, image, or PDF) into
structured clinical summaries using Ollama's Meditron model.

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
    """Print results in a human-readable, summary-first format."""
    info = result.get("extracted_info", {})
    triage = info.get("triage", {})

    print(f"\n{'='*65}")
    print("  AI CLINICAL TRIAGE ASSISTANT")
    print(f"{'='*65}")

    print(f"\n  Input Type : {result['input_type'].upper()}")
    print(f"  Processing : {result['processing_time']}")

    # --- SUMMARY (prominent) ---
    print(f"\n{'━'*65}")
    print("  📋 CLINICAL SUMMARY")
    print(f"{'━'*65}")
    summary_text = result.get("summary", "No summary generated.")
    # Word-wrap the summary for readability
    for line in summary_text.split("\n"):
        print(f"  {line.strip()}")

    # --- TRIAGE ---
    print(f"\n{'─'*65}")
    print("  🚨 TRIAGE ASSESSMENT")
    print(f"{'─'*65}")
    print(f"  Level      : {triage.get('level', 'UNKNOWN')}")
    print(f"  Confidence : {triage.get('confidence', 0)}")
    for r in triage.get("reasons", []):
        print(f"  Reason     : {r}")

    # --- EXTRACTED INFO (compact) ---
    symptoms = info.get("symptoms", [])
    if symptoms:
        print(f"\n{'─'*65}")
        print(f"  🔍 EXTRACTED SYMPTOMS ({len(symptoms)})")
        print(f"{'─'*65}")
        for i, s in enumerate(symptoms, 1):
            print(f"  {i}. {s}")

    body_parts = info.get("body_parts", [])
    if body_parts:
        print(f"\n  Body Parts : {', '.join(body_parts)}")

    severity = info.get("severity", "not specified")
    if severity and severity != "not specified":
        print(f"  Severity   : {severity}")

    duration = info.get("duration", "not mentioned")
    if duration and duration != "not mentioned":
        print(f"  Duration   : {duration}")

    onset = info.get("onset", "not mentioned")
    if onset and onset != "not mentioned":
        print(f"  Onset      : {onset}")

    concerns = info.get("patient_concerns", [])
    if concerns:
        print(f"\n{'─'*65}")
        print("  💬 PATIENT'S OWN WORDS")
        print(f"{'─'*65}")
        for c in concerns:
            print(f'  → "{c}"')

    print(f"\n{'='*65}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    source = sys.argv[1]
    print(f"\n  INPUT: {source[:100]}{'...' if len(source) > 100 else ''}")

    result = run_pipeline(source)

    # Human-readable summary-first output
    _print_readable(result)

    # Compact JSON for frontend consumption
    print("\n  JSON OUTPUT:")
    print(json.dumps(result, indent=2))
