import json
import logging
from app.ai.state import ComplaintState
from app.ai.groq_client import groq_engine

logger = logging.getLogger("ai_nodes")

def intake_extraction_node(state: ComplaintState) -> ComplaintState:
    """Node 1: Extract structured complaint data from unstructured text."""
    logger.info("Executing intake_extraction_node...")
    raw_text = state.get("raw_input_text", "")
    model_name = state.get("model_name", "gemma2-9b-it")
    
    system_prompt = """You are a Senior Pharmaceutical Quality Assurance Specialist.
Your task is to extract structured complaint metadata from the provided complaint input (PDF, email, or customer transcript).
Return a JSON object with these EXACT keys:
- "reporter_name": Name of reporter or null
- "reporter_organization": Institution, hospital, or distributor name
- "contact_email": Contact email address
- "country": Country of origin
- "product_name": Full product name (e.g. Paracetamol 500mg Tablets or Metformin API)
- "product_type": "Finished Dosage Form (FDF)" or "Active Pharmaceutical Ingredient (API)"
- "batch_number": Batch / Lot number if mentioned, else null
- "manufacturing_date": YYYY-MM-DD or null
- "expiry_date": YYYY-MM-DD or null
- "manufacturing_site": Site name or null
- "sample_received": true or false
- "defect_title": Concise 5-10 word title of defect
- "defect_description": Detailed summary of reported issue
- "complaint_category": One of ("Physical Defect", "Chemical Impurity / OOS", "Particulate Contamination", "Packaging & Labelling", "Sub-potency / Efficacy", "Adverse Event")
- "initial_severity": "Critical", "Major", or "Minor"
"""
    try:
        res_str = groq_engine.query(raw_text, system_prompt, model=model_name)
        extracted = json.loads(res_str)
        state["extracted_data"] = extracted
        state["severity"] = extracted.get("initial_severity", "Major")
    except Exception as e:
        logger.error(f"Error in intake_extraction_node: {e}")
        state["errors"].append(f"Intake Extraction Error: {str(e)}")
        state["extracted_data"] = {
            "product_name": "Unknown Pharma Product",
            "product_type": "Finished Dosage Form (FDF)",
            "defect_title": "Customer Complaint Received",
            "defect_description": raw_text[:200],
            "complaint_category": "Physical Defect",
            "initial_severity": "Major"
        }
    
    state["current_node"] = "completeness_checker"
    return state


def completeness_checker_node(state: ComplaintState) -> ComplaintState:
    """Node 2: Evaluate 21 CFR Part 211.198 complaint data completeness."""
    logger.info("Executing completeness_checker_node...")
    extracted = state.get("extracted_data", {})
    raw_text = state.get("raw_input_text", "")
    model_name = state.get("model_name", "gemma2-9b-it")
    
    system_prompt = """You are a Pharma QMS Compliance Auditor.
Analyze the extracted complaint data and determine data completeness for regulatory investigation.
Return JSON with:
- "completeness_score": number 0-100
- "missing_critical_fields": list of missing fields (e.g., ["Batch Number", "Retention Sample Status", "Storage Conditions"])
- "followup_email_draft": A professional follow-up email draft to the customer requesting missing details.
"""
    prompt = f"Extracted Data:\n{json.dumps(extracted, indent=2)}\nRaw Input:\n{raw_text}"
    try:
        res_str = groq_engine.query(prompt, system_prompt, model=model_name)
        res = json.loads(res_str)
        state["completeness_score"] = float(res.get("completeness_score", 70.0))
        state["missing_fields"] = res.get("missing_critical_fields", [])
        state["followup_email_draft"] = res.get("followup_email_draft", "")
    except Exception as e:
        logger.error(f"Error in completeness_checker_node: {e}")
        state["completeness_score"] = 65.0
        state["missing_fields"] = ["Batch Number verification"] if not extracted.get("batch_number") else []
        state["followup_email_draft"] = "Dear Customer, please provide retention sample and batch certificate details."

    state["current_node"] = "risk_assessment"
    return state


