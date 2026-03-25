import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FlaskConical, Play, CheckCircle, AlertCircle, Clock, 
  Trash2, Plus, Search, ChevronRight, History, BarChart, 
  Settings, Loader2, Zap, Shield, Bug, Gauge, Code2, Save, X, ExternalLink
} from 'lucide-react';
import api from '../api/axios';

const TestForge = () => {
  const [testSuites, setTestSuites] = useState([
    { id: '1', name: 'Auth Module Unit Tests', language: 'javascript', status: 'passed', last_run: '2024-03-24', coverage: '94%' },
    { id: '2', name: 'Sandbox Security Integration', language: 'python', status: 'failed', last_run: '2024-03-23', coverage: '88%' },
    { id: '3', name: 'Database Connection Pool', language: 'go', status: 'passed', last_run: '2024-03-22', coverage: '92%' },
    { id: '4', name: 'AI Reasoning Fallback', language: 'javascript', status: 'passed', last_run: '2024-03-21', coverage: '96%' },
  ]);
  const [loading, setLoading] = useState(false);
  const [activeSuite, setActiveSuite] = useState(null);
  const [showNewSuite, setShowNewSuite] = useState(false);
  const [suiteName, setSuiteName] = useState('');
  const [suiteLang, setSuiteLang] = useState('javascript');

  const runAllTests = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("All test suites executed successfully.");
    }, 2000);
  };

  const createSuite = () => {
    if (!suiteName) return;
    const newSuite = {
      id: Date.now().toString(),
      name: suiteName,
      language: suiteLang,
      status: 'pending',
      last_run: 'Never',
      coverage: '0%'
    };
    setTestSuites([newSuite, ...testSuites]);
    setShowNewSuite(false);
    setSuiteName('');
  };

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-6 pt-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20">
              <FlaskConical className="text-white" size={28} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">TestForge<span className="text-primary">.</span></h1>
          </div>
          <p className="text-zinc-500 font-medium tracking-tight">Automated testing and quality assurance for your workspaces</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowNewSuite(true)}
            className="btn-secondary px-6 py-4 text-xs font-black uppercase tracking-widest"
          >
            <Plus size={18} /> New Suite
          </button>
          <button 
            onClick={runAllTests}
            disabled={loading}
            className="btn-primary px-8 py-4 text-xs font-black uppercase tracking-widest min-w-[180px]"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <><Play size={18} /> Run All Suites</>}
          </button>
        </div>
      </header>

      {/* Stats Summary */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'Pass Rate', value: '92%', icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Avg Coverage', value: '91.4%', icon: Gauge, color: 'text-primary' },
          { label: 'Total Tests', value: '1,428', icon: Code2, color: 'text-blue-400' },
          { label: 'Failures', value: '3', icon: AlertCircle, color: 'text-red-400' }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-8 text-center space-y-4 border-white/5 group hover:border-white/10 transition-all">
            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Test Suites List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Active Test Suites</h2>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600">
            <Filter size={14} /> Sort by Last Run
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {testSuites.map((suite, i) => (
              <motion.div
                key={suite.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-1 group hover:border-primary/30 transition-all border border-white/5"
              >
                <div className="bg-[#090514] rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-8 flex-1 w-full">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all ${
                      suite.status === 'passed' ? 'bg-emerald-500/10 text-emerald-400 shadow-emerald-500/20' : 
                      suite.status === 'failed' ? 'bg-red-500/10 text-red-400 shadow-red-500/20' : 'bg-white/5 text-zinc-600'
                    }`}>
                      {suite.status === 'passed' ? <CheckCircle size={28} /> : 
                       suite.status === 'failed' ? <Bug size={28} /> : <Clock size={28} />}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <h3 className="text-xl font-bold text-white tracking-tight">{suite.name}</h3>
                        <span className="px-2 py-0.5 bg-white/5 border border-white/5 text-[8px] font-black text-zinc-500 uppercase tracking-widest rounded-lg">
                          {suite.language}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                        <span className="flex items-center gap-2"><Clock size={12}/> Last run: {suite.last_run}</span>
                        <span className="flex items-center gap-2"><Shield size={12}/> Coverage: {suite.coverage}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <button className="flex-1 md:flex-none btn-secondary px-6 py-3 text-[10px] uppercase tracking-widest font-black">
                      View Report
                    </button>
                    <button className="flex-1 md:flex-none btn-primary px-8 py-3 text-[10px] uppercase tracking-widest font-black shadow-none">
                      <Play size={14} /> Run Suite
                    </button>
                    <button className="p-3 text-zinc-700 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* New Suite Modal */}
      <AnimatePresence>
        {showNewSuite && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-2xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg glass-card p-12 space-y-8 shadow-2xl shadow-primary/20 relative"
            >
              <button onClick={() => setShowNewSuite(false)} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors">
                <X size={24} />
              </button>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">New Test Suite</h2>
                <p className="text-zinc-500 font-medium">Define a new quality assurance protocol</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Suite Name</label>
                  <input 
                    type="text"
                    value={suiteName}
                    onChange={(e) => setSuiteName(e.target.value)}
                    className="input-field"
                    placeholder="e.g. Core API Integration"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Language Environment</label>
                  <select 
                    value={suiteLang}
                    onChange={(e) => setSuiteLang(e.target.value)}
                    className="input-field appearance-none cursor-pointer"
                  >
                    <option value="javascript">JavaScript (Node.js)</option>
                    <option value="python">Python 3.10</option>
                    <option value="cpp">C++ (GCC 11)</option>
                    <option value="java">Java 21</option>
                    <option value="go">Go 1.21</option>
                  </select>
                </div>
                <button 
                  onClick={createSuite}
                  className="btn-primary w-full py-5 text-sm mt-4 shadow-xl shadow-primary/30"
                >
                  <Save size={20} /> Initialize Suite
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestForge;
