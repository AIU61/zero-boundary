import { featuredRoute, mockUser, nearbyTasks } from "@/mockData";
import { ChevronRight, Sparkles, MapPin, AudioLines, Flame } from "lucide-react";
import { motion } from "motion/react";
import { Tab, TaskStatus } from "@/types";

interface HomeViewProps {
  onNavigate: (tab: Tab) => void;
  taskStatuses: Record<string, TaskStatus>;
}

export function HomeView({ onNavigate, taskStatuses }: HomeViewProps) {
  const completedCount = Object.values(taskStatuses).filter(status => status === "completed").length;
  const activeCount = Object.values(taskStatuses).filter(status => status === "accepted").length;

  return (
    <div className="flex flex-col gap-8 pb-24 lg:pb-8 pt-4 px-4 w-full max-w-5xl mx-auto">
      <section className="grid grid-cols-3 gap-3">
        {[
          { label: "今日推荐", value: nearbyTasks.length + 1 },
          { label: "进行中", value: activeCount },
          { label: "已完成", value: completedCount },
        ].map(item => (
          <div key={item.label} className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3">
            <div className="text-[10px] text-slate-500">{item.label}</div>
            <div className="mt-1 text-2xl font-mono font-bold text-slate-100">{item.value}</div>
          </div>
        ))}
      </section>
      
      {/* AI Assistant Nora Notification */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-cyber-blue/20 to-cyber-purple/10 border border-cyber-blue/30 p-4 shadow-[0_0_20px_rgba(6,182,212,0.15)] group hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] transition-shadow duration-500"
      >
        <div className="absolute top-0 right-0 p-2 opacity-20">
          <AudioLines size={64} className="text-cyber-blue animate-[pulse_3s_ease-in-out_infinite] group-hover:scale-110 transition-transform duration-700" />
        </div>
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-cyber-blue" />
            <span className="text-sm font-semibold text-cyber-blue tracking-wide">诺拉 (AI 助手) 推送</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            林砚，检测到你正在蓝岸商圈。已为你生成专属探店任务：完成<strong className="text-white">“黑雨冷萃 - 夜行路线”</strong>，即可获得城市能量与隐藏菜单资格。
          </p>
          <button
            onClick={() => onNavigate("tasks")}
            className="self-start mt-2 px-5 py-1.5 bg-cyber-blue text-cyber-dark font-bold text-xs uppercase tracking-wider rounded hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.6)] transition-all duration-300 active:scale-95"
          >
            立即领取任务
          </button>
        </div>
      </motion.div>

      {/* Featured Route */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold flex items-center gap-2 text-white">
            <Flame size={20} className="text-cyber-purple drop-shadow-[0_0_8px_rgba(192,38,211,0.8)]" />
            <span className="tracking-wide">精选城市路线</span>
          </h2>
          <button
            onClick={() => onNavigate("map")}
            className="text-[11px] font-mono tracking-widest uppercase text-cyan-300 flex items-center hover:text-white transition-colors"
          >
            Explore <ChevronRight size={14} />
          </button>
        </div>
        
        <button
          onClick={() => onNavigate("tasks")}
          className="text-left group relative rounded-2xl overflow-hidden border border-slate-800 hover:border-cyber-blue/50 transition-all duration-500 bg-slate-900/50 cursor-pointer shadow-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] block w-full"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10" />
          
          {/* Mock Image Placeholder */}
          <div className="h-56 w-full bg-[url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2947&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-out" />
          
          <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
            <div className="flex flex-wrap gap-2 mb-3">
              {featuredRoute.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 text-[10px] bg-cyber-purple/20 text-fuchsia-300 border border-cyber-purple/30 rounded shadow-[0_0_10px_rgba(192,38,211,0.2)] backdrop-blur-md">
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-xl font-bold text-white mb-1.5 group-hover:text-cyber-blue transition-colors duration-300">
              {featuredRoute.title}
            </h3>
            <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
              {featuredRoute.description}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm font-mono font-bold text-cyber-blue flex items-center gap-1 bg-cyber-blue/10 px-2.5 py-1 rounded border border-cyber-blue/20">
                +{featuredRoute.rewardEnergy} 能量
              </span>
            </div>
          </div>
        </button>
      </motion.section>

      {/* Nearby Tasks */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={18} className="text-cyber-blue drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
          <h2 className="text-lg font-semibold tracking-wide">附近发现</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nearbyTasks.map((task, i) => (
            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + (i * 0.1) }}
              key={task.id} 
              onClick={() => onNavigate("tasks")}
              className="text-left p-5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-600 transition-all duration-300 flex flex-col gap-3 group cursor-pointer hover:bg-slate-900/60 hover:shadow-lg"
            >
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-slate-100 group-hover:text-white transition-colors">{task.title}</h4>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/80 group-hover:bg-cyber-blue/20 transition-colors">
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-cyber-blue" />
                </div>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{task.description}</p>
              <div className="mt-auto pt-3 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-y-2">
                <div className="flex gap-2">
                  {task.tags.map(tag => (
                    <span key={tag} className="text-[10px] text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-mono font-bold text-cyber-blue bg-cyber-blue/10 px-2 py-0.5 rounded">+{task.rewardEnergy} E</span>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

    </div>
  );
}
