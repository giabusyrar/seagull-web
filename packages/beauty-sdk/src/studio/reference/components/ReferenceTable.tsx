import React from 'react';
import { Edit2, Trash2, Sparkles, Globe, ExternalLink, Target } from 'lucide-react';
import { DataTable, EmptyState, ColumnDef, BrandTag, getDomainFromUrl } from '@gateway-experience/shared';
import type { EntityConfig } from '../config/reference-entity-configs';


interface ReferenceTableProps {
  config: EntityConfig;
  items: any[];
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  searchQuery?: string;
}

export const ReferenceTable: React.FC<ReferenceTableProps> = ({
  config,
  items,
  onEdit,
  onDelete,
  searchQuery = '',
}) => {
  if (items.length === 0) {
    return (
      <EmptyState
        title={`No ${config.title.toLowerCase()} found`}
        description={`Click "+ New ${config.singularTitle}" above to create one.`}
      />
    );
  }

  const columns: ColumnDef<any>[] = [
    {
      key: 'actions',
      header: 'Actions',
      align: 'left',
      className: 'w-16',
      render: (item) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="p-1.5 hover:bg-muted hover:text-amber-600 rounded text-muted-foreground transition cursor-pointer"
            title={`Edit ${config.singularTitle}`}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="p-1.5 hover:bg-rose-500/10 hover:text-rose-600 rounded text-muted-foreground transition cursor-pointer"
            title={`Delete ${config.singularTitle}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (item) => {
        if (['brands', 'brand'].includes(config.slug)) {
          return (
            <BrandTag
              name={item.name}
              website={item.website}
              colorCode={item.colorCode}
              showWebsiteLink={false}
            />
          );
        }
        return (
          <div className="font-bold text-foreground text-xs truncate max-w-[200px] sm:max-w-none" title={item.name}>
            {item.name}
          </div>
        );
      },
    },
    {
      key: 'code',
      header: 'Code',
      render: (item) => {
        const fallbackPrefixMap: Record<string, string> = {
          brands: 'BRD',
          brand: 'BRD',
          products: 'PRD',
          product: 'PRD',
          ingredients: 'ING',
          ingredient: 'ING',
          statuses: 'ST',
          status: 'ST',
        };
        const prefix = fallbackPrefixMap[config.slug] || 'REF';
        const formattedCode =
          item.code ||
          item.axisCode ||
          `${prefix}-${(item.name || 'ITEM')
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .slice(0, 12)}`;
        return (
          <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded tracking-wider whitespace-nowrap">
            {formattedCode}
          </span>
        );
      },
    },

    // Entity Specific: Brands
    ...(['brands', 'brand'].includes(config.slug)
      ? [
          {
            key: 'website',
            header: 'Website',
            render: (item: any) => {
              const site = item.website;
              const domain = getDomainFromUrl(site);
              if (!site && !domain) return <span className="text-muted-foreground italic text-[11px]">—</span>;
              const href = site ? (site.startsWith('http') ? site : `https://${site}`) : `https://${domain}`;
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 hover:text-amber-500 hover:underline flex items-center gap-1 font-mono text-[11px] w-fit whitespace-nowrap"
                >
                  <Globe className="h-3 w-3 text-amber-600/80 shrink-0" />
                  <span>{domain || site}</span>
                  <ExternalLink className="h-2.5 w-2.5 opacity-70 shrink-0" />
                </a>
              );
            },
          },
          {
            key: 'colorCode',
            header: 'Color Code',
            render: (item: any) => {
              const lower = (item.name || '').toLowerCase();
              const defaultHex = lower.includes('wardah') ? '#10b981' :
                lower.includes('makeover') || lower.includes('make over') ? '#f43f5e' :
                lower.includes('emina') ? '#ec4899' :
                lower.includes('kahf') ? '#f59e0b' :
                lower.includes('biodef') ? '#06b6d4' :
                lower.includes('somethinc') ? '#8b5cf6' :
                lower.includes('wonderly') ? '#a855f7' :
                lower.includes('omg') ? '#f97316' : '#eab308';
              const hex = item.colorCode || defaultHex;
              return (
                <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-foreground bg-secondary/60 border border-border px-2 py-0.5 rounded w-fit whitespace-nowrap">
                  <span className="h-3.5 w-3.5 rounded-full shrink-0 border border-border shadow-xs" style={{ backgroundColor: hex }} />
                  <span>{hex}</span>
                </span>
              );
            },
          },
        ]
      : []),

    // Entity Specific: Products
    ...(['products', 'product'].includes(config.slug)
      ? [
          {
            key: 'brand',
            header: 'Brand',
            render: (item: any) => (
              <BrandTag
                name={item.brandName || item.brandId || 'Unassigned'}
                website={item.brandWebsite || item.website}
                showWebsiteLink={true}
              />
            ),
          },
        ]
      : []),

    // Entity Specific: Ingredients
    ...(['ingredients', 'ingredient'].includes(config.slug)
      ? [
          {
            key: 'category',
            header: 'Category / Function',
            render: (item: any) => (
              <span className="px-2 py-0.5 bg-purple-500/15 border border-purple-500/40 text-purple-300 text-[10px] font-bold rounded flex items-center gap-1 w-fit whitespace-nowrap">
                <Sparkles className="h-3 w-3 text-purple-400" />
                <span>{item.category || 'Active Active'}</span>
              </span>
            ),
          },
        ]
      : []),

    // Entity Specific: Severity Tier Groups & Classification Items
    ...(['severity-tier-groups', 'severity-tier-group', 'severity-tiers', 'severity-tier', 'severity-groups', 'severity-group', 'severity-levels', 'severity-level'].includes(config.slug)
      ? [
          {
            key: 'items',
            header: 'Classification Tiers',
            render: (item: any) => {
              const tierItems: any[] = Array.isArray(item.items) ? item.items : [];
              if (tierItems.length === 0) {
                return <span className="text-zinc-600 text-xs italic">No tiers defined</span>;
              }
              return (
                <div className="flex flex-wrap items-center gap-1.5 max-w-md">
                  {tierItems.map((t: any, idx: number) => {
                    const hex = t.colorCode || '#10b981';
                    return (
                      <span
                        key={t.id || t.code || idx}
                        style={{
                          backgroundColor: `${hex}18`,
                          borderColor: `${hex}50`,
                          color: hex,
                        }}
                        className="px-2 py-0.5 border text-[10px] font-bold rounded-md flex items-center gap-1 whitespace-nowrap"
                        title={t.description || t.code}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: hex }}
                        />
                        <span>{t.name || t.code}</span>
                      </span>
                    );
                  })}
                </div>
              );
            },
          },
          {
            key: 'tierCount',
            header: 'Tiers',
            render: (item: any) => {
              const count = Array.isArray(item.items) ? item.items.length : 0;
              return (
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-secondary/60 border border-border text-amber-600 rounded whitespace-nowrap">
                  {count} {count === 1 ? 'tier' : 'tiers'}
                </span>
              );
            },
          },
        ]
      : []),

    // Entity Specific: Skin Conditions
    ...(['skin-conditions', 'skin-condition', 'skin-concerns', 'skin-concern', 'concerns', 'concern'].includes(config.slug)
      ? [
          {
            key: 'dimensionCode',
            header: 'Target Dimension',
            render: (item: any) => (
              <span className="px-2 py-0.5 bg-blue-500/15 border border-blue-500/40 text-blue-600 text-[10px] font-bold rounded flex items-center gap-1 w-fit whitespace-nowrap">
                <Target className="h-3 w-3" />
                <span>{item.dimensionCode || item.dimension_code || 'sebum'}</span>
              </span>
            ),
          },
        ]
      : []),





    {
      key: 'description',
      header: 'Description',
      render: (item) => (
        <span className="text-muted-foreground text-xs leading-relaxed max-w-sm sm:max-w-md line-clamp-2 block" title={item.description}>
          {item.description || <span className="italic">No description</span>}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      className: 'hidden md:table-cell w-28',
      render: (item) => (
        <span className="text-muted-foreground font-mono text-[11px] whitespace-nowrap">
          {item.createdAt && !item.createdAt.startsWith('0001') ? new Date(item.createdAt).toLocaleDateString() : '—'}
        </span>
      ),
    },
  ];

  return <DataTable columns={columns} data={items} keyField="id" />;
};
