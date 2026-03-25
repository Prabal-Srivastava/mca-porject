import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe, Cpu, Clock, CheckCircle, AlertCircle, RefreshCw, BarChart, Server, Activity, ArrowUpRight } from 'lucide-react';
import api from '../api/axios';

const StatusPage = () => {
  const [status, setStatus] = useState('operational'); // operational, degraded, maintenance
  const [metrics, setMetrics] = useState({
    api_latency: '45ms',
    uptime: '99.98%',
    active_sandboxes: 124,
    cpu_load: '12%',
    memory_usage: '4.2GB / 32GB'
  });

  const services = [
    { name: 'API Services', status: 'operational', region: 'Global' },
    { name: 'Docker Sandbox Node-1', status: 'operational', region: 'US-East' },
    { name: 'Docker Sandbox Node-2', status: 'operational', region: 'EU-West' },
    { name: 'Database (MongoDB)', status: 'operational', region: 'Global' },
    { name: 'Real-time (Socket.io)', status: 'degraded', region: 'Global' },
    { name: 'AI Reasoning Engine', status: 'operational', region: 'Global' },
    { name: 'Prometheus Monitoring', status: 'operational', region: 'Global' },
    { name: 'Redis Cache Layer', status: 'operational', region: 'Global' },
  ];

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">System Status<span className="text-primary">.</span></h1>
          <p className="text-zinc-500 font-medium tracking-tight">Real-time health of CodeRunner's high-performance infrastructure</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="btn-secondary px-6 py-3 text-xs uppercase tracking-widest font-black">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </header>

      {/* Main Status Hero */}
      <section className={`glass-card p-12 relative overflow-hidden transition-all duration-500 border ${
        status === 'operational' ? 'border-emerald-500/20 shadow-emerald-500/10' : 'border-red-500/20 shadow-red-500/10'
      }`}>
        <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full pointer-events-none opacity-20 ${
          status === 'operational' ? 'bg-emerald-500' : 'bg-red-500'
        }`} />
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <div className="flex items-center gap-8">
            <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all ${
              status === 'operational' ? 'bg-emerald-500/20 text-emerald-400 shadow-emerald-500/20' : 'bg-red-500/20 text-red-400 shadow-red-500/20'
            }`}>
              {status === 'operational' ? <Shield size={48} /> : <AlertCircle size={48} />}
            </div>
            <div className="space-y-2">
              <h2 className={`text-3xl font-black uppercase tracking-tight ${status === 'operational' ? 'text-emerald-400' : 'text-red-400'}`}>
                {status === 'operational' ? 'All Systems Operational' : 'Partial Outage Detected'}
              </h2>
              <p className="text-zinc-500 font-medium">Verified by our 24/7 automated observability layer.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Uptime (30d)</p>
              <p className="text-xl font-black text-white tracking-tighter">{metrics.uptime}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Avg Latency</p>
              <p className="text-xl font-black text-white tracking-tighter">{metrics.api_latency}</p>
            </div>
            <div className="space-y-1 hidden md:block">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Active Runs</p>
              <p className="text-xl font-black text-white tracking-tighter">{metrics.active_sandboxes}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-6 border-white/5 group hover:border-white/10 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{s.region}</span>
              <div className={`w-2 h-2 rounded-full shadow-lg ${
                s.status === 'operational' ? 'bg-emerald-500 shadow-emerald-500/30' : 
                s.status === 'degraded' ? 'bg-yellow-500 shadow-yellow-500/30' : 'bg-red-500 shadow-red-500/30'
              }`} />
            </div>
            <h3 className="text-sm font-black text-white tracking-tight uppercase group-hover:text-primary transition-colors">{s.name}</h3>
            <p className={`text-[10px] font-black uppercase mt-2 tracking-widest ${
              s.status === 'operational' ? 'text-emerald-500/50' : 
              s.status === 'degraded' ? 'text-yellow-500/50' : 'text-red-500/50'
            }`}>
              {s.status}
            </p>
          </motion.div>
        ))}
      </section>

      {/* Performance Metrics Section */}
      <section className="py-12">
        <div className="glass-card p-12 space-y-12">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Performance Analytics</h3>
            <div className="flex items-center gap-4 text-xs font-bold text-zinc-500">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> Traffic</span>
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Success Rate</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-zinc-500">
                <span className="flex items-center gap-2"><Cpu size={14}/> CPU Allocation</span>
                <span className="text-white">{metrics.cpu_load}</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: metrics.cpu_load }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-zinc-500">
                <span className="flex items-center gap-2"><Activity size={14}/> Memory Utilization</span>
                <span className="text-white">{metrics.memory_usage.split(' / ')[0]}</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '13%' }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StatusPage;
