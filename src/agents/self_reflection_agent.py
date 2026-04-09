import json
import os
import requests
from datetime import datetime

class SelfReflectionAgent:
    def __init__(self):
        self.history_file = "data/reflection_history.json"
        self.decision_history = []
        self.improvements = []
        self.load_history()
        print("🤖 Self-Reflection Agent Initialized (Ollama-Powered)")

    def load_history(self):
        if os.path.exists(self.history_file):
            try:
                with open(self.history_file, 'r') as f:
                    data = json.load(f)
                    self.decision_history = data.get('decision_history', [])
                    self.improvements = data.get('improvements', [])
            except:
                pass

    def save_history(self):
        os.makedirs(os.path.dirname(self.history_file), exist_ok=True)
        with open(self.history_file, 'w') as f:
            json.dump({
                'decision_history': self.decision_history[-200:],
                'improvements': self.improvements[-50:],
                'last_updated': datetime.now().isoformat()
            }, f, indent=2)

    def reflect_with_ollama(self, detection, risk, confidence=None, user_feedback=None, row_data=None):
        decision = {
            'timestamp': datetime.now().isoformat(),
            'detection': detection,
            'risk': risk,
            'confidence': confidence,
            'user_feedback': user_feedback,
            'row_data': row_data
        }
        self.decision_history.append(decision)
        
        if len(self.decision_history) >= 5:
            return self.analyze_with_ollama()
        
        self.save_history()
        return {
            'status': 'stored',
            'message': f'Decision stored. Need {5 - len(self.decision_history)} more for AI analysis.',
            'decisions_collected': len(self.decision_history)
        }

    def analyze_with_ollama(self):
        recent = self.decision_history[-10:]
        
        prompt = f"""Analyze these cybersecurity decisions:

{json.dumps(recent, indent=2)}

Respond in this format:
PATTERNS: (what you observed)
IMPROVEMENTS: (specific suggestions)
THRESHOLDS: (recommended score between 0.5-0.9)"""

        try:
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "phi3",
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.3, "num_predict": 200}
                },
                timeout=45
            )
            data = response.json()
            analysis = data.get("response", "Analysis in progress")
            
            improvement = {
                'timestamp': datetime.now().isoformat(),
                'analysis': analysis,
                'decisions_analyzed': len(recent)
            }
            self.improvements.append(improvement)
            self.save_history()
            
            return {
                'status': 'analyzed',
                'analysis': analysis,
                'message': 'AI Self-Reflection complete!',
                'decisions_analyzed': len(recent)
            }
        except Exception as e:
            return {'status': 'error', 'message': str(e)}

    def get_stats(self):
        total = len(self.decision_history)
        false_positives = sum(1 for d in self.decision_history if d.get('user_feedback') == 'false_positive')
        correct = sum(1 for d in self.decision_history if d.get('user_feedback') == 'correct')
        
        return {
            'total_decisions': total,
            'false_positives': false_positives,
            'correct': correct,
            'accuracy': round((correct / max(1, total)) * 100, 1),
            'improvements_count': len(self.improvements),
            'needs_more_data': total < 5
        }

    def get_improvements(self):
        if self.improvements:
            return self.improvements[-1]
        return {'status': 'waiting', 'message': 'Collecting enough decisions for AI analysis...'}