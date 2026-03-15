"""
Step 10 — FastAPI Server
Exposes the triage pipeline as a REST API.
Accepts text or audio file upload, returns structured JSON.
"""

import json
import os
import tempfile
import shutil
import io
import contextlib
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from backend.pipeline import run_pipeline
from rag2.rag_pipeline import run_rag_pipeline, initialize_rag
from pydantic import BaseModel
from loguru import logger

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


class DiagnoseRequest(BaseModel):
    summary: str
    structured_data: dict


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

    with contextlib.redirect_stdout(io.StringIO()):
        if file is not None:
            # Save uploaded file to temp file, preserving extension for input_handler
            original_filename = getattr(file, "filename", "") or ""
            _, ext = os.path.splitext(original_filename)
            suffix = ext if ext else ".wav" # fallback for audio mostly
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


@app.post("/diagnose")
async def diagnose_patient(req: DiagnoseRequest):
    """
    On-demand AI diagnosis using RAG2.
    Accepts the summarized output and structured data from the initial analysis.
    """
    with contextlib.redirect_stdout(io.StringIO()):
        try:
            logger.remove()
        except:
            pass
        initialize_rag()
        
        # Reconstruct the expected pipeline output dictionary for RAG query builder
        pipeline_output = {
            "summary": req.summary,
            "structured_data": req.structured_data
        }
        
        rag_result = run_rag_pipeline(pipeline_output)

    return rag_result


@app.post("/ocr")
async def ocr_image(file: UploadFile = File(...)):
    """
    Perform OCR on an uploaded image file.
    Returns the extracted text from the image.
    """
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Uploaded file must be an image (png, jpg, etc.)."
        )

    original_filename = getattr(file, "filename", "") or ""
    _, ext = os.path.splitext(original_filename)
    suffix = ext if ext else ".png"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        shutil.copyfileobj(file.file, tmp)
        tmp.close()

        from ocr_processing.ocr_module import ocr_from_image
        with contextlib.redirect_stdout(io.StringIO()):
            extracted_text = ocr_from_image(tmp.name)

        return {"text": extracted_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {e}")
    finally:
        try:
            os.unlink(tmp.name)
        except OSError:
            pass


if __name__ == "__main__":
    import uvicorn
    print("Starting AI Triage API server...")
    print("API docs: http://127.0.0.1:8000/docs")
    uvicorn.run(app, host="127.0.0.1", port=8000)
