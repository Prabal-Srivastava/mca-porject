import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Code2, Clock, Trash2, Copy, Share2, 
  ExternalLink, Folder, Hash, Filter, SortDesc, Zap, History, Loader2, AlertCircle, FileCode, CheckCircle
} from 'lucide-react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const SnippetManager = () => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [notification, setNotification] = useState(null);

  const fetchSnippets = async () => {
    try {
      const response = await api.get('/history/');
      // Filtering for smaller code snippets or specifically marked ones (mocking snippet logic)
      setSnippets(response.data);
    } catch (err) {
      console.error('Failed to fetch snippets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnippets();
  }, []);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    notify("Copied to clipboard!", "success");
  };

  const deleteSnippet = async (id) => {
    if (!confirm("Are you sure you want to delete this snippet?")) return;
    try {
      await api.delete(`/history/${id}`);
      setSnippets(snippets.filter(s => s.id !== id));
      notify("Snippet deleted", "info");
    } catch (err) {
      notify("Failed to delete", "error");
    }
  };

  const notify = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const languages = ['all', 'javascript', 'python', 'cpp', 'java', 'go'];
  
  const filteredSnippets = snippets.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase()) || 
                          s.code?.toLowerCase().includes(search.toLowerCase());
    const matchesLang = selectedLanguage === 'all' || s.language === selectedLanguage;
    return matchesSearch && matchesLang;
  });

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">Code Vault<span className="text-primary">.</span></h1>
          <p className="text-zinc-500 font-medium">Reusable code fragments and reusable logic</p>
        </div>
        <Link to="/editor" className="btn-primary px-8 py-4 text-sm uppercase tracking-widest font-black">
          <Plus size={20} /> Create Snippet
        </Link>
      </header>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white/[0.02] p-4 rounded-[2rem] border border-white/5">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search vault..."
            className="input-field pl-14 py-3 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-auto w-full md:w-auto p-1 bg-black/20 rounded-2xl border border-white/5 shrink-0">
          {languages.map((lang) => (
            <button 
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedLanguage === lang ? 'bg-primary text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Syncing vault...</p>
        </div>
      ) : filteredSnippets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredSnippets.map((snippet, i) => (
              <motion.div
                layout
                key={snippet.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-1 group hover:border-primary/30 transition-all border border-white/5"
              >
                <div className="bg-[#090514] rounded-[2rem] p-8 space-y-6 overflow-hidden relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/[0.03] rounded-xl flex items-center justify-center border border-white/5 group-hover:bg-primary/20 transition-all">
                        <FileCode size={20} className="text-zinc-500 group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white tracking-tight">{snippet.name || 'Untitled Snippet'}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/50">{snippet.language}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => copyToClipboard(snippet.code)}
                        className="p-2 text-zinc-600 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                      >
                        <Copy size={16} />
                      </button>
                      <button 
                        onClick={() => deleteSnippet(snippet.id)}
                        className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="relative group/code">
                    <pre className="font-mono text-[11px] text-zinc-400 line-clamp-6 bg-black/40 p-4 rounded-xl border border-white/5 group-hover/code:text-zinc-200 transition-colors">
                      <code>{snippet.code}</code>
                    </pre>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090514] via-transparent to-transparent opacity-60 pointer-events-none" />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-1">
                      <Clock size={12} /> {new Date(snippet.updated_at).toLocaleDateString()}
                    </span>
                    <Link to={`/editor/${snippet.id}`} className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 hover:translate-x-1 transition-transform">
                      Open Playground <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="glass-card p-20 text-center space-y-6 border-dashed border-zinc-800">
          <div className="w-20 h-20 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto">
            <History className="text-zinc-700" size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Vault is empty</h2>
            <p className="text-zinc-500 max-w-sm mx-auto font-medium tracking-tight">Start saving your reusable code patterns here.</p>
          </div>
          <Link to="/editor" className="btn-primary inline-flex">
            <Plus size={20} /> Create Snippet
          </Link>
        </div>
      )}

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl flex items-center gap-4 min-w-[300px]"
          >
            <div className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-emerald-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-primary'}`} />
            <span className="text-sm font-bold text-white">{notification.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SnippetManager;
