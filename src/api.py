from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import os
import sys

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import agents
from src.agents.pattern_detector import PatternDetector
from src.agents.risk_scorer import RiskScorer
from src.agents.explainer_agent import ExplainerAgent

# Create FastAPI app
app = FastAPI(title="Agentic AI Cyber Defense API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agents (load models)
print("=" * 50)
print("Initializing AI Agents...")
print("=" * 50)

detector = PatternDetector()
scorer = RiskScorer()
explainer = ExplainerAgent()

print("✅ All agents ready!")
print("=" * 50)


@app.get("/")
async def root():
    return {
        "message": "Agentic AI Cyber Defense System",
        "status": "running",
        "agents": ["PatternDetector", "RiskScorer", "ExplainerAgent"]
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "agents_loaded": True}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    """
    Analyze uploaded CSV file for network anomalies
    """
    try:
        # Read CSV
        df = pd.read_csv(file.file)
        print(f"📊 Received file: {file.filename} with {len(df)} rows")
        
        # Clean column names
        df.columns = df.columns.str.strip()
        
        # Drop unnecessary columns if they exist
        cols_to_drop = ["Flow ID", "Source IP", "Destination IP", "Timestamp", "Label"]
        df = df.drop(columns=[c for c in cols_to_drop if c in df.columns], errors="ignore")
        
        # Fill NaN values
        df = df.fillna(0)
        
        # Convert to numeric
        for col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        results = []
        
        # Analyze first 20 rows (or all if less)
        limit = min(20, len(df))
        
        for idx in range(limit):
            row = df.iloc[idx]
            data = row.to_dict()
            
            # Step 1: Pattern Detection
            detection = detector.detect(data)
            
            # Step 2: Risk Scoring
            risk = scorer.score(detection)
            
            # Step 3: LLM Explanation
            explanation = explainer.explain(detection, risk)
            
            results.append({
                "row_id": idx + 1,
                "Detection": detection,
                "Risk": risk,
                "Explanation": explanation
            })
        
        print(f"✅ Analysis complete: {len(results)} events processed")
        
        return results
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {"error": str(e)}


@app.post("/analyze/batch")
async def analyze_batch(file: UploadFile = File(...)):
    """
    Analyze entire CSV file (all rows)
    """
    try:
        df = pd.read_csv(file.file)
        df.columns = df.columns.str.strip()
        
        cols_to_drop = ["Flow ID", "Source IP", "Destination IP", "Timestamp", "Label"]
        df = df.drop(columns=[c for c in cols_to_drop if c in df.columns], errors="ignore")
        df = df.fillna(0)
        
        for col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        results = []
        
        for idx in range(len(df)):
            row = df.iloc[idx]
            data = row.to_dict()
            
            detection = detector.detect(data)
            risk = scorer.score(detection)
            explanation = explainer.explain(detection, risk)
            
            results.append({
                "row_id": idx + 1,
                "Detection": detection,
                "Risk": risk,
                "Explanation": explanation
            })
        
        return results
        
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)