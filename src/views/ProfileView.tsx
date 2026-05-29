import { mockUser } from "@/mockData";
import { Shield, Fingerprint, Activity, Clock, Settings, Network, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

interface ProfileViewProps {
  energy: number;
  assetCount: number;
  completedTaskCount: number;
}

export function ProfileView({ energy, assetCount, completedTaskCount }: ProfileViewProps) {
  return (
    <div className="flex flex-col gap-8 pb-28 lg:pb-8 pt-6 px-6 w-full max-w-3xl mx-auto">
      
      {/* Identity Card */}
      <div className="relative overflow-hidden rounded-3xl bg-black border border-white/10 p-8 shadow-2xl">
        {/* Glow effect */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyber-blue/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyber-purple/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-display font-bold text-white tracking-tight">{mockUser.nickname}</h1>
              <span className="px-3 py-1 bg-white/5 text-slate-300 text-[10px] font-mono font-bold tracking-widest rounded border border-white/10 shadow-inner uppercase">探索者</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-300 font-mono text-sm opacity-90 mb-6 bg-cyan-900/20 px-2.5 py-1 w-fit rounded border border-cyan-800/50">
              <Fingerprint size={14} className="opacity-70" />
              {mockUser.zeroId}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-mono mb-1.5 tracking-widest">CURRENT_LVL</div>
            <div className="text-5xl font-display font-bold text-white leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{mockUser.level}</div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="relative z-10 mt-6 mb-8">
          <div className="flex justify-between text-[11px] text-slate-400 font-mono tracking-wider mb-2">
            <span>EXP_12450</span>
            <span className="opacity-60">NEXT_15000</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "83%" }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="h-full bg-gradient-to-r from-cyber-blue via-cyan-300 to-white rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)]"
            />
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
          <div>
            <div className="text-[10px] text-slate-500 font-mono tracking-widest mb-1.5">ENERGY</div>
            <div className="text-lg font-mono font-bold text-cyan-300">{energy.toLocaleString()}</div>
          </div>
          <div className="pl-6 border-l border-white/10">
            <div className="text-[10px] text-slate-500 font-mono tracking-widest mb-1.5">CREDIT</div>
            <div className="text-lg font-mono font-bold text-emerald-400">{mockUser.creditScore}</div>
          </div>
          <div className="pl-6 border-l border-white/10">
            <div className="text-[10px] text-slate-500 font-mono tracking-widest mb-1.5">CONTRIB</div>
            <div className="text-lg font-mono font-bold text-fuchsia-400">{mockUser.contribution}</div>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-3 gap-3">
        {[
          { label: "完成履约", value: completedTaskCount },
          { label: "资产总数", value: assetCount },
          { label: "贡献指数", value: mockUser.contribution },
        ].map(item => (
          <div key={item.label} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="text-[10px] text-slate-500">{item.label}</div>
            <div className="mt-1 text-xl font-mono font-bold text-slate-100">{item.value.toLocaleString()}</div>
          </div>
        ))}
      </section>

      {/* Operations */}
      <div className="grid grid-cols-1 gap-2">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest pl-1 mt-2 mb-1 flex items-center gap-2">
          <Activity size={14} className="text-cyber-purple" /> 
          数据授权市场
        </h3>
        
        <button className="group flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800/80 hover:border-slate-600 transition-all">
          <div className="w-10 h-10 rounded-full bg-cyber-blue/10 flex items-center justify-center text-cyber-blue group-hover:scale-110 group-hover:bg-cyber-blue/20 transition-all">
            <Network size={20} />
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-sm font-medium text-slate-200 group-hover:text-cyber-blue transition-colors">去中心化授权管理</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">控制品牌可读取的数据边界，审计已授权节点</p>
          </div>
          <ChevronRight size={16} className="text-slate-600 group-hover:text-cyber-blue transition-colors" />
        </button>

         <button className="group flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800/80 hover:border-slate-600 transition-all">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
            <Shield size={20} />
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-sm font-medium text-slate-200 group-hover:text-emerald-400 transition-colors">社区治理议会</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">你的信用分达标，可参与反作弊投票与商圈评级</p>
          </div>
          <ChevronRight size={16} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 mt-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest pl-1 mb-1">通用</h3>
        
        <button className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/30 border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
          <Clock size={16} className="text-slate-500" />
          <span className="text-sm font-medium text-slate-300">历史履约与时间轴</span>
        </button>
        <button className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/30 border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
          <Settings size={16} className="text-slate-500" />
          <span className="text-sm font-medium text-slate-300">零界设置与硬件接入</span>
        </button>
      </div>
    </div>
  );
}
