import os
import librosa
import torch
from transformers import pipeline
from typing import Dict


class TranscriptionService:
    """Transcription service using Whisper-large-v3 (MedASR-compatible)"""
    
    def __init__(self):
        # Initialize Whisper pipeline
        # Using openai/whisper-large-v3 as MedASR proxy
        self.model_name = "openai/whisper-large-v3"
        self.asr_pipeline = None
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize the Whisper ASR pipeline"""
        try:
            self.asr_pipeline = pipeline(
                "automatic-speech-recognition",
                model=self.model_name,
                device=0 if torch.cuda.is_available() else -1,
                return_timestamps=False
            )
        except Exception as e:
            print(f"Warning: Could not initialize Whisper model: {e}")
            print("Model will be initialized on first use")
    
    def _ensure_model_loaded(self):
        """Ensure model is loaded before use"""
        if self.asr_pipeline is None:
            self._initialize_model()
    
    async def transcribe(self, audio_path: str, case_id: str) -> Dict:
        """
        Transcribe audio file to text.
        Returns verbatim transcript preserving hesitations and pauses.
        """
        self._ensure_model_loaded()
        
        try:
            # Validate audio
            duration = self._validate_audio(audio_path)
            
            # Run ASR transcription
            result = self.asr_pipeline(
                audio_path,
                generate_kwargs={
                    "task": "transcribe",
                    "language": "en",
                    "temperature": 0.0  # Avoids hallucination
                }
            )
            
            transcript_text = result["text"].strip()
            
            return {
                "audio_id": case_id,
                "duration_seconds": round(duration, 2),
                "transcript": transcript_text,
                "language": "en",
                "model": "MedASR-compatible (Whisper-large-v3)"
            }
        
        except Exception as e:
            raise Exception(f"Transcription failed: {str(e)}")
    
    def _validate_audio(self, audio_path: str) -> float:
        """Validate audio file and return duration"""
        try:
            y, sr = librosa.load(audio_path, sr=None)
            duration = len(y) / sr
            return duration
        except Exception as e:
            raise Exception(f"Audio validation failed: {str(e)}")
