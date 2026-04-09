import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
});

export interface AnalysisResult {
  row_id: number;
  Detection: 'ANOMALY' | 'NORMAL';
  Risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  Confidence: number;
  Explanation: string;
}

export async function analyzeCSV(file: File): Promise<AnalysisResult[]> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  return response.data;
}