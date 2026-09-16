'use client';

import React from 'react';
import { cn } from '../utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted border border-border/40', className)}
      {...props}
    />
  );
};
