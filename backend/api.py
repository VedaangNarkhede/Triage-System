"""
Step 10 — FastAPI Server
Exposes the triage pipeline as a REST API.
Accepts text or audio file upload, returns structured JSON.
"""

import json
import os
import tempfile
import shutil
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from backend.pipeline import run_pipeline

app = FastAPI(
    title="AI Triage & Decision Support API",
    description="AI-powered intelligent triage system that processes audio/text and returns structured clinical analysis.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    """Health check endpoint."""
    return {
        "status": "running",
        "service": "AI Triage & Decision Support System",
        "version": "1.0.0"
    }


@app.post("/analyze")
async def analyze(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Analyze clinical input (text or audio) and return structured triage results.

    - **text**: Raw clinical text input
    - **file**: Audio file upload (.wav, .mp3, .flac, .m4a)

    Returns structured JSON with transcript, entities, urgency, and summary.
    """
    if text is None and file is None:
        raise HTTPException(
            status_code=400,
            detail="Either 'text' or 'file' must be provided."
        )

    if file is not None:
        # Save uploaded audio to temp file
        suffix = os.path.splitext(file.filename)[1] if file.filename else ".wav"
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        try:
            shutil.copyfileobj(file.file, tmp)
            tmp.close()
            result = run_pipeline(tmp.name)
        finally:
            os.unlink(tmp.name)
    else:
        result = run_pipeline(text)

    return result


if __name__ == "__main__":
    import uvicorn
    print("Starting AI Triage API server...")
    print("API docs: http://127.0.0.1:8000/docs")
    uvicorn.run(app, host="127.0.0.1", port=8000)