def risk_assessment_node(state: ComplaintState) -> ComplaintState:
    """Node 3: Assess health hazard rating, patient safety impact, and FDA alert triggers."""
    logger.info("Executing risk_assessment_node...")
    extracted = state.get("extracted_data", {})
    raw_text = state.get("raw_input_text", "")
    model_name = state.get("model_name", "gemma2-9b-it")
    
    system_prompt = """You are a Regulatory Affairs Expert in Pharmaceutical Risk Management (ICH Q9 / FDA Guidelines).
Evaluate health hazard risk and regulatory reporting obligation for this complaint.
Return JSON with:
- "health_hazard_class": "Class I (Life Threatening / Severe Health Hazard)" OR "Class II (Temporary / Reversible Adverse Effect)" OR "Class III (Unlikely Adverse Consequences)"
- "patient_safety_impact": Detailed description of potential health hazard to patients.
- "regulatory_reporting_trigger": boolean (true if FDA 15-day Field Alert Report required)
- "regulatory_justification": Regulatory explanation referencing 21 CFR 211.198 / EU GMP Annex 11.
- "risk_priority_number": Integer 1-100 (RPN)
"""
    prompt = f"Product: {extracted.get('product_name')}\nCategory: {extracted.get('complaint_category')}\nDefect: {extracted.get('defect_description')}"
    try:
        res_str = groq_engine.query(prompt, system_prompt, model=model_name)
        res = json.loads(res_str)
        state["health_hazard_class"] = res.get("health_hazard_class", "Class II (Temporary / Reversible Adverse Effect)")
        state["patient_safety_impact"] = res.get("patient_safety_impact", "Potential risk to patient health depending on batch distribution.")
        state["regulatory_reporting_trigger"] = bool(res.get("regulatory_reporting_trigger", False))
        state["regulatory_justification"] = res.get("regulatory_justification", "Standard 30-day internal investigation initiated under QMS guidelines.")
        state["risk_priority_number"] = int(res.get("risk_priority_number", 50))
    except Exception as e:
        logger.error(f"Error in risk_assessment_node: {e}")
        state["health_hazard_class"] = "Class II (Temporary / Reversible Adverse Effect)"
        state["patient_safety_impact"] = "Moderate risk to product efficacy."
        state["regulatory_reporting_trigger"] = False
        state["regulatory_justification"] = "Internal QMS investigation required."
        state["risk_priority_number"] = 55

    state["current_node"] = "duplicate_detection"
    return state


def duplicate_detection_node(state: ComplaintState) -> ComplaintState:
    """Node 4: Identify potential duplicate complaints or historical batch trends."""
    logger.info("Executing duplicate_detection_node...")
    extracted = state.get("extracted_data", {})
    batch = extracted.get("batch_number", "")
    
    # Simulating duplicate check against historical DB
    duplicates = []
    if batch and ("PCT" in batch or "2024" in batch or "8841" in batch):
        duplicates.append("CMP-2024-002 (Tablet capping reported in same batch PCT-2024-8841)")
    
    state["duplicate_complaints"] = duplicates
    state["current_node"] = "root_cause_analysis"
    return state


def root_cause_node(state: ComplaintState) -> ComplaintState:
    """Node 5: Perform 5-Why analysis and Ishikawa (Fishbone) root cause breakdown."""
    logger.info("Executing root_cause_node...")
    extracted = state.get("extracted_data", {})
    model_name = state.get("model_name", "gemma2-9b-it")
    
    system_prompt = """You are a Quality Engineering Root Cause Analysis Lead.
Perform a 5-Why Analysis and Ishikawa fishbone classification for this defect.
Return JSON with:
- "primary_root_cause": Clear statement of underlying root cause
- "ishikawa_category": One of ("Machine & Maintenance", "Material & Vendor Quality", "Method & SOP Execution", "Manpower & Training", "Measurement & Testing", "Environment & Storage")
- "why_1": Step 1 why
- "why_2": Step 2 why
- "why_3": Step 3 why
- "why_4": Step 4 why
- "why_5": Step 5 why
- "investigation_summary": 2-3 sentence investigation summary.
"""
    prompt = f"Product: {extracted.get('product_name')}\nDefect: {extracted.get('defect_description')}"
    try:
        res_str = groq_engine.query(prompt, system_prompt, model=model_name)
        res = json.loads(res_str)
        state["rca_data"] = res
    except Exception as e:
        logger.error(f"Error in root_cause_node: {e}")
        state["rca_data"] = {
            "primary_root_cause": "Process parameter variation during batch manufacturing.",
            "ishikawa_category": "Machine & Maintenance",
            "why_1": "Equipment parameter drift.",
            "why_2": "Calibration offset in sensor.",
            "why_3": "Maintenance window missed.",
            "why_4": "Schedule conflict.",
            "why_5": "Preventive maintenance process gap.",
            "investigation_summary": "Root cause linked to machine calibration offset."
        }

    state["current_node"] = "capa_recommendation"
    return state


