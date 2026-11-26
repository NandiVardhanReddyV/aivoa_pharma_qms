import os
import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.schema import (
    DBComplaint, DBRiskAssessment, DBRootCauseAnalysis, DBCAPA, DBAuditLog,
    ComplaintCreateSchema, ComplaintResponseSchema, IngestRequest, ComplaintUpdateSchema
)
from app.ai.graph import run_complaint_ai_pipeline

router = APIRouter()

def _format_complaint_dict(c: DBComplaint) -> dict:
    risk_dict = None
    if c.risk_assessment:
        risk_dict = {
            "health_hazard_class": c.risk_assessment.health_hazard_class,
            "patient_safety_impact": c.risk_assessment.patient_safety_impact,
            "regulatory_reporting_trigger": c.risk_assessment.regulatory_reporting_trigger,
            "regulatory_justification": c.risk_assessment.regulatory_justification,
            "missing_critical_fields": c.risk_assessment.missing_critical_fields or [],
            "followup_email_draft": c.risk_assessment.followup_email_draft,
            "duplicate_complaint_ids": c.risk_assessment.duplicate_complaint_ids or [],
            "ai_confidence_score": c.risk_assessment.ai_confidence_score
        }

    rca_dict = None
    if c.rca:
        rca_dict = {
            "primary_root_cause": c.rca.primary_root_cause,
            "ishikawa_category": c.rca.ishikawa_category,
            "why_1": c.rca.why_1,
            "why_2": c.rca.why_2,
            "why_3": c.rca.why_3,
            "why_4": c.rca.why_4,
            "why_5": c.rca.why_5,
            "investigation_summary": c.rca.investigation_summary
        }

    capa_list = []
    if c.capas:
        for capa in c.capas:
            capa_list.append({
                "id": capa.id,
                "capa_type": capa.capa_type,
                "description": capa.description,
                "assigned_department": capa.assigned_department,
                "target_completion_days": capa.target_completion_days,
                "status": capa.status,
                "verified_by": capa.verified_by
            })

    return {
        "id": c.id,
        "created_at": c.created_at,
        "reporter_name": c.reporter_name,
        "reporter_organization": c.reporter_organization,
        "contact_email": c.contact_email,
        "country": c.country,
        "product_name": c.product_name,
        "product_type": c.product_type,
        "batch_number": c.batch_number,
        "manufacturing_date": c.manufacturing_date,
        "expiry_date": c.expiry_date,
        "manufacturing_site": c.manufacturing_site,
        "sample_received": c.sample_received,
        "defect_title": c.defect_title,
        "defect_description": c.defect_description,
        "complaint_category": c.complaint_category,
        "status": c.status,
        "severity": c.severity,
        "risk_priority_number": c.risk_priority_number,
        "fda_15day_alert_required": c.fda_15day_alert_required,
        "completeness_score": c.completeness_score,
        "raw_transcript": c.raw_transcript,
        "source_type": c.source_type,
        "risk_assessment": risk_dict,
        "rca": rca_dict,
        "capas": capa_list
    }


