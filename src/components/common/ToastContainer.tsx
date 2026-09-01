import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { Toast } from '../../services/store';

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const iconMap = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
            error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
            info: <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />,
          };

          const borderMap = {
            success: 'border-emerald-500/30 bg-emerald-950/70 text-emerald-100',
            warning: 'border-amber-500/30 bg-amber-950/70 text-amber-100',
            error: 'border-rose-500/30 bg-rose-950/70 text-rose-100',
            info: 'border-purple-500/30 bg-purple-950/70 text-purple-100',
          };

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={`pointer-events-auto p-4 rounded-xl border backdrop-blur-xl shadow-2xl flex items-start justify-between gap-3 ${borderMap[toast.type]}`}
            >
              <div className="flex items-start gap-3">
                {iconMap[toast.type]}
                <div>
                  <h4 className="text-sm font-semibold leading-tight text-white">{toast.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{toast.message}</p>
                </div>
              </div>
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
