import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Folder, Clock, ChevronRight, Globe, Shield, ExternalLink, User, Search, LayoutGrid, List, Trash2, Loader2 } from 'lucide-react';
import api from '../api/axios';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchProjects = async () => {
    try {
      const response = await api.get('/history/');
      const sorted = response.data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      setProjects(sorted);
    } catch (err) {
      console.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const togglePublic = async (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.patch(`/history/${projectId}/toggle-public`);
      setProjects(projects.map(p => p.id === projectId ? { ...p, is_public: res.data.is_public } : p));
    } catch (err) {
      alert("Failed to update visibility");
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Your Workspaces<span className="text-primary">.</span></h1>
          <p className="text-zinc-500 font-medium">Manage your high-performance code environments</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/portfolio/me" className="btn-secondary px-6 py-3 text-xs">
            <User size={16} />
            Portfolio
          </Link>
          <Link to="/editor" className="btn-primary px-8 py-4 text-sm">
            <Zap size={20} />
            Start VisuCode
          </Link>
        </div>
      </header>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white/[0.02] p-4 rounded-[2rem] border border-white/5">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search workspaces..."
            className="input-field pl-14 py-3 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 p-1 bg-black/20 rounded-xl border border-white/5">
          <button 
            onClick={() => setView('grid')}
            className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-primary text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setView('list')}
            className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-primary text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Syncing environments...</p>
        </div>
      ) : filteredProjects.length > 0 ? (
        <motion.div 
          layout
          className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}
        >
          <AnimatePresence>
            {filteredProjects.map((project, i) => (
              <motion.div
                layout
                key={project.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/editor/${project.id}`}>
                  <div className={`glass-card group p-8 hover:border-primary/30 transition-all relative overflow-hidden ${view === 'list' ? 'flex items-center justify-between py-6' : ''}`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.03] blur-3xl rounded-full group-hover:bg-primary/10 transition-all" />
                    
                    <div className={view === 'list' ? "flex items-center gap-6" : "space-y-6"}>
                      <div className="w-14 h-14 bg-white/[0.03] rounded-2xl flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all border border-white/5">
                        <Folder size={28} className="text-zinc-500 group-hover:text-primary transition-colors" />
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1 tracking-tight">{project.name || 'Untitled Project'}</h3>
                        <p className="text-sm text-zinc-500 font-medium line-clamp-1">{project.description || 'Standard workspace environment'}</p>
                      </div>
                    </div>

                    <div className={view === 'list' ? "flex items-center gap-8" : "flex items-center justify-between mt-10 pt-6 border-t border-white/5"}>
                      <div className="flex items-center gap-2 text-zinc-600">
                        <Clock size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(project.updated_at).toLocaleDateString()}</span>
                      </div>
                      <button 
                        onClick={(e) => togglePublic(e, project.id)}
                        className={`px-3 py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                          project.is_public 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-zinc-800 border-white/5 text-zinc-500'
                        }`}
                      >
                        {project.is_public ? <Globe size={12} /> : <Shield size={12} />}
                        {project.is_public ? 'Public' : 'Private'}
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="glass-card p-20 text-center space-y-6 border-dashed border-zinc-800">
          <div className="w-20 h-20 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto">
            <Search className="text-zinc-700" size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">No environments found</h2>
            <p className="text-zinc-500 max-w-sm mx-auto font-medium">Create your first playground or try searching for something else.</p>
          </div>
          <Link to="/editor" className="btn-primary inline-flex">
            <Plus size={20} />
            New Playground
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
