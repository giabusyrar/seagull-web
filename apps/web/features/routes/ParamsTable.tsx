'use client';

import React from 'react';
import { Plus, Trash2, Lock } from 'lucide-react';
import { SearchableSelect, type SelectOption } from '@gateway-experience/shared';

const TYPE_OPTIONS: SelectOption[] = [
  { value: 'dynamic', label: 'dynamic' },
  { value: 'static', label: 'static' },
];

const FIELD_TYPE_OPTIONS: SelectOption[] = [
  { value: 'text', label: 'text' },
  { value: 'file', label: 'file' },
];

export interface RouteParamItem {
  id: string;
  key: string;
  value: string;
  type: 'static' | 'dynamic';
  required?: boolean;
  isInherited?: boolean;
  /** Body-only: how Try & Send's Form tab collects this field — a plain
   *  value, or a real file upload (which forces the whole request to be
   *  sent as multipart/form-data, and can never be 'static'). */
  fieldType?: 'text' | 'file';
}

export interface ParamsTableProps {
  kind: 'headers' | 'query' | 'body';
  items: RouteParamItem[];
  onChange: (updated: RouteParamItem[]) => void;
  collectionParams?: { kind: string; key: string; value: string; enabled: boolean }[];
  collectionGlobalVars?: { id: string; key: string; value: string; enabled: boolean }[];
}