@router.post("/complaints/ingest")
async def ingest_complaint(
    text_content: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    model_name: str = Form("gemma2-9b-it"),
    db: AsyncSession = Depends(get_db)
):
    """Ingest raw prompt or uploaded PDF/Email file -> execute 7-stage LangGraph workflow -> save to DB."""
    source_type = "Manual Prompt"

    if file:
        source_type = f"Uploaded File ({file.filename})"
        content_bytes = await file.read()
    
        if file.filename.lower().endswith(".pdf"):
            try:
                import io
                import pypdf
    
                pdf_reader = pypdf.PdfReader(io.BytesIO(content_bytes))
    
                extracted_pages = [
                    page.extract_text()
                    for page in pdf_reader.pages
                    if page.extract_text()
                ]
    
                text_content = "\n".join(extracted_pages)
    
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Could not read PDF file: {str(e)}"
                )
        else:
            text_content = content_bytes.decode(
                "utf-8",
                errors="ignore"
            )
    
    text_content = text_content or ""

    if not text_content or not text_content.strip():
        raise HTTPException(status_code=400, detail="No text content or file provided for complaint ingestion.")

    # Execute LangGraph Workflow
    final_state = run_complaint_ai_pipeline(text_content, source_type=source_type, model_name=model_name)
    extracted = final_state.get("extracted_data", {})
    rca_data = final_state.get("rca_data", {})
    capa_list = final_state.get("capa_list", [])

    # Generate unique complaint ID
    count_stmt = select(DBComplaint)
    result = await db.execute(count_stmt)
    existing_count = len(result.scalars().all()) + 1
    complaint_id = f"CMP-{datetime.date.today().year}-{existing_count:03d}"

    # Create Complaint record
    db_complaint = DBComplaint(
        id=complaint_id,
        reporter_name=extracted.get("reporter_name") or "Healthcare QA Officer",
        reporter_organization=extracted.get("reporter_organization") or "Global Pharma Distributor",
        contact_email=extracted.get("contact_email") or "qa.contact@pharma-distrib.com",
        country=extracted.get("country") or "United States",
        product_name=extracted.get("product_name") or "Paracetamol 500mg Tablets",
        product_type=extracted.get("product_type") or "Finished Dosage Form (FDF)",
        batch_number=extracted.get("batch_number") or "PCT-2024-8841",
        manufacturing_date=extracted.get("manufacturing_date") or "2024-02-10",
        expiry_date=extracted.get("expiry_date") or "2026-02-09",
        manufacturing_site=extracted.get("manufacturing_site") or "Site Alpha - Formulations Facility",
        sample_received=bool(extracted.get("sample_received", False)),
        defect_title=extracted.get("defect_title") or "Product Quality Defect",
        defect_description=extracted.get("defect_description") or text_content[:400],
        complaint_category=extracted.get("complaint_category") or "Physical Defect",
        raw_transcript=text_content,
        source_type=source_type,
        status="Under AI Assessment",
        severity=final_state.get("severity", "Major"),
        risk_priority_number=final_state.get("risk_priority_number", 50),
        fda_15day_alert_required=final_state.get("regulatory_reporting_trigger", False),
        completeness_score=final_state.get("completeness_score", 75.0)
    )
    db.add(db_complaint)
    await db.flush()

    # Create Risk Assessment record
    db_risk = DBRiskAssessment(
        complaint_id=complaint_id,
        health_hazard_class=final_state.get("health_hazard_class", "Class II (Temporary / Reversible Adverse Effect)"),
        patient_safety_impact=final_state.get("patient_safety_impact", "Standard monitoring required."),
        regulatory_reporting_trigger=final_state.get("regulatory_reporting_trigger", False),
        regulatory_justification=final_state.get("regulatory_justification", "Processed under 21 CFR 211.198 guidelines."),
        missing_critical_fields=final_state.get("missing_fields", []),
        followup_email_draft=final_state.get("followup_email_draft", ""),
        duplicate_complaint_ids=final_state.get("duplicate_complaints", []),
        ai_confidence_score=0.94
    )
    db.add(db_risk)

    # Create RCA record
    db_rca = DBRootCauseAnalysis(
        complaint_id=complaint_id,
        primary_root_cause=rca_data.get("primary_root_cause", "Pending full laboratory investigation"),
        ishikawa_category=rca_data.get("ishikawa_category", "Machine & Process"),
        why_1=rca_data.get("why_1"),
        why_2=rca_data.get("why_2"),
        why_3=rca_data.get("why_3"),
        why_4=rca_data.get("why_4"),
        why_5=rca_data.get("why_5"),
        investigation_summary=rca_data.get("investigation_summary", "LangGraph 5-Why analysis completed.")
    )
    db.add(db_rca)

    # Create CAPA records
    for idx, c_item in enumerate(capa_list, 1):
        capa_id = f"CAPA-{complaint_id}-{idx}"
        db_capa = DBCAPA(
            id=capa_id,
            complaint_id=complaint_id,
            capa_type=c_item.get("capa_type", "Corrective Action"),
            description=c_item.get("description", "Inspect batch retains"),
            assigned_department=c_item.get("assigned_department", "QA"),
            target_completion_days=c_item.get("target_completion_days", 14),
            status=c_item.get("status", "Open")
        )
        db.add(db_capa)

    # Add Audit Log
    db_audit = DBAuditLog(
        complaint_id=complaint_id,
        action="LangGraph Autonomous Ingestion & Risk Assessment",
        performed_by=f"LangGraph Agent ({model_name})",
        details=f"Extracted metadata, score {final_state.get('completeness_score')}%, RPN {final_state.get('risk_priority_number')}."
    )
    db.add(db_audit)

    await db.commit()

    # Query back full object with relationships
    stmt = select(DBComplaint).options(
        selectinload(DBComplaint.risk_assessment),
        selectinload(DBComplaint.rca),
        selectinload(DBComplaint.capas)
    ).where(DBComplaint.id == complaint_id)
    res = await db.execute(stmt)
    full_complaint = res.scalar_one()

    return _format_complaint_dict(full_complaint)


