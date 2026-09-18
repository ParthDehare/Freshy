import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CheckCircle2, AlertTriangle, X, Info, AlertOctagon } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 400);
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertOctagon className="w-5 h-5 text-red-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/40 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]',
    error: 'border-red-500/40 shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]',
    warning: 'border-amber-500/40 shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]',
    info: 'border-cyan-500/40 shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]',
  };

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3.5 rounded-xl bg-neutral-950/95 backdrop-blur-xl border ${borders[toast.type] || borders.info} text-white text-sm max-w-md transition-all duration-400 ${exiting ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0 animate-slideInRight'}`}
    >
      {icons[toast.type] || icons.info}
      <div className="flex-1 min-w-0">
        {toast.title && <div className="font-bold text-white text-sm">{toast.title}</div>}
        <div className="text-neutral-300 text-xs mt-0.5 leading-relaxed">{toast.message}</div>
      </div>
      <button onClick={() => { setExiting(true); setTimeout(() => onRemove(toast.id), 300); }} className="text-neutral-500 hover:text-white transition cursor-pointer shrink-0 mt-0.5">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, message, duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (title, message, duration) => addToast('success', title, message, duration),
    error: (title, message, duration) => addToast('error', title, message, duration),
    warning: (title, message, duration) => addToast('warning', title, message, duration),
    info: (title, message, duration) => addToast('info', title, message, duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container — Fixed bottom-right */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-auto">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
