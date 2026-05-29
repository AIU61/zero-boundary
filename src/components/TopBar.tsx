import { cn } from "@/lib/utils";
import { Battery, Terminal } from "lucide-react";

interface TopBarProps {
  energy: number;
  level: number;
  className?: string;
}

export function TopBar({ energy, level, className }: TopBarProps) {
  return (
    <div className={cn("sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-cyber-darker/60 backdrop-blur-xl border-b border-white/5", className)}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded bg-gradient-to-br from-cyber-blue/20 to-transparent border border-cyber-blue/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <Terminal size={18} className="text-cyber-blue drop-shadow-[0_0_5px_currentColor]" />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[10px] font-display font-bold tracking-[0.2em] text-cyber-blue uppercase leading-none mb-1">Zero ID</span>
          <span className="text-xs font-mono text-slate-400 leading-none">Lv.{level} <span className="text-slate-600 px-1">|</span> 探索者</span>
        </div>
      </div>
      
      <div className="flex flex-col items-end">
        <span className="text-[9px] font-mono tracking-widest text-slate-500 mb-1">SYSTEM_ENERGY</span>
        <div className="flex items-center gap-2 bg-black/40 border border-cyber-blue/20 px-3 py-1.5 rounded text-cyber-blue shadow-inner">
          <Battery size={14} className="animate-pulse drop-shadow-[0_0_5px_currentColor]" />
          <span className="text-sm font-mono font-bold">{energy.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
