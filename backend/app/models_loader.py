import os
import json
import numpy as np
import pandas as pd
import joblib

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

iso_forest = None
gb_classifier = None
scaler = None
feature_metadata = None
default_feature_vector = None

def load_models():
    global iso_forest, gb_classifier, scaler, feature_metadata, default_feature_vector
    try:
        iso_path = os.path.join(MODELS_DIR, "isolation_forest.joblib")
        gb_path = os.path.join(MODELS_DIR, "gradient_boosting.joblib")
        scaler_path = os.path.join(MODELS_DIR, "scaler.joblib")
        meta_path = os.path.join(MODELS_DIR, "feature_metadata.json")

        if not os.path.exists(iso_path) or not os.path.exists(gb_path):
            print("Models not found on disk. Run train_models.py first.")
            return False

        iso_forest = joblib.load(iso_path)
        gb_classifier = joblib.load(gb_path)
        scaler = joblib.load(scaler_path)

        with open(meta_path, "r") as f:
            feature_metadata = json.load(f)

        # Compute default baseline vector from sample CSV for benign defaults
        sample_path = os.path.join(DATA_DIR, "cic_ids2017_sample.csv")
        if os.path.exists(sample_path):
            sample_df = pd.read_csv(sample_path, nrows=500)
            sample_df.columns = sample_df.columns.str.strip()
            feature_names = feature_metadata["feature_names"]
            medians = sample_df[feature_names].median(numeric_only=True).to_dict()
            default_feature_vector = medians
        else:
            default_feature_vector = {f: 0.0 for f in feature_metadata["feature_names"]}

        print(f"ML models loaded successfully! ({len(feature_metadata['feature_names'])} features)")
        return True
    except Exception as e:
        print(f"Error loading models: {e}")
        return False

def score_event_features(custom_features: dict = None) -> tuple[float, float]:
    """
    Returns:
      (iso_forest_score, classifier_score) both normalized between 0.0 and 100.0
    """
    global iso_forest, gb_classifier, scaler, feature_metadata, default_feature_vector
    if iso_forest is None or gb_classifier is None:
        load_models()

    if iso_forest is None:
        # Fallback if models not ready
        return (25.0, 20.0)

    feature_names = feature_metadata["feature_names"]
    row = []
    custom = custom_features or {}
    for name in feature_names:
        val = custom.get(name, default_feature_vector.get(name, 0.0))
        try:
            row.append(float(val))
        except (ValueError, TypeError):
            row.append(0.0)

    X_df = pd.DataFrame([row], columns=feature_names)
    
    # Isolation Forest score:
    # decision_function returns negative for anomalies, positive for inliers
    # We invert and scale so higher value = higher anomaly (0-100)
    try:
        X_scaled = scaler.transform(X_df)
        iso_raw = iso_forest.decision_function(X_scaled)[0]
        # Typically iso_raw ranges from -0.3 (very anomalous) to +0.2 (normal)
        # Convert to 0-100: -0.2 -> 90, 0.15 -> 10
        iso_score = float(np.clip((0.15 - iso_raw) / 0.35 * 100.0, 0.0, 100.0))
    except Exception:
        iso_score = 30.0

    # HistGradientBoosting probability:
    try:
        gb_prob = gb_classifier.predict_proba(X_df)[0][1] # Probability of PortScan / Malicious class
        classifier_score = float(np.clip(gb_prob * 100.0, 0.0, 100.0))
    except Exception:
        classifier_score = 25.0

    return (round(iso_score, 1), round(classifier_score, 1))

# Initialize on module import
load_models()
