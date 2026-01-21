
## MedASR Transcription

This stage converts cleaned survivor audio testimonies into raw clinical transcripts using a MedASR-compatible automatic speech recognition pipeline.

### Objective
To generate **verbatim, clinically faithful transcripts** from survivor speech while preserving:
- Hesitations and filler words (e.g., “uh”, “um”)
- Pauses and fragmented sentences
- Emotionally affected speech patterns

These elements are critical for forensic interpretation and downstream clinical reasoning.

---

### Model Choice
Due to limited public access to MedASR weights, this prototype demonstrates the transcription layer using **Whisper-large-v3** as an open, medical-capable ASR baseline. The system is architected to be **directly swappable** with MedASR from Google’s Health AI Developer Foundations in regulated clinical environments.

---

### Processing Steps
1. Load preprocessed 16kHz mono WAV files
2. Validate audio duration and sampling rate
3. Transcribe each audio file using the ASR pipeline
4. Save outputs as:
   - Individual `.txt` transcript files
   - A structured `transcripts.json` file for downstream NLP

---

### Output Artifacts

3_medASR_outputs/
│
├── survivor_case_01.txt
├── survivor_case_02.txt
├── survivor_case_03.txt
├── survivor_case_04.txt
└── transcripts.json

Ethical Considerations

Only synthetic audio data is used

No summarization or reinterpretation is performed at this stage

Human review is expected before any clinical or legal use
