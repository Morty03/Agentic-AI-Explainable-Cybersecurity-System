import requests

class ExplainerAgent:

    def __init__(self):
        print("Ollama AI Explainability Agent Initialized")

    def explain(self, detection, risk):

        prompt = f"""
        You are a cybersecurity expert.

        Detection: {detection}
        Risk: {risk}

        Explain clearly:

        1. what this means
        2. possible reason for this detection
        3. what action the user should take

        Keep the explanation simple, professional, and structured.
        """

        try:
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "tinyllama",
                    "prompt": prompt,
                    "stream": False
                }
            )

            data = response.json()

            # DEBUG (optional)
            print("Ollama response:", data)

            return data.get("response", "No response from AI")

        except Exception as e:
            return f"Error: {e}"