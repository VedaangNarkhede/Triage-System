import json
import sys
import os
import logging
import contextlib
import io

# Suppress noisy library logs (Standard Logging)
logging.getLogger("PyRuSH").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)

# Suppress Loguru (used by PyRuSH and others)
try:
    from loguru import logger
    logger.remove()
except ImportError:
    pass

# Add project root to path so all package imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ocr_processing.pipeline import run_pipeline


def _print_readable(result: dict):
    """Print results in a human-readable, summary-first format (Minimalist)."""
    # --- SUMMARY ---
    print(f"\n{'='*65}")
    print("  CLINICAL SUMMARY")
    print(f"{'='*65}")
    summary_text = result.get("summary", "No summary generated.")
    for line in summary_text.split("\n"):
        print(f"  {line.strip()}")

    # --- ORIGINAL TEXT ---
    print(f"\n{'-'*65}")
    print("  PATIENT'S OWN WORDS")
    print(f"{'-'*65}")
    concerns = result.get("extracted_info", {}).get("patient_concerns", [])
    if concerns:
        for c in concerns:
            print(f'  -> "{c}"')
    else:
        # Fallback to truncated original text or prompt
        print(f"  {result.get('original_text', 'N/A')[:500]}...")


def _precaution_to_sentence(disease_name: str, precautions: list) -> str:
    """Convert a list of precautions into readable sentence-form advice."""
    if not precautions:
        return ""
    lines = []
    for i, p in enumerate(precautions, 1):
        lines.append(f"  {i}. {p.strip().capitalize()}.")
    return "\n".join(lines)


def _print_rag_results(rag_result: dict):
    """Print RAG2 diagnosis results in the user-requested format."""
    import textwrap

    # Retrieved diseases (Top 3)
    retrieved = rag_result.get("retrieved_diseases", [])[:3]
    if retrieved:
        print(f"\n{'-'*65}")
        print(f"  RETRIEVED DISEASES ({len(retrieved)} candidates)")
        print(f"{'-'*65}")
        for i, d in enumerate(retrieved, 1):
            print(f"  {i}. {d['disease']} (score: {d['score']:.3f})")
            if d.get("symptoms"):
                print(f"     Symptoms: {', '.join(d['symptoms'][:6])}")
            if d.get("precautions"):
                print(f"     Precautions: {', '.join(d['precautions'][:4])}")

    # Final Diagnosis Reasoning
    suggestions = rag_result.get("diagnosis_suggestions", [])
    if suggestions:
        print(f"\n{'-'*65}")
        print("  POSSIBLE DISEASES DIAGNOSTIC ARE:")
        print(f"{'-'*65}")

        # Point-wise disease list
        for i, s in enumerate(suggestions[:3], 1):
            print(f"  {i}. {s.get('disease', 'Unknown')}")

        print(f"\n  REASONING ANALYSIS:")
        for i, s in enumerate(suggestions[:3], 1):
            disease_name = s.get('disease', 'Unknown')
            reasoning = s.get('reasoning', '')
            precautions = s.get('precautions', [])

            # Reasoning paragraph
            print(f"\n  [{disease_name}]")
            wrapped = textwrap.fill(reasoning, width=100, initial_indent="  ", subsequent_indent="  ")
            print(wrapped)

            # Precautions as sentences
            if precautions:
                print(f"\n  Recommended Precautions:")
                print(_precaution_to_sentence(disease_name, precautions))

    print(f"\n{'='*65}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    skip_rag = False
    args = sys.argv[1:]
    if "--no-rag" in args:
        skip_rag = True
        args.remove("--no-rag")

    if not args:
        print(__doc__)
        sys.exit(1)

    source = args[0]
    print(f"\n  INPUT: {source[:100]}{'...' if len(source) > 100 else ''}")

    # ── Stage 1: OCR Processing Pipeline ──────────────────────────────────
    with contextlib.redirect_stdout(io.StringIO()):
        result = run_pipeline(source)

    # 1. RAW JSON OUTPUT (OCR)
    print("\n  RAW JSON OUTPUT (OCR):")
    print(json.dumps(result, indent=2))

    # 2. Human-readable Summary & Patient Words
    _print_readable(result)

    # ── Stage 2: RAG2 Pipeline (Qwen) ─────────────────────────────────────
    if not skip_rag:
        try:
            from rag2.rag_pipeline import run_rag_pipeline, initialize_rag

            with contextlib.redirect_stdout(io.StringIO()):
                initialize_rag()
                rag_result = run_rag_pipeline(result)

            # 3. RAG Results (Human-readable)
            _print_rag_results(rag_result)

            # 4. RAW JSON OUTPUT (RAG) — for frontend
            print("\n  RAW JSON OUTPUT (RAG):")
            print(json.dumps(rag_result, indent=2, default=str))

        except ImportError as e:
            print(f"\n  ! RAG2 module not available: {e}")
        except Exception as e:
            print(f"\n  ! RAG2 pipeline error: {e}")
    else:
        print("\n  RAG stage skipped (--no-rag flag).")
