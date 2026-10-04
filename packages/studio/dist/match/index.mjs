'use client';
"use client";

// src/match/components/MatchManager.tsx
import { useState as useState5, useEffect as useEffect5 } from "react";
import { Sparkles as Sparkles2, ShieldAlert as ShieldAlert3, Boxes as Boxes3, Play as Play2, Palette as Palette2, Wand2 as Wand22 } from "lucide-react";
import { PageHeader, TabNav, ConfirmDialog, usePersistentState } from "@gateway-experience/shared";

// src/match/components/tabs/ConflictMatrixTab.tsx
import { ShieldAlert, Pencil, Trash2, Building, Smartphone } from "lucide-react";
import { SearchFilterBar, DataTable, Button } from "@gateway-experience/shared";
import { jsx, jsxs } from "react/jsx-runtime";
var ConflictMatrixTab = ({
  conflicts,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteConflict,
  selectedBrand,
  setSelectedBrand,
  selectedApp,
  setSelectedApp
}) => {
  const filtered = conflicts.filter((c) => {
    if (selectedBrand !== "*" && c.brandId && c.brandId !== "*" && c.brandId !== selectedBrand) {
      return false;
    }
    if (selectedApp !== "*" && c.applicationId && c.applicationId !== "*" && c.applicationId !== selectedApp) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.ingredientA.toLowerCase().includes(q) || c.ingredientB.toLowerCase().includes(q) || c.conflictType.toLowerCase().includes(q) || c.warningMessage && c.warningMessage.toLowerCase().includes(q);
  });
  const activeFilterCount = (selectedBrand !== "*" ? 1 : 0) + (selectedApp !== "*" ? 1 : 0);
  const customFilterContent = /* @__PURE__ */ jsxs("div", { className: "space-y-3.5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border pb-2", children: [
      /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-foreground uppercase tracking-wider", children: "Multi-Tenant Filters" }),
      activeFilterCount > 0 && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            setSelectedBrand("*");
            setSelectedApp("*");
          },
          className: "text-[10px] text-beak hover:underline cursor-pointer",
          children: "Reset All"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxs("label", { className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx(Building, { className: "h-3 w-3 text-beak" }),
        /* @__PURE__ */ jsx("span", { children: "Brand Scope" })
      ] }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: selectedBrand,
          onChange: (e) => setSelectedBrand(e.target.value),
          className: "w-full bg-secondary/50 border border-border rounded-lg p-2 text-xs font-bold text-beak focus:border-ring outline-none cursor-pointer",
          children: [
            /* @__PURE__ */ jsx("option", { value: "*", className: "bg-popover text-popover-foreground", children: "All Brands (*)" }),
            /* @__PURE__ */ jsx("option", { value: "wardah", className: "bg-popover text-popover-foreground", children: "Wardah Beauty" }),
            /* @__PURE__ */ jsx("option", { value: "kahf", className: "bg-popover text-popover-foreground", children: "Kahf Men Care" }),
            /* @__PURE__ */ jsx("option", { value: "labore", className: "bg-popover text-popover-foreground", children: "Labor\xE9 Sensitive Skin" }),
            /* @__PURE__ */ jsx("option", { value: "emina", className: "bg-popover text-popover-foreground", children: "Emina Teen & Young" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxs("label", { className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx(Smartphone, { className: "h-3 w-3 text-sky-400" }),
        /* @__PURE__ */ jsx("span", { children: "Channel / Application" })
      ] }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: selectedApp,
          onChange: (e) => setSelectedApp(e.target.value),
          className: "w-full bg-secondary/50 border border-border rounded-lg p-2 text-xs font-bold text-sky-400 focus:border-ring outline-none cursor-pointer",
          children: [
            /* @__PURE__ */ jsx("option", { value: "*", className: "bg-popover text-popover-foreground", children: "Omnichannel (*)" }),
            /* @__PURE__ */ jsx("option", { value: "ecommerce_mobile", className: "bg-popover text-popover-foreground", children: "Mobile App" }),
            /* @__PURE__ */ jsx("option", { value: "store_kiosk", className: "bg-popover text-popover-foreground", children: "Skin Kiosk" }),
            /* @__PURE__ */ jsx("option", { value: "web_consult", className: "bg-popover text-popover-foreground", children: "Online Portal" })
          ]
        }
      )
    ] })
  ] });
  const columns = [
    {
      key: "ingredientA",
      header: "Ingredient A",
      render: (c) => /* @__PURE__ */ jsxs("div", { className: "font-semibold text-rose-400 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(ShieldAlert, { className: "h-3.5 w-3.5" }),
        /* @__PURE__ */ jsx("span", { children: c.ingredientA })
      ] })
    },
    {
      key: "ingredientB",
      header: "Ingredient B",
      render: (c) => /* @__PURE__ */ jsx("span", { className: "font-semibold text-rose-300 font-mono", children: c.ingredientB })
    },
    {
      key: "conflictType",
      header: "Conflict Type",
      render: (c) => /* @__PURE__ */ jsx("span", { className: "bg-rose-500/15 text-rose-400 font-mono px-2 py-0.5 rounded text-[10px] uppercase border border-rose-500/30 font-bold", children: c.conflictType })
    },
    {
      key: "resolutionAction",
      header: "Routine Resolution",
      render: (c) => /* @__PURE__ */ jsx("span", { className: "font-mono font-bold text-amber-300 uppercase text-[11px]", children: c.resolutionAction })
    },
    {
      key: "warningMessage",
      header: "Clinical Warning Copy",
      render: (c) => /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-xs max-w-xs truncate block", title: c.warningMessage, children: c.warningMessage || "-" })
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (c) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "icon-xs",
            onClick: () => onOpenEditModal(c),
            title: "Edit Conflict",
            children: /* @__PURE__ */ jsx(Pencil, { className: "h-3.5 w-3.5" })
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "icon-xs",
            onClick: () => onDeleteConflict(c.id),
            title: "Delete Conflict",
            className: "hover:text-destructive",
            children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" })
          }
        )
      ] })
    }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx(
      SearchFilterBar,
      {
        searchQuery,
        onSearchChange,
        searchPlaceholder: "Search conflicting ingredient pairs...",
        actionLabel: "New Conflict Rule",
        onAction: onOpenAddModal,
        customFilterContent,
        activeFilterCount
      }
    ),
    /* @__PURE__ */ jsx(
      DataTable,
      {
        columns,
        data: filtered,
        keyExtractor: (c) => c.id,
        emptyMessage: "No conflict matrix rules found for current filters."
      }
    )
  ] });
};

