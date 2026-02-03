from datetime import datetime
from typing import Dict


class P3Mapper:
    """P3 Medical Report mapping service"""
    
    def empty_p3_record(self) -> Dict:
        """Create an empty P3 record structure"""
        return {
            "facility_details": {
                "facility_name": None,
                "examiner_name": None,
                "exam_date": None
            },
            "survivor_statement_summary": None,
            "history_of_assault": {
                "timing": None,
                "mechanism": None,
                "repeated_assault": None,
                "drug_facilitated_suspected": None
            },
            "physical_examination": {
                "injuries_observed": [],
                "injury_locations": [],
                "injury_age_estimate": None
            },
            "clinical_opinion": {
                "consistency_with_history": "To be determined by clinician",
                "degree_of_force": None
            },
            "limitations_and_uncertainty": [],
            "clinician_review_required": True
        }
    
    async def map_to_p3(self, case_id: str, clinical_facts: Dict) -> Dict:
        """
        Map extracted clinical facts to P3 medical report structure.
        Pre-fills relevant sections while leaving diagnostic fields blank.
        """
        p3 = self.empty_p3_record()
        
        # Set exam date
        p3["facility_details"]["exam_date"] = datetime.today().strftime("%Y-%m-%d")
        
        # Map history of assault
        p3["history_of_assault"]["timing"] = clinical_facts.get("timing_of_assault")
        p3["history_of_assault"]["mechanism"] = clinical_facts.get("mechanism_of_injury")
        p3["history_of_assault"]["repeated_assault"] = clinical_facts.get("repeated_assault")
        
        # Map drug-facilitated indicators
        drug_flag = clinical_facts.get("drug_facilitated_indicators")
        p3["history_of_assault"]["drug_facilitated_suspected"] = (
            "yes" if drug_flag not in ["no", None, ""] else "no"
        )
        
        # Map physical examination findings
        injury_type = clinical_facts.get("injury_type")
        if injury_type:
            p3["physical_examination"]["injuries_observed"] = (
                [injury_type] if isinstance(injury_type, str) else injury_type
            )
        
        body_location = clinical_facts.get("body_location")
        if body_location:
            p3["physical_examination"]["injury_locations"] = (
                [body_location] if isinstance(body_location, str) else body_location
            )
        
        p3["physical_examination"]["injury_age_estimate"] = clinical_facts.get("injury_color_or_stage")
        
        # Map uncertainty notes
        uncertainty = clinical_facts.get("survivor_uncertainty_notes")
        if uncertainty:
            p3["limitations_and_uncertainty"] = (
                [uncertainty] if isinstance(uncertainty, str) else uncertainty
            )
        
        return p3
