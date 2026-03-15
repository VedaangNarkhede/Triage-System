"""
Step 1 — Input Handler Module
Accepts either an audio file path or raw text string.
Returns standardized JSON with type and content.
"""

import os
import json
import sys

AUDIO_EXTENSIONS = {".wav", ".mp3", ".flac", ".m4a", ".ogg", ".webm"}
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".webp"}
PDF_EXTENSIONS = {".pdf"}

def handle_input(source: str) -> dict:
    """
    Determine if the source is an audio file, image, PDF, or raw text.

    Args:
        source: Either a file path or raw text string.

    Returns:
        dict with keys:
            - "type": "audio", "image", "pdf", or "text"
            - "content": the file path or raw text
    """
    # Check if source looks like a file path with a known extension
    _, ext = os.path.splitext(source)
    ext_lower = ext.lower()
    
    if os.path.isfile(source):
        if ext_lower in AUDIO_EXTENSIONS:
            return {"type": "audio", "content": source}
        elif ext_lower in IMAGE_EXTENSIONS:
            return {"type": "image", "content": source}
        elif ext_lower in PDF_EXTENSIONS:
            return {"type": "pdf", "content": source}

    return {"type": "text", "content": source}


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python input_handler.py <audio_file_or_text>")
        print('Example: python input_handler.py "I have severe chest pain"')
        print("Example: python input_handler.py sample.wav")
        sys.exit(1)

    source = sys.argv[1]
    result = handle_input(source)
    print(json.dumps(result, indent=2))
