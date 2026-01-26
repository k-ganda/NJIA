# NJIA  
## A trauma-informed AI assistant that bridges the gap between clinical care and forensic justice for SGBV survivors.


---

### One-Sentence Summary
NJIA is a human-centered AI system that transforms a single trauma-informed survivor interview into structured, forensic-ready medical documentation.

---

## Overview

Survivors of Sexual and Gender-Based Violence (SGBV) are often forced to recount their trauma multiple times—to clinicians, police officers, and legal professionals—resulting in re-traumatization and fragmented documentation. In many low-resource settings, clinical notes lack the forensic rigor required for successful prosecution, contributing to persistently low conviction rates.

**NJIA** addresses this gap by introducing an **AI-assisted forensic documentation pipeline** that allows a survivor to speak once, while the system handles the administrative and technical burden of medical-legal record creation.

The system is designed for **offline, privacy-preserving deployment**, making it suitable for frontline clinics and community health settings.

---

## Core Principles

- **Trauma-Informed Design**: Survivors speak once; AI manages documentation.
- **Human-in-the-Loop**: Clinicians retain full authority and review control.
- **Justice-Centered AI**: Outputs are optimized for medico-legal integrity.
- **Privacy by Design**: No real survivor data is used; all inputs are synthetic.
- **Reproducibility**: Fully executable pipeline using open, auditable tools.

---

## Project Architecture

Survivor Audio
↓
Audio Preprocessing
↓
MedASR-Compatible Transcription
↓
MedGemma Clinical Reasoning (HAI-DEF)
↓
Forensic Clinical Formatting (P3 Mapping)


---

## Repository Structure

NJIA/
│
├── 1_input_audio/
│ └── Synthetic survivor interview audio files
│
├── 2_preprocessing/
│ ├── audio_cleaning.ipynb
│ └── cleaned_audio/
│
├── 3_medASR_transcription.ipynb
│ └── MedASR-compatible transcription pipeline
│
├── 4_text_postprocessing.ipynb
│ └── MedGemma-powered clinical fact extraction
│
├── 5_clinical_formatting.ipynb
│ └── Forensic documentation and P3 pre-fill mapping
│
└── README.md


---

## Input Data

Due to ethical and privacy considerations, **synthetic audio testimonies** are used throughout this prototype. These audio files are generated from carefully written scripts that reflect real-world survivor interviews, including:

- Natural pauses and hesitations
- Emotional speech patterns
- Forensically relevant details (injury type, timing, mechanism)
- Multiple assault scenarios (physical assault, drug-facilitated assault)
- Gender-balanced survivor representation

This approach enables realistic evaluation while protecting survivor dignity.

---

## Pipeline Stages

### 1. Audio Preprocessing

Raw audio files are standardized to improve speech recognition accuracy while preserving clinically meaningful speech characteristics.

**Steps include:**
- Conversion to mono audio
- Resampling to 16kHz
- Light noise reduction
- Loudness normalization

Pauses, stutters, and emotional cues are intentionally preserved.

---

### 2. MedASR-Compatible Transcription

Cleaned audio is transcribed using a **medical-grade ASR proxy** designed to be compatible with MedASR from Google’s Health AI Developer Foundations (HAI-DEF).

Due to limited public availability of MedASR weights, this prototype demonstrates the transcription layer using **Whisper-large-v3** as an open baseline. The architecture is explicitly designed to be **swappable with MedASR** in regulated deployments.

The transcription process prioritizes **verbatim capture** over linguistic normalization.

---

### 3. Clinical Text Postprocessing (MedGemma)

This stage uses **MedGemma**, an open-weight medical language model from Google’s Health AI Developer Foundations, to extract structured clinical and forensic facts from raw transcripts.

**Extracted information includes:**
- Injury types and locations
- Injury age indicators
- Mechanism of injury
- Timing of assault
- Indicators of drug-facilitated assault
- Survivor uncertainty and memory gaps

Outputs are structured as JSON and intentionally avoid summarization or assumption.

---

### 4. Forensic Clinical Formatting (P3 Mapping)

Extracted clinical facts are mapped into a structured format aligned with the **Kenya Police P3 medical examination form**.

The system:
- Pre-fills relevant sections (history, physical findings)
- Leaves diagnostic and opinion fields blank
- Explicitly flags records as requiring clinician review

This design reduces documentation burden while preserving medico-legal integrity.

---

## Ethical Safeguards

- No real survivor data is used
- AI does not determine guilt or make diagnoses
- Survivor uncertainty is preserved verbatim
- Clinicians remain final decision-makers
- Outputs are drafts, not legal documents

---

## Intended Impact

If deployed, NJIA has the potential to:
- Reduce survivor re-traumatization
- Improve quality and consistency of forensic documentation
- Increase successful prosecution rates for SGBV cases
- Support overburdened frontline clinicians
- Strengthen trust in health-justice systems

---

## Limitations

- This is a research prototype, not a certified clinical tool
- P3 mapping is a digital abstraction, not an official government form
- Deployment would require regulatory approval, clinician training, and ethical oversight, and more recordings for variability.

## MVP

https://4147a63e.mydala.app 

---

## Author

**Kathrine Ganda**  
AI & Digital Health Researcher  

Project: **NJIA (The Path): A MedGemma-Powered Forensic Intelligence Layer**

---

## Disclaimer

NJIA is a research demonstration and is not intended for live clinical or legal use without appropriate regulatory, ethical, and professional approvals.


