import enum
import datetime
from typing import List, Optional, Any, Dict
from sqlalchemy import Column, String, Integer, DateTime, Text, Float, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from pydantic import BaseModel, Field
from app.core.database import Base

# --- Enums ---
class ProductCategory(str, enum.Enum):
    FDF = "Finished Dosage Form (FDF)"
    API = "Active Pharmaceutical Ingredient (API)"

class ComplaintSeverity(str, enum.Enum):
    CRITICAL = "Critical"
    MAJOR = "Major"
    MINOR = "Minor"

class ComplaintStatus(str, enum.Enum):
    LOGGED = "Logged"
    UNDER_REVIEW = "Under AI Assessment"
    INVESTIGATION = "RCA & Investigation"
    CAPA_ASSIGNED = "CAPA Assigned"
    CLOSED = "Closed"

class HealthHazardRating(str, enum.Enum):
    CLASS_I = "Class I (Life Threatening / Severe Health Hazard)"
    CLASS_II = "Class II (Temporary / Reversible Adverse Effect)"
    CLASS_III = "Class III (Unlikely Adverse Consequences)"

# --- SQLAlchemy Models ---
class DBComplaint(Base):
    __tablename__ = "complaints"

    id = Column(String, primary_key=True, index=True) # e.g. CMP-2024-001
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Customer Details
    reporter_name = Column(String, nullable=True)
    reporter_organization = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    country = Column(String, nullable=True)
    
    # Product Information
    product_name = Column(String, index=True)
    product_type = Column(String, default=ProductCategory.FDF.value) # FDF or API
    batch_number = Column(String, index=True, nullable=True)
    manufacturing_date = Column(String, nullable=True)
    expiry_date = Column(String, nullable=True)
    manufacturing_site = Column(String, nullable=True)
    sample_received = Column(Boolean, default=False)
    
    # Defect Information
    defect_title = Column(String)
    defect_description = Column(Text)
    complaint_category = Column(String) # e.g., Physical Defect, Chemical Impurity, Packaging, Efficacy
    raw_transcript = Column(Text, nullable=True) # Raw input prompt or parsed PDF text
    source_type = Column(String, default="Manual") # Email, PDF Document, Call Transcript
    
    # Workflow Status & Risk Score
    status = Column(String, default=ComplaintStatus.LOGGED.value)
    severity = Column(String, default=ComplaintSeverity.MAJOR.value)
    risk_priority_number = Column(Integer, default=50) # 1-100 score
    fda_15day_alert_required = Column(Boolean, default=False)
    completeness_score = Column(Float, default=0.0) # Percentage 0-100
    
    # Relationships
    risk_assessment = relationship("DBRiskAssessment", back_populates="complaint", uselist=False, cascade="all, delete-orphan")
    rca = relationship("DBRootCauseAnalysis", back_populates="complaint", uselist=False, cascade="all, delete-orphan")
    capas = relationship("DBCAPA", back_populates="complaint", cascade="all, delete-orphan")
    audit_logs = relationship("DBAuditLog", back_populates="complaint", cascade="all, delete-orphan")


class DBRiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    complaint_id = Column(String, ForeignKey("complaints.id"))
    health_hazard_class = Column(String, default=HealthHazardRating.CLASS_II.value)
    patient_safety_impact = Column(Text)
    regulatory_reporting_trigger = Column(Boolean, default=False)
    regulatory_justification = Column(Text)
    missing_critical_fields = Column(JSON, default=list) # List of missing data points
    followup_email_draft = Column(Text, nullable=True)
    duplicate_complaint_ids = Column(JSON, default=list) # Matching past complaints
    ai_confidence_score = Column(Float, default=0.92)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    complaint = relationship("DBComplaint", back_populates="risk_assessment")


class DBRootCauseAnalysis(Base):
    __tablename__ = "root_cause_analyses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    complaint_id = Column(String, ForeignKey("complaints.id"))
    primary_root_cause = Column(Text)
    ishikawa_category = Column(String) # Manpower, Machine, Material, Method, Measurement, Environment
    why_1 = Column(Text, nullable=True)
    why_2 = Column(Text, nullable=True)
    why_3 = Column(Text, nullable=True)
    why_4 = Column(Text, nullable=True)
    why_5 = Column(Text, nullable=True)
    investigation_summary = Column(Text)

    complaint = relationship("DBComplaint", back_populates="rca")


class DBCAPA(Base):
    __tablename__ = "capas"

    id = Column(String, primary_key=True) # e.g. CAPA-2024-001-1
    complaint_id = Column(String, ForeignKey("complaints.id"))
    capa_type = Column(String) # Corrective Action or Preventive Action
    description = Column(Text)
    assigned_department = Column(String) # QA, Production, QC, Packaging, Supply Chain
    target_completion_days = Column(Integer, default=14)
    status = Column(String, default="Open") # Open, In Progress, Completed
    verified_by = Column(String, nullable=True)

    complaint = relationship("DBComplaint", back_populates="capas")


class DBAuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    complaint_id = Column(String, ForeignKey("complaints.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    action = Column(String) # e.g., AI Ingestion, Risk Assessment Updated, CAPA Added
    performed_by = Column(String, default="AI Copilot (gemma2-9b-it)")
    details = Column(Text, nullable=True)

    complaint = relationship("DBComplaint", back_populates="audit_logs")


# --- Pydantic Schemas ---
class CAPABase(BaseModel):
    id: Optional[str] = None
    capa_type: str
    description: str
    assigned_department: str
    target_completion_days: int = 14
    status: str = "Open"

class RCARequest(BaseModel):
    primary_root_cause: str
    ishikawa_category: str
    why_1: str
    why_2: str
    why_3: str
    why_4: Optional[str] = None
    why_5: Optional[str] = None
    investigation_summary: str

class ComplaintCreateSchema(BaseModel):
    reporter_name: Optional[str] = "Quality Manager"
    reporter_organization: Optional[str] = "Global Health Depot"
    contact_email: Optional[str] = "qa@depot.com"
    country: Optional[str] = "USA"
    product_name: str
    product_type: str = ProductCategory.FDF.value
    batch_number: Optional[str] = None
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None
    manufacturing_site: Optional[str] = "Site Alpha (Main Plant)"
    sample_received: bool = False
    defect_title: str
    defect_description: str
    complaint_category: str = "Physical Defect"
    raw_transcript: Optional[str] = None
    source_type: str = "Manual Input"

class ComplaintUpdateSchema(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    batch_number: Optional[str] = None
    sample_received: Optional[bool] = None

class IngestRequest(BaseModel):
    text_content: Optional[str] = None
    model_name: Optional[str] = "gemma2-9b-it"

class ComplaintResponseSchema(BaseModel):
    id: str
    created_at: datetime.datetime
    reporter_name: Optional[str]
    reporter_organization: Optional[str]
    contact_email: Optional[str]
    country: Optional[str]
    product_name: str
    product_type: str
    batch_number: Optional[str]
    manufacturing_date: Optional[str]
    expiry_date: Optional[str]
    manufacturing_site: Optional[str]
    sample_received: bool
    defect_title: str
    defect_description: str
    complaint_category: str
    status: str
    severity: str
    risk_priority_number: int
    fda_15day_alert_required: bool
    completeness_score: float
    raw_transcript: Optional[str]
    source_type: str
    
    # Associated fields
    risk_assessment: Optional[Dict[str, Any]] = None
    rca: Optional[Dict[str, Any]] = None
    capas: List[Dict[str, Any]] = []

    class Config:
        from_attributes = True
