import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Card = ({ 
  children, 
  className, 
  padding = 'lg',
  hover = true,
  animate = true,
  ...props 
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const Component = animate ? motion.div : 'div';

  return (
    <Component
      {...(animate ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 }
      } : {})}
      className={cn(
        'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-premium overflow-hidden',
        hover && 'hover:shadow-premium-hover hover:border-brand-200 transition-all duration-300',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

const CardHeader = ({ title, subtitle, action, className }) => (
  <div className={cn("flex items-start justify-between mb-6", className)}>
    <div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
    </div>
    {action && <div className="ml-4">{action}</div>}
  </div>
);

Card.Header = CardHeader;

export default Card;
