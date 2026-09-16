import React from 'react';
export interface HttpMethodBadgeProps {
    method: string;
    size?: 'sm' | 'md';
    className?: string;
}
export declare const HttpMethodBadge: React.FC<HttpMethodBadgeProps>;
