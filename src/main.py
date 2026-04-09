import pandas as pd

from agents.pattern_detector import PatternDetector
from agents.risk_scorer import RiskScorer
from agents.explainer_agent import ExplainerAgent


def main():

    print("Starting Agentic AI Cybersecurity System...\n")

    # initialize agents
    detector = PatternDetector()
    scorer = RiskScorer()
    explainer = ExplainerAgent()

    # load sample network data
    data = pd.read_csv("data/processed/X_scaled.csv")

    sample = data.iloc[0]

    print("Analyzing network traffic...\n")

    # Step 1: detect anomaly
    detection = detector.detect(sample)

    # Step 2: assign risk score
    risk = scorer.score(detection)

    # Step 3: generate AI explanation
    explanation = explainer.explain(detection, risk)

    print("\n===== THREAT ANALYSIS REPORT =====\n")

    print("Detection Result:", detection)
    print("Risk Level:", risk)

    print("\nExplanation:")
    print(explanation)


if __name__ == "__main__":
    main()