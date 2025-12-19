import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Loader2, Info } from 'lucide-react';

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
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
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
      case 'loading': return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-100 p-4 flex items-center gap-3 min-w-[300px] animate-in slide-in-from-right-full duration-300">
      {getIcon()}
      <p className="text-sm font-medium text-slate-700 flex-1">{toast.message}</p>
      <button 
        onClick={() => onRemove(toast.id)}
        className="text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};