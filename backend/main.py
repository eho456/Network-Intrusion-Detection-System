from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import pickle
import os

app = FastAPI(
    title="Network Intrusion Detection System",
    description="ML-powered IDS using Random Forest trained on UNSW-NB15",
    version="1.0.0"
)

# Allow API call
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # React
        "http://frontend:5173",    # Docker service name
    ],
    allow_methods=["*"],         
    allow_headers=["*"],
)

# Build paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, '..', 'src', 'rf_model.pkl')
DATA_PATH  = os.path.join(BASE_DIR, '..', 'data', 'test_features.csv')

# Load mode
try:
    with open(MODEL_PATH, 'rb') as f:
        model, feature_cols = pickle.load(f)
    print(f"Model loaded. Features: {len(feature_cols)}")
except FileNotFoundError:
    raise RuntimeError(f"No model found: {MODEL_PATH}")

try:
    df_raw = pd.read_csv(DATA_PATH)
    df = df_raw.sample(2000, random_state=42).fillna(0).replace([np.inf, -np.inf], 0)
    print(f"Data loaded. Shape: {df.shape}")
except FileNotFoundError:
    raise RuntimeError(f"No data found: {DATA_PATH}")

def get_predictions():
    X = df[feature_cols].fillna(0).replace([np.inf, -np.inf], 0)
    preds = model.predict(X)
    proba = model.predict_proba(X)[:, 1]
    return preds, proba


# Endpoints

@app.get("/")
def root():
    return {"status": "running", "message": "Network IDS API", "docs": "/docs"}


@app.get("/api/stats")
def stats():
    """Statistics for header"""
    preds, proba = get_predictions()
    total = len(preds)
    attacks = int(preds.sum())
    return {
        "total_connections": total,
        "attacks_detected": attacks,
        "normal_traffic": total - attacks,
        "attack_rate": round(float(attacks / total * 100), 1),
        "avg_confidence": round(float(proba[preds == 1].mean() * 100), 1) if attacks > 0 else 0
    }


@app.get("/api/alerts")
def alerts():
    """Top 25 high confidence attack detections."""
    preds, proba = get_predictions()
    df_out = df.copy()
    df_out["predicted"] = preds
    df_out["confidence"] = (proba * 100).round(1)

    attacks = df_out[df_out["predicted"] == 1].nlargest(25, "confidence")
    cols = [c for c in ["confidence", "attack_cat", "proto", "sbytes", "dbytes"] 
            if c in attacks.columns]

    records = attacks[cols].to_dict(orient="records")

    for r in records:
        for k, v in r.items():
            if isinstance(v, float) and np.isnan(v):
                r[k] = "unknown"
    return records


@app.get("/api/attack_breakdown")
def attack_breakdown():
    """Count of each attack category"""
    preds, _ = get_predictions()
    df_out = df.copy()
    df_out["predicted"] = preds
    attacks = df_out[df_out["predicted"] == 1]

    if "attack_cat" in attacks.columns:
        breakdown = attacks["attack_cat"].value_counts().head(8).to_dict()
    else:
        breakdown = {"Unknown": len(attacks)}
    return breakdown


@app.get("/api/timeline")
def timeline():
    """Traffic split for the bar chart."""
    preds, _ = get_predictions()
    df_out = df.copy()
    df_out["predicted"] = preds
    df_out["bucket"] = pd.cut(range(len(df_out)), bins=12, labels=False)

    return [
        {
            "bucket": f"T{i+1}",
            "attacks": int(df_out[df_out["bucket"] == i]["predicted"].sum()),
            "normal": int((df_out[df_out["bucket"] == i]["predicted"] == 0).sum())
        }
        for i in range(12)
    ]


@app.get("/api/model_info")
def model_info():
    """Model metadata"""
    return {
        "model": "Random Forest",
        "n_estimators": 300,
        "features_used": len(feature_cols),
        "recall": 97.18,
        "precision": 86.37,
        "f1": 91.46,
        "roc_auc": 98.42,
        "dataset": "UNSW-NB15",
        "trained_on": "~175,000 network flows"
    }