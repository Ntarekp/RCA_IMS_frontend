import React from 'react';
import { ViewState } from '../types';
import { 
  LayoutDashboard, 
  Package, 
  ArrowRightLeft, 
  BarChart3, 
  FileText, 
  Truck, 
  Settings,
  Shield,
  X
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, onClose }) => {
  const menuItems: { id: ViewState; label: string; icon: React.ElementType }[] = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'STOCK', label: 'Stock', icon: Package },
    { id: 'TRANSACTIONS', label: 'Transactions', icon: ArrowRightLeft },
    { id: 'ANALYTICS', label: 'Analytics', icon: BarChart3 },
    { id: 'REPORT', label: 'Report', icon: FileText },
    { id: 'SUPPLIERS', label: 'Suppliers', icon: Truck },
    { id: 'SETTINGS', label: 'Settings', icon: Settings },
  ];

  // Shared Nav Content
  const NavContent = ({ isCollapsed = false }) => (
    <>
      <div className={`h-20 flex items-center gap-3 border-b border-slate-100/80 mb-2 ${isCollapsed ? 'justify-center px-2' : 'px-6'}`}>
        <div className="bg-slate-900 text-white p-1.5 rounded-lg shadow-lg shadow-slate-900/20">
             <Shield className="w-6 h-6" fill="currentColor" />
        </div>
        <div className={`leading-tight ${isCollapsed ? 'hidden' : 'block'}`}>
          <h1 className="font-bold text-sm text-slate-900 tracking-tight">RCA</h1>
          <h1 className="font-medium text-xs text-slate-500 tracking-wide">Inventory</h1>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onChangeView(item.id);
                // Close mobile menu on selection if open
                if (window.innerWidth < 768) {
                    onClose();
                }
              }}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} strokeWidth={2} />
              <span className={`${isCollapsed ? 'hidden' : 'block'} whitespace-nowrap`}>
                  {item.label}
              </span>
              
              {/* Active Indicator for collapsed mode */}
              {isCollapsed && isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
              )}
              
              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap shadow-xl translate-x-[-5px] group-hover:translate-x-0">
                      {item.label}
                  </div>
              )}
            </button>
          );
        })}
      </nav>
      
      {/* Bottom Profile Snippet (Optional - enhances Sidebar look) */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">PN</div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-semibold text-slate-700 truncate">Prince Neza</p>
                    <p className="text-[10px] text-slate-400 truncate">Manager</p>
                </div>
            </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
            onClick={onClose}
        />
      )}

      {/* Mobile Sidebar (Drawer) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 shadow-2xl transform transition-transform duration-300 ease-out md:hidden flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute top-4 right-4">
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>
        <NavContent />
      </aside>

      {/* Tablet (Icons) Sidebar */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 z-30 bg-white border-r border-slate-200 h-full transition-all duration-300 w-20 lg:hidden">
         <NavContent isCollapsed={true} /> 
      </aside>

      {/* Desktop (Full) Sidebar */}
       <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-white border-r border-slate-200 h-full transition-all duration-300 w-64">
         <NavContent />
      </aside>
    </>
  );
};