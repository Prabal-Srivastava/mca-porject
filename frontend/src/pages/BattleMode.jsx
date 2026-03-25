import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Swords, Users, Zap, Clock, ChevronRight, 
  Plus, Search, Shield, Timer, Award, Rocket, Play, User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const BattleMode = () => {
  const [battles, setBattles] = useState([
    { id: '1', title: 'Array Master Race', participants: 12, max: 20, time_left: '14:20', difficulty: 'Hard', prize: '500 XP' },
    { id: '2', title: 'Binary Search Speedrun', participants: 5, max: 8, time_left: '05:45', difficulty: 'Medium', prize: '200 XP' },
    { id: '3', title: 'String Manipulation Brawl', participants: 24, max: 50, time_left: '42:10', difficulty: 'Easy', prize: '100 XP' },
  ]);

  const leaderboard = [
    { rank: 1, name: 'prabhat_pro', score: 1450, avatar: 'P' },
    { rank: 2, name: 'code_ninja', score: 1220, avatar: 'C' },
    { rank: 3, name: 'react_king', score: 980, avatar: 'R' },
    { rank: 4, name: 'dev_guru', score: 850, avatar: 'D' },
  ];

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-6 pt-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-rose-500/20">
              <Swords className="text-white" size={28} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">Battle Mode<span className="text-rose-500">.</span></h1>
          </div>
          <p className="text-zinc-500 font-medium tracking-tight">Race against other developers to solve logic puzzles in real-time.</p>
        </div>
        <button className="btn-primary px-10 py-5 text-sm uppercase tracking-widest font-black bg-rose-500 hover:bg-rose-600 shadow-rose-500/20">
          <Plus size={20} /> Host Battle
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Active Battles */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Active Arenas</h2>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600">
              <Users size={14} /> 41 Players Online
            </div>
          </div>

          <div className="space-y-4">
            {battles.map((battle, i) => (
              <motion.div
                key={battle.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-1 group hover:border-rose-500/30 transition-all border border-white/5"
              >
                <div className="bg-[#090514] rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-8 flex-1 w-full">
                    <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 group-hover:scale-110 transition-transform">
                      <Zap className="text-rose-500" size={32} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white tracking-tight">{battle.title}</h3>
                      <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        <span className="flex items-center gap-2 text-rose-400"><Timer size={14}/> {battle.time_left}</span>
                        <span className="flex items-center gap-2"><Users size={14}/> {battle.participants}/{battle.max} joined</span>
                        <span className={`px-2 py-0.5 rounded-lg border ${battle.difficulty === 'Hard' ? 'border-red-500/20 text-red-400 bg-red-500/5' : 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'}`}>
                          {battle.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="text-right mr-4 hidden md:block">
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Rewards</p>
                      <p className="text-sm font-black text-amber-400 uppercase">{battle.prize}</p>
                    </div>
                    <Link to="/editor" className="flex-1 md:flex-none btn-primary px-10 py-4 text-[10px] uppercase tracking-widest font-black bg-rose-500 hover:bg-rose-600 shadow-none">
                      <Play size={14} /> Join Arena
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Real-time Leaderboard */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">World Ranking</h2>
          <div className="glass-card p-8 space-y-6">
            {leaderboard.map((user, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <span className={`text-lg font-black ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-zinc-400' : i === 2 ? 'text-orange-400' : 'text-zinc-600'}`}>
                    #{user.rank}
                  </span>
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 font-black text-zinc-400 group-hover:border-primary/50 group-hover:text-primary transition-all">
                    {user.avatar}
                  </div>
                  <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">{user.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-white">{user.score}</span>
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-tighter">Points</p>
                </div>
              </div>
            ))}
            <hr className="border-white/5" />
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xs">YOU</div>
                <span className="text-xs font-bold text-white tracking-tight">prabhat_mca</span>
              </div>
              <span className="text-[10px] font-black text-primary uppercase">Rank #42</span>
            </div>
          </div>

          <div className="glass-card p-8 bg-gradient-to-br from-primary/20 to-purple-600/20 border-primary/30 relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
              <Award className="text-amber-400" size={32} />
              <h3 className="text-lg font-black text-white uppercase leading-tight">Weekly Champion <br />Tournament</h3>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">Top 3 winners get exclusive badges and 1 month Pro subscription.</p>
              <button className="w-full btn-primary py-3 text-[10px] shadow-none">View Details</button>
            </div>
            <Rocket className="absolute -bottom-4 -right-4 text-white/5 rotate-12 group-hover:scale-110 transition-transform" size={120} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleMode;