export const ParamsTable: React.FC<ParamsTableProps> = ({
  kind,
  items,
  onChange,
  collectionParams = [],
  collectionGlobalVars = [],
}) => {
  const mergedItems = React.useMemo(() => {
    const routeItemMap = new Map<string, RouteParamItem>();
    items.forEach((item) => {
      if (item.key) routeItemMap.set(item.key.toLowerCase(), item);
    });

    const result: RouteParamItem[] = [];
    const processedKeys = new Set<string>();

    if (kind === 'headers') {
      collectionParams
        .filter((p) => p.kind === 'header' && p.enabled)
        .forEach((p, i) => {
          const lowerKey = p.key.toLowerCase();
          processedKeys.add(lowerKey);
          const override = routeItemMap.get(lowerKey);

          result.push({
            id: override ? override.id : `col-h-inherited-${i}-${p.key}`,
            key: p.key,
            value: override ? override.value : p.value || '',
            type: override ? override.type : (!!p.value ? 'static' : 'dynamic'),
            required: override ? override.required : true,
            isInherited: !override,
          });
        });
    } else if (kind === 'query') {
      collectionParams
        .filter((p) => p.kind === 'query' && p.enabled)
        .forEach((p, i) => {
          const lowerKey = p.key.toLowerCase();
          processedKeys.add(lowerKey);
          const override = routeItemMap.get(lowerKey);

          result.push({
            id: override ? override.id : `col-q-inherited-${i}-${p.key}`,
            key: p.key,
            value: override ? override.value : p.value || '',
            type: override ? override.type : (!!p.value ? 'static' : 'dynamic'),
            required: override ? override.required : true,
            isInherited: !override,
          });
        });
    } else if (kind === 'body') {
      collectionGlobalVars
        .filter((v) => v.enabled)
        .forEach((v, i) => {
          const lowerKey = v.key.toLowerCase();
          processedKeys.add(lowerKey);
          const override = routeItemMap.get(lowerKey);

          result.push({
            id: override ? override.id : `col-b-inherited-${i}-${v.key}`,
            key: v.key,
            value: override ? override.value : v.value || '',
            type: override ? override.type : (!!v.value ? 'static' : 'dynamic'),
            required: override ? override.required : true,
            isInherited: !override,
          });
        });
    }

    items.forEach((item) => {
      if (!item.key || !processedKeys.has(item.key.toLowerCase())) {
        result.push({ ...item, isInherited: false });
      }
    });

    return result;
  }, [kind, items, collectionParams, collectionGlobalVars]);

  const handleAddItem = () => {
    onChange([
      ...items,
      {
        id: Date.now().toString(),
        key: '',
        value: '',
        type: 'dynamic',
        ...(kind === 'body' ? { fieldType: 'text' as const } : {}),
      },
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof RouteParamItem, val: any) => {
    const target = mergedItems[index];
    const updated = items.filter((x) => x.key.toLowerCase() !== target.key.toLowerCase());
    const newItem: RouteParamItem = {
      id: target.id.startsWith('col-') ? Date.now().toString() : target.id,
      key: target.key,
      value: target.value,
      type: target.type,
      required: target.required,
      fieldType: target.fieldType,
      [field]: val,
    };
    if (field === 'type' && val === 'dynamic') {
      newItem.value = '';
    }
    // A file can never be a static value, and only ever comes from the
    // caller — forcing 'dynamic' here keeps that combination from ever
    // existing rather than silently ignoring it at send time.
    if (field === 'fieldType' && val === 'file') {
      newItem.type = 'dynamic';
      newItem.value = '';
    }
    onChange([...updated, newItem]);
  };

  const handleDeleteItem = (id: string) => {
    onChange(items.filter((x) => x.id !== id));
  };

  const getTitle = () => {
    if (kind === 'headers') return 'Route Headers';
    if (kind === 'query') return 'Route Query Parameters';
    return 'Route Body Variables (for JSON Payload)';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
        <span>{getTitle()}</span>
        <button
          type="button"
          onClick={handleAddItem}
          className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold transition cursor-pointer"
        >
          <Plus className="h-3 w-3" /> Add {kind === 'headers' ? 'Header' : kind === 'query' ? 'Query Param' : 'Body Var'}
        </button>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-xs">
        {mergedItems.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground italic">
            No {kind === 'headers' ? 'headers' : kind === 'query' ? 'query parameters' : 'body variables'} defined.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-muted/80 text-muted-foreground font-bold text-[10px] uppercase tracking-wider border-b border-border select-none">
                  <th className="px-3 py-2 w-1/4">Key</th>
                  <th className="px-3 py-2 w-36">Type</th>
                  {kind === 'body' && <th className="px-3 py-2 w-32">Field type</th>}
                  <th className="px-3 py-2 w-24 text-center">Required</th>
                  <th className="px-3 py-2">Value (Static only)</th>
                  <th className="px-3 py-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {mergedItems.map((item, idx) => {
                  const isInherited = !!item.isInherited;
                  return (
                    <tr key={item.id} className="hover:bg-accent/40 transition-colors">
                      <td className="p-1.5 px-3 flex items-center gap-1.5 min-w-0">
                        <input
                          type="text"
                          value={item.key}
                          readOnly={isInherited}
                          onChange={(e) => !isInherited && handleUpdateItem(idx, 'key', e.target.value)}
                          placeholder={kind === 'headers' ? 'X-Header' : 'key'}
                          className={`w-full bg-transparent outline-none font-mono text-xs placeholder:text-muted-foreground/50 ${
                            isInherited ? 'text-muted-foreground cursor-not-allowed font-semibold' : 'text-foreground'
                          }`}
                        />
                        {isInherited && (
                          <span
                            title="Inherited from Collection Settings. Edit collection settings to update globally, or type a value to override."
                            className="inline-flex items-center gap-1 bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded font-sans select-none shrink-0 cursor-help"
                          >
                            <Lock className="h-2.5 w-2.5" />
                            Inherited
                          </span>
                        )}
                      </td>
                      <td className="p-1.5">
                        <SearchableSelect
                          value={item.type}
                          onChange={(v) => handleUpdateItem(idx, 'type', v)}
                          options={item.fieldType === 'file' ? TYPE_OPTIONS.filter((o) => o.value === 'dynamic') : TYPE_OPTIONS}
                          placeholder="Select type..."
                          className="w-36"
                        />
                      </td>
                      {kind === 'body' && (
                        <td className="p-1.5">
                          <SearchableSelect
                            value={item.fieldType || 'text'}
                            onChange={(v) => handleUpdateItem(idx, 'fieldType', v)}
                            options={FIELD_TYPE_OPTIONS}
                            placeholder="Select field type..."
                            className="w-32"
                          />
                        </td>
                      )}
                      <td className="p-1.5 text-center align-middle">
                        <button
                          type="button"
                          onClick={() => handleUpdateItem(idx, 'required', !item.required)}
                          className={`relative inline-flex h-4 w-8 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none cursor-pointer ${
                            item.required ? 'bg-primary' : 'bg-muted'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-background shadow-xs ring-0 transition duration-200 ease-in-out ${
                              item.required ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="p-1.5 px-3">
                        <input
                          type="text"
                          value={item.value}
                          disabled={item.type === 'dynamic' || item.fieldType === 'file'}
                          onChange={(e) => handleUpdateItem(idx, 'value', e.target.value)}
                          placeholder={
                            item.fieldType === 'file'
                              ? 'Files are always supplied by the caller'
                              : isInherited
                              ? 'Default from Collection Settings (Edit to override)'
                              : item.type === 'dynamic'
                              ? 'Dynamic value filled at runtime'
                              : 'Static value injected by gateway'
                          }
                          className="w-full bg-transparent outline-none font-mono text-xs placeholder:text-muted-foreground/50 text-foreground disabled:opacity-40"
                        />
                      </td>
                      <td className="p-1.5 text-center align-middle">
                        {isInherited ? (
                          <div title="Inherited from Collection Settings (Managed at Collection level)" className="flex items-center justify-center cursor-not-allowed p-1 text-muted-foreground/60">
                            <Lock className="h-3.5 w-3.5" />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 text-muted-foreground hover:text-destructive transition rounded-md hover:bg-accent cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