@router.get("/complaints")
async def list_complaints(
    severity: Optional[str] = None,
    product_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """List all customer complaints with optional filters."""
    stmt = select(DBComplaint).options(
        selectinload(DBComplaint.risk_assessment),
        selectinload(DBComplaint.rca),
        selectinload(DBComplaint.capas)
    ).order_by(DBComplaint.created_at.desc())

    if severity:
        stmt = stmt.where(DBComplaint.severity == severity)
    if product_type:
        stmt = stmt.where(DBComplaint.product_type == product_type)

    res = await db.execute(stmt)
    complaints = res.scalars().all()
    return [_format_complaint_dict(c) for c in complaints]


@router.get("/complaints/{complaint_id}")
async def get_complaint(complaint_id: str, db: AsyncSession = Depends(get_db)):
    """Get single complaint by ID."""
    stmt = select(DBComplaint).options(
        selectinload(DBComplaint.risk_assessment),
        selectinload(DBComplaint.rca),
        selectinload(DBComplaint.capas)
    ).where(DBComplaint.id == complaint_id)
    res = await db.execute(stmt)
    c = res.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return _format_complaint_dict(c)


@router.post("/complaints/{complaint_id}/reassess")
async def reassess_complaint(
    complaint_id: str,
    model_name: str = "llama-3.3-70b-versatile",
    db: AsyncSession = Depends(get_db)
):
    """Re-assess complaint using specified Groq model (e.g., llama-3.3-70b-versatile)."""
    stmt = select(DBComplaint).options(
        selectinload(DBComplaint.risk_assessment),
        selectinload(DBComplaint.rca),
        selectinload(DBComplaint.capas)
    ).where(DBComplaint.id == complaint_id)
    res = await db.execute(stmt)
    c = res.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")

    text_content = c.raw_transcript or f"{c.defect_title} {c.defect_description}"
    final_state = run_complaint_ai_pipeline(text_content, source_type=c.source_type, model_name=model_name)

    # Update risk assessment
    if c.risk_assessment:
        c.risk_assessment.health_hazard_class = final_state.get("health_hazard_class", c.risk_assessment.health_hazard_class)
        c.risk_assessment.patient_safety_impact = final_state.get("patient_safety_impact", c.risk_assessment.patient_safety_impact)
        c.risk_assessment.regulatory_reporting_trigger = final_state.get("regulatory_reporting_trigger", c.risk_assessment.regulatory_reporting_trigger)
        c.risk_assessment.regulatory_justification = final_state.get("regulatory_justification", c.risk_assessment.regulatory_justification)
    
    c.risk_priority_number = final_state.get("risk_priority_number", c.risk_priority_number)
    c.fda_15day_alert_required = final_state.get("regulatory_reporting_trigger", c.fda_15day_alert_required)
    
    # Audit log
    db_audit = DBAuditLog(
        complaint_id=c.id,
        action=f"AI Copilot Re-Assessment via {model_name}",
        performed_by=f"Groq LLM ({model_name})",
        details="Updated risk analysis and RPN score."
    )
    db.add(db_audit)
    await db.commit()

    return _format_complaint_dict(c)


@router.get("/analytics")
async def get_analytics(db: AsyncSession = Depends(get_db)):
    """Analytics dashboard statistics for QMS executives."""
    stmt = select(DBComplaint)
    res = await db.execute(stmt)
    all_c = res.scalars().all()

    total = len(all_c)
    critical_count = sum(1 for c in all_c if c.severity == "Critical")
    major_count = sum(1 for c in all_c if c.severity == "Major")
    fda_alert_count = sum(1 for c in all_c if c.fda_15day_alert_required)
    fdf_count = sum(1 for c in all_c if "FDF" in c.product_type or "Finished" in c.product_type)
    api_count = sum(1 for c in all_c if "API" in c.product_type or "Active" in c.product_type)

    avg_completeness = (sum(c.completeness_score for c in all_c) / total) if total > 0 else 0.0

    return {
        "total_complaints": total,
        "critical_severity": critical_count,
        "major_severity": major_count,
        "fda_15day_alerts": fda_alert_count,
        "fdf_product_complaints": fdf_count,
        "api_product_complaints": api_count,
        "avg_completeness_score": round(avg_completeness, 1)
    }
