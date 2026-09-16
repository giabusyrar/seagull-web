import React from 'react';
export interface CodeGeneratorProps {
    method: string;
    url: string;
    requestBody?: string;
    headers?: Record<string, string>;
}
export declare const CodeGenerator: React.FC<CodeGeneratorProps>;
