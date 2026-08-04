import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.schema import DBComplaint, DBRiskAssessment, DBRootCauseAnalysis, DBCAPA, DBAuditLog

async def seed_sample_data(db: AsyncSession):
    """Seed DB with realistic pharmaceutical complaints (FDF & API) if empty."""
    stmt = select(DBComplaint)
    res = await db.execute(stmt)
    if res.scalars().first():
        return # Data already present

    # 1. FDF Complaint - Paracetamol Tablets Capping
    c1 = DBComplaint(
        id="CMP-2024-001",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=4),
        reporter_name="Dr. Sarah Jenkins",
        reporter_organization="St. Jude Regional Hospital Pharmacy",
        contact_email="s.jenkins@stjude-hospital.org",
        country="United States",
        product_name="Paracetamol 500mg Film-Coated Tablets",
        product_type="Finished Dosage Form (FDF)",
        batch_number="PCT-2024-8841",
        manufacturing_date="2024-01-15",
        expiry_date="2026-01-14",
        manufacturing_site="Site Alpha - Tablet Compression Suite B",
        sample_received=True,
        defect_title="Tablet Capping and Lamination in Blister Strips",
        defect_description="Upon opening aluminum blister packs of Batch PCT-2024-8841, hospital pharmacy staff noticed top crowns of tablets split horizontally (capping) in approximately 4 out of 10 blister pockets. 2 split tablets released powder debris inside blister pockets.",
        complaint_category="Physical Defect",
        raw_transcript="Customer Email: Hospital received complaint from ward nurse regarding broken tablets in Paracetamol 500mg Batch PCT-2024-8841. Top portion split off inside blister.",
        source_type="Email Transcript",
        status="CAPA Assigned",
        severity="Major",
        risk_priority_number=62,
        fda_15day_alert_required=False,
        completeness_score=92.0
    )
    db.add(c1)

    r1 = DBRiskAssessment(
        complaint_id="CMP-2024-001",
        health_hazard_class="Class II (Temporary / Reversible Adverse Effect)",
        patient_safety_impact="Under-dosing potential if partial split tablet is ingested. Low risk of systemic toxic effect.",
        regulatory_reporting_trigger=False,
        regulatory_justification="Isolated physical integrity defect; does not trigger 15-day Field Alert Report under 21 CFR 211.198, but requires full internal batch reconciliation.",
        missing_critical_fields=[],
        followup_email_draft="Dear Dr. Jenkins, retention sample testing is underway. Replacement batch shipment initiated.",
        duplicate_complaint_ids=[],
        ai_confidence_score=0.95
    )
    db.add(r1)

    rca1 = DBRootCauseAnalysis(
        complaint_id="CMP-2024-001",
        primary_root_cause="Granulation moisture content dropped below 1.2% optimal target prior to high-speed compression.",
        ishikawa_category="Material & Process Parameters",
        why_1="Why did tablets cap? Insufficient inter-granular binding force during compression.",
        why_2="Why was binding force insufficient? Fluid Bed Dryer (FBD-02) over-dried Batch PCT-2024-8841.",
        why_3="Why was granulation over-dried? Humidity sensor in FBD-02 was uncalibrated by +4% RH.",
        why_4="Why was sensor uncalibrated? Maintenance interval exceeded by 10 days due to production rush.",
        why_5="Why was maintenance delayed? Calibration tracking system lacked automated alert lock.",
        investigation_summary="5-Why pinpointed FBD-02 moisture sensor calibration drift leading to over-drying of granules."
    )
    db.add(rca1)

    capa1_1 = DBCAPA(
        id="CAPA-CMP-2024-001-1",
        complaint_id="CMP-2024-001",
        capa_type="Corrective Action",
        description="Recalibrate FBD-02 humidity sensors and perform 100% visual inspection of remaining warehouse inventory for Batch PCT-2024-8841.",
        assigned_department="Quality Control & Engineering",
        target_completion_days=5,
        status="Completed",
        verified_by="QA Lead"
    )
    capa1_2 = DBCAPA(
        id="CAPA-CMP-2024-001-2",
        complaint_id="CMP-2024-001",
        capa_type="Preventive Action",
        description="Implement automated hard interlock in MES to prevent batch processing if FBD sensor calibration is expired.",
        assigned_department="Quality Assurance & IT",
        target_completion_days=14,
        status="Open"
    )
    db.add(capa1_1)
    db.add(capa1_2)

    # 2. API Complaint - Metformin Hydrochloride API OOS Impurity
    c2 = DBComplaint(
        id="CMP-2024-002",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2),
        reporter_name="Marcus Vance",
        reporter_organization="Apex Formulations Inc.",
        contact_email="m.vance@apexformulations.com",
        country="Germany",
        product_name="Metformin Hydrochloride API (Micro-grained)",
        product_type="Active Pharmaceutical Ingredient (API)",
        batch_number="MET-API-9902",
        manufacturing_date="2024-02-01",
        expiry_date="2027-01-31",
        manufacturing_site="API Chemical Synthesis Plant 3",
        sample_received=True,
        defect_title="Out-of-Specification (OOS) Related Substance Impurity Peak at 0.18%",
        defect_description="Customer analytical testing via HPLC revealed an unknown impurity peak at RRT 1.45 at 0.18% w/w, exceeding the USP monograph specification limit of NMT 0.10%. Bulk drum seals intact.",
        complaint_category="Chemical Impurity / OOS",
        raw_transcript="COA Verification Alert: Customer HPLC assay for Metformin API Batch MET-API-9902 failed related substances limit. Unknown peak 0.18%.",
        source_type="PDF Document",
        status="Under AI Assessment",
        severity="Critical",
        risk_priority_number=88,
        fda_15day_alert_required=True,
        completeness_score=95.0
    )
    db.add(c2)

    r2 = DBRiskAssessment(
        complaint_id="CMP-2024-002",
        health_hazard_class="Class I (Life Threatening / Severe Health Hazard)",
        patient_safety_impact="Potential genotoxic or toxic degradation impurity in active ingredient affecting finished dosage drug safety.",
        regulatory_reporting_trigger=True,
        regulatory_justification="Mandatory 15-day FDA Field Alert / EMA Rapid Alert requirement for OOS chemical impurities in active pharmaceutical ingredients distributed across borders.",
        missing_critical_fields=[],
        followup_email_draft="Urgent: Batch MET-API-9902 quarantine confirmation requested.",
        duplicate_complaint_ids=[],
        ai_confidence_score=0.97
    )
    db.add(r2)

    rca2 = DBRootCauseAnalysis(
        complaint_id="CMP-2024-002",
        primary_root_cause="Thermal degradation during crystallization wash phase due to coolant valve leak in Reactor R-301.",
        ishikawa_category="Machine & Chemical Process",
        why_1="Why did impurity peak spike to 0.18%? Thermal degradation product formed during final crystallization.",
        why_2="Why did thermal degradation occur? Reactor R-301 temperature reached 88°C instead of set 65°C.",
        why_3="Why did temperature spike? Chilled water recirculation control valve stuck in closed position.",
        why_4="Why did valve stick? Crystallizer jacket scale accumulation caused pneumatic actuator seizure.",
        why_5="Why was jacket scale present? Descaling frequency was reduced from monthly to quarterly.",
        investigation_summary="5-Why analysis established crystallizer jacket descaling delay caused pneumatic valve seizure and thermal degradation."
    )
    db.add(rca2)

    capa2 = DBCAPA(
        id="CAPA-CMP-2024-002-1",
        complaint_id="CMP-2024-002",
        capa_type="Corrective Action",
        description="Issue immediate global quarantine alert for Metformin API Batch MET-API-9902 and initiate LC-MS impurity structural identification.",
        assigned_department="Regulatory Affairs & QC Analytics",
        target_completion_days=2,
        status="Open"
    )
    db.add(capa2)

    await db.commit()
