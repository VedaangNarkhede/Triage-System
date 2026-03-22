# 🏥 AI Clinical Triage System

An AI-powered Clinical Triage and Decision Support System that automates the transcription, analysis, and structuring of raw patient inputs (audio or text). The system provides structured clinical notes, extracts key symptoms, and assigns a preliminary triage urgency level using a combination of local and cloud-based Language and Vision models.

---

## 🏗 System Architecture

The project is split into several cohesive modules working together:

### 1. Backend API (`/backend`)
A Python-based backend that orchestrates the triage pipeline:
- **Speech-to-Text**: Converts raw patient audio to text using Whisper.
- **NLP Extraction**: Extracts medical entities, duration, and severity using custom NER pipelines.
- **Triage & Urgency**: Calculates a risk score and assigns a Triage Level.
- **Summarization**: Generates standardized Chief Complaint and History of Present Illness (HPI) notes via LLMs.

### 2. Smart OCR Module (`/ocr_processing`)
Uses Vision-Language Models (VLMs) to accurately extract clinical text from scanned documents, PDFs, and images.

### 3. RAG Diagnosis Engine (`/rag2`)
Retrieval-Augmented Generation (RAG) system that compares extracted patient symptoms against a vector database of diseases to provide AI-assisted differential diagnoses.

### 4. Interactive Frontend (`/triage-web`)
A modern Next.js React application providing a futuristic, dark-themed dashboard to submit cases, view AI diagnostics, and review the generated structured clinical notes.

---

## 🧠 AI & ML Models Used

The system leverages state-of-the-art open-source models tailored for speed and medical accuracy:

*   **ASR (Automatic Speech Recognition)**: `faster-whisper` (`base` model, float16/int8) for rapid transcription of audio inputs.
*   **Clinical Summarization & Reasoning**: `Qwen/Qwen2.5-32B-Instruct` (via Hugging Face API) is the primary LLM for structuring summaries and powering the RAG diagnostic agent.
*   **Medical OCR Engine**: `opendatalab/MinerU2.5-2509-1.2B` (based on Qwen2-VL) for advanced document and image text extraction.
*   **Vector Embeddings (RAG)**: `BAAI/bge-small-en-v1.5` for embedding medical knowledge bases into ChromaDB.
*   **Local LLM Wrapper**: Supports `meditron` via local Ollama wrappers for privacy-preserved medical inference.

---

## 📁 Project Structure

```text
.
├── backend/            # Core processing pipeline, FastAPI server, and API routes
├── triage-web/         # Next.js web application frontend
├── ocr_processing/     # VLM-powered optical character recognition module
├── rag2/               # Advanced RAG pipeline for disease diagnosis
├── run.py              # CLI runner for quick terminal execution
└── server.py           # Example local Ollama integration server
```

---

## 🚀 Getting Started

### 1. Backend Setup

The backend relies on Python. We recommend using a virtual environment (`venv` or `conda`).

```bash
# Ensure you are at the project root
# Install dependencies
pip install -r backend/requirements.txt

# Start the Backend Server (Ensure you run this from the project root!)
uvicorn backend.api:app --host 0.0.0.0 --port 8000 --reload
```
*The API interactive documentation will be available at `http://127.0.0.1:8000/docs`.*

### 2. Frontend Setup

The frontend is a Next.js application requiring Node.js.

```bash
# Navigate to the frontend directory
cd triage-web

# Install NPM dependencies
npm install

# Start the development server
npm run dev
```
*The web interface will be accessible at `http://localhost:3000`.*

---

## 🛠 Command Line Interface (CLI)

You can also run the pipeline directly via the command line without starting the full web interface:

```bash
# To process text
python run.py "The patient is complaining of a severe headache and nausea for the past 3 days."

# To process audio
python run.py path/to/patient_recording.wav
```
