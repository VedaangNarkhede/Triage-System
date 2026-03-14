"""
Step 1 — Unified Input Handler
Accepts audio file paths, image file paths, PDF file paths, or raw text strings.
Returns standardized dict with type and content.
"""

import os
import json
import sys

AUDIO_EXTENSIONS = {".wav", ".mp3", ".flac", ".m4a", ".ogg", ".webm"}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".webp"}
PDF_EXTENSIONS = {".pdf"}


def handle_input(source: str) -> dict:
    """
    Determine the type of input source.

    Args:
        source: A file path (audio/image/PDF) or raw text string.

    Returns:
        dict with keys:
            - "type": "audio", "image", "pdf", or "text"
            - "content": the file path or raw text
    """
    _, ext = os.path.splitext(source)
    ext_lower = ext.lower()

    if ext_lower in AUDIO_EXTENSIONS and os.path.isfile(source):
        return {"type": "audio", "content": source}
    elif ext_lower in IMAGE_EXTENSIONS and os.path.isfile(source):
        return {"type": "image", "content": source}
    elif ext_lower in PDF_EXTENSIONS and os.path.isfile(source):
        return {"type": "pdf", "content": source}
    else:
        return {"type": "text", "content": source}


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python input_handler.py <audio_file|image_file|pdf_file|text>")
        print('Example: python input_handler.py "I have severe chest pain"')
        print("Example: python input_handler.py sample.wav")
        print("Example: python input_handler.py scan.jpg")
        print("Example: python input_handler.py report.pdf")
        sys.exit(1)

    source = sys.argv[1]
    result = handle_input(source)
    print(json.dumps(result, indent=2))
