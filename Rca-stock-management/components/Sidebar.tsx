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
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Navigation Section - Unified Card */}
      <nav className="flex-1 bg-[#F1F2F7] border border-[#E5E7EB] rounded-2xl p-3 space-y-1 overflow-y-auto">
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
              className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-[12px] transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-[#1E293B] text-white shadow-md shadow-slate-900/10' 
                  : 'text-[#9CA3AF] hover:bg-white hover:text-[#1E293B] hover:shadow-sm'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-[#9CA3AF] group-hover:text-[#1E293B]'}`} strokeWidth={2} />
              <span className={`${isCollapsed ? 'hidden' : 'block'} whitespace-nowrap`}>
                  {item.label}
              </span>
              
              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-[#1E293B] text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap shadow-xl translate-x-[-5px] group-hover:translate-x-0">
                      {item.label}
                  </div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-[#1E293B]/20 backdrop-blur-sm z-40 md:hidden transition-opacity"
            onClick={onClose}
        />
      )}

      {/* Mobile Sidebar (Drawer) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-out md:hidden flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute top-4 right-4 z-50">
            <button onClick={onClose} className="p-2 text-[#9CA3AF] hover:text-[#1E293B] hover:bg-[#EDEEF3] rounded-full transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>
        <NavContent />
      </aside>

      {/* Tablet (Icons) Sidebar */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 z-30 bg-transparent h-full transition-all duration-300 w-24 lg:hidden">
         <NavContent isCollapsed={true} /> 
      </aside>

      {/* Desktop (Full) Sidebar */}
       <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-transparent h-full transition-all duration-300 w-72">
         <NavContent />
      </aside>
    </>
  );
};
