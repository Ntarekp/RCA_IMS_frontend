import React from 'react';
import { Search, Bell, Settings, UserCircle, Menu, Command } from 'lucide-react';
import { ViewState } from '../types';

interface HeaderProps {
    onChangeView?: (view: ViewState) => void;
    onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onChangeView, onMenuClick }) => {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 transition-all duration-200">
      {/* Left side: Menu (Mobile) + Search */}
      <div className="flex items-center flex-1 max-w-xl gap-4">
        <button 
            onClick={onMenuClick}
            className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg md:hidden transition-colors"
        >
            <Menu className="w-6 h-6" />
        </button>

        <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
            <input 
                type="text" 
                placeholder="Search inventory..." 
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-12 py-2.5 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
                <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 bg-white border border-slate-200 rounded-md shadow-sm">
                    <Command className="w-3 h-3" /> K
                </kbd>
            </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-4 pl-4">
        <button 
            onClick={() => onChangeView?.('NOTIFICATIONS')}
            className="relative text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-all"
        >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button 
            onClick={() => onChangeView?.('SETTINGS')}
            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-all hidden md:block"
        >
            <Settings className="w-5 h-5" />
        </button>
        <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>
        <button 
            onClick={() => onChangeView?.('PROFILE')}
            className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-full pr-4 transition-all border border-transparent hover:border-slate-100"
        >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-500/20">
                PN
            </div>
            <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-700">Prince N.</p>
                <p className="text-[10px] text-slate-500">Admin</p>
            </div>
        </button>
      </div>
    </header>
  );
};