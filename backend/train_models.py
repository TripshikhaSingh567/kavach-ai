import os
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, HistGradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
import joblib

SOURCE_CSV = r"C:\Users\trips\Downloads\MachineLearningCSV\MachineLearningCVE\Friday-WorkingHours-Afternoon-PortScan.pcap_ISCX.csv"
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

def train_and_export():
    print(f"Reading source CSV from {SOURCE_CSV}...")
    if not os.path.exists(SOURCE_CSV):
        raise FileNotFoundError(f"Source CSV not found at {SOURCE_CSV}")

    df = pd.read_csv(SOURCE_CSV, low_memory=False)
    # Strip whitespace from column names
    df.columns = df.columns.str.strip()
    
    print(f"Initial shape: {df.shape}")
    print(f"Columns: {list(df.columns[:10])}...")
    
    # Identify label column
    label_col = 'Label'
    if label_col not in df.columns:
        matching = [c for c in df.columns if 'label' in c.lower()]
        if matching:
            label_col = matching[0]
        else:
            raise KeyError("Could not find Label column in dataset")
            
    print(f"Label column: {label_col}")
    print(df[label_col].value_counts())
    
    # Replace inf and -inf with NaN, then drop NaNs
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)
    print(f"Shape after dropping inf and NaN: {df.shape}")
    
    # Stratified sampling: 5000 BENIGN, 1000 PortScan
    benign_df = df[df[label_col].astype(str).str.upper() == 'BENIGN']
    portscan_df = df[df[label_col].astype(str).str.upper().str.contains('PORTSCAN')]
    
    n_benign = min(5000, len(benign_df))
    n_portscan = min(1000, len(portscan_df))
    
    sampled_benign = benign_df.sample(n=n_benign, random_state=42)
    sampled_portscan = portscan_df.sample(n=n_portscan, random_state=42)
    
    sample_df = pd.concat([sampled_benign, sampled_portscan]).sample(frac=1.0, random_state=42).reset_index(drop=True)
    
    sample_csv_path = os.path.join(DATA_DIR, "cic_ids2017_sample.csv")
    sample_df.to_csv(sample_csv_path, index=False)
    print(f"Saved stratified sample ({len(sample_df)} rows: {n_benign} BENIGN, {n_portscan} PortScan) to {sample_csv_path}")
    
    # Select feature columns (numeric only, excluding label)
    feature_cols = [c for c in sample_df.columns if c != label_col and np.issubdtype(sample_df[c].dtype, np.number)]
    print(f"Using {len(feature_cols)} numeric features for training")
    
    X = sample_df[feature_cols].copy()
    y = (sample_df[label_col].astype(str).str.upper().str.contains('PORTSCAN')).astype(int)
    
    # Scale features for robust distance calculations
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # 1. Isolation Forest for unsupervised anomaly detection
    print("Training Isolation Forest...")
    iso_forest = IsolationForest(
        n_estimators=100,
        contamination=0.16,
        random_state=42,
        n_jobs=-1
    )
    iso_forest.fit(X_scaled)
    
    # 2. Gradient Boosting Classifier for known pattern detection
    print("Training HistGradientBoostingClassifier...")
    gb_classifier = HistGradientBoostingClassifier(
        max_iter=100,
        random_state=42
    )
    gb_classifier.fit(X, y)
    
    # Save models and metadata
    iso_path = os.path.join(MODELS_DIR, "isolation_forest.joblib")
    gb_path = os.path.join(MODELS_DIR, "gradient_boosting.joblib")
    scaler_path = os.path.join(MODELS_DIR, "scaler.joblib")
    meta_path = os.path.join(MODELS_DIR, "feature_metadata.json")
    
    joblib.dump(iso_forest, iso_path)
    joblib.dump(gb_classifier, gb_path)
    joblib.dump(scaler, scaler_path)
    
    with open(meta_path, "w") as f:
        json.dump({
            "feature_names": feature_cols,
            "n_features": len(feature_cols),
            "label_col": label_col,
            "classes": ["BENIGN", "PortScan"],
            "sample_counts": {"BENIGN": n_benign, "PortScan": n_portscan}
        }, f, indent=2)
        
    print("All models and metadata successfully exported!")

if __name__ == "__main__":
    train_and_export()
