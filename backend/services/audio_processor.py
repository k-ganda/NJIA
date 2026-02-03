import os
import librosa
import soundfile as sf
import numpy as np
import noisereduce as nr
from pathlib import Path


class AudioProcessor:
    """Audio preprocessing service - cleans and normalizes audio for transcription"""
    
    def __init__(self):
        self.target_sr = 16000  # Standard for ASR
        self.output_dir = "cleaned_audio"
        os.makedirs(self.output_dir, exist_ok=True)
    
    async def process_audio(self, audio_path: str, case_id: str) -> str:
        """
        Process audio file:
        - Convert to mono
        - Resample to 16kHz
        - Light noise reduction
        - Loudness normalization
        """
        try:
            # Load audio
            y, sr = librosa.load(audio_path, sr=None, mono=False)
            
            # Convert to mono if stereo
            if len(y.shape) > 1:
                y = librosa.to_mono(y)
            
            # Resample to target sample rate
            if sr != self.target_sr:
                y = librosa.resample(y, orig_sr=sr, target_sr=self.target_sr)
            
            # Light noise reduction (preserving speech characteristics)
            y = nr.reduce_noise(y=y, sr=self.target_sr, stationary=False, prop_decrease=0.3)
            
            # Loudness normalization (LUFS-based)
            y = self._normalize_loudness(y)
            
            # Save cleaned audio
            output_path = os.path.join(self.output_dir, f"{case_id}_cleaned.wav")
            sf.write(output_path, y, self.target_sr)
            
            return output_path
        
        except Exception as e:
            raise Exception(f"Audio processing failed: {str(e)}")
    
    def _normalize_loudness(self, y: np.ndarray, target_lufs: float = -23.0) -> np.ndarray:
        """Normalize audio loudness to target LUFS"""
        # Simple RMS-based normalization (LUFS calculation requires more complex processing)
        # For MVP, using RMS normalization
        rms = np.sqrt(np.mean(y**2))
        if rms > 0:
            target_rms = 0.1  # Target RMS level
            y = y * (target_rms / rms)
        
        # Prevent clipping
        y = np.clip(y, -1.0, 1.0)
        return y
