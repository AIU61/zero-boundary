import { useMemo, useState } from "react";
import { featuredRoute, nearbyTasks } from "@/mockData";
import { CheckCircle2, CircleDashed, Clock3, MapPin, RotateCcw, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { TaskStatus } from "@/types";

type TaskFilter = "all" | "accepted" | "route" | "brand";

interface TasksViewProps {
  taskStatuses: Record<string, TaskStatus>;
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void;
}

export function TasksView({ taskStatuses, onTaskStatusChange }: TasksViewProps) {
  const allTasks = [featuredRoute, ...nearbyTasks];
  const [activeActions, setActiveActions] = useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("all");

  const tasks = useMemo(() => allTasks.map(task => ({
    ...task,
    status: taskStatuses[task.id] ?? task.status,
  })), [allTasks, taskStatuses]);

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === "accepted") return task.status === "accepted";
    if (activeFilter === "route") return task.type === "route";
    if (activeFilter === "brand") return task.type === "brand";
    return true;
  });

  const completedCount = tasks.filter(task => task.status === "completed").length;
  const activeCount = tasks.filter(task => task.status === "accepted").length;
  const earnedEnergy = tasks
    .filter(task => task.status === "completed")
    .reduce((sum, task) => sum + task.rewardEnergy, 0);

  const handleAction = (taskId: string) => {
    const task = tasks.find(item => item.id === taskId);
    if (!task || activeActions[taskId] || task.status === "completed") return;

    if (task.status === "available") {
      onTaskStatusChange(taskId, "accepted");
      return;
    }
    
    setActiveActions(prev => ({ ...prev, [taskId]: true }));
    
    setTimeout(() => {
      setActiveActions(prev => ({ ...prev, [taskId]: false }));
      onTaskStatusChange(taskId, "completed");
    }, 1500);
  };

  const resetDemo = () => {
    tasks.forEach(task => onTaskStatusChange(task.id, task.id === featuredRoute.id ? "accepted" : "available"));
  };

  return (
    <div className="flex flex-col gap-6 pb-28 lg:pb-8 pt-6 px-6 w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">任务中心</h1>
          <p className="text-sm text-slate-400 mt-2 font-mono tracking-wide">TASK_CENTER // 完成履约获取资产</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono text-cyber-blue font-bold drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">{tasks.length}</div>
          <div className="text-[10px] text-slate-500 font-mono tracking-widest mt-1 uppercase">Task Pool</div>
        </div>
      </div>

      <section className="grid grid-cols-3 gap-3">
        {[
          { label: "进行中", value: activeCount },
          { label: "已完成", value: completedCount },
          { label: "已获得能量", value: earnedEnergy },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
            <div className="text-[10px] text-slate-500">{stat.label}</div>
            <div className="mt-1 text-xl font-mono font-bold text-slate-100">{stat.value.toLocaleString()}</div>
          </div>
        ))}
      </section>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mask-linear">
        {[
          { id: "all", label: "所有任务 (ALL)" },
          { id: "accepted", label: "进行中 (ACTIVE)" },
          { id: "route", label: "跨店路线 (ROUTE)" },
          { id: "brand", label: "品牌共创 (BRAND)" },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as TaskFilter)}
            className={cn(
              "px-4 py-1.5 rounded-full text-[11px] font-mono tracking-wider whitespace-nowrap transition-all border",
              activeFilter === tab.id 
                ? "bg-cyber-blue text-cyber-darker border-cyber-blue font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]" 
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-600"
            )}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={resetDemo}
          className="ml-auto hidden sm:flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-[11px] text-slate-400 hover:text-slate-200"
        >
          <RotateCcw size={12} /> 重置演示
        </button>
      </div>

      <div className="flex flex-col gap-5">
        {filteredTasks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center text-sm text-slate-400">
            当前筛选下暂无任务，切换筛选或重置演示状态。
          </div>
        )}

        {filteredTasks.map((task, index) => (
          <motion.div 
            key={task.id} 
            animate={{
              scale: task.status === "completed" ? 1.01 : 1,
              borderColor: task.status === "completed" ? 'rgba(52, 211, 153, 0.3)' : 'rgba(30, 41, 59, 0.8)'
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative p-6 rounded-2xl bg-black/40 backdrop-blur-sm border transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
          >
            {task.status === "accepted" && (
               <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-r from-cyber-purple/20 to-transparent text-fuchsia-300 text-[10px] font-mono font-bold tracking-widest rounded-bl-xl rounded-tr-2xl border-b border-l border-cyber-purple/30">
                 ACTIVE_NODE
               </div>
            )}
            
            <div className="flex gap-5">
              <div className="flex-shrink-0 mt-1">
                {task.status === "completed" ? (
                  <CheckCircle2 className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" size={26} />
                ) : task.status === "accepted" ? (
                  <CircleDashed className="text-cyber-purple animate-[spin_4s_linear_infinite]" size={26} />
                ) : (
                  <CheckCircle2 className="text-slate-700" size={26} />
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-display font-bold text-white mb-2">{task.title}</h3>
                <p className="text-sm text-slate-400 mb-5 leading-relaxed max-w-2xl">{task.description}</p>

                <div className="mb-5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5"><MapPin size={13} className="text-cyber-blue" />{task.location}</span>
                  <span className="flex items-center gap-1.5"><Clock3 size={13} className="text-cyber-purple" />约 {task.estimatedMinutes} 分钟</span>
                  <span className="text-emerald-300">掉落：{task.assetReward}</span>
                </div>
                
                <div className="flex items-center gap-2 mb-6">
                  {task.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-slate-900 border border-white/5 text-slate-300 text-[10px] font-mono tracking-wider rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="text-sm font-mono text-cyan-300 font-bold bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded">
                    +{task.rewardEnergy} E
                  </div>
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      {task.status !== "completed" ? (
                        <motion.button 
                          key="button"
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={() => handleAction(task.id)}
                          className={`relative overflow-hidden px-4 py-1.5 rounded text-sm font-medium transition-all duration-300 ${
                            task.status === "accepted" 
                              ? 'bg-cyber-purple/20 text-fuchsia-300 border border-cyber-purple/50 cursor-pointer hover:bg-cyber-purple/30 active:scale-95' 
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer active:scale-95'
                          }`}
                        >
                          <span className={`block transition-opacity duration-200 ${activeActions[task.id] ? 'opacity-0' : 'opacity-100'}`}>
                            {task.status === "accepted" ? '打卡履约' : '领取任务'}
                          </span>
                          
                          <AnimatePresence>
                            {activeActions[task.id] && (
                              <motion.div 
                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                  className={`flex items-center justify-center`}
                                >
                                  <CheckCircle2 size={18} className={task.status === "accepted" ? 'text-fuchsia-300' : 'text-cyan-300'} />
                                </motion.div>
                                
                                {/* Particles */}
                                {[...Array(6)].map((_, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                                    animate={{ 
                                      x: (Math.random() - 0.5) * 80, 
                                      y: (Math.random() - 0.5) * 40 - 10,
                                      scale: Math.random() * 0.5 + 0.5,
                                      opacity: 0
                                    }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                    className={`absolute ${task.status === "accepted" ? 'text-fuchsia-400' : 'text-cyan-400'}`}
                                  >
                                    <Zap size={10} className="fill-current" />
                                  </motion.div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      ) : (
                        <motion.div
                          key="badge"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 rounded-full"
                        >
                          <CheckCircle2 size={16} />
                          <span className="text-[10px] sm:text-xs font-bold font-mono tracking-wider">已完成</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
