# NJIA - Setup Instructions

This document provides instructions for setting up and running the NJIA frontend and backend.

## Project Structure

```
NJIA/
├── backend/              # FastAPI backend
│   ├── services/        # AI model services
│   ├── main.py         # FastAPI application
│   └── requirements.txt
├── frontend/            # React frontend
│   ├── src/
│   │   ├── pages/      # Page components
│   │   └── App.jsx
│   └── package.json
└── notebooks/           # Original Jupyter notebooks with models
```

## Backend Setup

### Prerequisites
- Python 3.9 or higher
- pip

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

**Note:** The first time you run the backend, it will download the Whisper and MedGemma models, which can be several GB in size. This may take some time.

### Running the Backend

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

API documentation (Swagger UI) will be available at `http://localhost:8000/docs`

## Frontend Setup

### Prerequisites
- Node.js 16 or higher
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

### Running the Frontend

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage Flow

1. **Landing Page**: Start by clicking "Start New Case" to create a new case file
2. **Audio Intake**: Record audio or upload an audio file for transcription
3. **P3 Report**: Review and complete the P3 medical report form (pre-filled with AI-extracted data)
4. **Evidence Upload**: Upload evidence pictures associated with the case

## API Endpoints

### Cases
- `POST /api/cases/create` - Create a new case
- `GET /api/cases/{case_id}` - Get case information

### Audio Processing
- `POST /api/audio/upload` - Upload audio file
- `POST /api/audio/preprocess` - Preprocess audio (clean, normalize)
- `POST /api/transcribe` - Transcribe audio to text

### Clinical Processing
- `POST /api/extract-clinical-facts` - Extract clinical facts from transcript
- `POST /api/generate-p3` - Generate P3 medical report

### Evidence
- `POST /api/evidence/upload` - Upload evidence pictures

## Model Integration

The backend integrates models from the notebooks:

1. **Audio Preprocessing** (`services/audio_processor.py`)
   - Uses librosa and noisereduce
   - Converts to mono, resamples to 16kHz, reduces noise

2. **Transcription** (`services/transcription_service.py`)
   - Uses Whisper-large-v3 (MedASR-compatible)
   - Provides verbatim transcription

3. **Clinical Extraction** (`services/clinical_extractor.py`)
   - Uses MedGemma (via Gemma proxy)
   - Extracts structured clinical facts

4. **P3 Mapping** (`services/p3_mapper.py`)
   - Maps clinical facts to P3 medical report structure

## Troubleshooting

### Backend Issues

- **Model download fails**: Ensure you have sufficient disk space (models can be 5-10GB)
- **CUDA errors**: The models will fall back to CPU if CUDA is not available
- **Port already in use**: Change the port in the uvicorn command

### Frontend Issues

- **CORS errors**: Ensure the backend is running and CORS is configured correctly
- **API connection fails**: Check that the backend URL in `vite.config.js` matches your backend port

## Development Notes

- The models are loaded on first use, which may take time
- For production, consider using model caching or a separate model service
- Audio files are stored in `backend/uploads/` and cleaned audio in `backend/cleaned_audio/`
- Evidence pictures are stored in `backend/uploads/{case_id}/evidence/`

## Next Steps

- Add database persistence for cases
- Implement PDF export for P3 reports
- Add OpenMRS integration
- Implement user authentication
- Add error handling and logging
- Add unit tests
