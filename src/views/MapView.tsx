import React, { useState, useRef } from "react";
import { Navigation, Crosshair, Search, Store, Tag, X, Flame } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { featuredRoute, nearbyTasks } from "@/mockData";
import { Tab, TaskStatus } from "@/types";

type NodeType = 'route' | 'store' | 'brand';

interface MapNode {
  id: string;
  name: string;
  type: NodeType;
  top: string;
  left: string;
  description: string;
  energy: number;
  tags: string[];
  taskId?: string;
}

const mapNodes: MapNode[] = [
  {
    id: "n1",
    name: "沈予安咖啡馆",
    type: "store",
    top: "32%",
    left: "38%",
    description: "夜行任务起点，完成试饮即可获得数字凭证。",
    energy: 150,
    tags: ["咖啡猎人", "隐藏菜单"],
    taskId: "route-night-walk-1"
  },
  {
    id: "n2",
    name: "ZERO 潮牌店",
    type: "brand",
    top: "55%",
    left: "70%",
    description: "授权试穿偏好数据，获取专属立减权益和限量徽章。",
    energy: 300,
    tags: ["数据授权", "品牌共创"],
    taskId: "task-1"
  },
  {
    id: "n3",
    name: "蓝岸 Livehouse",
    type: "route",
    top: "75%",
    left: "28%",
    description: "夜行路线核心节点，参与声波收集任务，掉落特殊资产。",
    energy: 500,
    tags: ["夜行路线", "限时打卡"],
    taskId: "task-2"
  },
  {
    id: "n4",
    name: "霓虹滑板公园",
    type: "route",
    top: "22%",
    left: "72%",
    description: "挑战指定滑板动作，通过AI动作识别获得大量能量奖励。",
    energy: 400,
    tags: ["路线分发", "AI验证"]
  },
  {
    id: "n5",
    name: "虚拟艺术展廊",
    type: "brand",
    top: "80%",
    left: "58%",
    description: "全息投射的独立艺术画廊。浏览每5幅作品即可解锁数字票根。",
    energy: 250,
    tags: ["跨界联名", "数字资产"]
  },
  {
    id: "n6",
    name: "深宵小面馆",
    type: "store",
    top: "45%",
    left: "15%",
    description: "验证你的消费足迹，如果你曾经在附近连续打卡3天，解锁免费招牌面。",
    energy: 100,
    tags: ["长线履约", "信用验证"]
  }
];

const allTasks = [featuredRoute, ...nearbyTasks];

interface MapViewProps {
  onNavigate: (tab: Tab) => void;
  taskStatuses: Record<string, TaskStatus>;
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void;
}

