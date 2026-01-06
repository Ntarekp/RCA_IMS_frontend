import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'loading' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    if (toast.type !== 'loading') {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'loading': return null; // No icon for loading, just the bar
      case 'info': return <Info className="w-5 h-5 text-[#28375B]" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl border border-slate-100 p-4 min-w-[320px] animate-in slide-in-from-top-full duration-300 relative overflow-hidden">
      <div className="flex items-center gap-3">
        {getIcon()}
        <p className={`text-sm font-medium flex-1 ${toast.type === 'loading' ? 'text-[#28375B]' : 'text-slate-700'}`}>
          {toast.message}
        </p>
        <button 
          onClick={() => onRemove(toast.id)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Linear Loading Bar */}
      {toast.type === 'loading' && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
          <div className="h-full bg-[#28375B] animate-indeterminate-bar"></div>
        </div>
      )}

      {/* Inline styles for the custom animation */}
      <style>{`
        @keyframes indeterminate-bar {
          0% { left: -100%; width: 100%; }
          100% { left: 100%; width: 100%; }
        }
        .animate-indeterminate-bar {
          position: absolute;
          animation: indeterminate-bar 2s infinite linear;
        }
      `}</style>
    </div>
  );
};
