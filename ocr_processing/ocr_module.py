"""
Step 2b — OCR Module (Image & PDF)
Extracts text from images and PDF files using MinerU2.5-2509-1.2B (Qwen2-VL).
Lazy-loads the model on first call to avoid slow startup when not needed.
"""

import os
import gc
import torch
from PIL import Image
from transformers import Qwen2VLForConditionalGeneration, AutoProcessor
from qwen_vl_utils import process_vision_info

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

# Lazy-loaded global model
_ocr_model = None


class MinerUOCR:
    """MinerU2.5-2509-1.2B OCR engine based on Qwen2-VL."""

    def __init__(self, model_name="opendatalab/MinerU2.5-2509-1.2B"):
        print(f"[OCR] Loading model {model_name}...")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_name = model_name

        self.model = Qwen2VLForConditionalGeneration.from_pretrained(
            model_name,
            trust_remote_code=True,
            torch_dtype=torch.float16,
            device_map=None,
        ).to(self.device)

        self.processor = AutoProcessor.from_pretrained(
            model_name, trust_remote_code=True
        )
        print(f"[OCR] Model loaded on {self.device}.")

    def perform_ocr(self, image_path: str) -> str:
        """Run OCR on a single image file and return extracted text."""
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "image", "image": f"file://{image_path}"},
                    {"type": "text", "text": "OCR:"},
                ],
            }
        ]

        text = self.processor.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )
        image_inputs, video_inputs = process_vision_info(messages)
        inputs = self.processor(
            text=[text],
            images=image_inputs,
            videos=video_inputs,
            padding=True,
            return_tensors="pt",
        ).to(self.device)

        generated_ids = self.model.generate(**inputs, max_new_tokens=2048)
        generated_ids_trimmed = [
            out_ids[len(in_ids):]
            for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
        ]
        output_text = self.processor.batch_decode(
            generated_ids_trimmed,
            skip_special_tokens=True,
            clean_up_tokenization_spaces=False,
        )

        return output_text[0]


def _get_ocr_model() -> MinerUOCR:
    """Lazy-load the OCR model on first use."""
    global _ocr_model
    if _ocr_model is None:
        _ocr_model = MinerUOCR()
    return _ocr_model


def ocr_from_image(image_path: str) -> str:
    """
    Extract text from an image file.

    Args:
        image_path: Absolute or relative path to the image file.

    Returns:
        Extracted text string.
    """
    abs_path = os.path.abspath(image_path)
    if not os.path.isfile(abs_path):
        raise FileNotFoundError(f"Image file not found: {abs_path}")

    model = _get_ocr_model()
    print(f"[OCR] Performing OCR on image: {abs_path}")
    return model.perform_ocr(abs_path)


def ocr_from_pdf(pdf_path: str) -> str:
    """
    Extract text from a PDF file by converting each page to an image and running OCR.

    Args:
        pdf_path: Absolute or relative path to the PDF file.

    Returns:
        Extracted text string (all pages concatenated).
    """
    abs_path = os.path.abspath(pdf_path)
    if not os.path.isfile(abs_path):
        raise FileNotFoundError(f"PDF file not found: {abs_path}")

    if fitz is None:
        raise ImportError(
            "PyMuPDF is required for PDF processing. Install it with: pip install PyMuPDF"
        )

    print(f"[OCR] Converting PDF to images: {abs_path}")
    doc = fitz.open(abs_path)
    all_text = []
    model = _get_ocr_model()

    import tempfile

    for page_num in range(len(doc)):
        page = doc[page_num]
        pix = page.get_pixmap(dpi=300)

        # Save page as temporary image
        tmp_path = os.path.join(
            tempfile.gettempdir(), f"_ocr_pdf_page_{page_num}.jpg"
        )
        pix.save(tmp_path)

        print(f"[OCR] Processing PDF page {page_num + 1}/{len(doc)}...")
        page_text = model.perform_ocr(tmp_path)
        all_text.append(page_text)

        # Clean up temp file
        try:
            os.remove(tmp_path)
        except OSError:
            pass

    doc.close()

    return "\n\n--- Page Break ---\n\n".join(all_text)
