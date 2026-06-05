import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '../../utils/cn';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  children, 
  maxWidth = 'max-w-2xl',
  showClose = true
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" 
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={cn(
              "relative bg-white w-full rounded-[24px] sm:rounded-[32px] shadow-2xl overflow-hidden border border-slate-200/60 max-h-[90vh] flex flex-col",
              maxWidth
            )}
          >
            {(title || showClose) && (
              <div className="p-5 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <div>
                  {title && <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">{title}</h2>}
                  {subtitle && <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">{subtitle}</p>}
                </div>
                {showClose && (
                  <button 
                    onClick={onClose} 
                    className="p-2 sm:p-2.5 hover:bg-white rounded-xl sm:rounded-2xl text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200 transition-all shadow-sm active:scale-95"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}

            <div className="p-5 sm:p-8 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
