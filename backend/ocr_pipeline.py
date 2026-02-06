from paddleocr import PaddleOCR
import cv2
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OCR (English only as per user request)
try:
    ocr = PaddleOCR(
        lang='en',                 # English model
        use_textline_orientation=True,  # replaces deprecated use_angle_cls
        show_log=False # Suppress PaddleOCR internal logging
    )
    logger.info("PaddleOCR initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize PaddleOCR: {e}")
    ocr = None

def run_ocr(image_path):
    """
    Runs OCR on the image at the given path and returns the extracted text.
    """
    if ocr is None:
        return "OCR model not initialized."

    try:
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            return "Failed to read image."

        # Run OCR
        result = ocr.ocr(img, cls=True)

        # Handle case where no text is detected
        if result is None or result[0] is None:
            return ""

        extracted_text = []
        # result structure is [ [ [box], (text, confidence) ], ... ]
        # result[0] contains the list of text lines found
        for line in result[0]:
            text = line[1][0]
            extracted_text.append(text)
        
        full_text = "\n".join(extracted_text)
        return full_text

    except Exception as e:
        logger.error(f"Error during OCR processing: {e}")
        return f"Error during OCR processing: {str(e)}"

if __name__ == "__main__":
    # Test with a helper function if needed, or manual run
    pass
