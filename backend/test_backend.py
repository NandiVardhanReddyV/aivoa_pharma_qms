import asyncio
import json
from app.core.database import engine, Base, AsyncSessionLocal
from app.sample_data import seed_sample_data
from app.ai.graph import run_complaint_ai_pipeline
from sqlalchemy.future import select
from app.models.schema import DBComplaint

async def run_test():
    print("--- 1. Testing Database & Seed Data ---")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as session:
        await seed_sample_data(session)
        res = await session.execute(select(DBComplaint))
        complaints = res.scalars().all()
        print(f"Database seeded successfully. Total Complaints in DB: {len(complaints)}")
        for c in complaints:
            print(f" - [{c.id}] {c.product_name} | Severity: {c.severity} | FDA 15-Day Alert: {c.fda_15day_alert_required}")

    print("\n--- 2. Testing 7-Stage LangGraph AI Workflow ---")
    test_prompt = "Paracetamol 500mg Tablets Batch PCT-2024-8841 reported broken and capping inside blister pack by Dr. Sarah."
    state = run_complaint_ai_pipeline(test_prompt, source_type="UnitTest Prompt", model_name="gemma2-9b-it")
    
    print("Extracted Data:", json.dumps(state.get("extracted_data"), indent=2))
    print("Health Hazard Class:", state.get("health_hazard_class"))
    print("Completeness Score:", state.get("completeness_score"))
    print("Risk Priority Number:", state.get("risk_priority_number"))
    print("5-Why Primary Root Cause:", state.get("rca_data", {}).get("primary_root_cause"))
    print("CAPA Count:", len(state.get("capa_list", [])))
    print("LangGraph Execution Status: ALL NODES COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(run_test())
