"""
Step 2 — Audio-to-Text (ASR) Module
Converts audio files to text transcripts using faster-whisper.
Robustly handles missing CUDA runtime libraries — falls back to CPU.
"""

import json
import sys
from faster_whisper import WhisperModel


# Lazy-loaded global model
_model = None
_device_used = None


def _load_model(device="cpu", compute_type="int8"):
    """Load a whisper model on the specified device."""
    global _model, _device_used
    print(f"[ASR] Loading whisper 'base' model on {device} ({compute_type})...")
    _model = WhisperModel("base", device=device, compute_type=compute_type)
    _device_used = device
    print(f"[ASR] Model loaded on {device}.")
    return _model


def _get_model():
    """Get or create the whisper model. Try CUDA first, fallback to CPU."""
    global _model
    if _model is None:
        try:
            _load_model(device="cuda", compute_type="float16")
        except Exception as e:
            print(f"[ASR] CUDA model load failed: {e}")
            _load_model(device="cpu", compute_type="int8")
    return _model


def transcribe_audio(filepath: str) -> dict:
    """
    Transcribe an audio file to text using faster-whisper.

    Args:
        filepath: Path to the audio file (.wav, .mp3, etc.)

    Returns:
        dict with key "transcript" containing the full transcribed text.
    """
    global _model
    model = _get_model()

    try:
        segments, info = model.transcribe(filepath, beam_size=5)
        full_text = " ".join(segment.text.strip() for segment in segments)
    except RuntimeError as e:
        # CUDA inference failed (e.g., cublas DLL missing) — reload on CPU
        print(f"[ASR] CUDA inference failed: {e}")
        print("[ASR] Reloading model on CPU...")
        _model = None
        _load_model(device="cpu", compute_type="int8")
        segments, info = _model.transcribe(filepath, beam_size=5)
        full_text = " ".join(segment.text.strip() for segment in segments)

    return {"transcript": full_text}


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python asr_module.py <audio_file>")
        print("Example: python asr_module.py sample_audio.wav")
        sys.exit(1)

    filepath = sys.argv[1]
    result = transcribe_audio(filepath)
    print(json.dumps(result, indent=2))