// src/match/components/tabs/ProductGroupsTab.tsx
import { Boxes, Pencil as Pencil2, Trash2 as Trash22, Building as Building2, Smartphone as Smartphone2, CheckCircle2, XCircle } from "lucide-react";
import { SearchFilterBar as SearchFilterBar2, DataTable as DataTable2, Button as Button2 } from "@gateway-experience/shared";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var ProductGroupsTab = ({
  groups,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteGroup,
  selectedBrand,
  setSelectedBrand,
  selectedApp,
  setSelectedApp
}) => {
  const filtered = groups.filter((g) => {
    if (selectedBrand !== "*" && g.brandId && g.brandId !== "*" && g.brandId !== selectedBrand) {
      return false;
    }
    if (selectedApp !== "*" && g.applicationId && g.applicationId !== "*" && g.applicationId !== selectedApp) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return g.name.toLowerCase().includes(q) || (g.code || "").toLowerCase().includes(q) || g.categories.some((c) => c.toLowerCase().includes(q));
  });
  const activeFilterCount = (selectedBrand !== "*" ? 1 : 0) + (selectedApp !== "*" ? 1 : 0);
  const customFilterContent = /* @__PURE__ */ jsxs2("div", { className: "space-y-3.5", children: [
    /* @__PURE__ */ jsxs2("div", { className: "flex items-center justify-between border-b border-border pb-2", children: [
      /* @__PURE__ */ jsx2("span", { className: "text-xs font-bold text-foreground uppercase tracking-wider", children: "Multi-Tenant Filters" }),
      activeFilterCount > 0 && /* @__PURE__ */ jsx2(
        "button",
        {
          type: "button",
          onClick: () => {
            setSelectedBrand("*");
            setSelectedApp("*");
          },
          className: "text-[10px] text-primary hover:underline cursor-pointer",
          children: "Reset All"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs2("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxs2("label", { className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx2(Building2, { className: "h-3 w-3 text-primary" }),
        /* @__PURE__ */ jsx2("span", { children: "Brand Scope" })
      ] }),
      /* @__PURE__ */ jsxs2(
        "select",
        {
          value: selectedBrand,
          onChange: (e) => setSelectedBrand(e.target.value),
          className: "w-full bg-secondary/50 border border-border rounded-lg p-2 text-xs font-bold text-primary focus:border-ring outline-none cursor-pointer",
          children: [
            /* @__PURE__ */ jsx2("option", { value: "*", className: "bg-popover text-popover-foreground", children: "All Brands (*)" }),
            /* @__PURE__ */ jsx2("option", { value: "wardah", className: "bg-popover text-popover-foreground", children: "Wardah Beauty" }),
            /* @__PURE__ */ jsx2("option", { value: "kahf", className: "bg-popover text-popover-foreground", children: "Kahf Men Care" }),
            /* @__PURE__ */ jsx2("option", { value: "labore", className: "bg-popover text-popover-foreground", children: "Labor\xE9 Sensitive Skin" }),
            /* @__PURE__ */ jsx2("option", { value: "emina", className: "bg-popover text-popover-foreground", children: "Emina Teen & Young" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs2("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxs2("label", { className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx2(Smartphone2, { className: "h-3 w-3 text-sky-400" }),
        /* @__PURE__ */ jsx2("span", { children: "Channel / Application" })
      ] }),
      /* @__PURE__ */ jsxs2(
        "select",
        {
          value: selectedApp,
          onChange: (e) => setSelectedApp(e.target.value),
          className: "w-full bg-secondary/50 border border-border rounded-lg p-2 text-xs font-bold text-sky-400 focus:border-ring outline-none cursor-pointer",
          children: [
            /* @__PURE__ */ jsx2("option", { value: "*", className: "bg-popover text-popover-foreground", children: "Omnichannel (*)" }),
            /* @__PURE__ */ jsx2("option", { value: "ecommerce_mobile", className: "bg-popover text-popover-foreground", children: "Mobile App" }),
            /* @__PURE__ */ jsx2("option", { value: "store_kiosk", className: "bg-popover text-popover-foreground", children: "Skin Kiosk" }),
            /* @__PURE__ */ jsx2("option", { value: "web_consult", className: "bg-popover text-popover-foreground", children: "Online Portal" })
          ]
        }
      )
    ] })
  ] });
  const columns = [
    {
      key: "name",
      header: "Campaign Group",
      render: (g) => /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-0.5", children: [
        /* @__PURE__ */ jsxs2("div", { className: "font-semibold text-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsx2(Boxes, { className: "h-3.5 w-3.5 text-primary" }),
          /* @__PURE__ */ jsx2("span", { children: g.name })
        ] }),
        g.code && /* @__PURE__ */ jsx2("span", { className: "text-[10px] font-mono text-muted-foreground", children: g.code })
      ] })
    },
    {
      key: "brandId",
      header: "Brand",
      render: (g) => /* @__PURE__ */ jsx2("span", { className: "bg-primary/10 text-primary font-mono px-2 py-0.5 rounded text-[10px] uppercase border border-primary/30 font-bold", children: g.brandId || "*" })
    },
    {
      key: "products",
      header: "Products",
      render: (g) => /* @__PURE__ */ jsxs2("span", { className: "font-mono text-xs text-muted-foreground", children: [
        g.productIds?.length || 0,
        " product(s)"
      ] })
    },
    {
      key: "categories",
      header: "Categories",
      render: (g) => {
        if (!g.categories || g.categories.length === 0) {
          return /* @__PURE__ */ jsx2("span", { className: "text-muted-foreground text-xs", children: "\u2014" });
        }
        return /* @__PURE__ */ jsx2("div", { className: "flex flex-wrap items-center gap-1 max-w-xs", children: g.categories.map((c) => /* @__PURE__ */ jsx2(
          "span",
          {
            className: "bg-amber-500/15 text-amber-400 font-mono px-1.5 py-0.5 rounded text-[9px] uppercase border border-amber-500/30 font-bold",
            children: c
          },
          c
        )) });
      }
    },
    {
      key: "isActive",
      header: "Status",
      render: (g) => g.isActive ? /* @__PURE__ */ jsxs2("span", { className: "flex items-center gap-1 text-emerald-400 text-[11px] font-semibold", children: [
        /* @__PURE__ */ jsx2(CheckCircle2, { className: "h-3.5 w-3.5" }),
        " Active"
      ] }) : /* @__PURE__ */ jsxs2("span", { className: "flex items-center gap-1 text-muted-foreground text-[11px] font-semibold", children: [
        /* @__PURE__ */ jsx2(XCircle, { className: "h-3.5 w-3.5" }),
        " Inactive"
      ] })
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (g) => /* @__PURE__ */ jsxs2("div", { className: "flex items-center justify-end gap-1", children: [
        /* @__PURE__ */ jsx2(
          Button2,
          {
            variant: "ghost",
            size: "icon-xs",
            onClick: () => onOpenEditModal(g),
            title: "Edit Product Group",
            children: /* @__PURE__ */ jsx2(Pencil2, { className: "h-3.5 w-3.5" })
          }
        ),
        /* @__PURE__ */ jsx2(
          Button2,
          {
            variant: "ghost",
            size: "icon-xs",
            onClick: () => onDeleteGroup(g.id),
            title: "Delete Product Group",
            className: "hover:text-destructive",
            children: /* @__PURE__ */ jsx2(Trash22, { className: "h-3.5 w-3.5" })
          }
        )
      ] })
    }
  ];
  return /* @__PURE__ */ jsxs2("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx2(
      SearchFilterBar2,
      {
        searchQuery,
        onSearchChange,
        searchPlaceholder: "Search product groups by name, code, or category...",
        actionLabel: "New Product Group",
        onAction: onOpenAddModal,
        customFilterContent,
        activeFilterCount
      }
    ),
    /* @__PURE__ */ jsx2(
      DataTable2,
      {
        columns,
        data: filtered,
        keyExtractor: (g) => g.id,
        emptyMessage: "No product groups found for current filters. Create one to curate a campaign catalog for a brand."
      }
    )
  ] });
};

// src/match/components/tabs/ShadesTab.tsx
import { Pencil as Pencil3, Trash2 as Trash23 } from "lucide-react";
import { SearchFilterBar as SearchFilterBar3, DataTable as DataTable3, Button as Button3 } from "@gateway-experience/shared";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var ShadesTab = ({
  shades,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteShade
}) => {
  const filtered = shades.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.hexColor.toLowerCase().includes(q);
  });
  const columns = [
    {
      key: "name",
      header: "Shade",
      render: (s) => /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx3("span", { className: "h-4 w-4 rounded-full border border-white/10 shrink-0", style: { backgroundColor: s.hexColor } }),
        /* @__PURE__ */ jsxs3("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsx3("span", { className: "font-semibold text-foreground", children: s.name }),
          /* @__PURE__ */ jsx3("span", { className: "text-[10px] font-mono text-muted-foreground", children: s.hexColor })
        ] })
      ] })
    },
    {
      key: "region",
      header: "Applies To",
      render: (s) => /* @__PURE__ */ jsx3("span", { className: "font-mono text-[10px] uppercase text-muted-foreground", children: s.region })
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (s) => /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-end gap-1", children: [
        /* @__PURE__ */ jsx3(Button3, { variant: "ghost", size: "icon-xs", onClick: () => onOpenEditModal(s), title: "Edit Shade", children: /* @__PURE__ */ jsx3(Pencil3, { className: "h-3.5 w-3.5" }) }),
        /* @__PURE__ */ jsx3(Button3, { variant: "ghost", size: "icon-xs", onClick: () => onDeleteShade(s.id), title: "Delete Shade", className: "hover:text-destructive", children: /* @__PURE__ */ jsx3(Trash23, { className: "h-3.5 w-3.5" }) })
      ] })
    }
  ];
  return /* @__PURE__ */ jsxs3("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx3(
      SearchFilterBar3,
      {
        searchQuery,
        onSearchChange,
        searchPlaceholder: "Search shades by name or hex color...",
        actionLabel: "New Shade",
        onAction: onOpenAddModal
      }
    ),
    /* @__PURE__ */ jsx3(DataTable3, { columns, data: filtered, keyExtractor: (s) => s.id, emptyMessage: "No shades defined for this product yet." })
  ] });
};

