'use client';

import React from 'react';
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../utils';

export interface KeyValueItem {
  id: string;
  key: string;
  value: string;
  description?: string;
  enabled: boolean;
  isInherited?: boolean;
}

export interface KeyValueTableProps {
  items: KeyValueItem[];
  onChange: (items: KeyValueItem[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  descriptionPlaceholder?: string;
  showDescription?: boolean;
  readOnly?: boolean;
  title?: string;
  className?: string;
}

export const KeyValueTable: React.FC<KeyValueTableProps> = ({
  items,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  descriptionPlaceholder = 'Description',
  showDescription = false,
  readOnly = false,
  title,
  className = '',
}) => {
  const handleToggle = (index: number) => {
    if (readOnly) return;
    const next = [...items];
    next[index] = { ...next[index], enabled: !next[index].enabled };
    onChange(next);
  };

  const handleUpdate = (index: number, field: keyof KeyValueItem, val: any) => {
    if (readOnly) return;
    const next = [...items];
    next[index] = { ...next[index], [field]: val };
    onChange(next);
  };

  const handleAdd = () => {
    if (readOnly) return;
    onChange([
      ...items,
      { id: Date.now().toString(), key: '', value: '', description: '', enabled: true },
    ]);
  };

  const handleDelete = (index: number) => {
    if (readOnly) return;
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className={cn('space-y-2', className)}>
      {title && (
        <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
          <span>{title}</span>
          {!readOnly && (
            <button
              type="button"
              onClick={handleAdd}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold transition cursor-pointer"
            >
              <Plus className="h-3 w-3" /> Add Item
            </button>
          )}
        </div>
      )}

      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-xs">
        {items.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground italic flex flex-col items-center justify-center gap-2">
            <span>No parameters defined.</span>
            {!readOnly && (
              <Button
                variant="outline"
                size="xs"
                onClick={handleAdd}
                leftIcon={<Plus className="h-3 w-3" />}
              >
                Add Row
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-muted/80 text-muted-foreground font-bold text-[10px] uppercase tracking-wider border-b border-border select-none">
                  <th className="px-3 py-2 w-8 text-center"></th>
                  <th className="px-3 py-2 w-1/3">Key</th>
                  <th className="px-3 py-2 w-1/3">Value</th>
                  {showDescription && <th className="px-3 py-2">Description</th>}
                  {!readOnly && <th className="px-3 py-2 w-10 text-center"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {items.map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    className={cn(
                      'hover:bg-accent/40 transition-colors',
                      !item.enabled ? 'opacity-50 bg-muted/20' : ''
                    )}
                  >
                    <td className="px-2 py-1 text-center align-middle">
                      <button
                        type="button"
                        onClick={() => handleToggle(idx)}
                        disabled={readOnly}
                        className="text-muted-foreground hover:text-foreground transition cursor-pointer flex items-center justify-center"
                      >
                        {item.enabled ? (
                          <CheckSquare className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <Square className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </td>

                    <td className="p-1 px-3">
                      <input
                        type="text"
                        value={item.key}
                        readOnly={readOnly}
                        onChange={(e) => handleUpdate(idx, 'key', e.target.value)}
                        placeholder={keyPlaceholder}
                        className="w-full bg-transparent outline-none font-mono text-xs text-foreground placeholder:text-muted-foreground/50"
                      />
                    </td>

                    <td className="p-1 px-3">
                      <input
                        type="text"
                        value={item.value}
                        readOnly={readOnly}
                        onChange={(e) => handleUpdate(idx, 'value', e.target.value)}
                        placeholder={valuePlaceholder}
                        className="w-full bg-transparent outline-none font-mono text-xs text-foreground placeholder:text-muted-foreground/50"
                      />
                    </td>

                    {showDescription && (
                      <td className="p-1 px-3">
                        <input
                          type="text"
                          value={item.description || ''}
                          readOnly={readOnly}
                          onChange={(e) => handleUpdate(idx, 'description', e.target.value)}
                          placeholder={descriptionPlaceholder}
                          className="w-full bg-transparent outline-none text-xs text-foreground placeholder:text-muted-foreground/50"
                        />
                      </td>
                    )}

                    {!readOnly && (
                      <td className="p-1 text-center align-middle">
                        <button
                          type="button"
                          onClick={() => handleDelete(idx)}
                          className="p-1 text-muted-foreground hover:text-destructive transition cursor-pointer rounded-md hover:bg-accent"
                          title="Delete row"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
