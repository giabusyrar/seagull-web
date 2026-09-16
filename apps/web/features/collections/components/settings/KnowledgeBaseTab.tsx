import React from 'react';

interface KnowledgeBaseTabProps {
  knowledgeBase: string;
  setKnowledgeBase: (v: string) => void;
}

export const KnowledgeBaseTab: React.FC<KnowledgeBaseTabProps> = ({
  knowledgeBase,
  setKnowledgeBase,
}) => {
  return (
    <div className="space-y-3 text-xs text-foreground">
      <div className="space-y-1">
        <label className="text-[11px] font-bold uppercase text-muted-foreground">Knowledge Base Text / Embeddings</label>
        <textarea
          value={knowledgeBase}
          onChange={(e) => setKnowledgeBase(e.target.value)}
          rows={8}
          placeholder="Paste collection documentation or vector context..."
          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground font-mono text-[11px] focus:outline-none focus:border-ring placeholder:text-muted-foreground resize-none"
        />
      </div>
    </div>
  );
};
