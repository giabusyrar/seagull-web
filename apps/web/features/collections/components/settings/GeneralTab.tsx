import React from 'react';

interface GeneralTabProps {
  name: string;
  setName: (v: string) => void;
  type: 'proxy' | 'llm' | 'core-engine';
  setType: (v: 'proxy' | 'llm' | 'core-engine') => void;
  healthCheckPath: string;
  setHealthCheckPath: (v: string) => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  name,
  setName,
  type,
  setType,
  healthCheckPath,
  setHealthCheckPath,
}) => {
  return (
    <div className="space-y-4 text-xs text-foreground">
      <div className="space-y-1">
        <label className="text-[11px] font-bold uppercase text-muted-foreground">Collection Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Payment Gateway APIs"
          className="w-full px-3 py-1.5 bg-background border border-border rounded text-foreground focus:outline-none focus:border-ring placeholder:text-muted-foreground"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase text-muted-foreground">Collection Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'proxy' | 'llm' | 'core-engine')}
            className="w-full px-3 py-1.5 bg-background border border-border rounded text-foreground focus:outline-none focus:border-ring"
          >
            <option value="proxy">HTTP Proxy Gateway</option>
            <option value="llm">AI / LLM Service</option>
            <option value="core-engine">Core Engine API</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase text-muted-foreground">Health Check Path</label>
          <input
            type="text"
            value={healthCheckPath}
            onChange={(e) => setHealthCheckPath(e.target.value)}
            placeholder="/health"
            className="w-full px-3 py-1.5 bg-background border border-border rounded text-foreground focus:outline-none focus:border-ring placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};
