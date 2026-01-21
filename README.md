
## ## Clinical Text Postprocessing (MedGemma)

This stage transforms raw ASR transcripts into structured clinical and forensic facts using **MedGemma** from Google’s Health AI Developer Foundations (HAI-DEF).

### Objective
To bridge the gap between survivor speech and medical-legal documentation by extracting clinically relevant facts while preserving survivor intent and uncertainty.

---

### Model Usage
MedGemma is used for medical language understanding and clinical reasoning, enabling:
- Injury identification
- Mechanism-of-injury inference
- Timeline extraction
- Detection of drug-facilitated assault indicators
- Explicit capture of survivor uncertainty

This task requires domain-specific medical reasoning and cannot be reliably performed using general-purpose language models.

---

### Extraction Strategy
- Verbatim transcripts are passed to MedGemma
- A structured prompt enforces:
  - No summarization
  - No assumption
  - Neutral clinical language
- Output is constrained to JSON for downstream forensic formatting

---


