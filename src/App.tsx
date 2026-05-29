/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Tab, TaskStatus } from '@/types';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { HomeView } from '@/views/HomeView';
import { MapView } from '@/views/MapView';
import { TasksView } from '@/views/TasksView';
import { AssetsView } from '@/views/AssetsView';
import { ProfileView } from '@/views/ProfileView';
import { featuredRoute, mockUser, nearbyTasks } from '@/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { useLocalStorageState } from '@/lib/storage';

const allTasks = [featuredRoute, ...nearbyTasks];
const initialTaskStatuses = Object.fromEntries(allTasks.map(task => [task.id, task.status])) as Record<string, TaskStatus>;

export default function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('home');
  const [taskStatuses, setTaskStatuses] = useLocalStorageState<Record<string, TaskStatus>>(
    'zero-boundary-task-statuses',
    initialTaskStatuses
  );

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTaskStatuses(prev => ({ ...prev, [taskId]: status }));
  };

  const renderView = () => {
    switch (currentTab) {
      case 'home': return <HomeView onNavigate={setCurrentTab} taskStatuses={taskStatuses} />;
      case 'map': return <MapView />;
      case 'tasks': return <TasksView taskStatuses={taskStatuses} onTaskStatusChange={updateTaskStatus} />;
      case 'assets': return <AssetsView />;
      case 'profile': return <ProfileView />;
      default: return <HomeView onNavigate={setCurrentTab} taskStatuses={taskStatuses} />;
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-200">
      <div className="md:flex h-screen overflow-hidden">
        {/* Desktop Sidebar (uses BottomNav component with responsive styles) */}
        <BottomNav 
          currentTab={currentTab} 
          onTabChange={setCurrentTab} 
          className="hidden md:flex bottom-auto md:w-20 lg:w-64 md:flex-shrink-0"
        />

        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <TopBar energy={mockUser.energy} level={mockUser.level} />
          
          {/* Main scrollable area */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden w-full relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="min-h-full"
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
      
      {/* Mobile Bottom Nav */}
      <div className="md:hidden">
        <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
      </div>
    </div>
  );
}