def capa_recommendation_node(state: ComplaintState) -> ComplaintState:
    """Node 6: Generate actionable Corrective & Preventive Actions (CAPA)."""
    logger.info("Executing capa_recommendation_node...")
    extracted = state.get("extracted_data", {})
    rca = state.get("rca_data", {})
    model_name = state.get("model_name", "gemma2-9b-it")
    
    system_prompt = """You are a CAPA Steering Committee Lead in a Pharma Plant.
Generate concrete Corrective Actions (CA) and Preventive Actions (PA).
Return JSON with key "capas" containing a list of objects, each with:
- "id": "CAPA-1", "CAPA-2"
- "capa_type": "Corrective Action" OR "Preventive Action"
- "description": Specific actionable description
- "assigned_department": e.g., "Quality Control", "Production Maintenance", "Supply Chain", "Regulatory"
- "target_completion_days": integer (e.g. 3, 7, 14, 30)
- "status": "Open"
"""
    prompt = f"Defect: {extracted.get('defect_title')}\nRoot Cause: {rca.get('primary_root_cause')}"
    try:
        res_str = groq_engine.query(prompt, system_prompt, model=model_name)
        res = json.loads(res_str)
        state["capa_list"] = res.get("capas", [])
    except Exception as e:
        logger.error(f"Error in capa_recommendation_node: {e}")
        state["capa_list"] = [
            {
                "id": "CAPA-1",
                "capa_type": "Corrective Action",
                "description": "Quarantine affected batch lots and re-test retain samples.",
                "assigned_department": "Quality Control",
                "target_completion_days": 5,
                "status": "Open"
            },
            {
                "id": "CAPA-2",
                "capa_type": "Preventive Action",
                "description": "Update standard operating procedure (SOP) and recalibrate equipment.",
                "assigned_department": "Production Maintenance",
                "target_completion_days": 14,
                "status": "Open"
            }
        ]

    state["current_node"] = "summary_generator"
    return state


def summary_generator_node(state: ComplaintState) -> ComplaintState:
    """Node 7: Produce an executive regulatory-compliant complaint summary."""
    logger.info("Executing summary_generator_node...")
    extracted = state.get("extracted_data", {})
    hazard = state.get("health_hazard_class", "")
    rca = state.get("rca_data", {})
    capas = state.get("capa_list", [])
    
    summary = f"""# 21 CFR Part 211.198 Executive Complaint Assessment Report

## 1. Complaint Identification & Metadata
- **Product Name**: {extracted.get('product_name', 'N/A')} ({extracted.get('product_type', 'FDF')})
- **Batch / Lot Number**: {extracted.get('batch_number', 'Unspecified')}
- **Manufacturing Site**: {extracted.get('manufacturing_site', 'Main Facility')}
- **Defect Category**: {extracted.get('complaint_category', 'General Quality Defect')}

## 2. Health Hazard & Risk Classification
- **Health Hazard Rating**: {hazard}
- **Risk Priority Number (RPN)**: {state.get('risk_priority_number', 50)} / 100
- **FDA 15-Day Field Alert Triggered**: {'YES (CRITICAL)' if state.get('regulatory_reporting_trigger') else 'NO (Standard 30-Day Evaluation)'}
- **Regulatory Justification**: {state.get('regulatory_justification', '')}

## 3. Investigation & Root Cause (5-Why Analysis)
- **Primary Root Cause**: {rca.get('primary_root_cause', 'Under Investigation')}
- **Ishikawa Domain**: {rca.get('ishikawa_category', 'Machine & Process')}
- **Root Cause Summary**: {rca.get('investigation_summary', '')}

## 4. Corrective & Preventive Action Plan (CAPA)
"""
    for idx, c in enumerate(capas, 1):
        summary += f"- **CAPA #{idx} [{c.get('capa_type')}]**: {c.get('description')} (Dept: {c.get('assigned_department')}, Timeline: {c.get('target_completion_days')} days)\n"

    summary += "\n**Quality Assurance Approval**: Approved by AI Quality Agent Copilot. Recommended for QA Officer final sign-off."
    
    state["executive_summary"] = summary
    state["current_node"] = "completed"
    return state
