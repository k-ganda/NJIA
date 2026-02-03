import json
import re
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from typing import Dict


class ClinicalExtractor:
    """Clinical fact extraction service using MedGemma"""
    
    def __init__(self):
        # MedGemma model from Google Health AI Developer Foundations
        self.model_name = "google/gemma-2-2b-it"  # Using Gemma as MedGemma proxy
        # Note: In production, use actual MedGemma model when available
        self.tokenizer = None
        self.model = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize MedGemma model and tokenizer"""
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                device_map="auto" if torch.cuda.is_available() else None,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
            )
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
        except Exception as e:
            print(f"Warning: Could not initialize MedGemma model: {e}")
            print("Model will be initialized on first use")
    
    def _ensure_model_loaded(self):
        """Ensure model is loaded before use"""
        if self.model is None or self.tokenizer is None:
            self._initialize_model()
    
    async def extract(self, transcript: str) -> Dict:
        """
        Extract structured clinical facts from survivor testimony.
        Returns JSON with clinical facts.
        """
        self._ensure_model_loaded()
        
        try:
            prompt = self._build_prompt(transcript)
            
            inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)
            
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=512,
                temperature=0.0,
                do_sample=False
            )
            
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Extract JSON from response
            clinical_facts = self._extract_json(response)
            
            return clinical_facts
        
        except Exception as e:
            raise Exception(f"Clinical extraction failed: {str(e)}")
    
    def _build_prompt(self, transcript: str) -> str:
        """Build the prompt for MedGemma"""
        system_prompt = """You are a medical forensic documentation assistant.

Your task is to extract structured clinical facts from survivor testimony.
Do NOT summarize.
Do NOT add new information.
Do NOT assume intent.

Only extract facts explicitly stated or clearly implied.

Use neutral, clinical language.
"""
        
        user_prompt = f"""Extract the following fields from the testimony below.

Fields:
- injury_type
- body_location
- injury_color_or_stage
- mechanism_of_injury
- timing_of_assault
- repeated_assault (yes/no/unclear)
- drug_facilitated_indicators
- survivor_uncertainty_notes

Return output as JSON only.

Testimony:
\"\"\"{transcript}\"\"\"
"""
        
        return system_prompt + user_prompt
    
    def _extract_json(self, response: str) -> Dict:
        """Extract JSON from model response"""
        # Try to find JSON in response
        json_match = re.search(r"\{.*\}", response, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass
        
        # If no valid JSON found, return empty structure
        return {
            "injury_type": None,
            "body_location": None,
            "injury_color_or_stage": None,
            "mechanism_of_injury": None,
            "timing_of_assault": None,
            "repeated_assault": None,
            "drug_facilitated_indicators": None,
            "survivor_uncertainty_notes": None
        }
