import { userAssets } from "@/mockData";
import { Ticket, Hexagon, Tag, CalendarClock } from "lucide-react";
import { motion } from "motion/react";

export function AssetsView() {
  const stats = [
    { label: "徽章库", count: userAssets.filter(asset => asset.type === "badge").length, color: "text-slate-200" },
    { label: "有效票根", count: userAssets.filter(asset => asset.type === "ticket").length, color: "text-slate-200" },
    { label: "可用权益", count: userAssets.filter(asset => asset.type === "coupon").length, color: "text-slate-200" },
    { label: "本月将过期", count: userAssets.filter(asset => asset.expiresAt).length, color: "text-rose-400" },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'badge': return <Hexagon size={24} className="text-cyber-blue" />;
      case 'ticket': return <Ticket size={24} className="text-cyber-purple drop-shadow-[0_0_8px_rgba(192,38,211,0.5)]" />;
      case 'coupon': return <Tag size={24} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />;
      default: return <Hexagon size={24} />;
    }
  };

  const getGradient = (type: string) => {
    switch (type) {
      case 'badge': return 'from-cyan-950/80 to-slate-900 border-cyan-900/50 hover:border-cyan-500/50';
      case 'ticket': return 'from-fuchsia-950/80 to-slate-900 border-fuchsia-900/50 hover:border-fuchsia-500/50';
      case 'coupon': return 'from-emerald-950/80 to-slate-900 border-emerald-900/50 hover:border-emerald-500/50';
      default: return 'from-slate-900 to-slate-950';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex flex-col gap-6 pb-24 lg:pb-8 pt-4 px-4 w-full max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-wide">资产折叠</h1>
        <p className="text-xs text-slate-400 mt-1">权益钱包与数字凭证记录</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 shadow-inner"
          >
            <div className="text-xs text-slate-500 mb-1">{stat.label}</div>
            <div className={`text-2xl font-mono font-bold ${stat.color}`}>{stat.count}</div>
          </motion.div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-slate-200 mt-2 tracking-wider">最新获取</h2>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {userAssets.map(asset => (
          <motion.div variants={item} key={asset.id} className={`p-5 rounded-2xl bg-gradient-to-br ${getGradient(asset.type)} border flex flex-col gap-4 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl`}>
            {/* Glossy overlay effect */}
            <div className="absolute top-0 right-0 left-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent z-0 pointer-events-none" />
            
            <div className="relative z-10 flex justify-between items-start">
              <div className="w-12 h-12 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-inner group-hover:scale-110 transition-transform duration-300">
                {getIcon(asset.type)}
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 bg-black/40 px-2 py-1 rounded border border-white/5 backdrop-blur tracking-widest">
                #{asset.id.split('-').pop()?.toUpperCase()}
              </span>
            </div>
            
            <div className="relative z-10 mt-2">
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors">{asset.name}</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{asset.description}</p>
              <p className="text-[11px] text-slate-500 mt-2">发行方：{asset.issuer}</p>
            </div>
            
            <div className="relative z-10 mt-auto pt-4 border-t border-white/10 border-dashed flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span className="tracking-widest">MINTED</span>
              <span className="font-bold text-slate-400">{new Date(asset.acquiredAt).toLocaleDateString()}</span>
            </div>
            {asset.expiresAt && (
              <div className="relative z-10 -mt-2 flex items-center gap-1.5 text-[10px] text-rose-300/80 font-mono">
                <CalendarClock size={12} />
                <span>EXPIRES {new Date(asset.expiresAt).toLocaleDateString()}</span>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
