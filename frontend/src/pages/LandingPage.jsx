import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Rocket, Shield, Cpu, Zap, Users, Globe, ChevronRight, Terminal, Code2 } from 'lucide-react';

const LandingPage = () => {
  const features = [
    { title: 'Isolated Sandboxes', desc: 'Secure Docker containers for every execution', icon: Shield, color: 'text-blue-400' },
    { title: 'Multi-Language', desc: 'Python, Node, C++, Java, Go, Ruby and more', icon: Code2, color: 'text-purple-400' },
    { title: 'Real-time Collab', desc: 'Code together with live cursor and chat', icon: Users, color: 'text-emerald-400' },
    { title: 'AI Dual-Engine', desc: 'Powered by Gemini Pro and GPT-3.5', icon: Zap, color: 'text-yellow-400' },
  ];

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold uppercase tracking-widest"
            >
              <Rocket size={14} />
              The Future of Online IDEs
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black text-white leading-[1.1] tracking-tight"
            >
              Compile. Execute. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Collaborate.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-medium"
            >
              A high-performance SaaS platform for developers to write, run, and share code in isolated environments with integrated AI assistance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link to="/register" className="btn-primary px-10 py-5 text-base w-full md:w-auto">
                Start Coding Free
                <ChevronRight size={20} />
              </Link>
              <Link to="/pricing" className="btn-secondary px-10 py-5 text-base w-full md:w-auto">
                View Pricing
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white/[0.01]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 group hover:border-primary/30 transition-all"
              >
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${f.color}`}>
                  <f.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{f.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Preview / CTA */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="glass-card p-1 md:p-2 overflow-hidden border-primary/20 shadow-primary/10">
            <div className="bg-[#0d0a1a] rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <div className="ml-4 px-3 py-1 rounded-lg bg-white/5 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                  Preview.js
                </div>
              </div>
              <pre className="font-mono text-sm md:text-lg text-primary/80 leading-relaxed">
                <code>{`// Welcome to CodeRunner
const mission = "Build the best dev experience";
const features = ["Docker", "AI", "Real-time"];

export function startCoding() {
  console.log(\`Ready to \${mission}...\`);
}`}</code>
              </pre>
              
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
