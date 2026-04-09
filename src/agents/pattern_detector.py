import joblib
import pandas as pd
import numpy as np
import os


class PatternDetector:

    def __init__(self):

        base_dir = os.path.dirname(os.path.dirname(__file__))
        model_path = os.path.join(base_dir, "models", "anomaly_detection_model.pkl")

        self.model = joblib.load(model_path)

        print("Pattern Detector Model Loaded")

    def detect(self, data):

        if isinstance(data, dict):
            data = pd.DataFrame([data])

        if isinstance(data, pd.Series):
            data = data.to_frame().T

        prediction = self.model.predict(data)

        result = np.where(prediction == -1, "ANOMALY", "NORMAL")

        return result[0]


# Test the agent
if __name__ == "__main__":

    detector = PatternDetector()

    data_path = os.path.join("data", "processed", "X_scaled.csv")

    sample = pd.read_csv(data_path).iloc[0]

    result = detector.detect(sample)

    print("Detection Result:", result)