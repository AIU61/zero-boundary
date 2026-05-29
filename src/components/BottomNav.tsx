import React from "react";
import { cn } from "@/lib/utils";
import { Tab } from "@/types";
import { Home, Map, Target, WalletCards, User } from "lucide-react";

interface BottomNavProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  className?: string;
}

export function BottomNav({ currentTab, onTabChange, className }: BottomNavProps) {
  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: '零界', icon: <Home size={20} /> },
    { id: 'map', label: '城市', icon: <Map size={20} /> },
    { id: 'tasks', label: '任务', icon: <Target size={20} /> },
    { id: 'assets', label: '资产', icon: <WalletCards size={20} /> },
    { id: 'profile', label: '我的', icon: <User size={20} /> },
  ];

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 z-50 md:sticky md:top-0 md:h-screen md:w-20 lg:w-64 md:border-r md:border-t-0 md:flex md:flex-col bg-cyber-darker/80 backdrop-blur-2xl border-t border-white/5 safe-area-pb", className)}>
      <div className="flex md:flex-col items-center md:items-start lg:px-4 md:py-8 justify-around md:justify-start w-full h-[72px] md:h-full md:gap-4 max-w-md mx-auto md:max-w-none md:mx-0">
        
        {/* Desktop Header for Sidebar */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-6 w-full mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-cyber-blue to-cyan-300 flex items-center justify-center rounded-sm rotate-45 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
             <div className="w-3 h-3 bg-cyber-darker rounded-sm -rotate-45" />
          </div>
          <span className="font-display font-bold tracking-[0.15em] text-white leading-tight">ZERO<br/>BOUNDARY</span>
        </div>

        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "relative flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1.5 lg:gap-4 p-2 lg:px-4 lg:py-3.5 w-full transition-all duration-300 group rounded-xl",
                isActive ? "text-cyan-300" : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              {isActive && (
                <div className="lg:hidden absolute -bottom-3 w-10 h-[3px] rounded-t-full bg-cyber-blue shadow-[0_0_10px_#06b6d4]" />
              )}
              
              <div className={cn(
                "transition-all duration-300 relative z-10",
                isActive ? "scale-110 drop-shadow-[0_0_8px_currentColor]" : "group-hover:scale-110"
              )}>
                {item.icon}
              </div>
              
              <span className={cn(
                "text-[10px] lg:text-[13px] font-medium tracking-wide transition-colors relative z-10",
                isActive ? "text-cyan-300 font-bold" : ""
              )}>
                {item.label}
              </span>
              
              {/* Desktop active background */}
              {isActive && (
                <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-cyber-blue/10 to-transparent border-l-2 border-cyber-blue rounded-r-xl -z-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
