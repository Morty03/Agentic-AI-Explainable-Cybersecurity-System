'use client';

import { useState, useCallback, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { 
  Shield, Activity, AlertTriangle, CheckCircle, 
  Upload, FileText, X, Brain, 
  Wifi, ThumbsUp, ThumbsDown, Sparkles, 
  Zap, Cpu, Eye, Lock, Server, BarChart3, 
  Hexagon, Radio, ScanEye
} from 'lucide-react';
import { analyzeCSV } from './lib/api';

export default function Dashboard() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [realtimeLoading, setRealtimeLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [reflectionStats, setReflectionStats] = useState<any>(null);
  const [improvements, setImprovements] = useState<any>(null);
  const [showReflection, setShowReflection] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'csv' | 'realtime'>('csv');

  const [stats, setStats] = useState({
    total_analyzed: 0,
    anomaly_count: 0,
    high_risk_count: 0,
  });

  const loadReflectionStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/reflection/stats');
      const data = await response.json();
      setReflectionStats(data);
    } catch (error) {}
  };

  const loadImprovements = async () => {
    try {
      const response = await fetch('http://localhost:8000/reflection/improvements');
      const data = await response.json();
      setImprovements(data);
    } catch (error) {}
  };

  const triggerSelfReflection = async () => {
    toast.loading('AI neural net learning...', { id: 'reflect' });
    try {
      const response = await fetch('http://localhost:8000/reflect/analyze', { method: 'POST' });
      const data = await response.json();
      toast.success(data.message || 'Learning complete', { id: 'reflect' });
      loadReflectionStats();
      loadImprovements();
    } catch (error) {
      toast.error('Failed', { id: 'reflect' });
    }
  };

  useEffect(() => {
    loadReflectionStats();
    loadImprovements();
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      setUploadedFile(file);
      toast.success(file.name);
    } else if (file) {
      toast.error('Need CSV file');
    }
  }, []);

  const handleAnalyze = async () => {
    if (!uploadedFile) {
      toast.error('Select a file first');
      return;
    }

    setLoading(true);
    toast.loading('AI agents scanning...', { id: 'analyze' });

    try {
      const analysisResults = await analyzeCSV(uploadedFile);
      setResults(analysisResults);
      
      const anomalyCount = analysisResults.filter((r: any) => r.Detection === 'ANOMALY').length;
      const highRiskCount = analysisResults.filter((r: any) => r.Risk === 'HIGH' || r.Risk === 'CRITICAL').length;

      setStats({
        total_analyzed: analysisResults.length,
        anomaly_count: anomalyCount,
        high_risk_count: highRiskCount,
      });
      
      toast.success(`${analysisResults.length} events processed`, { id: 'analyze' });
      loadReflectionStats();
    } catch (error: any) {
      toast.error('Analysis failed', { id: 'analyze' });
    } finally {
      setLoading(false);
    }
  };

  const startRealtime = async () => {
    setRealtimeLoading(true);
    toast.loading('Packet capture initiated...', { id: 'realtime' });
    
    try {
      const response = await fetch("http://localhost:8000/realtime/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interface: "Wi-Fi", packets: 10 })
      });
      const data = await response.json();
      
      if (data.threats && data.threats.length > 0) {
        setResults(data.threats);
        const anomalyCount = data.threats.filter((r: any) => r.Detection === 'ANOMALY').length;
        const highRiskCount = data.threats.filter((r: any) => r.Risk === 'HIGH' || r.Risk === 'CRITICAL').length;
        setStats({
          total_analyzed: data.threats.length,
          anomaly_count: anomalyCount,
          high_risk_count: highRiskCount,
        });
        toast.success(`${data.total_packets} packets captured`, { id: "realtime" });
        loadReflectionStats();
      } else {
        toast.error('No packets', { id: "realtime" });
      }
    } catch (error) {
      toast.error("Capture failed", { id: "realtime" });
    }
    setRealtimeLoading(false);
  };

  const sendFeedback = async (rowId: number, feedback: string) => {
    if (feedbackGiven.has(rowId)) {
      toast.error('Feedback already given');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/reflect/${rowId}?feedback=${feedback}`, {
        method: 'POST'
      });
      const data = await response.json();
      toast.success(data.message);
      setFeedbackGiven(prev => new Set(prev).add(rowId));
      loadReflectionStats();
      loadImprovements();
    } catch (error) {
      toast.error('Failed');
    }
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'CRITICAL': return 'bg-gradient-to-r from-red-600 to-red-500 text-white border-red-400';
      case 'HIGH': return 'bg-gradient-to-r from-orange-600/20 to-orange-500/20 text-orange-400 border-orange-500/30';
      case 'MEDIUM': return 'bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gradient-to-r from-zinc-800/50 to-zinc-700/50 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: '#0a0a0f', color: '#00ffff', border: '1px solid #00ffff33' } }} />
      <div className="min-h-screen bg-black bg-grid">
        
        {/* Header - Futuristic */}
        <header className="sticky top-0 z-50 glass border-b border-cyan-500/20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 animate-glow">
                  <Hexagon className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent neon-text">
                    Agentic<span className="text-purple-400">Cyber</span>
                  </h1>
                  <p className="text-[10px] text-zinc-500 tracking-wider">AUTONOMOUS AI CYBER DEFENSE</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                  <span className="text-[10px] text-cyan-400 tracking-wider">ACTIVE</span>
                </div>
                <button 
                  onClick={() => setShowReflection(!showReflection)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-all"
                >
                  <Brain className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-xs text-purple-400">REFLECTION</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          
          {/* Stats Cards - Glowing */}
          {stats.total_analyzed > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="glass-card rounded-2xl p-4 text-center group hover:border-cyan-500/50 transition-all">
                <ScanEye className="h-5 w-5 text-cyan-400 mx-auto mb-2 opacity-70 group-hover:opacity-100" />
                <p className="text-3xl font-bold text-white">{stats.total_analyzed}</p>
                <p className="text-[10px] text-zinc-500 tracking-wide">SCANNED</p>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center group hover:border-red-500/50 transition-all">
                <AlertTriangle className="h-5 w-5 text-red-400 mx-auto mb-2 opacity-70 group-hover:opacity-100" />
                <p className="text-3xl font-bold text-red-400">{stats.anomaly_count}</p>
                <p className="text-[10px] text-zinc-500 tracking-wide">ANOMALIES</p>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center group hover:border-orange-500/50 transition-all">
                <Zap className="h-5 w-5 text-orange-400 mx-auto mb-2 opacity-70 group-hover:opacity-100" />
                <p className="text-3xl font-bold text-orange-400">{stats.high_risk_count}</p>
                <p className="text-[10px] text-zinc-500 tracking-wide">HIGH RISK</p>
              </div>
            </div>
          )}

          {/* Self-Reflection Panel */}
          {showReflection && reflectionStats && (
            <div className="gradient-border mb-8 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
                  <h2 className="text-xs font-mono text-purple-400 tracking-wider">SELF_REFLECTION.MATRIX</h2>
                </div>
                {reflectionStats?.total_decisions >= 5 && (
                  <button onClick={triggerSelfReflection} className="text-[10px] px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition">
                    EXECUTE_LEARN
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-center mb-4">
                <div>
                  <p className="text-2xl font-bold text-white">{reflectionStats.total_decisions || 0}</p>
                  <p className="text-[9px] text-zinc-500">DECISIONS</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">{reflectionStats.accuracy || 0}%</p>
                  <p className="text-[9px] text-zinc-500">ACCURACY</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400">{reflectionStats.false_positives || 0}</p>
                  <p className="text-[9px] text-zinc-500">FALSE POS</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">{reflectionStats.improvements_count || 0}</p>
                  <p className="text-[9px] text-zinc-500">LEARNINGS</p>
                </div>
              </div>

              {improvements?.analysis && (
                <div className="bg-black/50 rounded-xl p-3 text-[11px] text-zinc-400 font-mono leading-relaxed border-l-2 border-purple-500">
                  {improvements.analysis.slice(0, 150)}...
                </div>
              )}
            </div>
          )}

          {/* Tabs - Futuristic */}
          <div className="flex gap-1 mb-6 bg-zinc-900/30 rounded-xl p-1 w-fit">
            <button 
              onClick={() => setActiveTab('csv')} 
              className={`px-5 py-2 text-xs font-mono rounded-lg transition-all tracking-wider ${activeTab === 'csv' ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              [CSV_SCAN]
            </button>
            <button 
              onClick={() => setActiveTab('realtime')} 
              className={`px-5 py-2 text-xs font-mono rounded-lg transition-all tracking-wider ${activeTab === 'realtime' ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              [LIVE_CAPTURE]
            </button>
          </div>

          {/* CSV Upload */}
          {activeTab === 'csv' && (
            <div className="glass-card rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-5">
                <Upload className="h-4 w-4 text-cyan-400" />
                <h2 className="text-sm font-mono text-cyan-400 tracking-wider">UPLOAD.DATASET</h2>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-cyan-500/30 rounded-xl p-5 text-center hover:border-cyan-500/70 transition bg-black/30">
                    <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                    {uploadedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm font-mono text-zinc-300">{uploadedFile.name}</span>
                        <button onClick={() => setUploadedFile(null)} className="p-1 hover:bg-zinc-800 rounded">
                          <X className="h-3 w-3 text-zinc-500" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm font-mono text-zinc-500">DROP_FILE || CLICK_TO_BROWSE</p>
                    )}
                  </div>
                </label>
                
                <button onClick={handleAnalyze} disabled={!uploadedFile || loading} className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:opacity-50 rounded-xl font-mono text-sm font-medium text-white transition-all shadow-lg shadow-cyan-500/20">
                  {loading ? 'PROCESSING...' : 'EXECUTE_SCAN'}
                </button>
              </div>
            </div>
          )}

          {/* Real-time */}
          {activeTab === 'realtime' && (
            <div className="glass-card rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-5">
                <Radio className="h-4 w-4 text-green-400 animate-pulse" />
                <h2 className="text-sm font-mono text-green-400 tracking-wider">LIVE.CAPTURE</h2>
              </div>
              
              <button onClick={startRealtime} disabled={realtimeLoading} className="w-full py-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 border border-green-500/30 disabled:opacity-50 rounded-xl font-mono text-green-400 transition-all flex items-center justify-center gap-2 text-sm">
                {realtimeLoading ? <><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-400"></div> CAPTURING...</> : <><Wifi className="h-3.5 w-3.5" /> INITIATE_PACKET_CAPTURE</>}
              </button>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="h-3 w-3 text-cyan-400 animate-pulse" />
                <h2 className="text-[10px] font-mono text-cyan-400 tracking-wider">RESULTS.DATABASE</h2>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {results.map((result, idx) => (
                  <div key={idx} className="glass-card rounded-xl p-4 hover:border-cyan-500/50 transition-all">
                    
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${result.Detection === 'ANOMALY' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-green-500/20 text-green-400 border-green-500/50'}`}>
                        {result.Detection === 'ANOMALY' ? '⚠️ ANOMALY' : '✓ CLEAN'}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${getRiskColor(result.Risk)}`}>
                        {result.Risk}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-600">#{result.row_id}</span>
                    </div>

                    {result.Confidence && (
                      <div className="mb-3">
                        <div className="flex justify-between text-[9px] font-mono mb-1">
                          <span className="text-zinc-500">CONFIDENCE</span>
                          <span className={`${result.Confidence >= 80 ? 'text-green-400' : result.Confidence >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {result.Confidence}%
                          </span>
                        </div>
                        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${result.Confidence >= 80 ? 'bg-green-500' : result.Confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${result.Confidence}%` }}></div>
                        </div>
                      </div>
                    )}

                    {result.src_ip && (
                      <div className="text-[10px] font-mono text-zinc-500 mb-2">
                        {result.src_ip} → {result.dst_ip} | {result.protocol} | {result.length}B
                      </div>
                    )}

                    <div className="bg-black/50 rounded-xl p-3 mb-3 border-l-2 border-cyan-500">
                      <p className="text-xs text-zinc-300 leading-relaxed font-mono">{result.Explanation}</p>
                    </div>

                    {!feedbackGiven.has(result.row_id) && (
                      <div className="flex gap-2">
                        <button onClick={() => sendFeedback(result.row_id, 'correct')} className="flex items-center gap-1 text-[9px] font-mono bg-green-500/10 hover:bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg transition border border-green-500/20">
                          <ThumbsUp className="h-3 w-3" />
                          CORRECT
                        </button>
                        <button onClick={() => sendFeedback(result.row_id, 'false_positive')} className="flex items-center gap-1 text-[9px] font-mono bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg transition border border-red-500/20">
                          <ThumbsDown className="h-3 w-3" />
                          FALSE_POS
                        </button>
                      </div>
                    )}

                    {feedbackGiven.has(result.row_id) && (
                      <div className="text-[9px] font-mono text-green-500/70 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        FEEDBACK_RECORDED
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {results.length === 0 && !loading && !realtimeLoading && (
            <div className="text-center py-20 glass-card rounded-2xl border-cyan-500/20">
              <div className="animate-float">
                <Hexagon className="h-12 w-12 text-cyan-500/30 mx-auto mb-4" />
              </div>
              <h3 className="text-lg font-mono text-white mb-2">AWAITING_INPUT</h3>
              <p className="text-sm font-mono text-zinc-500">{activeTab === 'csv' ? 'UPLOAD CSV TO BEGIN ANALYSIS' : 'INITIATE LIVE CAPTURE'}</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}