from typing import TypedDict, Optional, List, Dict, Any

class ComplaintState(TypedDict):
    """LangGraph State representation for processing Customer Complaints in Pharma QMS."""
    # Input data
    raw_input_text: str
    source_type: str # PDF, Email, Manual Prompt
    model_name: str
    
    # State flags & execution metadata
    complaint_id: Optional[str]
    current_node: str
    errors: List[str]
    
    # Extracted Intake Metadata
    extracted_data: Dict[str, Any]
    
    # Completeness Check
    completeness_score: float
    missing_fields: List[str]
    followup_email_draft: Optional[str]
    
    # Risk & Hazard Assessment
    health_hazard_class: str
    patient_safety_impact: str
    regulatory_reporting_trigger: bool
    regulatory_justification: str
    risk_priority_number: int
    severity: str
    
    # Historical / Duplicate Check
    duplicate_complaints: List[str]
    
    # Root Cause Analysis (5-Why & Ishikawa)
    rca_data: Dict[str, Any]
    
    # CAPA Recommendations
    capa_list: List[Dict[str, Any]]
    
    # Executive Summary Report
    executive_summary: str
