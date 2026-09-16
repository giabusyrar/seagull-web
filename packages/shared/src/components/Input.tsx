'use client';

import React from 'react';
import { cn } from '../utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ leftIcon, rightIcon, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-muted-foreground pointer-events-none shrink-0 flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full h-9 bg-secondary/50 border border-border rounded-lg text-foreground text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring transition placeholder:text-muted-foreground',
              leftIcon ? 'pl-9' : 'px-3',
              rightIcon ? 'pr-9' : 'pr-3',
              error ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : '',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-muted-foreground shrink-0 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <div className="text-[10px] text-destructive font-medium">{error}</div>}
        {!error && helperText && <div className="text-[10px] text-muted-foreground">{helperText}</div>}
      </div>
    );
  }
);

Input.displayName = 'Input';
