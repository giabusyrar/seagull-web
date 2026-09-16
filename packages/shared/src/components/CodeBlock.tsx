'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '../utils';

export interface CodeBlockProps {
  code: string;
  language?: string;
  maxHeight?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'json',
  maxHeight = '300px',
  showLineNumbers = false,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code ? code.split('\n') : [];

  return (
    <div className={cn('relative bg-muted/50 border border-border rounded-xl overflow-hidden group shadow-xs', className)}>
      <div className="px-3.5 py-2 bg-muted border-b border-border flex items-center justify-between text-[11px] text-muted-foreground font-mono">
        <span className="uppercase font-semibold tracking-wider">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition cursor-pointer px-2 py-0.5 rounded-md hover:bg-accent text-[11px]"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div
        style={{ maxHeight }}
        className="p-3 text-xs font-mono text-foreground overflow-x-auto overflow-y-auto leading-relaxed select-text flex"
      >
        {showLineNumbers && (
          <div className="pr-3 mr-3 border-r border-border/60 text-muted-foreground/40 select-none text-right shrink-0">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        )}
        <pre className="flex-1">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
