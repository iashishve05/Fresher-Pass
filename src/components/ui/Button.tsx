import React from 'react';
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid' | 'ghost' | 'outline';
};

const Button: React.FC<ButtonProps> = ({ variant = 'solid', className = '', children, ...rest }) => {
  const base = 'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium';
  const variants: Record<string, string> = {
    solid: 'bg-accent-cyan text-black hover:brightness-95',
    ghost: 'bg-white/5 text-white hover:bg-white/10',
    outline: 'bg-transparent text-white border border-white/10 hover:bg-white/5'
  };
  const cls = [base, variants[variant] || variants.solid, className].filter(Boolean).join(' ');
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
};

export default Button;
