
---

## Input Audio

Due to ethical and privacy constraints, **synthetic audio data** is used in this prototype. The audio files are generated from realistic survivor interview scripts that reflect:

- Hesitations and pauses
- Emotional speech patterns
- Forensically relevant descriptions (injury type, timing, mechanism)
- Multiple SGBV scenarios (physical assault, drug-facilitated assault)
- Gender-balanced survivor representation

This approach ensures realism while maintaining survivor dignity and data safety.

---

## Audio Preprocessing

All audio files undergo **conservative preprocessing** to improve speech recognition accuracy while preserving forensic meaning.

### Preprocessing Steps:
- Conversion to mono audio
- Resampling to 16kHz (ASR standard)
- Light noise reduction
- Loudness normalization

⚠️ **Silence, pauses, stutters, and emotional cues are intentionally preserved**, as they can be clinically and legally significant.

Processed audio files are saved as WAV files


