
import React from 'react';
import { motion } from 'framer-motion';
import { View } from '../types';

interface BottomNavProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate }) => {
  const NavItem = ({ view, icon, label }: { view: View; icon: string; label: string }) => {
    const isActive = activeView === view;
    return (
      <button 
        onClick={() => onNavigate(view)}
        className={`flex flex-col items-center gap-1 transition-colors p-2 relative ${isActive ? 'text-primary' : 'text-slate-400'}`}
      >
        {isActive && (
          <motion.div
            layoutId="nav-pill"
            className="absolute inset-0 bg-primary/5 rounded-xl -z-10"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <motion.span 
          whileTap={{ scale: 0.8 }}
          animate={{ scale: isActive ? 1.1 : 1 }}
          className={`material-symbols-outlined text-2xl ${isActive ? 'fill' : ''}`}
        >
          {icon}
        </motion.span>
        <span className="text-[10px] font-medium">{label}</span>
      </button>
    );
  };

  return (
    <nav className="absolute bottom-0 left-0 right-0 w-full bg-white/90 dark:bg-card-dark/90 backdrop-blur-xl border-t border-slate-100 dark:border-white/5 pb-safe z-50">
      <div className="flex items-center justify-around py-3">
        <NavItem view="timeline" icon="calendar_view_day" label="Timeline" />
        <NavItem view="people" icon="groups" label="People" />
        
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => onNavigate('capture')}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors p-2"
        >
          <div className="bg-primary rounded-full p-2 shadow-lg shadow-primary/20 mb-0.5">
            <span className="material-symbols-outlined text-white text-[24px]">add_a_photo</span>
          </div>
          <span className="text-[10px] font-medium">Capture</span>
        </motion.button>
        
        <NavItem view="insights" icon="insights" label="Insights" />
        <NavItem view="profile" icon="person" label="Self" />
      </div>
    </nav>
  );
};

export default BottomNav;
