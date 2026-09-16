'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'subtle';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}, ref) => {
  const variantStyles = {
    primary: 'bg-primary hover:bg-primary/90 active:scale-[0.98] text-primary-foreground font-bold shadow-xs',
    secondary: 'bg-secondary hover:bg-secondary/80 active:scale-[0.98] text-secondary-foreground font-semibold border border-border/50',
    outline: 'border border-border hover:bg-accent hover:text-accent-foreground text-foreground font-semibold',
    ghost: 'hover:bg-accent hover:text-accent-foreground text-muted-foreground hover:text-foreground font-medium',
    destructive: 'bg-destructive hover:bg-destructive/90 active:scale-[0.98] text-destructive-foreground font-bold shadow-xs',
    subtle: 'bg-beak/15 hover:bg-beak/25 active:scale-[0.98] text-primary font-semibold border border-beak/30',
  };

  const sizeStyles: Record<string, string> = {
    xs: 'h-7 px-2 text-[11px] rounded-md gap-1',
    sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
    md: 'h-9 px-4 text-xs rounded-md gap-1.5',
    lg: 'h-10 px-5 text-sm rounded-lg gap-2',
    icon: 'h-9 w-9 p-0 rounded-md flex items-center justify-center',
    'icon-xs': 'h-6 w-6 p-0 rounded-md flex items-center justify-center text-xs',
    'icon-sm': 'h-7 w-7 p-0 rounded-md flex items-center justify-center text-xs',
    'icon-lg': 'h-10 w-10 p-0 rounded-lg flex items-center justify-center text-sm',
  };

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap transition cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
});

Button.displayName = 'Button';
