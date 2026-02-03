from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import os
import uuid
from datetime import datetime

from services.audio_processor import AudioProcessor
from services.transcription_service import TranscriptionService
from services.clinical_extractor import ClinicalExtractor
from services.p3_mapper import P3Mapper

app = FastAPI(title="NJIA API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
audio_processor = AudioProcessor()
transcription_service = TranscriptionService()
clinical_extractor = ClinicalExtractor()
p3_mapper = P3Mapper()

# Storage directories
UPLOAD_DIR = "uploads"
CLEANED_AUDIO_DIR = "cleaned_audio"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CLEANED_AUDIO_DIR, exist_ok=True)


class CaseCreate(BaseModel):
    case_id: Optional[str] = None


class TranscriptionResponse(BaseModel):
    case_id: str
    transcript: str
    duration_seconds: float


class ClinicalExtractionResponse(BaseModel):
    case_id: str
    clinical_facts: dict


class P3Response(BaseModel):
    case_id: str
    p3_pre_fill: dict


@app.get("/")
async def root():
    return {"message": "NJIA API", "version": "1.0.0"}


@app.post("/api/cases/create")
async def create_case(case_data: Optional[CaseCreate] = None):
    """Create a new case file"""
    case_id = case_data.case_id if case_data and case_data.case_id else f"NJ-{datetime.now().strftime('%Y')}-{str(uuid.uuid4())[:3].upper()}"
    return {"case_id": case_id, "status": "created"}


@app.post("/api/audio/upload")
async def upload_audio(case_id: str = None, file: UploadFile = File(...)):
    """Upload audio file for processing"""
    try:
        # Get case_id from query param or generate one
        if not case_id:
            case_id = f"NJ-{datetime.now().strftime('%Y')}-{str(uuid.uuid4())[:3].upper()}"
        
        # Save uploaded file
        file_extension = os.path.splitext(file.filename)[1] or ".wav"
        audio_path = os.path.join(UPLOAD_DIR, f"{case_id}{file_extension}")
        
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        with open(audio_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        return {"case_id": case_id, "audio_path": audio_path, "status": "uploaded"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/audio/preprocess")
async def preprocess_audio(case_id: str, audio_path: str):
    """Preprocess audio file (clean, normalize, resample)"""
    try:
        cleaned_path = await audio_processor.process_audio(audio_path, case_id)
        return {"case_id": case_id, "cleaned_audio_path": cleaned_path, "status": "preprocessed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/transcribe")
async def transcribe_audio(case_id: str, audio_path: str):
    """Transcribe audio to text using Whisper"""
    try:
        result = await transcription_service.transcribe(audio_path, case_id)
        return TranscriptionResponse(
            case_id=case_id,
            transcript=result["transcript"],
            duration_seconds=result["duration_seconds"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/audio/process-full")
async def process_audio_full(case_id: str, file: UploadFile = File(...)):
    """Full audio processing pipeline: upload -> preprocess -> transcribe"""
    try:
        # 1. Upload
        file_extension = os.path.splitext(file.filename)[1] or ".wav"
        audio_path = os.path.join(UPLOAD_DIR, f"{case_id}{file_extension}")
        
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        with open(audio_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # 2. Preprocess
        cleaned_path = await audio_processor.process_audio(audio_path, case_id)
        
        # 3. Transcribe
        result = await transcription_service.transcribe(cleaned_path, case_id)
        
        return TranscriptionResponse(
            case_id=case_id,
            transcript=result["transcript"],
            duration_seconds=result["duration_seconds"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/extract-clinical-facts")
async def extract_clinical_facts(case_id: str, transcript: str):
    """Extract clinical facts from transcript using MedGemma"""
    try:
        clinical_facts = await clinical_extractor.extract(transcript)
        return ClinicalExtractionResponse(
            case_id=case_id,
            clinical_facts=clinical_facts
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-p3")
async def generate_p3(case_id: str, clinical_facts: dict):
    """Generate P3 medical report from clinical facts"""
    try:
        p3_record = await p3_mapper.map_to_p3(case_id, clinical_facts)
        return P3Response(
            case_id=case_id,
            p3_pre_fill=p3_record
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/evidence/upload")
async def upload_evidence(case_id: str = None, files: List[UploadFile] = File(...)):
    """Upload evidence pictures"""
    try:
        if not case_id:
            raise HTTPException(status_code=400, detail="case_id is required")
        
        uploaded_files = []
        evidence_dir = os.path.join(UPLOAD_DIR, case_id, "evidence")
        os.makedirs(evidence_dir, exist_ok=True)
        
        for file in files:
            file_path = os.path.join(evidence_dir, file.filename)
            with open(file_path, "wb") as f:
                content = await file.read()
                f.write(content)
            uploaded_files.append(file.filename)
        
        return {"case_id": case_id, "uploaded_files": uploaded_files, "status": "uploaded"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/cases/{case_id}")
async def get_case(case_id: str):
    """Get case information"""
    # This would typically fetch from a database
    return {"case_id": case_id, "status": "active"}