// src/match/components/tabs/MatchSimulatorTab.tsx
import { Play, Sparkles, AlertTriangle, ShieldCheck, Sun, Moon, Zap, Layers, Tag } from "lucide-react";
import { EmptyState } from "@gateway-experience/shared";
import { Fragment, jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
var MatchSimulatorTab = ({
  simBrand,
  setSimBrand,
  simSkinType,
  setSimSkinType,
  simSebum,
  setSimSebum,
  simHydration,
  setSimHydration,
  simSensitivity,
  setSimSensitivity,
  simPregnant,
  setSimPregnant,
  simRetinol,
  setSimRetinol,
  onRunSimulator,
  isSimulating,
  simResult
}) => {
  const getPhaseIcon = (phaseKey) => {
    const lower = phaseKey.toLowerCase();
    if (lower.includes("morning") || lower.includes("am") || lower.includes("sun") || lower.includes("day")) {
      return /* @__PURE__ */ jsx4(Sun, { className: "h-4 w-4 text-amber-400" });
    }
    if (lower.includes("night") || lower.includes("pm") || lower.includes("evening") || lower.includes("restoration")) {
      return /* @__PURE__ */ jsx4(Moon, { className: "h-4 w-4 text-sky-400" });
    }
    if (lower.includes("prep") || lower.includes("base") || lower.includes("complexion") || lower.includes("makeup")) {
      return /* @__PURE__ */ jsx4(Sparkles, { className: "h-4 w-4 text-purple-400" });
    }
    if (lower.includes("shave") || lower.includes("grooming")) {
      return /* @__PURE__ */ jsx4(Layers, { className: "h-4 w-4 text-teal-400" });
    }
    return /* @__PURE__ */ jsx4(Zap, { className: "h-4 w-4 text-emerald-400" });
  };
  const formatPhaseTitle = (phaseKey) => {
    return phaseKey.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };
  const routinePhases = [];
  if (simResult?.regimens?.phases && Object.keys(simResult.regimens.phases).length > 0) {
    for (const [phaseKey, steps] of Object.entries(simResult.regimens.phases)) {
      if (Array.isArray(steps) && steps.length > 0) {
        routinePhases.push({
          key: phaseKey,
          title: formatPhaseTitle(phaseKey),
          steps
        });
      }
    }
  } else if (simResult?.regimens) {
    if (simResult.regimens.amRoutine && simResult.regimens.amRoutine.length > 0) {
      routinePhases.push({
        key: "morning_protection",
        title: "Morning Routine (AM Protocol)",
        steps: simResult.regimens.amRoutine
      });
    }
    if (simResult.regimens.pmRoutine && simResult.regimens.pmRoutine.length > 0) {
      routinePhases.push({
        key: "night_restoration",
        title: "Evening Routine (PM Protocol)",
        steps: simResult.regimens.pmRoutine
      });
    }
  }
  return /* @__PURE__ */ jsxs4("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6", children: [
    /* @__PURE__ */ jsx4("div", { className: "lg:col-span-4 space-y-4", children: /* @__PURE__ */ jsxs4("div", { className: "bg-card border border-border rounded-lg p-5 space-y-4", children: [
      /* @__PURE__ */ jsxs4("div", { className: "flex items-center justify-between border-b border-border pb-3", children: [
        /* @__PURE__ */ jsx4("h3", { className: "font-bold text-foreground text-sm", children: "Consumer Clinical Profile" }),
        /* @__PURE__ */ jsx4("span", { className: "text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded font-mono font-bold", children: "2-Tier Engine" })
      ] }),
      /* @__PURE__ */ jsxs4("div", { className: "space-y-3 text-xs", children: [
        /* @__PURE__ */ jsxs4("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx4("label", { className: "text-muted-foreground", children: "Brand Scoping & Routine Paradigm:" }),
          /* @__PURE__ */ jsxs4(
            "select",
            {
              value: simBrand,
              onChange: (e) => setSimBrand(e.target.value),
              className: "w-full bg-muted/40 border border-border rounded px-3 py-2 text-foreground",
              children: [
                /* @__PURE__ */ jsx4("option", { value: "*", children: "All Brands (*)" }),
                /* @__PURE__ */ jsx4("option", { value: "wardah", children: "Wardah Beauty (Clinical AM/PM)" }),
                /* @__PURE__ */ jsx4("option", { value: "makeover", children: "Make Over (Skin Prep & Complexion)" }),
                /* @__PURE__ */ jsx4("option", { value: "kahf", children: "Kahf Men Care (Daily & Post-Shave)" }),
                /* @__PURE__ */ jsx4("option", { value: "biodef", children: "Biodef (Hygiene & Barrier)" }),
                /* @__PURE__ */ jsx4("option", { value: "labore", children: "Labor\xE9 Sensitive Skin" }),
                /* @__PURE__ */ jsx4("option", { value: "emina", children: "Emina Teen & Young" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs4("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx4("label", { className: "text-muted-foreground", children: "Skin Profile (Phenotype):" }),
          /* @__PURE__ */ jsxs4(
            "select",
            {
              value: simSkinType,
              onChange: (e) => setSimSkinType(e.target.value),
              className: "w-full bg-muted/40 border border-border rounded px-3 py-2 text-foreground font-mono",
              children: [
                /* @__PURE__ */ jsx4("option", { value: "OSPT", children: "OSPT (Oily, Sensitive, Pigmented, Tight)" }),
                /* @__PURE__ */ jsx4("option", { value: "OSPW", children: "OSPW (Oily, Sensitive, Pigmented, Wrinkled)" }),
                /* @__PURE__ */ jsx4("option", { value: "DRNT", children: "DRNT (Dry, Resistant, Non-Pigmented, Tight)" }),
                /* @__PURE__ */ jsx4("option", { value: "DSPT", children: "DSPT (Dry, Sensitive, Pigmented, Tight)" }),
                /* @__PURE__ */ jsx4("option", { value: "ORNT", children: "ORNT (Oily, Resistant, Non-Pigmented, Tight)" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs4("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxs4("div", { className: "flex justify-between text-muted-foreground", children: [
            /* @__PURE__ */ jsx4("span", { children: "Sebum Dimension:" }),
            /* @__PURE__ */ jsxs4("span", { className: "font-mono text-foreground font-bold", children: [
              simSebum,
              " pts"
            ] })
          ] }),
          /* @__PURE__ */ jsx4(
            "input",
            {
              type: "range",
              min: "0",
              max: "100",
              value: simSebum,
              onChange: (e) => setSimSebum(Number(e.target.value)),
              className: "w-full accent-amber-400"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs4("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxs4("div", { className: "flex justify-between text-muted-foreground", children: [
            /* @__PURE__ */ jsx4("span", { children: "Hydration Level:" }),
            /* @__PURE__ */ jsxs4("span", { className: "font-mono text-foreground font-bold", children: [
              simHydration,
              " pts"
            ] })
          ] }),
          /* @__PURE__ */ jsx4(
            "input",
            {
              type: "range",
              min: "0",
              max: "100",
              value: simHydration,
              onChange: (e) => setSimHydration(Number(e.target.value)),
              className: "w-full accent-sky-400"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs4("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxs4("div", { className: "flex justify-between text-muted-foreground", children: [
            /* @__PURE__ */ jsx4("span", { children: "Sensitivity Level:" }),
            /* @__PURE__ */ jsxs4("span", { className: "font-mono text-foreground font-bold", children: [
              simSensitivity,
              " pts"
            ] })
          ] }),
          /* @__PURE__ */ jsx4(
            "input",
            {
              type: "range",
              min: "0",
              max: "100",
              value: simSensitivity,
              onChange: (e) => setSimSensitivity(Number(e.target.value)),
              className: "w-full accent-rose-400"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs4("div", { className: "pt-2 border-t border-border space-y-2", children: [
          /* @__PURE__ */ jsx4("label", { className: "text-muted-foreground font-bold block", children: "Safety Gatekeeper Flags:" }),
          /* @__PURE__ */ jsxs4("label", { className: "flex items-center gap-2 p-2 bg-muted/40 border border-border rounded cursor-pointer", children: [
            /* @__PURE__ */ jsx4(
              "input",
              {
                type: "checkbox",
                checked: simPregnant,
                onChange: (e) => setSimPregnant(e.target.checked),
                className: "accent-rose-400 rounded"
              }
            ),
            /* @__PURE__ */ jsx4("span", { className: "text-foreground", children: "Is Pregnant / Nursing Consumer (Zero Retinoids)" })
          ] }),
          /* @__PURE__ */ jsxs4("label", { className: "flex items-center gap-2 p-2 bg-muted/40 border border-border rounded cursor-pointer", children: [
            /* @__PURE__ */ jsx4(
              "input",
              {
                type: "checkbox",
                checked: simRetinol,
                onChange: (e) => setSimRetinol(e.target.checked),
                className: "accent-amber-400 rounded"
              }
            ),
            /* @__PURE__ */ jsx4("span", { className: "text-foreground", children: "Active Retinol / Direct Acid User" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs4(
          "button",
          {
            onClick: onRunSimulator,
            disabled: isSimulating,
            className: "w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 mt-4 cursor-pointer disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsx4(Play, { className: "h-4 w-4 fill-black" }),
              /* @__PURE__ */ jsx4("span", { children: isSimulating ? "Evaluating 2-Tier Rules..." : "Run Regimen Matching" })
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx4("div", { className: "lg:col-span-8 space-y-6", children: simResult ? /* @__PURE__ */ jsxs4(Fragment, { children: [
      /* @__PURE__ */ jsxs4("div", { className: "bg-card border border-border rounded-lg p-5 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs4("div", { children: [
          /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx4("span", { className: "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-xs font-mono font-bold px-2 py-0.5 rounded", children: simResult.profileSummary.skinType }),
            /* @__PURE__ */ jsx4("h3", { className: "font-bold text-foreground text-base", children: "Personalized Prescription" })
          ] }),
          /* @__PURE__ */ jsx4("div", { className: "flex flex-wrap gap-2 mt-2", children: simResult.profileSummary.primaryConcerns.map((c, i) => /* @__PURE__ */ jsx4("span", { className: "text-[10px] bg-muted text-foreground px-2 py-0.5 rounded border border-border", children: c }, i)) })
        ] }),
        typeof simResult.profileSummary.overallSuitabilityScore === "number" && /* @__PURE__ */ jsxs4("div", { className: "text-right", children: [
          /* @__PURE__ */ jsx4("span", { className: "text-[10px] text-muted-foreground font-bold uppercase tracking-wider block", children: "Clinical Match" }),
          /* @__PURE__ */ jsxs4("span", { className: "text-3xl font-black text-emerald-400 font-mono", children: [
            simResult.profileSummary.overallSuitabilityScore,
            "%"
          ] })
        ] })
      ] }),
      simResult.clinicalConflictMatrix.layeringRulesApplied.length > 0 && /* @__PURE__ */ jsxs4("div", { className: "bg-amber-950/20 border border-amber-800/40 rounded-lg p-4 space-y-2", children: [
        /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-2 text-amber-400 font-bold text-xs", children: [
          /* @__PURE__ */ jsx4(AlertTriangle, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxs4("span", { children: [
            "Clinical Conflict Matrix Directives (",
            simResult.clinicalConflictMatrix.conflictsDetected,
            " detected)"
          ] })
        ] }),
        /* @__PURE__ */ jsx4("ul", { className: "space-y-1 text-xs text-amber-200/90 pl-6 list-disc", children: simResult.clinicalConflictMatrix.layeringRulesApplied.map((rule, idx) => /* @__PURE__ */ jsx4("li", { children: rule }, idx)) })
      ] }),
      routinePhases.map((phase) => /* @__PURE__ */ jsxs4("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs4("h4", { className: "font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-2", children: [
          getPhaseIcon(phase.key),
          /* @__PURE__ */ jsx4("span", { children: phase.title })
        ] }),
        /* @__PURE__ */ jsx4("div", { className: "space-y-2", children: phase.steps.map((step) => /* @__PURE__ */ jsxs4("div", { className: "bg-card border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxs4("div", { className: "space-y-1.5 flex-1", children: [
            /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsx4("span", { className: "w-5 h-5 rounded-full bg-muted text-amber-300 text-[10px] font-bold flex items-center justify-center font-mono shrink-0", children: step.stepNumber }),
              /* @__PURE__ */ jsx4("span", { className: "font-bold text-foreground text-sm", children: step.primaryProduct.name }),
              /* @__PURE__ */ jsx4("span", { className: "bg-muted text-amber-400 text-[10px] px-1.5 py-0.5 rounded font-medium border border-border", children: step.primaryProduct.brand })
            ] }),
            /* @__PURE__ */ jsxs4("div", { className: "text-xs text-muted-foreground flex items-center gap-3 pl-7", children: [
              /* @__PURE__ */ jsxs4("span", { children: [
                "Category: ",
                /* @__PURE__ */ jsx4("strong", { className: "text-foreground", children: step.category })
              ] }),
              /* @__PURE__ */ jsxs4("span", { children: [
                "Texture: ",
                /* @__PURE__ */ jsx4("strong", { className: "text-foreground", children: step.recommendedTexture || step.primaryProduct.texture })
              ] })
            ] }),
            step.primaryProduct.whySelected && step.primaryProduct.whySelected.length > 0 && /* @__PURE__ */ jsx4("div", { className: "pl-7 flex flex-wrap gap-1.5 pt-1", children: step.primaryProduct.whySelected.map((reason, rIdx) => /* @__PURE__ */ jsxs4("span", { className: "text-[10px] bg-emerald-950/40 text-emerald-300 border border-emerald-800/30 px-2 py-0.5 rounded flex items-center gap-1", children: [
              /* @__PURE__ */ jsx4(Tag, { className: "h-2.5 w-2.5" }),
              reason
            ] }, rIdx)) })
          ] }),
          /* @__PURE__ */ jsxs4("div", { className: "text-right shrink-0 sm:pl-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-border", children: [
            /* @__PURE__ */ jsxs4("div", { className: "font-mono text-emerald-400 font-bold text-sm", children: [
              step.primaryProduct.matchScore,
              " pts"
            ] }),
            /* @__PURE__ */ jsxs4("span", { className: "text-[10px] text-emerald-400 flex items-center justify-end gap-1", children: [
              /* @__PURE__ */ jsx4(ShieldCheck, { className: "h-3 w-3" }),
              " Zero Contraindications"
            ] })
          ] })
        ] }, step.stepNumber)) })
      ] }, phase.key))
    ] }) : /* @__PURE__ */ jsx4(
      EmptyState,
      {
        icon: /* @__PURE__ */ jsx4(Sparkles, { className: "h-6 w-6 text-emerald-400" }),
        title: "Regimen Matching Standby",
        description: "Adjust clinical scores & safety flags on the left, then click 'Run Regimen Matching' to simulate prescription routine.",
        className: "py-16"
      }
    ) })
  ] });
};

// src/match/components/tabs/PhotoTryOnTab.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle as AlertTriangle2, ImagePlus, Loader2, RefreshCw, Wand2, X } from "lucide-react";
import { Button as Button4, EmptyState as EmptyState2 } from "@gateway-experience/shared";

// src/core/collection-resolver.ts
function getCollectionPrefix(key) {
  const map = {
    form: "/core/form-engine",
    "form-engine": "/core/form-engine",
    score: "/core/score-engine",
    "score-engine": "/core/score-engine",
    match: "/core/match-engine",
    "match-engine": "/core/match-engine",
    vision: "/core/vision-engine",
    "vision-engine": "/core/vision-engine",
    reference: "/core/reference-service",
    "reference-service": "/core/reference-service",
    colour: "/core/colour-engine",
    "colour-engine": "/core/colour-engine"
  };
  return map[key] || `/core/${key}`;
}
function resolveDynamicEndpoint(key, routePattern, collections) {
  const prefix = getCollectionPrefix(key);
  const cleanPattern = routePattern.startsWith("/") ? routePattern : `/${routePattern}`;
  if (collections && collections.length > 0) {
    const matched = collections.find(
      (c) => c.originalPrefix === prefix || c.name.toLowerCase().includes(key.toLowerCase()) || c.id === key
    );
    if (matched && matched.originalPrefix) {
      return `${matched.originalPrefix}${cleanPattern}`;
    }
  }
  return `${prefix}${cleanPattern}`;
}

// src/core/scope.ts
var ALL_TENANTS = "*";
function tenantScopeQuery(brandId = ALL_TENANTS, applicationId = ALL_TENANTS) {
  return `brand_id=${encodeURIComponent(brandId || ALL_TENANTS)}&application_id=${encodeURIComponent(applicationId || ALL_TENANTS)}`;
}
function withTenantScope(path, brandId, applicationId) {
  return `${path}${path.includes("?") ? "&" : "?"}${tenantScopeQuery(brandId, applicationId)}`;
}

// src/match/api.ts
var ep = (path) => resolveDynamicEndpoint("match", path);
async function list(path, field, doFetch) {
  const data = await (await doFetch(path)).json();
  return Array.isArray(data[field]) ? data[field] : null;
}
var sendJson = (doFetch, url, method, body) => doFetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
function resource(path, field) {
  return {
    list: (doFetch = fetch) => list(ep(withTenantScope(path)), field, doFetch),
    create: (item, doFetch = fetch) => sendJson(doFetch, ep(path), "POST", item),
    update: (item, doFetch = fetch) => sendJson(doFetch, ep(path), "PUT", item),
    remove: (id, doFetch = fetch) => doFetch(ep(`${path}?id=${id}`), { method: "DELETE" })
  };
}
var conflictsApi = resource("/api/matching/conflicts", "conflicts");
var productGroupsApi = resource("/api/matching/product-groups", "groups");
var productsApi = {
  list: (doFetch = fetch) => list(ep(withTenantScope("/api/matching/products")), "products", doFetch),
  /** One brand's products ('' means every brand). */
  listForBrand: (brandId, doFetch = fetch) => list(ep(`/api/matching/products?brand_id=${encodeURIComponent(brandId || "*")}`), "products", doFetch)
};
var shadesApi = {
  ...resource("/api/matching/shades", "shades"),
  /** Shades of one product; unscoped, as the engine keys them by product. */
  list: (productId, doFetch = fetch) => list(ep(`/api/matching/shades?product_id=${encodeURIComponent(productId)}`), "shades", doFetch)
};
async function runMatch(payload, doFetch = fetch) {
  const res = await sendJson(doFetch, ep("/api/matching/match"), "POST", payload);
  return res.ok ? await res.json() : null;
}
var colourEp = (path) => resolveDynamicEndpoint("colour", path);
var ColourApiError = class extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "ColourApiError";
  }
};
async function colourError(res) {
  const text = await res.text();
  try {
    const j = JSON.parse(text);
    return new ColourApiError(res.status, String(j.code ?? ""), String(j.error || j.message || `HTTP ${res.status}`));
  } catch {
    return new ColourApiError(res.status, "", text || `HTTP ${res.status}`);
  }
}
async function fetchColourCatalog(doFetch = fetch) {
  const res = await doFetch(colourEp("/catalog"));
  if (!res.ok) throw await colourError(res);
  const data = await res.json();
  return data.catalog ?? {};
}
async function colourTryOn(image, shadeIds, doFetch = fetch) {
  const fd = new FormData();
  fd.append("image", image);
  shadeIds.filter(Boolean).forEach((id) => fd.append("shadeIds", id));
  const res = await doFetch(colourEp("/tryon"), { method: "POST", body: fd });
  if (!res.ok) throw await colourError(res);
  return res.blob();
}
async function listReferenceIngredients(routes, doFetch = fetch) {
  const data = await (await doFetch(routes.reference("ingredients"))).json();
  const raw = Array.isArray(data.ingredients) ? data.ingredients : Array.isArray(data) ? data : [];
  return raw.map((i) => ({ code: i.code || i.name, name: i.name }));
}

// src/match/components/tabs/PhotoTryOnTab.tsx
import { Fragment as Fragment2, jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
var errorMessage = (e) => e instanceof Error && e.message ? e.message : String(e);
function useObjectUrl(blob) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
}
var PhotoTryOnTab = () => {
  const [catalog, setCatalog] = useState(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [selected, setSelected] = useState({});
  const [result, setResult] = useState(null);
  const [rendering, setRendering] = useState(false);
  const [renderError, setRenderError] = useState(null);
  const requestId = useRef(0);
  const photoUrl = useObjectUrl(photo);
  const resultUrl = useObjectUrl(result);
  const loadCatalog = useCallback(() => {
    setCatalogLoading(true);
    setCatalogError(null);
    fetchColourCatalog().then(setCatalog).catch((e) => setCatalogError(errorMessage(e))).finally(() => setCatalogLoading(false));
  }, []);
  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);
  const resetResult = () => {
    requestId.current += 1;
    setResult(null);
    setRendering(false);
    setRenderError(null);
  };
  const choosePhoto = (file) => {
    resetResult();
    setPhoto(file);
  };
  const toggleShade = (category, shadeId) => {
    resetResult();
    setSelected((prev) => {
      const next = { ...prev };
      if (next[category] === shadeId) delete next[category];
      else next[category] = shadeId;
      return next;
    });
  };
  const shadeIds = Object.values(selected);
  const render = async () => {
    if (!photo || shadeIds.length === 0) return;
    const id = ++requestId.current;
    setRendering(true);
    setRenderError(null);
    setResult(null);
    try {
      const png = await colourTryOn(photo, shadeIds);
      if (id === requestId.current) setResult(png);
    } catch (e) {
      if (id === requestId.current) setRenderError(errorMessage(e));
    } finally {
      if (id === requestId.current) setRendering(false);
    }
  };
  const categories = Object.entries(catalog ?? {}).filter(([, shades]) => Array.isArray(shades) && shades.length > 0);
  return /* @__PURE__ */ jsxs5("div", { className: "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4 sm:gap-6", children: [
    /* @__PURE__ */ jsxs5("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs5("div", { className: "bg-card border border-border rounded-xl p-4 space-y-3", children: [
        /* @__PURE__ */ jsx5("h3", { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground", children: "1. Face photo" }),
        /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs5("label", { className: "flex items-center gap-1.5 px-3 py-2 rounded border border-border bg-secondary/40 hover:border-primary/60 text-xs font-semibold cursor-pointer", children: [
            /* @__PURE__ */ jsx5(ImagePlus, { className: "h-3.5 w-3.5" }),
            /* @__PURE__ */ jsx5("span", { children: photo ? "Change photo" : "Choose photo" }),
            /* @__PURE__ */ jsx5(
              "input",
              {
                type: "file",
                accept: "image/jpeg,image/png",
                className: "hidden",
                onChange: (e) => {
                  choosePhoto(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }
              }
            )
          ] }),
          photo && /* @__PURE__ */ jsxs5(Fragment2, { children: [
            /* @__PURE__ */ jsx5("span", { className: "text-[11px] text-muted-foreground truncate max-w-[180px]", title: photo.name, children: photo.name }),
            /* @__PURE__ */ jsx5(Button4, { variant: "ghost", size: "icon-xs", onClick: () => choosePhoto(null), title: "Remove photo", children: /* @__PURE__ */ jsx5(X, { className: "h-3.5 w-3.5" }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs5("div", { className: "bg-card border border-border rounded-xl p-4 space-y-3", children: [
        /* @__PURE__ */ jsxs5("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx5("h3", { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground", children: "2. Shades (one per category)" }),
          shadeIds.length > 0 && /* @__PURE__ */ jsx5(
            "button",
            {
              type: "button",
              onClick: () => {
                resetResult();
                setSelected({});
              },
              className: "text-[11px] text-muted-foreground hover:text-foreground cursor-pointer",
              children: "Clear"
            }
          )
        ] }),
        catalogLoading && /* @__PURE__ */ jsxs5("p", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx5(Loader2, { className: "h-3.5 w-3.5 animate-spin" }),
          " Loading the try-on catalog..."
        ] }),
        !catalogLoading && catalogError && /* @__PURE__ */ jsxs5("div", { className: "flex items-start justify-between gap-2 rounded border border-destructive/40 bg-destructive/10 px-3 py-2", children: [
          /* @__PURE__ */ jsxs5("p", { className: "text-xs text-destructive", children: [
            "Could not load the catalog: ",
            catalogError
          ] }),
          /* @__PURE__ */ jsx5(Button4, { variant: "ghost", size: "icon-xs", onClick: loadCatalog, title: "Retry", children: /* @__PURE__ */ jsx5(RefreshCw, { className: "h-3.5 w-3.5" }) })
        ] }),
        !catalogLoading && !catalogError && categories.length === 0 && /* @__PURE__ */ jsx5("p", { className: "text-xs text-muted-foreground", children: "The colour engine's catalog has no shades to try." }),
        categories.map(([category, shades]) => /* @__PURE__ */ jsxs5("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx5("p", { className: "text-[11px] font-semibold capitalize text-foreground", children: category }),
          /* @__PURE__ */ jsx5("div", { className: "flex flex-wrap gap-2", children: shades.map((s) => {
            const isSelected = selected[category] === s.shadeId;
            return /* @__PURE__ */ jsxs5(
              "button",
              {
                type: "button",
                "aria-pressed": isSelected,
                onClick: () => toggleShade(category, s.shadeId),
                title: `${s.productName} \u2014 ${s.shadeName} (${s.hexColor})`,
                className: `flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer ${isSelected ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/60"}`,
                children: [
                  /* @__PURE__ */ jsx5("span", { className: "h-4 w-4 rounded-full border border-black/10 shrink-0", style: { backgroundColor: s.hexColor } }),
                  /* @__PURE__ */ jsx5("span", { children: s.shadeName })
                ]
              },
              s.shadeId
            );
          }) })
        ] }, category))
      ] }),
      /* @__PURE__ */ jsxs5(Button4, { onClick: render, disabled: !photo || shadeIds.length === 0 || rendering, className: "w-full", children: [
        rendering ? /* @__PURE__ */ jsx5(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx5(Wand2, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx5("span", { children: rendering ? "Rendering..." : "Render try-on" })
      ] })
    ] }),
    /* @__PURE__ */ jsx5("div", { className: "bg-card border border-border rounded-xl p-4 space-y-3", children: !photoUrl ? /* @__PURE__ */ jsx5(
      EmptyState2,
      {
        icon: /* @__PURE__ */ jsx5(ImagePlus, { className: "h-6 w-6" }),
        title: "No photo yet",
        description: "Choose a face photo and the shades to try; the colour engine renders the look onto it."
      }
    ) : /* @__PURE__ */ jsxs5("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxs5("figure", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx5("figcaption", { className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Before" }),
        /* @__PURE__ */ jsx5("img", { src: photoUrl, alt: "Original photo", className: "w-full rounded-lg border border-border object-contain bg-black/40" })
      ] }),
      /* @__PURE__ */ jsxs5("figure", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx5("figcaption", { className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "After" }),
        resultUrl ? /* @__PURE__ */ jsx5("img", { src: resultUrl, alt: "Photo with the selected shades rendered", className: "w-full rounded-lg border border-border object-contain bg-black/40" }) : /* @__PURE__ */ jsx5("div", { className: "flex aspect-[3/4] items-center justify-center rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground", children: rendering ? /* @__PURE__ */ jsxs5("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx5(Loader2, { className: "h-4 w-4 animate-spin" }),
          " Rendering..."
        ] }) : renderError ? /* @__PURE__ */ jsxs5("span", { className: "flex flex-col items-center gap-1.5 text-destructive", children: [
          /* @__PURE__ */ jsx5(AlertTriangle2, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxs5("span", { children: [
            "Try-on failed: ",
            renderError
          ] })
        ] }) : shadeIds.length === 0 ? "Pick at least one shade." : 'Press "Render try-on".' })
      ] })
    ] }) })
  ] });
};

