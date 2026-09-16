import React from 'react';
export interface InfoTooltipProps {
    /** Helper text revealed on hover, focus, or tap. */
    content: React.ReactNode;
    /** Accessible label for the icon trigger. */
    label?: string;
    side?: 'top' | 'bottom';
    className?: string;
    iconClassName?: string;
}
export declare const InfoTooltip: React.FC<InfoTooltipProps>;
