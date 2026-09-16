import React from 'react';
export interface CodeBlockProps {
    code: string;
    language?: string;
    maxHeight?: string;
    showLineNumbers?: boolean;
    className?: string;
}
export declare const CodeBlock: React.FC<CodeBlockProps>;