// src/match/components/modals/ConflictRuleModal.tsx
import { useState as useState2, useEffect as useEffect2 } from "react";
import { ShieldAlert as ShieldAlert2, Loader2 as Loader22 } from "lucide-react";
import { Modal, useHostRoutes } from "@gateway-experience/shared";
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
var ConflictRuleModal = ({
  isOpen,
  onClose,
  onSave,
  editingConflict
}) => {
  const hostRoutes = useHostRoutes();
  const [confA, setConfA] = useState2("");
  const [confB, setConfB] = useState2("");
  const [confType, setConfType] = useState2("over_exfoliation");
  const [confAction, setConfAction] = useState2("split_am_pm");
  const [confWarning, setConfWarning] = useState2("");
  const [isSubmitting, setIsSubmitting] = useState2(false);
  const [ingredients, setIngredients] = useState2([]);
  useEffect2(() => {
    listReferenceIngredients(hostRoutes).then((list2) => {
      if (list2.length > 0) setIngredients(list2);
    }).catch(() => {
    });
  }, [isOpen, hostRoutes]);
  useEffect2(() => {
    if (editingConflict) {
      setConfA(editingConflict.ingredientA);
      setConfB(editingConflict.ingredientB);
      setConfType(editingConflict.conflictType);
      setConfAction(editingConflict.resolutionAction);
      setConfWarning(editingConflict.warningMessage || "");
    } else {
      setConfA("");
      setConfB("");
      setConfType("over_exfoliation");
      setConfAction("split_am_pm");
      setConfWarning("");
    }
  }, [editingConflict, isOpen]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!confA.trim() || !confB.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave({
        ...editingConflict ? { id: editingConflict.id } : {},
        ingredientA: confA.trim(),
        ingredientB: confB.trim(),
        conflictType: confType,
        resolutionAction: confAction,
        severity: "high",
        warningMessage: confWarning.trim()
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsx6(
    Modal,
    {
      isOpen,
      onClose,
      size: "md",
      icon: /* @__PURE__ */ jsx6(ShieldAlert2, { className: "h-4 w-4 text-rose-400" }),
      title: editingConflict ? "Edit Conflict Rule" : "New Ingredient Conflict",
      isLoading: isSubmitting,
      loadingText: isSubmitting ? editingConflict ? "Updating Conflict Rule..." : "Saving Conflict Rule..." : void 0,
      children: /* @__PURE__ */ jsxs6("form", { onSubmit: handleSubmit, className: "space-y-4 text-xs", children: [
        /* @__PURE__ */ jsxs6("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs6("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx6("label", { className: "text-muted-foreground", children: "Primary Ingredient (A):" }),
            /* @__PURE__ */ jsx6(
              "input",
              {
                type: "text",
                required: true,
                list: "conflict-ing-list",
                placeholder: "e.g. Retinol 0.5%",
                value: confA,
                onChange: (e) => setConfA(e.target.value),
                className: "w-full bg-muted/40 border border-border rounded px-3 py-2 text-foreground"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs6("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx6("label", { className: "text-muted-foreground", children: "Conflicting Ingredient (B):" }),
            /* @__PURE__ */ jsx6(
              "input",
              {
                type: "text",
                required: true,
                list: "conflict-ing-list",
                placeholder: "e.g. Glycolic Acid (AHA)",
                value: confB,
                onChange: (e) => setConfB(e.target.value),
                className: "w-full bg-muted/40 border border-border rounded px-3 py-2 text-foreground"
              }
            )
          ] }),
          /* @__PURE__ */ jsx6("datalist", { id: "conflict-ing-list", children: ingredients.map((ing) => /* @__PURE__ */ jsx6("option", { value: ing.name }, ing.code)) })
        ] }),
        /* @__PURE__ */ jsxs6("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs6("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx6("label", { className: "text-muted-foreground", children: "Conflict Type:" }),
            /* @__PURE__ */ jsxs6(
              "select",
              {
                value: confType,
                onChange: (e) => setConfType(e.target.value),
                className: "w-full bg-muted/40 border border-border rounded px-3 py-2 text-foreground font-mono",
                children: [
                  /* @__PURE__ */ jsx6("option", { value: "incompatible", children: "Strictly Incompatible" }),
                  /* @__PURE__ */ jsx6("option", { value: "over_exfoliation", children: "Over-exfoliation Risk" }),
                  /* @__PURE__ */ jsx6("option", { value: "pH_clash", children: "pH Neutralization Clash" }),
                  /* @__PURE__ */ jsx6("option", { value: "barrier_irritation", children: "Barrier Irritation Risk" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs6("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx6("label", { className: "text-muted-foreground", children: "Resolution Protocol:" }),
            /* @__PURE__ */ jsxs6(
              "select",
              {
                value: confAction,
                onChange: (e) => setConfAction(e.target.value),
                className: "w-full bg-muted/40 border border-border rounded px-3 py-2 text-foreground font-mono",
                children: [
                  /* @__PURE__ */ jsx6("option", { value: "split_am_pm", children: "Split Routine (AM vs PM)" }),
                  /* @__PURE__ */ jsx6("option", { value: "alternate_days", children: "Alternate Use Days" }),
                  /* @__PURE__ */ jsx6("option", { value: "strict_block", children: "Strict Product Exclusion" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs6("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx6("label", { className: "text-muted-foreground", children: "Clinical Warning Message:" }),
          /* @__PURE__ */ jsx6(
            "textarea",
            {
              rows: 2,
              placeholder: "e.g. Do not layer pure Vitamin C with Retinol simultaneously...",
              value: confWarning,
              onChange: (e) => setConfWarning(e.target.value),
              className: "w-full bg-muted/40 border border-border rounded px-3 py-2 text-foreground resize-none"
            }
          )
        ] }),
        /* @__PURE__ */ jsx6("div", { className: "flex justify-end pt-2", children: /* @__PURE__ */ jsxs6(
          "button",
          {
            type: "submit",
            disabled: isSubmitting,
            className: "px-4 py-2 bg-rose-600 hover:bg-rose-500 text-foreground font-bold rounded disabled:opacity-50 cursor-pointer flex items-center gap-1.5",
            children: [
              isSubmitting ? /* @__PURE__ */ jsx6(Loader22, { className: "h-3.5 w-3.5 animate-spin" }) : null,
              /* @__PURE__ */ jsx6("span", { children: isSubmitting ? editingConflict ? "Updating..." : "Saving..." : editingConflict ? "Update Rule" : "Save Rule" })
            ]
          }
        ) })
      ] })
    }
  );
};

// src/match/components/modals/ProductGroupModal.tsx
import { useState as useState3, useEffect as useEffect3, useMemo } from "react";
import { Boxes as Boxes2, Loader2 as Loader23, X as X2 } from "lucide-react";
import { Modal as Modal2, SearchableSelect, InfoTooltip } from "@gateway-experience/shared";
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
var BRAND_OPTIONS = [
  { value: "wardah", label: "Wardah Beauty" },
  { value: "kahf", label: "Kahf Men Care" },
  { value: "labore", label: "Labor\xE9 Sensitive Skin" },
  { value: "emina", label: "Emina Teen & Young" }
];
var ProductGroupModal = ({
  isOpen,
  onClose,
  onSave,
  editingGroup,
  defaultBrand
}) => {
  const [brandId, setBrandId] = useState3(defaultBrand && defaultBrand !== "*" ? defaultBrand : "wardah");
  const [applicationId, setApplicationId] = useState3("*");
  const [name, setName] = useState3("");
  const [code, setCode] = useState3("");
  const [description, setDescription] = useState3("");
  const [productIds, setProductIds] = useState3([]);
  const [categories, setCategories] = useState3([]);
  const [categoryDraft, setCategoryDraft] = useState3("");
  const [isActive, setIsActive] = useState3(true);
  const [isSubmitting, setIsSubmitting] = useState3(false);
  const [products, setProducts] = useState3([]);
  useEffect3(() => {
    if (!isOpen) return;
    productsApi.listForBrand(brandId).then((list2) => {
      if (list2) setProducts(list2);
    }).catch(() => {
    });
  }, [isOpen, brandId]);
  useEffect3(() => {
    if (editingGroup) {
      setBrandId(editingGroup.brandId);
      setApplicationId(editingGroup.applicationId || "*");
      setName(editingGroup.name);
      setCode(editingGroup.code || "");
      setDescription(editingGroup.description || "");
      setProductIds(editingGroup.productIds || []);
      setCategories(editingGroup.categories || []);
      setIsActive(editingGroup.isActive ?? true);
    } else {
      setBrandId(defaultBrand && defaultBrand !== "*" ? defaultBrand : "wardah");
      setApplicationId("*");
      setName("");
      setCode("");
      setDescription("");
      setProductIds([]);
      setCategories([]);
      setIsActive(true);
    }
    setCategoryDraft("");
  }, [editingGroup, isOpen, defaultBrand]);
  const productOptions = useMemo(
    () => products.map((p) => ({ value: p.id, label: p.name, description: p.category })),
    [products]
  );
  const availableCategories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
    [products]
  );
  const addCategory = (raw) => {
    const value = raw.trim();
    if (!value || categories.includes(value)) return;
    setCategories((prev) => [...prev, value]);
    setCategoryDraft("");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !brandId.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave({
        ...editingGroup ? { id: editingGroup.id } : {},
        brandId: brandId.trim(),
        applicationId: applicationId.trim() || "*",
        name: name.trim(),
        code: code.trim(),
        description: description.trim(),
        productIds,
        categories,
        isActive
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsx7(
    Modal2,
    {
      isOpen,
      onClose,
      size: "lg",
      icon: /* @__PURE__ */ jsx7(Boxes2, { className: "h-4 w-4 text-primary" }),
      title: editingGroup ? "Edit Product Group" : "New Product Group",
      isLoading: isSubmitting,
      loadingText: isSubmitting ? editingGroup ? "Updating Product Group..." : "Saving Product Group..." : void 0,
      children: /* @__PURE__ */ jsxs7("form", { onSubmit: handleSubmit, className: "space-y-4 text-xs", children: [
        /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs7("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx7("label", { className: "text-[#888888]", children: "Brand:" }),
            /* @__PURE__ */ jsx7(
              "select",
              {
                value: brandId,
                onChange: (e) => setBrandId(e.target.value),
                disabled: !!editingGroup,
                className: "w-full bg-[#161616] border border-[#333333] rounded px-3 py-2 text-white font-mono disabled:opacity-60",
                children: BRAND_OPTIONS.map((b) => /* @__PURE__ */ jsx7("option", { value: b.value, children: b.label }, b.value))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs7("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx7("label", { className: "text-[#888888]", children: "Group Name:" }),
            /* @__PURE__ */ jsx7(
              "input",
              {
                type: "text",
                required: true,
                placeholder: "e.g. Ramadan 2026 Glow Edit",
                value: name,
                onChange: (e) => setName(e.target.value),
                className: "w-full bg-[#161616] border border-[#333333] rounded px-3 py-2 text-white"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs7("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx7("label", { className: "text-[#888888]", children: "Group Code:" }),
            /* @__PURE__ */ jsx7(
              "input",
              {
                type: "text",
                placeholder: "e.g. RAMADAN26_GLOW",
                value: code,
                onChange: (e) => setCode(e.target.value),
                className: "w-full bg-[#161616] border border-[#333333] rounded px-3 py-2 text-white font-mono"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs7("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx7("label", { className: "text-[#888888] flex items-center justify-between", children: /* @__PURE__ */ jsx7("span", { children: "Status:" }) }),
            /* @__PURE__ */ jsxs7("label", { className: "flex items-center gap-2 bg-[#161616] border border-[#333333] rounded px-3 py-2 cursor-pointer", children: [
              /* @__PURE__ */ jsx7(
                "input",
                {
                  type: "checkbox",
                  checked: isActive,
                  onChange: (e) => setIsActive(e.target.checked),
                  className: "accent-primary"
                }
              ),
              /* @__PURE__ */ jsx7("span", { className: "text-white", children: "Active in matching engine" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs7("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx7("label", { className: "text-[#888888]", children: "Campaign Description:" }),
          /* @__PURE__ */ jsx7(
            "textarea",
            {
              rows: 2,
              placeholder: "e.g. Curated brightening & hydration lineup for the Ramadan campaign",
              value: description,
              onChange: (e) => setDescription(e.target.value),
              className: "w-full bg-[#161616] border border-[#333333] rounded px-3 py-2 text-white resize-none"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs7("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx7("label", { className: "text-[#888888]", children: "Products in Group:" }),
          /* @__PURE__ */ jsx7(
            SearchableSelect,
            {
              multiple: true,
              options: productOptions,
              value: productIds,
              onChange: setProductIds,
              placeholder: "-- Select products --",
              searchPlaceholder: "Search products..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxs7("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx7("label", { className: "text-[#888888]", children: "Categories in Group:" }),
            /* @__PURE__ */ jsx7(InfoTooltip, { content: "Every product in each listed category is included in the group.", label: "About Categories in Group" })
          ] }),
          /* @__PURE__ */ jsx7("div", { className: "flex flex-wrap items-center gap-1.5 mb-1.5", children: categories.map((c) => /* @__PURE__ */ jsxs7(
            "span",
            {
              className: "flex items-center gap-1 bg-amber-500/15 text-amber-400 font-mono px-2 py-0.5 rounded text-[10px] uppercase border border-amber-500/30 font-bold",
              children: [
                c,
                /* @__PURE__ */ jsx7(
                  "button",
                  {
                    type: "button",
                    onClick: () => setCategories((prev) => prev.filter((x) => x !== c)),
                    className: "hover:text-white cursor-pointer",
                    children: /* @__PURE__ */ jsx7(X2, { className: "h-3 w-3" })
                  }
                )
              ]
            },
            c
          )) }),
          /* @__PURE__ */ jsx7(
            "input",
            {
              type: "text",
              list: "product-group-category-list",
              placeholder: "Type a category and press Enter (e.g. Serum)",
              value: categoryDraft,
              onChange: (e) => setCategoryDraft(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCategory(categoryDraft);
                }
              },
              className: "w-full bg-[#161616] border border-[#333333] rounded px-3 py-2 text-white"
            }
          ),
          /* @__PURE__ */ jsx7("datalist", { id: "product-group-category-list", children: availableCategories.map((c) => /* @__PURE__ */ jsx7("option", { value: c }, c)) })
        ] }),
        /* @__PURE__ */ jsx7("div", { className: "flex justify-end pt-2", children: /* @__PURE__ */ jsxs7(
          "button",
          {
            type: "submit",
            disabled: isSubmitting,
            className: "px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground font-bold rounded disabled:opacity-50 cursor-pointer flex items-center gap-1.5",
            children: [
              isSubmitting ? /* @__PURE__ */ jsx7(Loader23, { className: "h-3.5 w-3.5 animate-spin" }) : null,
              /* @__PURE__ */ jsx7("span", { children: isSubmitting ? editingGroup ? "Updating..." : "Saving..." : editingGroup ? "Update Group" : "Save Group" })
            ]
          }
        ) })
      ] })
    }
  );
};

// src/match/components/modals/ShadeModal.tsx
import { useState as useState4, useEffect as useEffect4 } from "react";
import { Palette, Loader2 as Loader24 } from "lucide-react";
import { Modal as Modal3 } from "@gateway-experience/shared";
import { jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
var ShadeModal = ({ isOpen, onClose, onSave, editingShade, productId }) => {
  const [name, setName] = useState4("");
  const [hexColor, setHexColor] = useState4("#C41E3A");
  const [region, setRegion] = useState4("lip");
  const [isSubmitting, setIsSubmitting] = useState4(false);
  useEffect4(() => {
    if (editingShade) {
      setName(editingShade.name);
      setHexColor(editingShade.hexColor);
      setRegion(editingShade.region);
    } else {
      setName("");
      setHexColor("#C41E3A");
      setRegion("lip");
    }
  }, [editingShade, isOpen]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !hexColor.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave({
        ...editingShade ? { id: editingShade.id } : {},
        productId,
        name: name.trim(),
        hexColor: hexColor.trim(),
        region
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsx8(
    Modal3,
    {
      isOpen,
      onClose,
      size: "md",
      icon: /* @__PURE__ */ jsx8(Palette, { className: "h-4 w-4 text-primary" }),
      title: editingShade ? "Edit Shade" : "New Shade",
      isLoading: isSubmitting,
      loadingText: isSubmitting ? editingShade ? "Updating Shade..." : "Saving Shade..." : void 0,
      children: /* @__PURE__ */ jsxs8("form", { onSubmit: handleSubmit, className: "space-y-4 text-xs", children: [
        /* @__PURE__ */ jsxs8("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs8("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx8("label", { className: "text-[#888888]", children: "Shade Name:" }),
            /* @__PURE__ */ jsx8(
              "input",
              {
                type: "text",
                required: true,
                placeholder: "e.g. Ruby Red",
                value: name,
                onChange: (e) => setName(e.target.value),
                className: "w-full bg-[#161616] border border-[#333333] rounded px-3 py-2 text-white"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs8("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx8("label", { className: "text-[#888888]", children: "Exact Color:" }),
            /* @__PURE__ */ jsxs8("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx8(
                "input",
                {
                  type: "color",
                  value: hexColor,
                  onChange: (e) => setHexColor(e.target.value),
                  className: "h-9 w-9 rounded border border-[#333333] bg-transparent cursor-pointer"
                }
              ),
              /* @__PURE__ */ jsx8(
                "input",
                {
                  type: "text",
                  required: true,
                  pattern: "^#[0-9A-Fa-f]{6}$",
                  value: hexColor,
                  onChange: (e) => setHexColor(e.target.value),
                  className: "flex-1 bg-[#161616] border border-[#333333] rounded px-3 py-2 text-white font-mono"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs8("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx8("label", { className: "text-[#888888]", children: "Applies To:" }),
          /* @__PURE__ */ jsxs8(
            "select",
            {
              value: region,
              onChange: (e) => setRegion(e.target.value),
              className: "w-full bg-[#161616] border border-[#333333] rounded px-3 py-2 text-white font-mono",
              children: [
                /* @__PURE__ */ jsx8("option", { value: "lip", children: "Lips" }),
                /* @__PURE__ */ jsx8("option", { value: "eye", children: "Eyes" }),
                /* @__PURE__ */ jsx8("option", { value: "cheek", children: "Cheeks" }),
                /* @__PURE__ */ jsx8("option", { value: "skin", children: "Skin / Foundation" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx8("div", { className: "flex justify-end pt-2", children: /* @__PURE__ */ jsxs8(
          "button",
          {
            type: "submit",
            disabled: isSubmitting,
            className: "px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground font-bold rounded disabled:opacity-50 cursor-pointer flex items-center gap-1.5",
            children: [
              isSubmitting ? /* @__PURE__ */ jsx8(Loader24, { className: "h-3.5 w-3.5 animate-spin" }) : null,
              /* @__PURE__ */ jsx8("span", { children: isSubmitting ? editingShade ? "Updating..." : "Saving..." : editingShade ? "Update Shade" : "Save Shade" })
            ]
          }
        ) })
      ] })
    }
  );
};

// src/match/components/MatchManager.tsx
import { jsx as jsx9, jsxs as jsxs9 } from "react/jsx-runtime";
var MatchManager = () => {
  const [activeTab, setActiveTab] = usePersistentState("xg.matchEngine.activeTab", "conflicts");
  const [searchQuery, setSearchQuery] = useState5("");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState5(false);
  const [activeFilters, setActiveFilters] = useState5({});
  const [deleteConfirm, setDeleteConfirm] = useState5({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {
    }
  });
  const [selectedBrand, setSelectedBrand] = usePersistentState("xg.matchEngine.brand", "*");
  const [selectedApp, setSelectedApp] = usePersistentState("xg.matchEngine.application", "*");
  const [conflicts, setConflicts] = useState5([]);
  const [productGroups, setProductGroups] = useState5([]);
  const [products, setProducts] = useState5([]);
  const [shades, setShades] = useState5([]);
  const [shadeProductId, setShadeProductId] = useState5("");
  const [isConflictModalOpen, setIsConflictModalOpen] = useState5(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState5(false);
  const [isShadeModalOpen, setIsShadeModalOpen] = useState5(false);
  const [editingConflict, setEditingConflict] = useState5(null);
  const [editingGroup, setEditingGroup] = useState5(null);
  const [editingShade, setEditingShade] = useState5(null);
  const [simBrand, setSimBrand] = usePersistentState("xg.matchEngine.simulator.brand", "*");
  const [simSkinType, setSimSkinType] = usePersistentState("xg.matchEngine.simulator.skinType", "OSPT");
  const [simSebum, setSimSebum] = usePersistentState("xg.matchEngine.simulator.sebum", 75);
  const [simHydration, setSimHydration] = usePersistentState("xg.matchEngine.simulator.hydration", 40);
  const [simSensitivity, setSimSensitivity] = usePersistentState("xg.matchEngine.simulator.sensitivity", 65);
  const [simPregnant, setSimPregnant] = usePersistentState("xg.matchEngine.simulator.pregnant", false);
  const [simRetinol, setSimRetinol] = usePersistentState("xg.matchEngine.simulator.retinol", true);
  const [isSimulating, setIsSimulating] = useState5(false);
  const [simResult, setSimResult] = usePersistentState("xg.matchEngine.simulator.result", null);
  const loadData = () => {
    conflictsApi.list().then((list2) => {
      if (list2) setConflicts(list2);
    }).catch(() => {
    });
    productGroupsApi.list().then((list2) => {
      if (list2) setProductGroups(list2);
    }).catch(() => {
    });
    productsApi.list().then((list2) => {
      if (list2) {
        setProducts(list2);
        setShadeProductId((prev) => prev || list2[0]?.id || "");
      }
    }).catch(() => {
    });
  };
  const loadShades = (productId) => {
    if (!productId) {
      setShades([]);
      return;
    }
    shadesApi.list(productId).then((list2) => {
      if (list2) setShades(list2);
    }).catch(() => {
    });
  };
  useEffect5(() => {
    loadData();
  }, []);
  useEffect5(() => {
    loadShades(shadeProductId);
  }, [shadeProductId]);
  const matchTabs = [
    { id: "conflicts", label: "Contraindication Matrix", icon: /* @__PURE__ */ jsx9(ShieldAlert3, { className: "h-4 w-4 text-rose-400" }), badge: conflicts.length },
    { id: "groups", label: "Product Groups", icon: /* @__PURE__ */ jsx9(Boxes3, { className: "h-4 w-4 text-amber-400" }), badge: productGroups.length },
    { id: "shades", label: "Shades", icon: /* @__PURE__ */ jsx9(Palette2, { className: "h-4 w-4 text-rose-400" }), badge: shades.length },
    { id: "tryon", label: "Photo Try-On", icon: /* @__PURE__ */ jsx9(Wand22, { className: "h-4 w-4 text-purple-400" }) },
    { id: "simulator", label: "Match Simulator", icon: /* @__PURE__ */ jsx9(Play2, { className: "h-4 w-4 text-emerald-400" }) }
  ];
  const handleSaveConflict = async (data) => {
    if (editingConflict) {
      const updated = { ...editingConflict, ...data };
      setConflicts((prev) => prev.map((x) => x.id === editingConflict.id ? updated : x));
      try {
        await conflictsApi.update(updated);
      } catch {
      }
    } else {
      const newConf = {
        id: `conf-${Date.now()}`,
        brandId: selectedBrand,
        applicationId: selectedApp,
        ...data
      };
      setConflicts((prev) => [newConf, ...prev]);
      try {
        await conflictsApi.create(newConf);
      } catch {
      }
    }
  };
  const handleDeleteConflict = (id) => {
    const conf = conflicts.find((x) => x.id === id);
    setDeleteConfirm({
      isOpen: true,
      title: "Delete Conflict Matrix Rule",
      message: `Are you sure you want to delete ingredient conflict "${conf?.ingredientA} vs ${conf?.ingredientB}"?`,
      onConfirm: async () => {
        setConflicts((prev) => prev.filter((x) => x.id !== id));
        try {
          await conflictsApi.remove(id);
        } catch {
        }
        setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };
  const handleSaveGroup = async (data) => {
    if (editingGroup) {
      const updated = { ...editingGroup, ...data };
      setProductGroups((prev) => prev.map((x) => x.id === editingGroup.id ? updated : x));
      try {
        await productGroupsApi.update(updated);
      } catch {
      }
    } else {
      const newGroup = {
        id: `pgrp-${Date.now()}`,
        ...data
      };
      setProductGroups((prev) => [newGroup, ...prev]);
      try {
        await productGroupsApi.create(newGroup);
      } catch {
      }
    }
  };
  const handleDeleteGroup = (id) => {
    const group = productGroups.find((x) => x.id === id);
    setDeleteConfirm({
      isOpen: true,
      title: "Delete Product Group",
      message: `Are you sure you want to delete product group "${group?.name || id}"? Products relying on this campaign restriction will fall back to the full catalog.`,
      onConfirm: async () => {
        setProductGroups((prev) => prev.filter((x) => x.id !== id));
        try {
          await productGroupsApi.remove(id);
        } catch {
        }
        setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };
  const handleSaveShade = async (data) => {
    if (editingShade) {
      const updated = { ...editingShade, ...data };
      setShades((prev) => prev.map((x) => x.id === editingShade.id ? updated : x));
      try {
        await shadesApi.update(updated);
      } catch {
      }
    } else {
      const newShade = {
        id: `shade-${Date.now()}`,
        ...data
      };
      setShades((prev) => [newShade, ...prev]);
      try {
        await shadesApi.create(newShade);
      } catch {
      }
    }
  };
  const handleDeleteShade = (id) => {
    const shade = shades.find((x) => x.id === id);
    setDeleteConfirm({
      isOpen: true,
      title: "Delete Shade",
      message: `Are you sure you want to delete shade "${shade?.name || id}"?`,
      onConfirm: async () => {
        setShades((prev) => prev.filter((x) => x.id !== id));
        try {
          await shadesApi.remove(id);
        } catch {
        }
        setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };
  const handleRunSimulator = async () => {
    setIsSimulating(true);
    try {
      const payload = {
        brand_id: simBrand,
        application_id: selectedApp,
        dimension_scores: {
          sebum: Number(simSebum),
          hydration: Number(simHydration),
          sensitivity: Number(simSensitivity),
          pigmentation: 45
        },
        skin_profile: simSkinType,
        customer_conditions: {
          is_pregnant: simPregnant,
          uses_retinol: simRetinol
        }
      };
      const data = await runMatch(payload);
      if (data) setSimResult(data);
    } catch {
    } finally {
      setIsSimulating(false);
    }
  };
  return /* @__PURE__ */ jsxs9("div", { className: "flex-1 min-w-0 h-full overflow-y-auto bg-background text-foreground font-sans flex flex-col select-none", children: [
    /* @__PURE__ */ jsx9(
      PageHeader,
      {
        icon: /* @__PURE__ */ jsx9(Sparkles2, { className: "h-5 w-5 text-beak" }),
        breadcrumbs: [
          { label: "Workbench", href: "/" },
          { label: "Core Engines" },
          { label: "Match Engine" }
        ],
        title: "Clinical Product Matcher & Routine Generator",
        children: /* @__PURE__ */ jsx9(
          TabNav,
          {
            tabs: matchTabs,
            activeTab,
            onTabChange: (id) => setActiveTab(id)
          }
        )
      }
    ),
    /* @__PURE__ */ jsxs9("main", { className: "flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto", children: [
      activeTab === "conflicts" && /* @__PURE__ */ jsx9(
        ConflictMatrixTab,
        {
          conflicts,
          searchQuery,
          onSearchChange: setSearchQuery,
          onOpenAddModal: () => {
            setEditingConflict(null);
            setIsConflictModalOpen(true);
          },
          onOpenEditModal: (c) => {
            setEditingConflict(c);
            setIsConflictModalOpen(true);
          },
          onDeleteConflict: handleDeleteConflict,
          selectedBrand,
          setSelectedBrand,
          selectedApp,
          setSelectedApp
        }
      ),
      activeTab === "groups" && /* @__PURE__ */ jsx9(
        ProductGroupsTab,
        {
          groups: productGroups,
          searchQuery,
          onSearchChange: setSearchQuery,
          onOpenAddModal: () => {
            setEditingGroup(null);
            setIsGroupModalOpen(true);
          },
          onOpenEditModal: (g) => {
            setEditingGroup(g);
            setIsGroupModalOpen(true);
          },
          onDeleteGroup: handleDeleteGroup,
          selectedBrand,
          setSelectedBrand,
          selectedApp,
          setSelectedApp
        }
      ),
      activeTab === "shades" && /* @__PURE__ */ jsxs9("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs9("div", { className: "flex items-center gap-2 bg-secondary/40 border border-border rounded-lg px-3 py-2 w-fit", children: [
          /* @__PURE__ */ jsx9("label", { className: "text-xs font-semibold text-muted-foreground", children: "Product:" }),
          /* @__PURE__ */ jsxs9(
            "select",
            {
              value: shadeProductId,
              onChange: (e) => setShadeProductId(e.target.value),
              className: "bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer",
              children: [
                products.length === 0 && /* @__PURE__ */ jsx9("option", { value: "", children: "No products found" }),
                products.map((p) => /* @__PURE__ */ jsx9("option", { value: p.id, children: p.name }, p.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx9(
          ShadesTab,
          {
            shades,
            searchQuery,
            onSearchChange: setSearchQuery,
            onOpenAddModal: () => {
              setEditingShade(null);
              setIsShadeModalOpen(true);
            },
            onOpenEditModal: (s) => {
              setEditingShade(s);
              setIsShadeModalOpen(true);
            },
            onDeleteShade: handleDeleteShade
          }
        )
      ] }),
      activeTab === "tryon" && /* @__PURE__ */ jsx9(PhotoTryOnTab, {}),
      activeTab === "simulator" && /* @__PURE__ */ jsx9(
        MatchSimulatorTab,
        {
          simBrand,
          setSimBrand,
          simSkinType,
          setSimSkinType,
          simSebum,
          setSimSebum,
          simHydration,
          setSimHydration,
          simSensitivity,
          setSimSensitivity,
          simPregnant,
          setSimPregnant,
          simRetinol,
          setSimRetinol,
          onRunSimulator: handleRunSimulator,
          isSimulating,
          simResult
        }
      )
    ] }),
    /* @__PURE__ */ jsx9(
      ConflictRuleModal,
      {
        isOpen: isConflictModalOpen,
        onClose: () => setIsConflictModalOpen(false),
        onSave: handleSaveConflict,
        editingConflict
      }
    ),
    /* @__PURE__ */ jsx9(
      ProductGroupModal,
      {
        isOpen: isGroupModalOpen,
        onClose: () => setIsGroupModalOpen(false),
        onSave: handleSaveGroup,
        editingGroup,
        defaultBrand: selectedBrand
      }
    ),
    /* @__PURE__ */ jsx9(
      ShadeModal,
      {
        isOpen: isShadeModalOpen,
        onClose: () => setIsShadeModalOpen(false),
        onSave: handleSaveShade,
        editingShade,
        productId: shadeProductId
      }
    ),
    /* @__PURE__ */ jsx9(
      ConfirmDialog,
      {
        isOpen: deleteConfirm.isOpen,
        title: deleteConfirm.title,
        message: deleteConfirm.message,
        onConfirm: deleteConfirm.onConfirm,
        onClose: () => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))
      }
    )
  ] });
};
export {
  MatchManager
};
//# sourceMappingURL=index.mjs.map