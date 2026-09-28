import io
import os
from fastapi import HTTPException, UploadFile
from pypdf import PdfReader
import docx


async def extract_text_from_upload(file: UploadFile) -> dict:
    filename = file.filename or "Uploaded_Document.txt"
    ext = os.path.splitext(filename)[1].lower()
    
    content_bytes = await file.read()
    if not content_bytes:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")
        
    extracted_text = ""
    if ext == ".pdf":
        try:
            reader = PdfReader(io.BytesIO(content_bytes))
            pages_text = []
            for page in reader.pages:
                t = page.extract_text()
                if t:
                    pages_text.append(t.strip())
            extracted_text = "\n\n".join(pages_text)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse PDF document: {str(e)}")
            
    elif ext in (".docx", ".doc"):
        try:
            doc = docx.Document(io.BytesIO(content_bytes))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            extracted_text = "\n\n".join(paragraphs)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse Word document: {str(e)}")
            
    else:
        try:
            extracted_text = content_bytes.decode("utf-8")
        except UnicodeDecodeError:
            try:
                extracted_text = content_bytes.decode("latin-1")
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to decode text file: {str(e)}")
                
    extracted_text = extracted_text.strip()
    if not extracted_text:
        raise HTTPException(
            status_code=400,
            detail="No readable text could be extracted from this document. Please ensure it is not an image-only scanned document."
        )
        
    # Generate clean title if it has extension
    clean_title = os.path.splitext(filename)[0].replace("_", " ").replace("-", " ").title()
    if not clean_title:
        clean_title = filename

    return {
        "title": clean_title,
        "filename": filename,
        "text": extracted_text,
        "char_count": len(extracted_text),
        "file_size": len(content_bytes)
    }
