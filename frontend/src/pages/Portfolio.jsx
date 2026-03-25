import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Github, Twitter, Globe, Code2, Heart, Share2, ExternalLink, 
  Terminal, LayoutDashboard, History, Zap, Mail, MapPin, 
  Loader2, Folder, Clock, Shield, Plus, MessageSquare, Briefcase, GraduationCap
} from 'lucide-react';
import api from '../api/axios';

const Portfolio = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects'); // projects, about, stats

  const fetchPortfolio = async () => {
    try {
      // Mocking portfolio data fetch
      const res = await api.get('/history/');
      const publicProjects = res.data.filter(p => p.is_public);
      setProjects(publicProjects);
      
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(currentUser);
    } catch (err) {
      console.error('Failed to fetch portfolio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [username]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Assembling Profile...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-6 pt-10">
      {/* Profile Header */}
      <section className="glass-card p-12 relative overflow-hidden border-primary/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/[0.05] blur-[150px] rounded-full" />
        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-primary to-purple-600 rounded-[2.5rem] p-1 shadow-2xl shadow-primary/20 rotate-3">
            <div className="w-full h-full bg-background rounded-[2.3rem] flex items-center justify-center overflow-hidden">
              <User size={64} className="text-primary/50" />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">{user?.username || 'Dev User'}</h1>
              <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg inline-block self-center">
                {user?.role || 'Developer'}
              </span>
            </div>
            <p className="text-zinc-400 font-medium max-w-2xl text-lg leading-relaxed">
              Full-stack developer focused on high-performance architectures and secure code execution systems. Built with CodeRunner.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-4 text-zinc-500 font-bold text-xs uppercase tracking-widest">
              <span className="flex items-center gap-2"><MapPin size={14} className="text-primary"/> Global</span>
              <span className="flex items-center gap-2"><Mail size={14} className="text-primary"/> {user?.email || 'contact@dev.com'}</span>
              <span className="flex items-center gap-2"><Globe size={14} className="text-primary"/> coderunner.dev/{user?.username}</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="btn-primary px-8 py-4 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20">
              <Mail size={16} /> Hire Me
            </button>
            <button className="btn-secondary w-14 h-14 flex items-center justify-center p-0 rounded-2xl">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-center gap-4 p-2 bg-white/[0.02] border border-white/5 rounded-[2rem] max-w-md mx-auto relative z-10">
        {[
          { id: 'projects', label: 'Workspaces', icon: Folder },
          { id: 'about', label: 'About', icon: User },
          { id: 'stats', label: 'Stats', icon: Zap }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-zinc-500 hover:text-white'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10">
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.length > 0 ? projects.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card group p-1 hover:border-primary/30 transition-all border border-white/5"
              >
                <div className="bg-[#090514] rounded-[2rem] p-8 space-y-6 overflow-hidden relative">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-white/[0.03] rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-all border border-white/5">
                      <Terminal size={24} className="text-zinc-500 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400/50 bg-emerald-400/5 px-2 py-1 rounded-lg">Verified</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{p.name || 'Untitled Workspace'}</h3>
                    <p className="text-sm text-zinc-500 font-medium line-clamp-2">{p.description || 'Secure isolated development environment'}</p>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                      <Clock size={12} /> {new Date(p.updated_at).toLocaleDateString()}
                    </div>
                    <Link to={`/editor/${p.id}`} className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 hover:translate-x-1 transition-transform">
                      View Code <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-20 text-center glass-card border-dashed">
                <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">No public workspaces found.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="md:col-span-2 space-y-8">
              <div className="glass-card p-10 space-y-6">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <User size={24} className="text-primary" /> Background
                </h3>
                <p className="text-zinc-400 font-medium text-lg leading-relaxed">
                  Passionate developer with expertise in building scalable cloud-native applications. I specialize in backend security and high-performance frontend interfaces.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {['React', 'Node.js', 'Python', 'Docker', 'MongoDB', 'Tailwind'].map(skill => (
                        <span key={skill} className="px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 text-xs font-bold text-white uppercase tracking-widest">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Distributed Systems', 'UI/UX Design', 'AI Engineering'].map(interest => (
                        <span key={interest} className="px-3 py-1.5 bg-primary/5 rounded-xl border border-primary/10 text-xs font-bold text-primary uppercase tracking-widest">{interest}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="glass-card p-10 space-y-6">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Connect</h3>
                <div className="space-y-4">
                  {[
                    { icon: Github, label: 'GitHub', value: '@dev-user', color: 'hover:text-white' },
                    { icon: Twitter, label: 'Twitter', value: '@dev_runner', color: 'hover:text-blue-400' },
                    { icon: Globe, label: 'Website', value: 'dev-user.io', color: 'hover:text-primary' }
                  ].map((link, i) => (
                    <a key={i} href="#" className={`flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 transition-all ${link.color}`}>
                      <div className="flex items-center gap-4">
                        <link.icon size={20} />
                        <span className="text-xs font-bold uppercase tracking-widest">{link.label}</span>
                      </div>
                      <span className="text-[10px] font-black opacity-50">{link.value}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            {[
              { label: 'Total Runs', value: '1,248', icon: Zap, color: 'text-yellow-400' },
              { label: 'Lines Coded', value: '12.4k', icon: Code2, color: 'text-primary' },
              { label: 'Collaborations', value: '42', icon: MessageSquare, color: 'text-emerald-400' },
              { label: 'Snippets Saved', value: '86', icon: History, color: 'text-purple-400' }
            ].map((stat, i) => (
              <div key={i} className="glass-card p-8 text-center space-y-4">
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
