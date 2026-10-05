import PyPDF2
import re

def clean_text(text):
    stripped_text = re.sub(r'\s+', ' ', text).strip()
    stripped_text=  re.sub('', '', stripped_text)
    stripped_text=  re.sub('●', '', stripped_text)
    return stripped_text

def read_pdf(file_path):
    """
    Reads all text from a PDF file.
    Args:
        file_path (str): The path to the PDF file.
    """
    text = ""
    try:
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text()
        return {
            "status": True,
            "text":text
        }
    except FileNotFoundError:
        return {
            "status": False,
            "text": "The file was not found."
        }
    except Exception as e:
        return {
            "status": False,
            "text": f"An error occurred: {e}"
        }