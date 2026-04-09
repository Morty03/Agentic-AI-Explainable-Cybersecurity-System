class RiskScorer:

    def __init__(self):
        print("Risk Scorer Agent Initialized")

    def score(self, detection_result):

        if detection_result == "ANOMALY":
            return "HIGH"

        return "LOW"


# test the agent
if __name__ == "__main__":

    scorer = RiskScorer()

    test_result = "ANOMALY"

    risk_level = scorer.score(test_result)

    print("Detection:", test_result)
    print("Risk Level:", risk_level)