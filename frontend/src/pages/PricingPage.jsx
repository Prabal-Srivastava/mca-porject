import { motion } from 'framer-motion';
import { Check, Zap, Rocket, Shield, Globe, Users, ChevronRight, BarChart, Mic, MessageSquare, Code2, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

const PricingPage = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      desc: 'Perfect for learning and individual projects.',
      features: ['2 Isolated Sandboxes', '5 Concurrent Runs/Day', 'Standard Debugger', 'Community Support', 'Public Portfolio'],
      cta: 'Get Started',
      color: 'text-zinc-500',
      bg: 'bg-white/5',
      border: 'border-white/5',
    },
    {
      name: 'Pro',
      price: '$19',
      period: '/mo',
      desc: 'For professional developers and heavy users.',
      features: ['Unlimited Sandboxes', 'AI Dual-Engine Access', 'Real-time Collaboration', 'Advanced Metrics', 'Private Workspaces', '24/7 Priority Support'],
      cta: 'Go Pro',
      color: 'text-primary',
      bg: 'bg-primary/5',
      border: 'border-primary/20',
      popular: true,
    },
    {
      name: 'Team',
      price: '$49',
      period: '/mo',
      desc: 'Collaborative features for small teams.',
      features: ['All Pro Features', 'Team Workspace Management', 'Shared Snippet Vault', 'Voice-to-Code Collab', 'Custom Deployment', 'Onboarding Support'],
      cta: 'Start Trial',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/5',
      border: 'border-emerald-500/20',
    }
  ];

  return (
    <div className="flex-1 pb-20">
      <section className="py-20 text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold uppercase tracking-widest"
        >
          <Zap size={14} />
          Choose Your Plan
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-white tracking-tight"
        >
          Simple, Transparent <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Pricing.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-500 max-w-2xl mx-auto font-medium"
        >
          Whether you're just starting out or building complex distributed systems, we have the right tools for your journey.
        </motion.p>
      </section>

      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card p-10 relative overflow-hidden group hover:scale-[1.02] transition-all border ${plan.border}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-bl-2xl">
                  Most Popular
                </div>
              )}
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className={`text-2xl font-black uppercase tracking-widest ${plan.color}`}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white">{plan.price}</span>
                    <span className="text-zinc-500 text-lg font-bold">{plan.period}</span>
                  </div>
                  <p className="text-zinc-500 text-sm font-medium pt-2">{plan.desc}</p>
                </div>

                <hr className="border-white/5" />

                <ul className="space-y-4">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-zinc-400 text-sm font-medium">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.bg} ${plan.color}`}>
                        <Check size={12} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link 
                  to="/register" 
                  className={`btn-primary w-full py-5 text-sm ${plan.name !== 'Pro' ? 'bg-zinc-800 hover:bg-zinc-700 shadow-none' : ''}`}
                >
                  {plan.cta}
                  <ChevronRight size={20} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-40">
        <div className="container mx-auto px-6">
          <div className="glass-card p-12 md:p-20 text-center relative overflow-hidden border-primary/20">
            <div className="absolute top-0 left-0 w-full h-full bg-primary/[0.03] blur-[150px] pointer-events-none" />
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl font-black text-white uppercase tracking-tight">Need a Custom Enterprise Solution?</h2>
              <p className="text-zinc-500 max-w-2xl mx-auto font-medium text-lg">
                Custom quotas, private cloud deployment, SSO integration, and dedicated account management for large organizations.
              </p>
              <button className="btn-secondary inline-flex px-12 py-5 text-base">
                Contact Enterprise Sales
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
