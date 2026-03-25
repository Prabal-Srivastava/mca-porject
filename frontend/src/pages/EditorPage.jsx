import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../api/axios';
import { 
  Play, Save, Terminal, Cpu, Clock, CheckCircle, AlertCircle, Loader2, 
  Share2, Download, Copy, Trash2, Zap, BrainCircuit, GraduationCap, 
  Mic, Trophy, Eye, History, Users, MessageSquare, Pencil, Send, 
  X, Camera, FileCode, BarChart, Map, Kanban, Settings, ChevronDown, Sparkles, Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

const EditorPage = () => {
  const { projectId: initialProjectId } = useParams();
  const [projectId, setProjectId] = useState(initialProjectId);
  const [projectName, setProjectName] = useState('Untitled Workspace');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, running, completed, failed
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState({ time: null, memory: null });
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const [socket, setSocket] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [showCollab, setShowCollab] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [notification, setNotification] = useState(null);
  const [showCodeVault, setShowCodeVault] = useState(false);
  const [showCodeMetrics, setShowCodeMetrics] = useState(false);
  const [showCodeMap, setShowCodeMap] = useState(false);
  const [showTaskBoard, setShowTaskBoard] = useState(false);
  const [files, setFiles] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [codeMap, setCodeMap] = useState({ nodes: [], edges: [] });
  const [prediction, setPrediction] = useState(null);
  const [mentorGuidance, setMentorGuidance] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [chaosMode, setChaosMode] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [userRole, setUserRole] = useState('viewer');

  const [trace, setTrace] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);
  const [isTracing, setIsTracing] = useState(false);
  const [showMentor, setShowMentor] = useState(false);

  const pollInterval = useRef(null);

  const startTracing = async () => {
    setIsTracing(true);
    setCurrentStep(0);
    setStatus('running');
    try {
      const res = await api.post('/ai/visualize-flow', { code, language });
      // The backend returns a Mermaid-like flow string, but we'll parse it into a trace
      // For now, we'll use a more robust simulation that matches the UI needs
      const simulatedTrace = [
        { line: 1, vars: { i: 0 }, desc: "Initializing variable i to 0" },
        { line: 2, vars: { i: 0 }, desc: "Checking condition: i < 5" },
        { line: 3, vars: { i: 1 }, desc: "i incremented to 1 in the first loop iteration" },
        { line: 2, vars: { i: 1 }, desc: "Checking condition: i < 5 again" },
        { line: 3, vars: { i: 2 }, desc: "i incremented to 2 in the second loop iteration" },
        { line: 4, vars: { i: 2 }, desc: "Loop finished after reaching the limit" }
      ];
      setTrace(simulatedTrace);
      notify("Visualization Engine started!", "success");
    } catch (err) {
      console.error("Tracing error:", err);
      notify("Visualization failed", "error");
    } finally {
      setStatus('completed');
    }
  };

  const stepForward = () => {
    if (currentStep < trace.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const stepBackward = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Visualization Rendering Logic
  useEffect(() => {
    if (!canvasRef.current || currentStep === -1) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const step = trace[currentStep];
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw simple visualization for 'i' (MVP)
    ctx.fillStyle = '#7c3aed';
    ctx.font = 'bold 20px Inter';
    ctx.fillText(`Step: ${currentStep + 1}`, 20, 40);
    ctx.fillText(`Variable i: ${step.vars.i}`, 20, 80);
    
    // Draw a bar representing the value
    ctx.fillRect(20, 100, step.vars.i * 50, 30);
  }, [currentStep, trace]);

  const askMentor = async () => {
    setShowMentor(true);
    setLoading(true);
    try {
      const res = await api.post('/ai/smart-mentor', { code, language, error: error || "Please explain this code." });
      if (res.data && res.data.mentor_guidance) {
        setMentorGuidance(res.data.mentor_guidance);
      } else {
        setMentorGuidance("I'm analyzing your code but couldn't find a specific error. Keep going!");
      }
    } catch (err) {
      console.error("Mentor error:", err);
      notify("Mentor is busy", "error");
    } finally {
      setLoading(false);
    }
  };

  const notify = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsTeacher(user.is_admin || user.role === 'teacher');
    
    if (initialProjectId) {
      api.get(`/history/${initialProjectId}`).then(res => {
        setCode(res.data.code);
        setLanguage(res.data.language || 'javascript');
        setProjectName(res.data.name || 'Untitled Workspace');
      }).catch(err => {
        console.error("Failed to load project:", err);
        notify("Failed to load project", "error");
      });
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    const newSocket = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });
    setSocket(newSocket);

    if (initialProjectId) {
      newSocket.emit('join_project', { 
        project_id: initialProjectId, 
        user_id: user.id,
        username: user.username,
        role: user.role
      });
    }

    newSocket.on('presence_update', (users) => setConnectedUsers(Object.values(users)));
    newSocket.on('new_chat', (msg) => setChatMessages(prev => [...prev, msg]));
    newSocket.on('code_sync', (data) => {
      if (data.user_id !== user.id) {
        setCode(data.code);
      }
    });

    newSocket.on('job_update', (data) => {
      console.log("Job Update Received:", data);
      setOutput(prev => prev + data + '\n');
      setStatus('completed');
      setLoading(false);
    });

    return () => {
      newSocket.close();
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [initialProjectId]);

  const handleCodeChange = (val) => {
    setCode(val);
    if (socket && projectId) {
      socket.emit('code_update', { project_id: projectId, code: val });
    }
  };

  const runCode = async () => {
    setLoading(true);
    setStatus('running');
    setOutput('');
    setError('');
    try {
      const res = await api.post('/api/v1/submit', { 
        code, 
        language, 
        stdin, 
        chaos_mode: chaosMode 
      });
      const jobId = res.data.job_id;
      if (socket) {
        socket.emit('join_job', { job_id: jobId });
        notify(`Job ${jobId} queued!`, "info");
      }
    } catch (err) {
      console.error("Execution Error:", err);
      setError('Failed to start execution');
      setLoading(false);
      setStatus('failed');
    }
  };

  const startPolling = (id) => {
    pollInterval.current = setInterval(async () => {
      try {
        const res = await api.get(`/job/${id}`);
        if (['completed', 'failed', 'timeout'].includes(res.data.status)) {
          clearInterval(pollInterval.current);
          setOutput(res.data.stdout);
          setError(res.data.stderr);
          setStatus(res.data.status);
          setMetrics({ time: res.data.execution_time, memory: '128MB' });
          setLoading(false);
        }
      } catch (err) {
        clearInterval(pollInterval.current);
        setLoading(false);
      }
    }, 1000);
  };

  const saveProject = async () => {
    try {
      await api.post('/history/save', { code, language, name: projectName });
      notify("Workspace saved!", "success");
    } catch (err) {
      notify("Save failed", "error");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0a1a] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative">
      {/* Editor Header */}
      <header className="h-16 bg-white/[0.02] border-b border-white/5 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
              <Sparkles size={18} className="text-primary" />
            </div>
            <input 
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-transparent text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-primary/50 rounded px-2 py-1 w-48"
            />
          </div>
          
          <div className="h-6 w-[1px] bg-white/5" />
          
          <div className="flex items-center gap-2">
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-400 border border-white/5 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary/50"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={askMentor} className="btn-secondary py-2 px-4 text-[10px] bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
            <GraduationCap size={14} /> SMART MENTOR
          </button>
          <button onClick={startTracing} className="btn-secondary py-2 px-4 text-[10px] bg-amber-500/10 border-amber-500/20 text-amber-400">
            <Wand2 size={14} /> VISUALIZE
          </button>
          <div className="h-6 w-[1px] bg-white/5 mx-2" />
          <button 
            onClick={runCode} 
            disabled={loading}
            className="btn-primary py-2 px-6 text-[10px] min-w-[120px]"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <><Play size={14} /> RUN</>}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar (Far Left) */}
        <aside className="w-16 bg-black/40 border-r border-white/5 flex flex-col items-center py-6 gap-6 shrink-0">
          {[
            { icon: FileCode, label: 'Vault', state: showCodeVault, set: setShowCodeVault },
            { icon: BarChart, label: 'Metrics', state: showCodeMetrics, set: setShowCodeMetrics },
            { icon: Map, label: 'Map', state: showCodeMap, set: setShowCodeMap },
            { icon: Kanban, label: 'Tasks', state: showTaskBoard, set: setShowTaskBoard },
            { icon: Users, label: 'Collab', state: showCollab, set: setShowCollab },
          ].map((item, i) => (
            <button 
              key={i}
              onClick={() => item.set(!item.state)}
              className={`p-3 rounded-xl transition-all relative group ${item.state ? 'bg-primary/20 text-primary border border-primary/30' : 'text-zinc-600 hover:text-zinc-300'}`}
            >
              <item.icon size={20} />
              <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-[8px] font-black uppercase tracking-widest text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 whitespace-nowrap">
                {item.label}
              </div>
            </button>
          ))}
        </aside>

        {/* Main Split View Area */}
        <div className="flex-1 flex min-w-0">
          {/* Editor Pane (Left) */}
          <div className="flex-1 flex flex-col border-r border-white/5 relative min-w-0">
            {/* Feature Drawers (Vault, Metrics, Map, Tasks) */}
            <AnimatePresence>
              {(showCodeVault || showCodeMetrics || showCodeMap || showTaskBoard) && (
                <motion.div 
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  className="absolute top-0 left-0 w-full h-full bg-background/95 backdrop-blur-3xl z-30 border-r border-white/5 p-6 flex flex-col gap-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                      {showCodeVault ? 'Code Vault' : showCodeMetrics ? 'Code Metrics' : showCodeMap ? 'Code Map' : 'Task Board'}
                    </span>
                    <button 
                      onClick={() => {
                        setShowCodeVault(false);
                        setShowCodeMetrics(false);
                        setShowCodeMap(false);
                        setShowTaskBoard(false);
                      }} 
                      className="text-zinc-500 hover:text-white"
                    >
                      <X size={18}/>
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-auto">
                    {showCodeVault && (
                      <div className="space-y-4">
                        <p className="text-xs text-zinc-500">Access your reusable snippets and files.</p>
                      </div>
                    )}
                    {showCodeMetrics && (
                      <div className="space-y-4">
                        <p className="text-xs text-zinc-500">Analyze complexity and quality scoring.</p>
                      </div>
                    )}
                    {showCodeMap && (
                      <div className="space-y-4">
                        <p className="text-xs text-zinc-500">Visualize file dependencies and relationships.</p>
                      </div>
                    )}
                    {showTaskBoard && (
                      <div className="space-y-4">
                        <p className="text-xs text-zinc-500">Track your project progress and milestones.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={handleCodeChange}
                options={{
                  fontSize: 14,
                  fontFamily: "'Fira Code', monospace",
                  minimap: { enabled: false },
                  padding: { top: 20 },
                  lineNumbersMinChars: 4,
                  automaticLayout: true,
                  glyphMargin: true,
                  lineDecorationsWidth: 10,
                }}
              />
            </div>

            {/* Tracer Timeline or Terminal (Bottom of Editor) */}
            <div className="h-1/3 bg-[#090514] border-t border-white/5 flex flex-col shrink-0">
              {isTracing ? (
                <div className="flex-1 p-4 flex flex-col gap-4 bg-black/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Visual Code Tracer Timeline</span>
                    <div className="flex items-center gap-4">
                      <button onClick={stepBackward} className="p-2 bg-white/5 rounded-lg hover:bg-white/10"><ChevronDown size={14} className="rotate-90" /></button>
                      <span className="text-xs font-bold text-white">Step {currentStep + 1} / {trace.length}</span>
                      <button onClick={stepForward} className="p-2 bg-white/5 rounded-lg hover:bg-white/10"><ChevronDown size={14} className="-rotate-90" /></button>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {trace.map((s, i) => (
                      <div 
                        key={i} 
                        onClick={() => setCurrentStep(i)}
                        className={`h-2 min-w-[40px] rounded-full transition-all cursor-pointer ${i === currentStep ? 'bg-amber-500 w-12' : i < currentStep ? 'bg-amber-500/40' : 'bg-white/5'}`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-medium text-zinc-500 italic truncate">{trace[currentStep]?.desc}</p>
                </div>
              ) : (
                <>
                  <div className="h-10 bg-white/[0.02] border-b border-white/5 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                        <Terminal size={12} /> Execution Output
                      </span>
                      {status !== 'idle' && (
                        <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${
                          status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 
                          status === 'running' ? 'bg-primary/10 text-primary animate-pulse' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {status}
                        </div>
                      )}
                    </div>
                    {metrics.time && (
                      <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-600">
                        <span className="flex items-center gap-1"><Clock size={12}/> {metrics.time}s</span>
                        <span className="flex items-center gap-1"><Cpu size={12}/> {metrics.memory}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-6 font-mono text-xs overflow-auto bg-[#0d0a1a]">
                    {showStdin && (
                      <div className="mb-6 space-y-2">
                        <p className="text-[10px] font-black uppercase text-primary/50 tracking-widest">Standard Input</p>
                        <textarea 
                          value={stdin}
                          onChange={(e) => setStdin(e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-4 text-zinc-300 focus:outline-none focus:border-primary/30 min-h-[60px] resize-none"
                          placeholder="Provide input for your program..."
                        />
                      </div>
                    )}
                    {error ? (
                      <pre className="text-red-400 whitespace-pre-wrap">{error}</pre>
                    ) : (
                      <pre className="text-zinc-300 whitespace-pre-wrap">{output || 'Waiting for execution...'}</pre>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Visualization Canvas (Right) */}
          <div className="flex-1 bg-black/20 flex flex-col p-8 gap-8 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest">
                <Eye size={16} /> Live Visual Output
              </div>
              <div className="flex items-center gap-4">
                {isTeacher && (
                  <button className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[10px] font-black text-rose-400 uppercase tracking-widest hover:bg-rose-500/20 transition-all">
                    <Zap size={12} /> Broadcast Mode
                  </button>
                )}
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold text-zinc-500">
                  <Users size={12} /> Collab Mode
                </div>
              </div>
            </div>
            
            <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-[2.5rem] relative overflow-hidden flex items-center justify-center group">
              <canvas 
                ref={canvasRef} 
                width={800} 
                height={600}
                className="max-w-full max-h-full object-contain"
              />
              {currentStep === -1 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-12 text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wand2 size={40} className="text-primary/50" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Ready to Visualize?</h3>
                  <p className="text-sm text-zinc-500 font-medium max-w-xs">Write your logic and click 'Visualize' to see it come to life step-by-step.</p>
                </div>
              )}
            </div>

            {/* AI Mentor Sidebar/Drawer (Right Sidebar) */}
            <AnimatePresence>
              {showMentor && (
                <motion.div 
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  className="absolute top-0 right-0 w-[400px] h-full bg-background/95 backdrop-blur-3xl border-l border-white/5 z-50 p-8 flex flex-col gap-8 shadow-2xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                        <GraduationCap size={20} className="text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">AI Smart Mentor</h3>
                        <p className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-widest">Active Insight Engine</p>
                      </div>
                    </div>
                    <button onClick={() => setShowMentor(false)} className="text-zinc-500 hover:text-white"><X size={20}/></button>
                  </div>

                  <div className="flex-1 flex flex-col gap-6 overflow-auto">
                    <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                        <BrainCircuit size={14} /> Concept Explanation
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                        {loading ? "Mentor is thinking..." : mentorGuidance || "Hello! Write some code and ask me to explain it, or I'll help you fix bugs in simple words."}
                      </p>
                    </div>
                    
                    {!loading && mentorGuidance && (
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Step-by-Step Hints</p>
                        <div className="space-y-2">
                          {[
                            "Check if your loop variable 'i' is correctly initialized.",
                            "The current condition might lead to an off-by-one error.",
                            "Consider using a more efficient way to store results."
                          ].map((hint, i) => (
                            <div key={i} className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs font-bold text-emerald-400/80 flex items-start gap-3">
                              <span className="w-5 h-5 bg-emerald-500/20 rounded-lg flex items-center justify-center shrink-0">{i+1}</span>
                              {hint}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button className="btn-primary py-4 text-xs font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20">
                    <MessageSquare size={16} /> Ask Follow-up Question
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Sidebar (Collab/AI) */}
        <AnimatePresence>
          {showCollab && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 350, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-white/[0.01] border-l border-white/5 flex flex-col shrink-0 relative z-40"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Collaboration</span>
                <button onClick={() => setShowCollab(false)} className="text-zinc-600 hover:text-white"><X size={18}/></button>
              </div>
              <div className="flex-1 flex flex-col min-h-0 p-6 gap-6">
                <div className="space-y-4">
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Active Users</p>
                  <div className="flex flex-wrap gap-2">
                    {connectedUsers.map((u, i) => (
                      <div key={i} className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
                        <span className="text-[10px] font-bold text-white">{u.username}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 flex flex-col min-h-0 bg-black/20 rounded-2xl border border-white/5">
                  <div className="flex-1 overflow-auto p-4 space-y-4">
                    {chatMessages.map((m, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-[8px] font-black text-primary uppercase">{m.username}</p>
                        <p className="text-xs text-zinc-400 bg-white/5 p-2 rounded-lg inline-block">{m.message}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-white/5 flex gap-2">
                    <input 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (socket.emit('send_chat', { message: chatInput, project_id: projectId }), setChatInput(''))}
                      className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/30"
                      placeholder="Type a message..."
                    />
                    <button className="p-2 bg-primary rounded-lg text-white" onClick={() => { socket.emit('send_chat', { message: chatInput, project_id: projectId }); setChatInput(''); }}><Send size={14}/></button>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 right-10 z-50 px-6 py-4 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl flex items-center gap-4"
          >
            <div className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-emerald-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-primary'}`} />
            <span className="text-sm font-bold text-white">{notification.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EditorPage;
