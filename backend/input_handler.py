"""
Step 1 — Input Handler Module
Accepts either an audio file path or raw text string.
Returns standardized JSON with type and content.
"""

import os
import json
import sys

AUDIO_EXTENSIONS = {".wav", ".mp3", ".flac", ".m4a", ".ogg", ".webm"}


def handle_input(source: str) -> dict:
    """
    Determine if the source is an audio file or raw text.

    Args:
        source: Either a file path to an audio file or raw text string.

    Returns:
        dict with keys:
            - "type": "audio" or "text"
            - "content": the file path or raw text
    """
    # Check if source looks like a file path with an audio extension
    _, ext = os.path.splitext(source)
    if ext.lower() in AUDIO_EXTENSIONS and os.path.isfile(source):
        return {"type": "audio", "content": source}
    else:
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
