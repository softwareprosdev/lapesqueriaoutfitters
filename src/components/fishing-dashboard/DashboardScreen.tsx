'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CombinedMarineData, DashboardTab } from '@/types/marine';

// Import panels
import { YachtNavigationPanel } from './panels/YachtNavigationPanel';
import { ForecastPanel } from './panels/ForecastPanel';
import { TideChartPanel } from './panels/TideChartPanel';
import { WeatherPanel } from './panels/WeatherPanel';
import { MarinaPanel } from './panels/MarinaPanel';
import { SolunarPanel } from './panels/SolunarPanel';

interface DashboardScreenProps {
  activeTab: DashboardTab;
  data: CombinedMarineData | null;
  isLoading: boolean;
}

// Panel loading skeleton
function PanelSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-slate-700/50 rounded-lg w-1/3" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-32 bg-slate-700/30 rounded-xl" />
        <div className="h-32 bg-slate-700/30 rounded-xl" />
      </div>
      <div className="h-48 bg-slate-700/20 rounded-xl" />
    </div>
  );
}

export function DashboardScreen({ activeTab, data, isLoading }: DashboardScreenProps) {
  if (isLoading && !data) {
    return <PanelSkeleton />;
  }

  const panelVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const renderPanel = () => {
    switch (activeTab) {
      case 'yacht-navigation':
        return <YachtNavigationPanel data={data} />;
      case 'forecast':
        return <ForecastPanel data={data} />;
      case 'tides':
        return <TideChartPanel data={data} />;
      case 'weather':
        return <WeatherPanel data={data} />;
      case 'marina':
        return <MarinaPanel data={data} />;
      case 'solunar':
        return <SolunarPanel data={data} />;
      default:
        return <YachtNavigationPanel data={data} />;
    }
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={panelVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="h-full"
        >
          {renderPanel()}
        </motion.div>
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #D4AF37, #8B7355);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #F5E6CC, #D4AF37);
        }
      `}</style>
    </div>
  );
}
