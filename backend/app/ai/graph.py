import logging
from langgraph.graph import StateGraph, END
from app.ai.state import ComplaintState
from app.ai.nodes import (
    intake_extraction_node,
    completeness_checker_node,
    risk_assessment_node,
    duplicate_detection_node,
    root_cause_node,
    capa_recommendation_node,
    summary_generator_node
)

logger = logging.getLogger("ai_graph")

def build_complaint_graph():
    """Build and compile the LangGraph StateGraph workflow for Pharma Complaint Handling."""
    workflow = StateGraph(ComplaintState)
    
    # Add Nodes
    workflow.add_node("intake_extraction", intake_extraction_node)
    workflow.add_node("completeness_checker", completeness_checker_node)
    workflow.add_node("risk_assessment", risk_assessment_node)
    workflow.add_node("duplicate_detection", duplicate_detection_node)
    workflow.add_node("root_cause_analysis", root_cause_node)
    workflow.add_node("capa_recommendation", capa_recommendation_node)
    workflow.add_node("summary_generator", summary_generator_node)
    
    # Define Edges / Transitions
    workflow.set_entry_point("intake_extraction")
    workflow.add_edge("intake_extraction", "completeness_checker")
    workflow.add_edge("completeness_checker", "risk_assessment")
    workflow.add_edge("risk_assessment", "duplicate_detection")
    workflow.add_edge("duplicate_detection", "root_cause_analysis")
    workflow.add_edge("root_cause_analysis", "capa_recommendation")
    workflow.add_edge("capa_recommendation", "summary_generator")
    workflow.add_edge("summary_generator", END)
    
    app_graph = workflow.compile()
    return app_graph

complaint_ai_workflow = build_complaint_graph()

def run_complaint_ai_pipeline(raw_text: str, source_type: str = "Document", model_name: str = "gemma2-9b-it") -> ComplaintState:
    """Execute the complete 7-stage LangGraph Complaint Processing pipeline."""
    initial_state: ComplaintState = {
        "raw_input_text": raw_text,
        "source_type": source_type,
        "model_name": model_name,
        "complaint_id": None,
        "current_node": "start",
        "errors": [],
        "extracted_data": {},
        "completeness_score": 0.0,
        "missing_fields": [],
        "followup_email_draft": "",
        "health_hazard_class": "",
        "patient_safety_impact": "",
        "regulatory_reporting_trigger": False,
        "regulatory_justification": "",
        "risk_priority_number": 50,
        "severity": "Major",
        "duplicate_complaints": [],
        "rca_data": {},
        "capa_list": [],
        "executive_summary": ""
    }
    
    logger.info(f"Running LangGraph AI workflow with model: {model_name}...")
    final_state = complaint_ai_workflow.invoke(initial_state)
    return final_state