export function MapView({ onNavigate, taskStatuses, onTaskStatusChange }: MapViewProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<NodeType | 'all'>('all');
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);

  const filteredNodes = mapNodes.filter(node => 
    (activeFilter === 'all' || node.type === activeFilter) &&
    (node.name.toLowerCase().includes(search.toLowerCase()) || node.description.toLowerCase().includes(search.toLowerCase()))
  );

  const getNodeColor = (type: NodeType) => {
    switch (type) {
      case 'route': return 'bg-cyber-blue shadow-[0_0_15px_#06b6d4]';
      case 'store': return 'bg-cyber-purple shadow-[0_0_15px_#c026d3]';
      case 'brand': return 'bg-emerald-400 shadow-[0_0_15px_#34d399]';
    }
  };

  const getTextColor = (type: NodeType) => {
    switch (type) {
      case 'route': return 'text-cyan-300';
      case 'store': return 'text-fuchsia-300';
      case 'brand': return 'text-emerald-300';
    }
  };

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag on left click (button 0) or touch/pen
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    
    // Ignore drag if clicking on interactive elements
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
      return;
    }

    isDragging.current = true;
    startPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    setPosition({ x: e.clientX - startPos.current.x, y: e.clientY - startPos.current.y });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const zoomDelta = e.deltaY * -0.002;
    const newScale = Math.min(Math.max(scale + zoomDelta, 0.5), 3);
    setScale(newScale);
  };

  const resetView = () => {
    setPosition({ x: 0, y: 0 });
    setScale(1);
  };

  const getLinkedTask = (node: MapNode) => allTasks.find(task => task.id === node.taskId);
  const getTaskStatus = (node: MapNode) => {
    const task = getLinkedTask(node);
    return task ? taskStatuses[task.id] ?? task.status : null;
  };

  const handleNodeAction = (node: MapNode) => {
    const task = getLinkedTask(node);

    if (!task) return;

    const status = taskStatuses[task.id] ?? task.status;

    if (status === "available") {
      onTaskStatusChange(task.id, "accepted");
      onNavigate("tasks");
      return;
    }

    onNavigate(status === "completed" ? "assets" : "tasks");
  };

  const getActionLabel = (node: MapNode) => {
    const status = getTaskStatus(node);

    if (!status) return "即将开放";
    if (status === "completed") return "查看资产";
    if (status === "accepted") return "继续履约";
    return "领取任务";
  };

  return (
    <div 
      className="relative w-full h-[calc(100vh-145px)] md:h-[calc(100vh-73px)] overflow-hidden border-b border-t border-white/5 md:border-l md:border-t-0 flex items-center justify-center bg-transparent select-none touch-none"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div 
        className="absolute inset-0 w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, 
          transitionDuration: isDragging.current ? '0s' : '0.2s',
          transitionProperty: 'transform',
          transitionTimingFunction: 'ease-out'
        }}
      >
        {/* Map Background Grid (simulating city scan) */}
        <div className="absolute inset-[-100%] w-[300%] h-[300%] opacity-20 pointer-events-none"
             style={{
               backgroundImage: 'radial-gradient(circle at center, #06b6d4 1px, transparent 1px)',
               backgroundSize: '40px 40px'
             }}
        />
        
        {/* Scanning Radar Effect */}
        <div className="absolute w-[800px] h-[800px] rounded-full border border-cyber-blue/5 animate-[ping_6s_ease-in-out_infinite] pointer-events-none" />
        <div className="absolute w-[600px] h-[600px] rounded-full border border-cyber-blue/10 animate-[ping_4s_ease-in-out_infinite] pointer-events-none" />
        
        <div className="absolute w-[400px] h-[400px] rounded-full border border-cyber-blue/20 flex flex-col items-center justify-center pointer-events-none">
           {/* Inner subtle grid rotation */}
           <div className="w-full h-full rounded-full border border-dashed border-cyber-blue/10 animate-[spin_60s_linear_infinite]" />
        </div>
        
        <div className="absolute w-full h-[2px] bg-cyber-blue/5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute h-full w-[2px] bg-cyber-blue/5 left-1/2 -translate-x-1/2 pointer-events-none" />
        
        {/* Nodes / Stores on Map */}
        <AnimatePresence>
          {filteredNodes.map(node => {
            const isSelected = selectedNode?.id === node.id;
            const status = getTaskStatus(node);
            return (
              <motion.div 
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className={cn(
                  "absolute z-10 flex flex-col items-center gap-1 cursor-pointer group",
                  isSelected ? "z-20" : ""
                )}
                style={{ top: node.top, left: node.left }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(node);
                }}
              >
                <div className={cn(
                  "w-4 h-4 rounded-full transition-all duration-300", 
                  getNodeColor(node.type),
                  status === "completed" ? "ring-2 ring-emerald-300/70" : "",
                  isSelected ? "scale-150 ring-2 ring-white/30" : "group-hover:scale-125"
                )} />
                <span className={cn(
                  "text-[10px] font-mono px-1.5 py-0.5 rounded backdrop-blur whitespace-nowrap transition-all duration-300",
                  getTextColor(node.type),
                  isSelected ? "bg-black/80 scale-110" : "bg-black/50"
                )}>
                  {node.name}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
  
        {/* User Location */}
        <div className="absolute z-0 flex items-center justify-center w-12 h-12 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="absolute w-full h-full bg-cyber-blue/20 rounded-full animate-ping" />
          <Navigation size={20} className="text-cyber-blue fill-cyber-blue drop-shadow-[0_0_5px_#06b6d4] opacity-50" />
        </div>
      </div>

      {/* Top Search & Filter Overlay UI */}
      <div className="absolute top-4 left-4 right-4 z-30 flex flex-col gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-xl px-3 py-2 w-full max-w-sm shadow-xl">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text"
            placeholder="搜索节点、任务或地点..."
            className="bg-transparent border-none outline-none text-sm text-slate-200 w-full placeholder:text-slate-500 font-mono"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-500 hover:text-slate-300">
              <X size={16} />
            </button>
          )}
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 max-w-full overflow-x-auto no-scrollbar justify-start">
          <button 
            onClick={() => setActiveFilter('all')}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
              activeFilter === 'all' 
                ? "bg-slate-200 text-slate-900" 
                : "bg-slate-900/80 border border-slate-700/50 text-slate-400 hover:bg-slate-800"
            )}
          >
            全城扫描
          </button>
          <button 
            onClick={() => setActiveFilter('route')}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1 transition-colors border",
              activeFilter === 'route' 
                ? "bg-cyber-blue/20 border-cyber-blue text-cyan-300" 
                : "bg-slate-900/80 border-slate-700/50 text-slate-400 hover:bg-slate-800"
            )}
          >
            <Flame size={12} className={activeFilter === 'route' ? "text-cyan-300" : ""} /> 夜行路线
          </button>
          <button 
            onClick={() => setActiveFilter('store')}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1 transition-colors border",
              activeFilter === 'store' 
                ? "bg-cyber-purple/20 border-cyber-purple text-fuchsia-300" 
                : "bg-slate-900/80 border-slate-700/50 text-slate-400 hover:bg-slate-800"
            )}
          >
            <Store size={12} className={activeFilter === 'store' ? "text-fuchsia-300" : ""} /> 实体体验点
          </button>
          <button 
            onClick={() => setActiveFilter('brand')}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1 transition-colors border",
              activeFilter === 'brand' 
                ? "bg-emerald-900/40 border-emerald-500 text-emerald-300" 
                : "bg-slate-900/80 border-slate-700/50 text-slate-400 hover:bg-slate-800"
            )}
          >
            <Tag size={12} className={activeFilter === 'brand' ? "text-emerald-300" : ""} /> 品牌授权
          </button>
        </div>
      </div>

      {/* Bottom Right Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-30">
        <button 
          onClick={resetView}
          className="w-10 h-10 rounded-full bg-slate-900/80 backdrop-blur border border-slate-700 flex items-center justify-center text-slate-300 hover:text-cyber-blue hover:border-cyber-blue transition-colors shadow-lg pointer-events-auto"
          title="重置视角"
        >
          <Crosshair size={20} />
        </button>
      </div>
      
      {/* Node Detail Popover */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 left-4 right-20 md:left-auto md:right-16 md:w-80 bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl shadow-2xl z-40"
          >
            <button 
              onClick={() => setSelectedNode(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white bg-slate-800 rounded-full p-1"
            >
              <X size={14} />
            </button>
            <div className="flex items-center gap-2 mb-2">
               <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]", getTextColor(selectedNode.type))} />
               <h3 className="font-bold text-slate-100 text-lg">{selectedNode.name}</h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {selectedNode.description}
            </p>
            
            <div className="flex flex-wrap gap-1.5 mb-4">
              {selectedNode.tags.map(tag => (
                <span key={tag} className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded">
                  {tag}
                </span>
              ))}
              {getTaskStatus(selectedNode) && (
                <span className="px-1.5 py-0.5 text-[10px] bg-cyber-blue/10 text-cyan-300 border border-cyber-blue/20 rounded">
                  {getTaskStatus(selectedNode) === "completed" ? "已完成" : getTaskStatus(selectedNode) === "accepted" ? "进行中" : "可领取"}
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
               <div className="text-sm font-mono text-cyber-blue font-bold flex items-center gap-1">
                 +{selectedNode.energy} <span className="text-xs text-slate-500 font-sans font-normal">能量/次</span>
               </div>
               <button
                 onClick={() => handleNodeAction(selectedNode)}
                 disabled={!selectedNode.taskId}
                 className="px-4 py-1.5 bg-cyber-blue text-cyber-dark font-medium text-xs rounded hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 transition-colors"
               >
                 {getActionLabel(selectedNode)}
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
