import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Terminal, LayoutDashboard, Code2, FlaskConical, History, User, LogOut, Menu, X, Rocket, Swords } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Playground', path: '/editor', icon: Code2 },
    { name: 'TestForge', path: '/tests', icon: FlaskConical },
    { name: 'Battles', path: '/battles', icon: Swords },
    { name: 'Snippets', path: '/snippets', icon: History },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
      scrolled ? 'py-4 bg-background/80 backdrop-blur-xl border-b border-white/5' : 'py-6 bg-transparent'
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Terminal className="text-white" size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase">CodeRunner<span className="text-primary">.</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2 bg-white/[0.03] border border-white/5 p-1.5 rounded-2xl">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                isActive(link.path) 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-zinc-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <link.icon size={16} />
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-xs font-black text-white">{user.username}</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">{user.role}</span>
              </div>
              <button onClick={handleLogout} className="w-10 h-10 bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 rounded-xl flex items-center justify-center transition-all border border-white/5 group">
                <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary px-6 py-2.5 rounded-xl text-xs">
              <Rocket size={16} />
              Get Started
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-background/95 backdrop-blur-2xl border-b border-white/5 md:hidden"
          >
            <div className="p-6 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 p-4 rounded-2xl font-bold ${
                    isActive(link.path) ? 'bg-primary text-white' : 'text-zinc-400'
                  }`}
                >
                  <link.icon size={20} />
                  {link.name}
                </Link>
              ))}
              <hr className="my-4 border-white/5" />
              {user ? (
                <button onClick={handleLogout} className="flex items-center gap-4 p-4 rounded-2xl font-bold text-red-400">
                  <LogOut size={20} />
                  Sign Out
                </button>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="btn-primary">
                  Get Started
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
