import { cn } from '../../utils/cn';

const Input = ({ 
  label, 
  error, 
  icon: Icon, 
  className, 
  id, 
  ...props 
}) => {
  return (
    <div className="space-y-2 w-full group">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-semibold text-slate-700 dark:text-slate-300 group-focus-within:text-brand-600 transition-colors"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-500 transition-colors pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <input
          id={id}
          className={cn(
            'w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all duration-200 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-base sm:text-sm',
            Icon && 'pl-12',
            error && 'border-rose-300 focus:ring-rose-500/10 focus:border-rose-500 bg-rose-50/30 dark:bg-rose-500/5',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs font-medium text-rose-500 pl-1">{error}</p>
      )}
    </div>
  );
};

export default Input;
