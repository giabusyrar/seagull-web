'use client';
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  FormManager: () => FormManager,
  FormStudio: () => form_exports,
  MatchManager: () => MatchManager,
  MatchStudio: () => match_exports,
  ReferenceManager: () => ReferenceManager,
  ReferenceStudio: () => reference_exports,
  ScoreManager: () => ScoreManager,
  ScoreStudio: () => score_exports
});
module.exports = __toCommonJS(src_exports);

// src/reference/index.ts
var reference_exports = {};
__export(reference_exports, {
  REFERENCE_ENTITY_CONFIGS: () => REFERENCE_ENTITY_CONFIGS,
  ReferenceEntityDashboard: () => ReferenceEntityDashboard,
  ReferenceFormModal: () => ReferenceFormModal,
  ReferenceManager: () => ReferenceManager,
  ReferenceTable: () => ReferenceTable,
  SearchFilterBar: () => import_shared5.SearchFilterBar
});

// src/reference/components/ReferenceEntityDashboard.tsx
var import_react3 = require("react");
var import_lucide_react4 = require("lucide-react");

// src/reference/config/reference-entity-configs.ts
var REFERENCE_ENTITY_CONFIGS = {
  brands: {
    slug: "brands",
    title: "Brands Master Reference",
    singularTitle: "Brand",
    description: "Manage brand identities and master reference items",
    iconName: "Tag",
    resource: "brands",
    dataKey: "brands",
    fields: [
      { key: "name", label: "Brand Name", type: "text", required: true },
      { key: "code", label: "Brand Code", type: "text" },
      { key: "website", label: "Website URL (e.g. wardahbeauty.com)", type: "text" },
      { key: "colorCode", label: "Color Code (Hex e.g. #10b981)", type: "text" },
      { key: "description", label: "Description", type: "textarea" }
    ]
  },
  products: {
    slug: "products",
    title: "Products Master Reference",
    singularTitle: "Product",
    description: "Manage product catalog items and brand/category associations",
    iconName: "Package",
    resource: "products",
    dataKey: "products",
    fields: [
      { key: "name", label: "Product Name", type: "text", required: true },
      { key: "code", label: "Product Code", type: "text" },
      { key: "brandId", label: "Brand", type: "relation", relationEntity: "brands", required: true },
      // reference-service rejects a product without a category (400), so the
      // form has to offer one — it had no category field at all.
      { key: "categoryId", label: "Category", type: "relation", relationEntity: "categories", required: true },
      { key: "textureId", label: "Texture", type: "relation", relationEntity: "textures" },
      { key: "ingredientIds", label: "Active Ingredients", type: "multi-relation", relationEntity: "ingredients" },
      { key: "imageUrl", label: "Image URL", type: "text" },
      { key: "description", label: "Description", type: "textarea" }
    ]
  },
  categories: {
    slug: "categories",
    title: "Categories Master Reference",
    singularTitle: "Category",
    description: "Product categories a product is filed under",
    iconName: "LayoutGrid",
    resource: "categories",
    dataKey: "categories",
    fields: [
      { key: "name", label: "Category Name", type: "text", required: true },
      // Stored lower-cased by reference-service.
      { key: "code", label: "Category Code", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" }
    ]
  },
  textures: {
    slug: "textures",
    title: "Textures Master Reference",
    singularTitle: "Texture",
    description: "Product textures a product can carry",
    iconName: "Droplet",
    resource: "textures",
    dataKey: "textures",
    fields: [
      { key: "name", label: "Texture Name", type: "text", required: true },
      { key: "code", label: "Texture Code", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" }
    ]
  },
  dimensions: {
    slug: "dimensions",
    title: "Dimensions",
    singularTitle: "Dimension",
    description: "Master assessment metrics and diagnostic domains (MOVE, NUT, SLP, STR, GUT, SKN, sebum, etc.)",
    iconName: "Target",
    resource: "dimensions",
    dataKey: "dimensions",
    fields: [
      { key: "code", label: "Dimension Code (e.g. SLP, sebum)", type: "text", required: true },
      { key: "name", label: "Display Metric Name", type: "text", required: true },
      { key: "description", label: "Clinical Measurement Description", type: "textarea" }
    ]
  },
  conditions: {
    slug: "conditions",
    title: "Customer Conditions (Safety Flags)",
    singularTitle: "Customer Condition",
    description: "Master baseline conditions & zero-tolerance safety flags (is_pregnant, uses_retinol, etc.)",
    iconName: "Tag",
    resource: "conditions",
    dataKey: "conditions",
    fields: [
      { key: "code", label: "Condition Code (e.g. is_pregnant, uses_retinol)", type: "text", required: true },
      { key: "name", label: "Condition Display Name", type: "text", required: true },
      { key: "description", label: "Safety Gatekeeper Description", type: "textarea" }
    ]
  },
  ingredients: {
    slug: "ingredients",
    title: "Ingredients Master Reference",
    singularTitle: "Ingredient",
    description: "Manage skincare actives, botanical extracts, and chemical formulation ingredients",
    iconName: "Sparkles",
    resource: "ingredients",
    dataKey: "ingredients",
    fields: [
      { key: "name", label: "Ingredient Name", type: "text", required: true },
      { key: "code", label: "Ingredient Code", type: "text" },
      { key: "category", label: "Category / Function", type: "text" },
      { key: "description", label: "Description", type: "textarea" }
    ]
  },
  "severity-tier-groups": {
    slug: "severity-tier-groups",
    title: "Severity Tier Groups Reference",
    singularTitle: "Severity Tier Group",
    description: "Master diagnostic classification groups and clinical severity tiers (e.g. Severity Level, Acne Prone Level)",
    iconName: "ShieldAlert",
    resource: "severity-tier-groups",
    dataKey: "severityTierGroups",
    fields: [
      { key: "name", label: "Group Name (e.g. Severity Level, Acne Prone Level)", type: "text", required: true },
      { key: "code", label: "Group Code (e.g. SEVERITY_LEVEL, ACNE_PRONE_LEVEL)", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" }
    ]
  },
  "skin-conditions": {
    slug: "skin-conditions",
    title: "Skin Conditions",
    singularTitle: "Skin Condition",
    description: "Master clinical skin conditions and their target clinical dimension",
    iconName: "ShieldAlert",
    resource: "skin-conditions",
    dataKey: "skinConditions",
    fields: [
      { key: "code", label: "Condition Code (e.g. concern_oiliness)", type: "text", required: true },
      { key: "name", label: "Condition Display Name", type: "text", required: true },
      { key: "dimensionCode", label: "Target Clinical Dimension", type: "relation", relationEntity: "dimensions", required: true },
      { key: "description", label: "Clinical Etiology & Diagnostic Description", type: "textarea" }
    ]
  },
  applications: {
    slug: "applications",
    title: "Experience Applications Reference",
    singularTitle: "Application",
    description: "Master experience client applications, channels, and tenant credentials",
    iconName: "Layers",
    resource: "applications",
    dataKey: "applications",
    fields: [
      { key: "name", label: "Application Name", type: "text", required: true },
      { key: "key", label: "App Key / Slug", type: "text", required: true },
      { key: "channelType", label: "Channel Type", type: "text" },
      { key: "status", label: "Status", type: "text" },
      { key: "description", label: "Description", type: "textarea" }
    ]
  }
};
REFERENCE_ENTITY_CONFIGS["skin-concerns"] = REFERENCE_ENTITY_CONFIGS["skin-conditions"];
REFERENCE_ENTITY_CONFIGS["skin-concern"] = REFERENCE_ENTITY_CONFIGS["skin-conditions"];
REFERENCE_ENTITY_CONFIGS["skin-condition"] = REFERENCE_ENTITY_CONFIGS["skin-conditions"];
REFERENCE_ENTITY_CONFIGS["concerns"] = REFERENCE_ENTITY_CONFIGS["skin-conditions"];
REFERENCE_ENTITY_CONFIGS["concern"] = REFERENCE_ENTITY_CONFIGS["skin-conditions"];
REFERENCE_ENTITY_CONFIGS["severity-tier-group"] = REFERENCE_ENTITY_CONFIGS["severity-tier-groups"];
REFERENCE_ENTITY_CONFIGS["severity-groups"] = REFERENCE_ENTITY_CONFIGS["severity-tier-groups"];
REFERENCE_ENTITY_CONFIGS["severity-group"] = REFERENCE_ENTITY_CONFIGS["severity-tier-groups"];
REFERENCE_ENTITY_CONFIGS["severity-tiers"] = REFERENCE_ENTITY_CONFIGS["severity-tier-groups"];
REFERENCE_ENTITY_CONFIGS["severity-tier"] = REFERENCE_ENTITY_CONFIGS["severity-tier-groups"];
REFERENCE_ENTITY_CONFIGS["severity-levels"] = REFERENCE_ENTITY_CONFIGS["severity-tier-groups"];
REFERENCE_ENTITY_CONFIGS["severity-level"] = REFERENCE_ENTITY_CONFIGS["severity-tier-groups"];
REFERENCE_ENTITY_CONFIGS["dimension"] = REFERENCE_ENTITY_CONFIGS["dimensions"];
REFERENCE_ENTITY_CONFIGS["scoring-dimensions"] = REFERENCE_ENTITY_CONFIGS["dimensions"];
REFERENCE_ENTITY_CONFIGS["condition"] = REFERENCE_ENTITY_CONFIGS["conditions"];
REFERENCE_ENTITY_CONFIGS["customer-conditions"] = REFERENCE_ENTITY_CONFIGS["conditions"];
REFERENCE_ENTITY_CONFIGS["brand"] = REFERENCE_ENTITY_CONFIGS["brands"];
REFERENCE_ENTITY_CONFIGS["product"] = REFERENCE_ENTITY_CONFIGS["products"];
REFERENCE_ENTITY_CONFIGS["ingredient"] = REFERENCE_ENTITY_CONFIGS["ingredients"];
REFERENCE_ENTITY_CONFIGS["active-ingredients"] = REFERENCE_ENTITY_CONFIGS["ingredients"];
REFERENCE_ENTITY_CONFIGS["application"] = REFERENCE_ENTITY_CONFIGS["applications"];

// src/reference/components/ReferenceTable.tsx
var import_lucide_react = require("lucide-react");
var import_shared = require("@gateway-experience/shared");
var import_jsx_runtime = require("react/jsx-runtime");
var ReferenceTable = ({
  config,
  items,
  onEdit,
  onDelete,
  searchQuery = ""
}) => {
  if (items.length === 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_shared.EmptyState,
      {
        title: `No ${config.title.toLowerCase()} found`,
        description: `Click "+ New ${config.singularTitle}" above to create one.`
      }
    );
  }
  const columns = [
    {
      key: "actions",
      header: "Actions",
      align: "left",
      className: "w-16",
      render: (item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-1.5 whitespace-nowrap", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            onClick: () => onEdit(item),
            className: "p-1.5 hover:bg-muted hover:text-amber-600 rounded text-muted-foreground transition cursor-pointer",
            title: `Edit ${config.singularTitle}`,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Edit2, { className: "h-3.5 w-3.5" })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            onClick: () => onDelete(item),
            className: "p-1.5 hover:bg-rose-500/10 hover:text-rose-600 rounded text-muted-foreground transition cursor-pointer",
            title: `Delete ${config.singularTitle}`,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Trash2, { className: "h-3.5 w-3.5" })
          }
        )
      ] })
    },
    {
      key: "name",
      header: "Name",
      render: (item) => {
        if (["brands", "brand"].includes(config.slug)) {
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_shared.BrandTag,
            {
              name: item.name,
              website: item.website,
              colorCode: item.colorCode,
              showWebsiteLink: false
            }
          );
        }
        return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "font-bold text-foreground text-xs truncate max-w-[200px] sm:max-w-none", title: item.name, children: item.name });
      }
    },
    {
      key: "code",
      header: "Code",
      render: (item) => {
        const fallbackPrefixMap = {
          brands: "BRD",
          brand: "BRD",
          products: "PRD",
          product: "PRD",
          ingredients: "ING",
          ingredient: "ING",
          status: "ST"
        };
        const prefix = fallbackPrefixMap[config.slug] || "REF";
        const formattedCode = item.code || item.axisCode || `${prefix}-${(item.name || "ITEM").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12)}`;
        return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-mono text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded tracking-wider whitespace-nowrap", children: formattedCode });
      }
    },
    // Entity Specific: Brands
    ...["brands", "brand"].includes(config.slug) ? [
      {
        key: "website",
        header: "Website",
        render: (item) => {
          const site = item.website;
          const domain = (0, import_shared.getDomainFromUrl)(site);
          if (!site && !domain) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-muted-foreground italic text-[11px]", children: "\u2014" });
          const href = site ? site.startsWith("http") ? site : `https://${site}` : `https://${domain}`;
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "a",
            {
              href,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-amber-600 hover:text-amber-500 hover:underline flex items-center gap-1 font-mono text-[11px] w-fit whitespace-nowrap",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Globe, { className: "h-3 w-3 text-amber-600/80 shrink-0" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: domain || site }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ExternalLink, { className: "h-2.5 w-2.5 opacity-70 shrink-0" })
              ]
            }
          );
        }
      },
      {
        key: "colorCode",
        header: "Color Code",
        render: (item) => {
          const lower = (item.name || "").toLowerCase();
          const defaultHex = lower.includes("wardah") ? "#10b981" : lower.includes("makeover") || lower.includes("make over") ? "#f43f5e" : lower.includes("emina") ? "#ec4899" : lower.includes("kahf") ? "#f59e0b" : lower.includes("biodef") ? "#06b6d4" : lower.includes("somethinc") ? "#8b5cf6" : lower.includes("wonderly") ? "#a855f7" : lower.includes("omg") ? "#f97316" : "#eab308";
          const hex = item.colorCode || defaultHex;
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "flex items-center gap-1.5 font-mono text-[11px] font-bold text-foreground bg-secondary/60 border border-border px-2 py-0.5 rounded w-fit whitespace-nowrap", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-3.5 w-3.5 rounded-full shrink-0 border border-border shadow-xs", style: { backgroundColor: hex } }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: hex })
          ] });
        }
      }
    ] : [],
    // Entity Specific: Products
    ...["products", "product"].includes(config.slug) ? [
      {
        key: "brand",
        header: "Brand",
        render: (item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_shared.BrandTag,
          {
            name: item.brandName || item.brandId || "Unassigned",
            website: item.brandWebsite || item.website,
            showWebsiteLink: true
          }
        )
      }
    ] : [],
    // Entity Specific: Ingredients
    ...["ingredients", "ingredient"].includes(config.slug) ? [
      {
        key: "category",
        header: "Category / Function",
        render: (item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "px-2 py-0.5 bg-purple-500/15 border border-purple-500/40 text-purple-300 text-[10px] font-bold rounded flex items-center gap-1 w-fit whitespace-nowrap", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Sparkles, { className: "h-3 w-3 text-purple-400" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.category || "Active Active" })
        ] })
      }
    ] : [],
    // Entity Specific: Severity Tier Groups & Classification Items
    ...["severity-tier-groups", "severity-tier-group", "severity-tiers", "severity-tier", "severity-groups", "severity-group", "severity-levels", "severity-level"].includes(config.slug) ? [
      {
        key: "items",
        header: "Classification Tiers",
        render: (item) => {
          const tierItems = Array.isArray(item.items) ? item.items : [];
          if (tierItems.length === 0) {
            return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-zinc-600 text-xs italic", children: "No tiers defined" });
          }
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex flex-wrap items-center gap-1.5 max-w-md", children: tierItems.map((t, idx) => {
            const hex = t.colorCode || "#10b981";
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "span",
              {
                style: {
                  backgroundColor: `${hex}18`,
                  borderColor: `${hex}50`,
                  color: hex
                },
                className: "px-2 py-0.5 border text-[10px] font-bold rounded-md flex items-center gap-1 whitespace-nowrap",
                title: t.description || t.code,
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "span",
                    {
                      className: "w-2 h-2 rounded-full shrink-0",
                      style: { backgroundColor: hex }
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.name || t.code })
                ]
              },
              t.id || t.code || idx
            );
          }) });
        }
      },
      {
        key: "tierCount",
        header: "Tiers",
        render: (item) => {
          const count = Array.isArray(item.items) ? item.items.length : 0;
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "font-mono text-[10px] font-bold px-2 py-0.5 bg-secondary/60 border border-border text-amber-600 rounded whitespace-nowrap", children: [
            count,
            " ",
            count === 1 ? "tier" : "tiers"
          ] });
        }
      }
    ] : [],
    // Entity Specific: Skin Conditions
    ...["skin-conditions", "skin-condition", "skin-concerns", "skin-concern", "concerns", "concern"].includes(config.slug) ? [
      {
        key: "dimensionCode",
        header: "Target Dimension",
        render: (item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "px-2 py-0.5 bg-blue-500/15 border border-blue-500/40 text-blue-600 text-[10px] font-bold rounded flex items-center gap-1 w-fit whitespace-nowrap", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Target, { className: "h-3 w-3" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.dimensionCode || item.dimension_code || "sebum" })
        ] })
      }
    ] : [],
    {
      key: "description",
      header: "Description",
      render: (item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-muted-foreground text-xs leading-relaxed max-w-sm sm:max-w-md line-clamp-2 block", title: item.description, children: item.description || /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "italic", children: "No description" }) })
    },
    {
      key: "createdAt",
      header: "Created At",
      className: "hidden md:table-cell w-28",
      render: (item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-muted-foreground font-mono text-[11px] whitespace-nowrap", children: item.createdAt && !item.createdAt.startsWith("0001") ? new Date(item.createdAt).toLocaleDateString() : "\u2014" })
    }
  ];
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_shared.DataTable, { columns, data: items, keyField: "id" });
};

// src/reference/components/ReferenceFormModal.tsx
var import_react = require("react");
var import_lucide_react2 = require("lucide-react");
var import_shared2 = require("@gateway-experience/shared");

// src/reference/api.ts
function entityListFrom(data, config) {
  const rawList = data.data || (config.dataKey ? data[config.dataKey] : null) || (config.slug ? data[config.slug] : null) || data.items || data.brands || data.products || data.ingredients || data.eventTypes || data.reference || [];
  return Array.isArray(rawList) ? rawList : [];
}
async function listEntityItems(apiEndpoint, config) {
  const res = await fetch(apiEndpoint, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch reference items");
  return entityListFrom(await res.json(), config);
}
async function saveEntityItem(apiEndpoint, payload, isEdit) {
  const res = await fetch(apiEndpoint, {
    method: isEdit ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to ${isEdit ? "update" : "create"} item`);
  }
}
async function deleteEntityItem(apiEndpoint, id) {
  const url = apiEndpoint.includes("?") ? `${apiEndpoint}&id=${id}` : `${apiEndpoint}?id=${id}`;
  let res = await fetch(url, { method: "DELETE" });
  if (!res.ok) {
    res = await fetch(`${apiEndpoint}/${id}`, { method: "DELETE" });
  }
  if (!res.ok) throw new Error("Failed to delete item");
}
async function listRelationOptions(routes, entity) {
  const data = await (await fetch(routes.reference(entity))).json();
  const list2 = data.data || data[entity] || data.dimensions || data.items || data.brands || data.products || data.ingredients || [];
  return data.success && Array.isArray(list2) ? list2 : null;
}

// src/reference/components/ReferenceFormModal.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var ReferenceFormModal = ({
  isOpen,
  config,
  initialData,
  onClose,
  onSave
}) => {
  const hostRoutes = (0, import_shared2.useHostRoutes)();
  const [formData, setFormData] = (0, import_react.useState)({});
  const [relationOptions, setRelationOptions] = (0, import_react.useState)({});
  const [isSubmitting, setIsSubmitting] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    if (isOpen) {
      const initial = { ...initialData || {} };
      config.fields.forEach((f) => {
        if ((f.type === "text" || f.type === "textarea") && Array.isArray(initial[f.key])) {
          initial[f.key] = initial[f.key].join(", ");
        }
      });
      setFormData(initial);
      setError(null);
      config.fields.forEach(async (field2) => {
        if ((field2.type === "relation" || field2.type === "multi-relation") && field2.relationEntity) {
          try {
            const list2 = await listRelationOptions(hostRoutes, field2.relationEntity);
            if (list2) {
              setRelationOptions((prev) => ({ ...prev, [field2.relationEntity]: list2 }));
            }
          } catch {
          }
        }
      });
    }
  }, [isOpen, initialData, config, hostRoutes]);
  if (!isOpen) return null;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = { ...formData };
      config.fields.forEach((f) => {
        if (f.type === "number" || ["minScore", "maxScore", "weight", "orderIndex"].includes(f.key)) {
          const raw = payload[f.key];
          if (raw !== void 0 && raw !== null && raw !== "") {
            const num = Number(raw);
            payload[f.key] = isNaN(num) ? 0 : num;
          } else if (f.key === "maxScore") {
            payload[f.key] = 100;
          } else if (f.key === "minScore" || f.key === "weight" || f.key === "orderIndex") {
            payload[f.key] = 0;
          }
        }
        if (f.isCsvArray && typeof payload[f.key] === "string") {
          payload[f.key] = payload[f.key].split(",").map((s) => s.trim()).filter((s) => s.length > 0);
        }
      });
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err?.message || "Failed to save item");
    } finally {
      setIsSubmitting(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    import_shared2.Modal,
    {
      isOpen,
      onClose,
      size: "lg",
      title: initialData ? `Edit ${config.singularTitle}` : `New ${config.singularTitle}`,
      isLoading: isSubmitting,
      loadingText: isSubmitting ? initialData ? `Updating ${config.singularTitle}...` : `Saving ${config.singularTitle}...` : void 0,
      children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-4 pb-12 relative", children: [
        error && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded text-xs", children: error }),
        config.fields.map((field2, idx) => {
          const zIndexVal = (config.fields.length - idx) * 10;
          return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { zIndex: zIndexVal }, className: "space-y-1.5 relative", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: "block text-muted-foreground font-medium", children: [
              field2.label,
              " ",
              field2.required && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-amber-500", children: "*" })
            ] }),
            field2.type === "number" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "input",
              {
                type: "number",
                required: field2.required,
                value: formData[field2.key] ?? "",
                onChange: (e) => {
                  const val = e.target.value === "" ? "" : Number(e.target.value);
                  setFormData({ ...formData, [field2.key]: val });
                },
                className: "w-full h-9 bg-background border border-border rounded-lg px-3 text-foreground outline-none focus:border-ring transition font-mono"
              }
            ),
            field2.type === "text" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "input",
              {
                type: "text",
                required: field2.required,
                value: formData[field2.key] ?? "",
                onChange: (e) => setFormData({ ...formData, [field2.key]: e.target.value }),
                className: "w-full h-9 bg-background border border-border rounded-lg px-3 text-foreground outline-none focus:border-ring transition"
              }
            ),
            field2.type === "textarea" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "textarea",
              {
                rows: 3,
                value: formData[field2.key] || "",
                onChange: (e) => setFormData({ ...formData, [field2.key]: e.target.value }),
                className: "w-full bg-background border border-border rounded-lg p-2.5 text-foreground outline-none focus:border-ring transition"
              }
            ),
            field2.type === "select" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "select",
              {
                value: formData[field2.key] || field2.options?.[0]?.value || "",
                onChange: (e) => setFormData({ ...formData, [field2.key]: e.target.value }),
                className: "w-full h-9 bg-background border border-border rounded-lg px-3 text-foreground outline-none focus:border-ring transition cursor-pointer",
                children: field2.options?.map((opt2) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: opt2.value, children: opt2.label }, opt2.value))
              }
            ),
            field2.type === "relation" && field2.relationEntity && (() => {
              const opts = relationOptions[field2.relationEntity] || [];
              const isCodeBased = field2.relationEntity === "dimensions";
              const isDimensionRelation = field2.relationEntity === "dimensions";
              const currentVal = (() => {
                const direct = formData[field2.key];
                if (direct) {
                  const found = opts.find((o) => (isCodeBased ? o.code === direct : o.id === direct) || o.id === direct || o.name === direct);
                  if (found) return isCodeBased && found.code ? found.code : found.id;
                }
                if (field2.key === "brandId") {
                  const found = opts.find((o) => o.id === formData.brandId || o.name === formData.brandName);
                  if (found) return found.id;
                }
                return direct || "";
              })();
              return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                import_shared2.SearchableSelect,
                {
                  options: opts.map((opt2) => ({
                    value: isCodeBased && opt2.code ? opt2.code : opt2.id,
                    label: isCodeBased && opt2.code ? `${opt2.name} (${opt2.code})` : opt2.name
                  })),
                  value: currentVal,
                  onChange: (val) => setFormData({ ...formData, [field2.key]: val }),
                  placeholder: `-- Select ${field2.label} --`,
                  searchPlaceholder: `Search ${field2.label.toLowerCase()}...`
                }
              );
            })(),
            field2.type === "multi-relation" && field2.relationEntity && (() => {
              const opts = relationOptions[field2.relationEntity] || [];
              const isCodeBased = field2.relationEntity === "dimensions";
              const rawVal = formData[field2.key] ?? (formData["ingredientIds"] || []);
              const selectedValues = Array.isArray(rawVal) ? rawVal.map((v) => {
                if (typeof v === "string") {
                  const found = opts.find((o) => (isCodeBased ? o.code === v : o.id === v) || o.id === v || o.name === v);
                  return found ? isCodeBased && found.code ? found.code : found.id : v;
                }
                return isCodeBased && v?.code ? v.code : v?.id || v?.ingredientId;
              }).filter(Boolean) : typeof rawVal === "string" && rawVal ? [rawVal] : [];
              return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                import_shared2.SearchableSelect,
                {
                  multiple: true,
                  options: opts.map((opt2) => ({
                    value: isCodeBased && opt2.code ? opt2.code : opt2.id,
                    label: isCodeBased && opt2.code ? `${opt2.name} (${opt2.code})` : opt2.name
                  })),
                  value: selectedValues,
                  onChange: (vals) => {
                    const updated = { ...formData, [field2.key]: vals };
                    if (field2.key === "ingredientIds") updated.ingredientIds = vals;
                    setFormData(updated);
                  },
                  placeholder: `-- Select ${field2.label} --`,
                  searchPlaceholder: `Search ${field2.label.toLowerCase()}...`
                }
              );
            })()
          ] }, field2.key);
        }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "pt-3 flex items-center justify-end border-t border-border shrink-0", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
          "button",
          {
            type: "submit",
            disabled: isSubmitting,
            className: "px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-sm",
            children: [
              isSubmitting ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_lucide_react2.Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_lucide_react2.Save, { className: "h-3.5 w-3.5" }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: isSubmitting ? initialData ? "Updating..." : "Saving..." : initialData ? "Update Item" : "Save Item" })
            ]
          }
        ) })
      ] })
    }
  );
};

// src/reference/components/SeverityTierGroupModal.tsx
var import_react2 = require("react");
var import_lucide_react3 = require("lucide-react");
var import_shared3 = require("@gateway-experience/shared");
var import_jsx_runtime3 = require("react/jsx-runtime");
var PRESET_COLORS = [
  "#10b981",
  // Emerald
  "#38bdf8",
  // Sky
  "#3b82f6",
  // Blue
  "#8b5cf6",
  // Purple
  "#f59e0b",
  // Amber
  "#f97316",
  // Orange
  "#ef4444",
  // Red
  "#f43f5e",
  // Rose
  "#ec4899",
  // Pink
  "#06b6d4"
  // Cyan
];
var SeverityTierGroupModal = ({
  isOpen,
  initialData,
  onClose,
  onSave
}) => {
  const [code, setCode] = (0, import_react2.useState)("");
  const [name, setName] = (0, import_react2.useState)("");
  const [description, setDescription] = (0, import_react2.useState)("");
  const [items, setItems] = (0, import_react2.useState)([]);
  const [isSubmitting, setIsSubmitting] = (0, import_react2.useState)(false);
  const [error, setError] = (0, import_react2.useState)(null);
  (0, import_react2.useEffect)(() => {
    if (isOpen) {
      if (initialData) {
        setCode(initialData.code || "");
        setName(initialData.name || "");
        setDescription(initialData.description || "");
        setItems(Array.isArray(initialData.items) ? initialData.items : []);
      } else {
        setCode("");
        setName("");
        setDescription("");
        setItems([
          {
            code: "TIER_1",
            name: "Tier 1",
            orderIndex: 1,
            colorCode: "#10b981",
            description: ""
          }
        ]);
      }
      setError(null);
    }
  }, [isOpen, initialData]);
  if (!isOpen) return null;
  const handleNameChange = (val) => {
    setName(val);
    if (!initialData) {
      setCode(val.toUpperCase().replace(/[^A-Z0-9]/g, "_").slice(0, 40));
    }
  };
  const handleAddItem = () => {
    const nextIdx = items.length + 1;
    const fallbackColor = PRESET_COLORS[(nextIdx - 1) % PRESET_COLORS.length];
    setItems((prev) => [
      ...prev,
      {
        code: `TIER_${nextIdx}`,
        name: `Tier ${nextIdx}`,
        orderIndex: nextIdx,
        colorCode: fallbackColor,
        description: ""
      }
    ]);
  };
  const handleUpdateItem = (index, field2, value) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field2]: value };
      if (field2 === "name" && !initialData && (!next[index].code || next[index].code.startsWith("TIER_"))) {
        next[index].code = String(value).toUpperCase().replace(/[^A-Z0-9]/g, "_").slice(0, 30);
      }
      return next;
    });
  };
  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError("Group Name and Code are required.");
      return;
    }
    if (items.length === 0) {
      setError("Please add at least one classification tier item.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...initialData?.id ? { id: initialData.id } : {},
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description.trim(),
        items: items.map((it, idx) => ({
          ...it,
          orderIndex: idx + 1,
          code: (it.code || it.name).trim().toUpperCase().replace(/[^A-Z0-9]/g, "_"),
          name: it.name.trim(),
          colorCode: it.colorCode || "#10b981",
          description: (it.description || "").trim()
        }))
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err?.message || "Failed to save Severity Tier Group");
    } finally {
      setIsSubmitting(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    import_shared3.Modal,
    {
      isOpen,
      onClose,
      size: "3xl",
      icon: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.ShieldAlert, { className: "h-5 w-5 text-amber-400" }),
      title: initialData ? `Edit Classification Group (${code})` : "New Severity Classification Group",
      subtitle: "Define a diagnostic group (e.g. Severity Level, Acne Prone Level) and configure its classification tier items.",
      isLoading: isSubmitting,
      loadingText: isSubmitting ? initialData ? "Updating Classification Group..." : "Creating Classification Group..." : void 0,
      children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-4 text-xs", children: [
        error && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded text-xs font-semibold", children: error }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 bg-secondary/40 p-3.5 rounded-xl border border-border", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "space-y-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { className: "text-muted-foreground font-bold", children: [
              "Group Display Name ",
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-amber-500", children: "*" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "input",
              {
                type: "text",
                required: true,
                placeholder: "e.g. Acne Prone Level, Severity Level",
                value: name,
                onChange: (e) => handleNameChange(e.target.value),
                className: "w-full bg-background border border-border focus:border-ring rounded-lg px-3 py-2 text-foreground outline-none"
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "space-y-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { className: "text-muted-foreground font-bold", children: [
              "Group Code ",
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-amber-500", children: "*" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "input",
              {
                type: "text",
                required: true,
                placeholder: "e.g. ACNE_PRONE_LEVEL, SEVERITY_LEVEL",
                value: code,
                onChange: (e) => setCode(e.target.value.toUpperCase()),
                className: "w-full bg-background border border-border focus:border-ring rounded-lg px-3 py-2 text-foreground font-mono uppercase font-bold outline-none"
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "col-span-1 sm:col-span-2 space-y-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "text-muted-foreground font-bold", children: "Clinical / Operational Description" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "textarea",
              {
                rows: 2,
                placeholder: "e.g. Multi-tier classification for diagnosing inflammatory lesion reactivity & tolerance",
                value: description,
                onChange: (e) => setDescription(e.target.value),
                className: "w-full bg-background border border-border focus:border-ring rounded-lg p-2.5 text-foreground outline-none resize-none"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "space-y-2.5 pt-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-foreground font-bold flex items-center gap-1.5 text-xs", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Layers, { className: "h-4 w-4 text-amber-500" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { children: [
                "Classification Tier Items (",
                items.length,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
              "button",
              {
                type: "button",
                onClick: handleAddItem,
                className: "px-2.5 py-1 bg-secondary hover:bg-accent border border-border text-amber-600 hover:text-foreground rounded-lg flex items-center gap-1.5 font-semibold text-xs transition cursor-pointer",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Plus, { className: "h-3.5 w-3.5" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: "Add Tier Item" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            "div",
            {
              style: {
                display: "grid",
                gridTemplateColumns: "48px 1fr 140px 120px 40px",
                gap: "8px",
                alignItems: "center"
              },
              className: "px-3 py-1.5 bg-secondary/40 border border-border rounded-lg text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "text-center", children: "#" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { children: "Display Name" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { children: "Code" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "text-center", children: "Badge Color" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "text-center", children: "Act" })
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "space-y-2 max-h-64 overflow-y-auto pr-1", children: items.map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            "div",
            {
              style: {
                display: "grid",
                gridTemplateColumns: "48px 1fr 140px 120px 40px",
                gap: "8px",
                alignItems: "center"
              },
              className: "bg-card hover:bg-accent/50 border border-border hover:border-ring/40 p-2 rounded-lg transition",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "text-center font-mono font-bold text-amber-600 bg-secondary/60 border border-border rounded py-1", children: [
                  "#",
                  idx + 1
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "input",
                  {
                    type: "text",
                    required: true,
                    placeholder: "e.g. Sensitive Stinger",
                    value: item.name,
                    onChange: (e) => handleUpdateItem(idx, "name", e.target.value),
                    className: "w-full bg-background border border-border focus:border-ring rounded px-2.5 py-1 text-foreground text-xs outline-none"
                  }
                ) }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "input",
                  {
                    type: "text",
                    required: true,
                    placeholder: "CODE",
                    value: item.code,
                    onChange: (e) => handleUpdateItem(idx, "code", e.target.value.toUpperCase()),
                    className: "w-full bg-background border border-border focus:border-ring rounded px-2 py-1 text-purple-600 font-mono uppercase font-bold text-xs outline-none"
                  }
                ) }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-1.5 justify-center", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                    "input",
                    {
                      type: "color",
                      value: item.colorCode || "#10b981",
                      onChange: (e) => handleUpdateItem(idx, "colorCode", e.target.value),
                      className: "w-6 h-6 rounded border border-border cursor-pointer bg-transparent shrink-0",
                      title: "Choose Badge Color"
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                    "input",
                    {
                      type: "text",
                      value: item.colorCode || "#10b981",
                      onChange: (e) => handleUpdateItem(idx, "colorCode", e.target.value),
                      className: "w-16 bg-background border border-border rounded px-1.5 py-1 text-[11px] font-mono text-foreground outline-none"
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "text-center", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "button",
                  {
                    type: "button",
                    disabled: items.length <= 1,
                    onClick: () => handleRemoveItem(idx),
                    className: "p-1 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 disabled:opacity-30 rounded transition cursor-pointer",
                    title: items.length <= 1 ? "Minimum 1 tier required" : "Remove Tier",
                    children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Trash2, { className: "h-3.5 w-3.5" })
                  }
                ) })
              ]
            },
            idx
          )) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "pt-3 flex items-center justify-end border-t border-border", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "button",
          {
            type: "submit",
            disabled: isSubmitting,
            className: "px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-md",
            children: [
              isSubmitting ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Save, { className: "h-4 w-4" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: isSubmitting ? initialData ? "Updating..." : "Creating..." : initialData ? "Update Group" : "Create Group" })
            ]
          }
        ) })
      ] })
    }
  );
};

// src/reference/components/ReferenceEntityDashboard.tsx
var import_shared4 = require("@gateway-experience/shared");
var import_jsx_runtime4 = require("react/jsx-runtime");
var ReferenceEntityDashboard = ({ slug }) => {
  const [activeSlug, setActiveSlug] = (0, import_react3.useState)(slug);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = (0, import_react3.useState)(false);
  const [activeFilters, setActiveFilters] = (0, import_react3.useState)({});
  (0, import_react3.useEffect)(() => {
    setActiveSlug(slug);
  }, [slug]);
  const config = REFERENCE_ENTITY_CONFIGS[activeSlug] || REFERENCE_ENTITY_CONFIGS["brands"];
  const hostRoutes = (0, import_shared4.useHostRoutes)();
  const apiEndpoint = hostRoutes.reference(config.resource);
  const [items, setItems] = (0, import_react3.useState)([]);
  const [loading, setLoading] = (0, import_react3.useState)(true);
  const [searchQuery, setSearchQuery] = (0, import_react3.useState)("");
  const [searchColumn, setSearchColumn] = (0, import_react3.useState)("all");
  const [filterOption, setFilterOption] = (0, import_react3.useState)("all");
  const [currentPage, setCurrentPage] = (0, import_react3.useState)(1);
  const [pageSize, setPageSize] = (0, import_react3.useState)(10);
  const [isModalOpen, setIsModalOpen] = (0, import_react3.useState)(false);
  const [editingItem, setEditingItem] = (0, import_react3.useState)(null);
  const [deleteConfig, setDeleteConfig] = (0, import_react3.useState)({
    isOpen: false,
    item: null,
    isDeleting: false
  });
  (0, import_react3.useEffect)(() => {
    setSearchColumn("all");
    setFilterOption("all");
    setActiveFilters({});
    setCurrentPage(1);
  }, [activeSlug]);
  (0, import_react3.useEffect)(() => {
    setCurrentPage(1);
  }, [searchQuery, searchColumn, filterOption]);
  const columnOptions = (0, import_react3.useMemo)(() => {
    const opts = [
      { value: "all", label: "All Columns" },
      { value: "name", label: "Name" },
      { value: "code", label: "Code" }
    ];
    if (config.slug === "products") {
      opts.push(
        { value: "brand", label: "Brand" },
        { value: "ingredients", label: "Ingredients" }
      );
    } else if (config.slug === "ingredients") {
      opts.push({ value: "category", label: "Category / Function" });
    } else if (["severity-tiers", "severity-tier", "severity-levels"].includes(config.slug)) {
      opts.push({ value: "group", label: "Tier Group / Category" });
    } else if (config.slug === "brands") {
      opts.push(
        { value: "website", label: "Website" },
        { value: "colorCode", label: "Color Code" }
      );
    }
    opts.push({ value: "description", label: "Description" });
    return opts;
  }, [config.slug]);
  const brandOptions = (0, import_react3.useMemo)(() => {
    const brands = Array.from(
      new Set(
        (items || []).map((i) => i.brandName || i.brandId).filter((b) => typeof b === "string" && b.trim().length > 0)
      )
    );
    return brands.map((b) => ({ value: b, label: b }));
  }, [items]);
  const fetchItems = (0, import_react3.useCallback)(async () => {
    setLoading(true);
    try {
      setItems(await listEntityItems(apiEndpoint, config));
    } catch (err) {
      console.error("Fetch items error:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, config]);
  (0, import_react3.useEffect)(() => {
    fetchItems();
  }, [fetchItems]);
  const handleSave = async (formData) => {
    try {
      const isEdit = !!editingItem;
      const payload = isEdit ? { ...editingItem, ...formData, id: editingItem.id } : formData;
      await saveEntityItem(apiEndpoint, payload, isEdit);
      await fetchItems();
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      alert(err.message || "Operation failed");
    }
  };
  const handleRequestDelete = (target) => {
    setDeleteConfig({
      isOpen: true,
      item: target,
      isDeleting: false
    });
  };
  const handleConfirmDelete = async () => {
    const target = deleteConfig.item;
    if (!target) return;
    const targetId = typeof target === "object" && target !== null ? target.id : target;
    if (!targetId || typeof targetId !== "string") return;
    setDeleteConfig((prev) => ({ ...prev, isDeleting: true }));
    try {
      await deleteEntityItem(apiEndpoint, targetId);
      await fetchItems();
      setDeleteConfig({ isOpen: false, item: null, isDeleting: false });
    } catch (err) {
      alert(err.message || "Delete failed");
      setDeleteConfig((prev) => ({ ...prev, isDeleting: false }));
    }
  };
  const filterItemList = (0, import_react3.useCallback)(
    (sourceItems, q, targetCol, filterObj) => {
      const normalizedQ = q.toLowerCase().trim();
      return sourceItems.filter((item) => {
        if (normalizedQ) {
          if (targetCol === "name") {
            const val = (item.name || item.title || "").toLowerCase();
            if (!val.includes(normalizedQ)) return false;
          } else if (targetCol === "code") {
            const val = (item.code || "").toLowerCase();
            if (!val.includes(normalizedQ)) return false;
          } else if (targetCol === "brand") {
            const val = (item.brandName || item.brandId || "").toLowerCase();
            if (!val.includes(normalizedQ)) return false;
          } else if (targetCol === "group") {
            const val = (item.group || item.category || "").toLowerCase();
            if (!val.includes(normalizedQ)) return false;
          } else if (targetCol === "ingredients") {
            const ingList = Array.isArray(item.ingredientNames) ? item.ingredientNames.join(" ") : "";
            if (!ingList.toLowerCase().includes(normalizedQ)) return false;
          } else if (targetCol === "description") {
            const val = (item.description || "").toLowerCase();
            if (!val.includes(normalizedQ)) return false;
          } else {
            const nameMatch = (item.name || item.title || "").toLowerCase().includes(normalizedQ);
            const codeMatch = (item.code || "").toLowerCase().includes(normalizedQ);
            const slugMatch = (item.slug || "").toLowerCase().includes(normalizedQ);
            const groupMatch = (item.group || "").toLowerCase().includes(normalizedQ);
            const brandMatch = (item.brandName || item.brandId || "").toLowerCase().includes(normalizedQ);
            const descMatch = (item.description || "").toLowerCase().includes(normalizedQ);
            if (!nameMatch && !codeMatch && !slugMatch && !groupMatch && !brandMatch && !descMatch) {
              return false;
            }
          }
        }
        if (Array.isArray(filterObj.brands) && filterObj.brands.length > 0) {
          const itemBrand = item.brandName || item.brandId || "";
          if (!filterObj.brands.includes(itemBrand)) return false;
        }
        return true;
      });
    },
    []
  );
  const safeItems = Array.isArray(items) ? items : [];
  const filteredItems = (0, import_react3.useMemo)(
    () => filterItemList(safeItems, searchQuery, searchColumn, activeFilters),
    [filterItemList, safeItems, searchQuery, searchColumn, activeFilters]
  );
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex-1 min-w-0 h-full overflow-y-auto bg-background text-foreground font-sans flex flex-col select-none", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      import_shared4.PageHeader,
      {
        icon: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react4.Database, { className: "h-5 w-5 text-beak" }),
        breadcrumbs: [
          { label: "Workbench", href: "/" },
          { label: "Reference Data" },
          { label: config.title }
        ],
        title: config.title,
        description: config.description
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("main", { className: "flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto flex flex-col", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        import_shared4.SearchFilterBar,
        {
          searchQuery,
          onSearchChange: setSearchQuery,
          searchPlaceholder: `Search ${config.title.toLowerCase()}...`,
          searchColumn,
          onSearchColumnChange: setSearchColumn,
          columnOptions,
          onOpenFilterPanel: config.slug === "products" ? () => setIsFilterPanelOpen(true) : void 0,
          activeFilterCount: Object.keys(activeFilters).filter((k) => activeFilters[k] && activeFilters[k] !== "all").length,
          onRefresh: fetchItems,
          isLoading: loading,
          actionLabel: `New ${config.singularTitle}`,
          onAction: () => {
            setEditingItem(null);
            setIsModalOpen(true);
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "w-full", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        ReferenceTable,
        {
          config,
          items: paginatedItems,
          searchQuery,
          onEdit: (item) => {
            setEditingItem(item);
            setIsModalOpen(true);
          },
          onDelete: handleRequestDelete
        }
      ) }),
      !loading && totalItems > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "pt-2", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        import_shared4.Pagination,
        {
          currentPage,
          totalPages,
          totalItems,
          pageSize,
          onPageChange: (page) => setCurrentPage(page),
          onPageSizeChange: (newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }
        }
      ) })
    ] }),
    ["severity-tier-groups", "severity-tier-group", "severity-tiers", "severity-tier", "severity-groups", "severity-group"].includes(config.slug) ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      SeverityTierGroupModal,
      {
        isOpen: isModalOpen,
        initialData: editingItem,
        onClose: () => {
          setIsModalOpen(false);
          setEditingItem(null);
        },
        onSave: handleSave
      }
    ) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      ReferenceFormModal,
      {
        isOpen: isModalOpen,
        config,
        initialData: editingItem,
        onClose: () => {
          setIsModalOpen(false);
          setEditingItem(null);
        },
        onSave: handleSave
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      import_shared4.ConfirmDialog,
      {
        isOpen: deleteConfig.isOpen,
        onClose: () => setDeleteConfig({ isOpen: false, item: null, isDeleting: false }),
        onConfirm: handleConfirmDelete,
        title: `Delete ${config.singularTitle}`,
        message: `Are you sure you want to delete ${deleteConfig.item?.name ? `"${deleteConfig.item.name}"` : "this item"}? This action cannot be undone.`,
        confirmLabel: "Delete",
        isDestructive: true,
        isLoading: deleteConfig.isDeleting
      }
    ),
    config.slug !== "brands" && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      import_shared4.FilterPanel,
      {
        isOpen: isFilterPanelOpen,
        onClose: () => setIsFilterPanelOpen(false),
        title: `Filter ${config.title}`,
        sections: [
          ...brandOptions.length > 0 ? [
            {
              id: "brands",
              label: "Brand",
              type: "select",
              isMultiSelect: true,
              options: brandOptions,
              searchPlaceholder: "Search brand..."
            }
          ] : [],
          {
            id: "searchColumn",
            label: "Search Target Column",
            type: "select",
            isMultiSelect: false,
            options: columnOptions,
            searchPlaceholder: "Select column..."
          }
        ],
        initialFilters: {
          searchColumn,
          ...activeFilters
        },
        onApply: (filters) => {
          setActiveFilters(filters);
          if (filters.searchColumn) setSearchColumn(filters.searchColumn);
        },
        onReset: () => {
          setActiveFilters({});
          setSearchColumn("all");
        },
        resultCount: (draftFilters) => {
          const draftSearchCol = draftFilters.searchColumn || searchColumn;
          return filterItemList(safeItems, searchQuery, draftSearchCol, draftFilters).length;
        }
      }
    )
  ] });
};

// src/reference/components/ReferenceManager.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
var ReferenceManager = ({ initialEntity = "brands" }) => {
  const slugMap = {
    brand: "brands",
    brands: "brands",
    product: "products",
    products: "products",
    "event-type": "event-types",
    "event-types": "event-types",
    ingredient: "ingredients",
    ingredients: "ingredients",
    dimension: "dimensions",
    dimensions: "dimensions",
    "scoring-dimension": "dimensions",
    "scoring-dimensions": "dimensions",
    condition: "conditions",
    conditions: "conditions",
    "customer-condition": "conditions",
    "customer-conditions": "conditions",
    "skin-concern": "skin-conditions",
    "skin-concerns": "skin-conditions",
    "skin-condition": "skin-conditions",
    "skin-conditions": "skin-conditions",
    concern: "skin-conditions",
    concerns: "skin-conditions"
  };
  const slug = slugMap[initialEntity] || initialEntity || "brands";
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(ReferenceEntityDashboard, { slug });
};

// src/reference/index.ts
var import_shared5 = require("@gateway-experience/shared");

// src/form/index.ts
var form_exports = {};
__export(form_exports, {
  BUILTIN_TEMPLATES: () => BUILTIN_TEMPLATES,
  CALCULATION_METHODS: () => CALCULATION_METHODS,
  FALLBACK_DIMENSIONS: () => FALLBACK_DIMENSIONS,
  FormManager: () => FormManager,
  PFORM_EXAMPLE: () => PFORM_EXAMPLE,
  PFORM_SUGGESTED_DIMENSIONS: () => PFORM_SUGGESTED_DIMENSIONS,
  PIXIE_OMG_SKIN_ANALYZER: () => PIXIE_OMG_SKIN_ANALYZER,
  QuestionnaireRunner: () => QuestionnaireRunner,
  applyCalculationMethod: () => applyCalculationMethod,
  applyDimensionMapping: () => applyDimensionMapping,
  buildScoreRequest: () => buildScoreRequest,
  createSafetyFlag: () => createSafetyFlag,
  deleteQuestionnaire: () => deleteQuestionnaire,
  flattenElements: () => flattenElements,
  fromPFormSchema: () => fromPFormSchema,
  fromSurveyModel: () => fromSurveyModel,
  getDimensionMeta: () => getDimensionMeta,
  getDimensions: () => getDimensions,
  getQuestionnaire: () => getQuestionnaire,
  getQuestionnaireModel: () => getQuestionnaireModel,
  getSafetyFlags: () => getSafetyFlags,
  listQuestionnaires: () => listQuestionnaires,
  saveQuestionnaire: () => saveQuestionnaire,
  scoreSurveyAnswers: () => scoreSurveyAnswers,
  toSurveyModel: () => toSurveyModel
});

// src/form/components/FormManager.tsx
var import_react7 = require("react");
var import_lucide_react8 = require("lucide-react");
var import_shared9 = require("@gateway-experience/shared");

// src/form/components/tabs/QuestionnairesTab.tsx
var import_react4 = require("react");
var import_lucide_react5 = require("lucide-react");
var import_shared6 = require("@gateway-experience/shared");

// src/form/catalog.ts
var FALLBACK_DIMENSIONS = [
  { code: "sebum", label: "Sebum / Oiliness", purpose: "How oily or dry the skin is." },
  { code: "sensitivity", label: "Sensitivity / Redness", purpose: "How reactive the skin is to products and environment." },
  { code: "pigmentation", label: "Pigment Level", purpose: "How much uneven pigment or dark spots are present." },
  { code: "dark_spot", label: "Dark Spot Tendency", purpose: "Whether the skin scars or darkens easily." },
  { code: "pores", label: "Pores / Texture", purpose: "How visible pores are and how rough the skin feels." },
  { code: "acne", label: "Acne", purpose: "Presence and severity of active breakouts." },
  { code: "wrinkle", label: "Wrinkles / Fine Lines", purpose: "Visible ageing signs such as fine lines." }
];
var getDimensionMeta = (code, extra = []) => [...extra, ...FALLBACK_DIMENSIONS].find((d) => d.code === code) || {
  code,
  label: code,
  purpose: "Measure this aspect of the skin."
};
var CALCULATION_METHODS = [
  { value: "sum", label: "Sum", hint: "Add every answer score together." },
  { value: "average", label: "Average", hint: "Total divided by the number of answered questions." },
  { value: "max", label: "Highest", hint: "Take the single highest answer score." },
  { value: "min", label: "Lowest", hint: "Take the single lowest answer score." },
  { value: "boolean_or", label: "Boolean OR", hint: "Any answer scores above 0 \u2192 100, otherwise 0." },
  { value: "boolean_and", label: "Boolean AND", hint: "All answers score above 0 \u2192 100, otherwise 0." }
];
var applyCalculationMethod = (scores, method = "sum") => {
  const clamp = (n) => Math.max(0, Math.min(100, n));
  const total = scores.reduce((a, b) => a + b, 0);
  switch (method) {
    case "average":
      return clamp(scores.length ? total / scores.length : 0);
    case "max":
      return clamp(scores.length ? Math.max(...scores) : 0);
    case "min":
      return clamp(scores.length ? Math.min(...scores) : 0);
    case "boolean_or":
      return scores.some((s) => s > 0) ? 100 : 0;
    case "boolean_and":
      return scores.length > 0 && scores.every((s) => s > 0) ? 100 : 0;
    default:
      return clamp(total);
  }
};
var opt = (label, value, score) => ({ label, value, score });
var abc = (id, label, dimension, choices) => ({
  id,
  type: "single_choice",
  label,
  dimension,
  options: [
    opt(choices[0], `${id}_a`, 1),
    opt(choices[1], `${id}_b`, 2),
    opt(choices[2], `${id}_c`, 3)
  ]
});
var sebumCharacter = {
  id: "sebum_character",
  type: "multi_choice",
  label: "Check every statement that matches your facial skin (select all that apply).",
  dimension: "sebum",
  options: [
    opt("I can use any cleanser without feeling dry", "sebum_any_cleanser", 2),
    opt("I do not use any product after cleansing", "sebum_no_product", 1),
    opt("I never or only occasionally use moisturizer", "sebum_rare_moist", 2),
    opt("I use facial moisturizer once a day", "sebum_moist_1x", -1),
    opt("I use facial moisturizer twice a day", "sebum_moist_2x", -2),
    opt("My facial skin is rough or dry", "sebum_rough_dry", -2),
    opt("My facial skin is oily in some areas", "sebum_oily_areas", 2),
    opt("My face is very oily", "sebum_very_oily", 3),
    opt("My face feels uncomfortable without moisturizer", "sebum_uncomfortable", -2),
    opt("I like the feel of rich creams and/or oils on my skin", "sebum_likes_rich", -3),
    opt("None of the above", "sebum_none", 0)
  ]
};
var sensitivityChecklist = {
  id: "sensitivity_checklist",
  type: "multi_choice",
  label: "Tick any condition you are prone to experiencing.",
  dimension: "sensitivity",
  options: [
    opt("Facial redness and/or flushing", "sens_redness", 1),
    opt("Stinging or burning sensation on the skin", "sens_stinging", 1),
    opt("Allergic reaction to skincare products", "sens_allergy", 1),
    opt("Irritation when shaving the face", "sens_shaving", 1),
    opt("None of the above", "sens_none", 0)
  ]
};
var pigmentAmount = abc(
  "pigment_amount",
  "How much dark pigment or discoloration is visible on your face?",
  "pigmentation",
  ["A few faint spots", "Several visible spots", "Many clearly visible spots"]
);
var pigmentScars = abc(
  "pigment_scars",
  "What happens to acne marks or dark marks you have had?",
  "pigmentation",
  ["They fade quickly", "They take a long time to fade", "They are hard to remove"]
);
var pigmentReactivity = abc(
  "pigment_reactivity",
  "How easily does your skin change colour after sun, injury, or acne?",
  "pigmentation",
  ["Rarely gets dark marks", "Often gets dark marks", "Very easily gets dark marks"]
);
var darkSpotTendency = {
  id: "dark_spot_tendency",
  type: "single_choice",
  label: "Do dark spots appear easily after acne, injury, or sun exposure?",
  dimension: "dark_spot",
  options: [opt("Yes", "ds_yes", 1), opt("No", "ds_no", 0)]
};
var PIXIE_OMG_SKIN_ANALYZER = {
  code: "pixie_omg_skin_analyzer",
  name: "Pixie / OMG Skin Analyzer",
  description: "Questionnaire replica of the Wardah (Pixie) + OMG Skin Analyzer inputs for sebum, sensitivity, pigment level, and dark-spot tendency.",
  status: "draft",
  questions: [
    sebumCharacter,
    sensitivityChecklist,
    pigmentAmount,
    pigmentScars,
    pigmentReactivity,
    darkSpotTendency
  ],
  calculationMethods: {
    sebum: "sum",
    sensitivity: "boolean_or",
    // Pixie: any checklist item -> "Sensitive Stinger"
    pigmentation: "average",
    dark_spot: "boolean_or"
  }
};
var pfChoice = (label, value, score) => ({
  label,
  value,
  score
});
var pfSingle = (id, label, choices) => ({
  id,
  type: "single_choice",
  label,
  dimension: "",
  // assigned by XG
  options: choices.map(([label2, score], i) => pfChoice(label2, `${id}_${i}`, score))
});
var PFORM_EXAMPLE = {
  code: "pform_example",
  name: "pForm form (example)",
  description: "Example of a pForm form imported into XG: scored questions with no dimension yet. Assign a dimension to each question (Questions tab) and a method per dimension (Calculation tab) before use.",
  status: "draft",
  questions: [
    pfSingle("pform_age", "Age range", [
      ["Under 20", 0],
      ["20\u201329", 1],
      ["30\u201339", 2],
      ["40\u201349", 3],
      ["50 or older", 4]
    ]),
    {
      id: "pform_pregnancy",
      type: "boolean",
      label: "Are you currently pregnant or breastfeeding?",
      dimension: "",
      options: [],
      scoreTrue: 1,
      scoreFalse: 0
    },
    pfSingle("pform_sun_exposure", "On an average day, how long are you outdoors in direct sun?", [
      ["Less than 30 minutes", 0],
      ["30 minutes \u2013 1 hour", 1],
      ["1 \u2013 3 hours", 2],
      ["More than 3 hours", 3]
    ]),
    pfSingle("pform_climate", "Which best describes the climate where you live?", [
      ["Cool and dry", 0],
      ["Temperate", 1],
      ["Hot and humid", 2],
      ["Hot and dry", 2]
    ]),
    pfSingle("pform_pollution", "How would you rate the air pollution / dust where you spend most of your day?", [
      ["Low", 0],
      ["Moderate", 1],
      ["High", 2]
    ]),
    {
      id: "pform_stress",
      type: "rating",
      label: "On a scale of 1\u20135, how stressed have you felt this past month?",
      dimension: "",
      options: [],
      scale: { min: 1, max: 5 }
    },
    {
      id: "pform_sleep",
      type: "rating",
      label: "On a scale of 1\u20135, how well have you been sleeping?",
      dimension: "",
      options: [],
      scale: { min: 1, max: 5 }
    },
    pfSingle("pform_diet", "How often do you eat fried, sugary, or heavily processed food?", [
      ["Rarely", 0],
      ["A few times a week", 1],
      ["Most days", 2],
      ["Every day", 3]
    ]),
    pfSingle("pform_hydration", "How much plain water do you drink daily?", [
      ["Less than 1 litre", 2],
      ["1 \u2013 2 litres", 1],
      ["More than 2 litres", 0]
    ]),
    {
      id: "pform_smoking",
      type: "boolean",
      label: "Do you smoke?",
      dimension: "",
      options: [],
      scoreTrue: 2,
      scoreFalse: 0
    }
  ],
  calculationMethods: {}
  // set alongside the dimension mapping
};
var PFORM_SUGGESTED_DIMENSIONS = {
  pform_age: "lifestyle",
  pform_pregnancy: "sensitivity",
  pform_sun_exposure: "sun_exposure",
  pform_climate: "climate_humidity",
  pform_pollution: "pollution_exposure",
  pform_stress: "mental_stress",
  pform_sleep: "mental_stress",
  pform_diet: "gut_health",
  pform_hydration: "gut_health",
  pform_smoking: "lifestyle"
};
var PFORM_TYPE_MAP = {
  radiogroup: "single_choice",
  radio: "single_choice",
  single: "single_choice",
  single_choice: "single_choice",
  dropdown: "dropdown",
  select: "dropdown",
  checkbox: "multi_choice",
  multi: "multi_choice",
  multi_choice: "multi_choice",
  boolean: "boolean",
  rating: "rating",
  ranking: "ranking",
  number: "numeric_input",
  numeric: "numeric_input",
  text: "numeric_input"
};
function fromPFormSchema(raw) {
  const flat = [
    ...raw.questions ?? [],
    ...raw.items ?? [],
    ...raw.fields ?? [],
    ...raw.elements ?? [],
    ...(raw.pages ?? []).flatMap((p) => p?.elements ?? [])
  ];
  const questions = flat.map((q, i) => {
    const id = q.id || q.name || q.key || `pform_q${i + 1}`;
    const rawChoices = q.choices ?? q.options ?? q.answers ?? [];
    const options = rawChoices.map((c, ci) => {
      const obj = typeof c === "string" ? { label: c } : c;
      return {
        label: obj.label ?? obj.text ?? obj.title ?? obj.value ?? `Option ${ci + 1}`,
        value: obj.value ?? `${id}_${ci}`,
        score: typeof obj.score === "number" ? obj.score : 0
      };
    });
    const type = PFORM_TYPE_MAP[(q.type || "").toLowerCase()] || (options.length ? "single_choice" : "numeric_input");
    return {
      id,
      type,
      label: q.label ?? q.title ?? q.question ?? `Question ${i + 1}`,
      dimension: "",
      // assigned in XG
      options: type === "boolean" ? [] : options
    };
  });
  return {
    code: raw.code || raw.id || "pform_import",
    name: raw.name || raw.title || "pForm import",
    description: raw.description || "Imported from pForm. Assign a dimension to each question before use.",
    status: "draft",
    questions,
    calculationMethods: {}
  };
}
function applyDimensionMapping(q, mapping, methods = {}) {
  const questions = (q.questions ?? []).map((question) => {
    const dim = mapping[question.id];
    return dim ? { ...question, dimension: dim } : { ...question };
  });
  const usedDims = Array.from(new Set(questions.map((x) => x.dimension).filter(Boolean)));
  const calculationMethods = {};
  for (const d of usedDims) {
    calculationMethods[d] = methods[d] || q.calculationMethods?.[d] || "sum";
  }
  return { ...q, questions, calculationMethods };
}
var cloneQuestionnaire = (q) => JSON.parse(JSON.stringify(q));
var BUILTIN_TEMPLATES = [
  {
    id: PIXIE_OMG_SKIN_ANALYZER.code,
    name: PIXIE_OMG_SKIN_ANALYZER.name,
    description: PIXIE_OMG_SKIN_ANALYZER.description,
    build: () => cloneQuestionnaire(PIXIE_OMG_SKIN_ANALYZER)
  },
  {
    id: PFORM_EXAMPLE.code,
    name: PFORM_EXAMPLE.name,
    description: PFORM_EXAMPLE.description,
    build: () => cloneQuestionnaire(PFORM_EXAMPLE)
  }
];

// src/form/components/tabs/QuestionnairesTab.tsx
var import_jsx_runtime6 = require("react/jsx-runtime");
var methodLabel = (q, dimension) => {
  const m = q.calculationMethods?.[dimension] || "sum";
  return CALCULATION_METHODS.find((x) => x.value === m)?.label || m;
};
var QuestionnairesTab = ({
  questionnaires,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteQuestionnaire
}) => {
  const [expandedCode, setExpandedCode] = (0, import_react4.useState)(null);
  const filtered = questionnaires.filter((q) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return q.name.toLowerCase().includes(query) || q.code.toLowerCase().includes(query) || q.description?.toLowerCase().includes(query);
  });
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "space-y-4", children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      import_shared6.SearchFilterBar,
      {
        searchQuery,
        onSearchChange,
        searchPlaceholder: "Search questionnaires by name, code, or description\u2026",
        actionLabel: "New questionnaire",
        onAction: onOpenAddModal
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "space-y-3", children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      import_shared6.EmptyState,
      {
        icon: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react5.FileText, { className: "h-6 w-6 text-muted-foreground" }),
        title: "No questionnaires yet",
        description: "Build a questionnaire that turns answers into one score per dimension.",
        actionLabel: "New questionnaire",
        onAction: onOpenAddModal,
        actionIcon: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react5.Plus, { className: "h-4 w-4" }),
        className: "py-14"
      }
    ) : filtered.map((q) => {
      const isExpanded = expandedCode === q.code;
      const questions = q.questions || [];
      const dimensions = Array.from(new Set(questions.map((qu) => qu.dimension)));
      return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
        "div",
        {
          className: "rounded-lg border border-border bg-card overflow-hidden transition hover:border-beak/50",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "p-4 flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "space-y-1.5 flex-1 min-w-0", children: [
                /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("code", { className: "text-[11px] font-mono text-beak bg-beak/10 border border-beak/30 px-1.5 py-0.5 rounded", children: q.code }),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                    "span",
                    {
                      className: `px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold ${q.status === "published" ? "bg-beak/15 text-beak" : "bg-muted text-muted-foreground"}`,
                      children: q.status || "draft"
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h4", { className: "font-bold text-foreground text-sm", children: q.name }),
                q.description && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "text-xs text-muted-foreground leading-relaxed", children: q.description }),
                dimensions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "flex flex-wrap gap-1.5 pt-1", children: dimensions.map((dim) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
                  "span",
                  {
                    className: "rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground",
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "text-foreground font-medium", children: getDimensionMeta(dim).label }),
                      " ",
                      "\xB7 ",
                      methodLabel(q, dim)
                    ]
                  },
                  dim
                )) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex items-center gap-2 self-end md:self-center shrink-0", children: [
                /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { className: "text-[11px] text-muted-foreground hidden sm:block", children: [
                  questions.length || q.questionsCount || 0,
                  " questions"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
                  "button",
                  {
                    onClick: () => setExpandedCode(isExpanded ? null : q.code),
                    className: "h-8 px-2.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-ring transition flex items-center gap-1.5",
                    children: [
                      isExpanded ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react5.ChevronUp, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react5.ChevronDown, { className: "h-3.5 w-3.5" }),
                      isExpanded ? "Hide" : "Preview"
                    ]
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                  "button",
                  {
                    onClick: () => onOpenEditModal(q),
                    className: "h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-ring transition flex items-center justify-center",
                    title: "Edit",
                    children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react5.Pencil, { className: "h-3.5 w-3.5" })
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                  "button",
                  {
                    onClick: () => onDeleteQuestionnaire(q.code),
                    className: "h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 transition flex items-center justify-center",
                    title: "Delete",
                    children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react5.Trash2, { className: "h-3.5 w-3.5" })
                  }
                )
              ] })
            ] }),
            isExpanded && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "border-t border-border bg-muted/20 p-4 space-y-2", children: questions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "text-xs text-muted-foreground", children: "No questions configured." }) : questions.map((qu, qIdx) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "rounded-md border border-border bg-card p-3 space-y-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex items-center justify-between gap-2 text-xs", children: [
                /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { className: "text-foreground", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { className: "text-muted-foreground mr-1", children: [
                    qIdx + 1,
                    "."
                  ] }),
                  qu.label
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "text-[10px] uppercase tracking-wide text-beak shrink-0", children: getDimensionMeta(qu.dimension).label })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-1.5", children: qu.options.map((opt2, oi) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
                "div",
                {
                  className: "rounded border border-border px-2 py-1 flex items-center justify-between text-xs",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "text-muted-foreground truncate pr-2", children: opt2.label }),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { className: "text-foreground font-mono shrink-0", children: [
                      (opt2.score ?? 0) > 0 ? "+" : "",
                      opt2.score ?? 0
                    ] })
                  ]
                },
                oi
              )) })
            ] }, qu.id || qIdx)) })
          ]
        },
        q.code
      );
    }) })
  ] });
};

// src/form/components/tabs/FormSimulatorTab.tsx
var import_react5 = require("react");
var import_lucide_react6 = require("lucide-react");
var import_shared7 = require("@gateway-experience/shared");
var import_survey_core = require("survey-core");
var import_survey_react_ui = require("survey-react-ui");

// src/form/surveyjs.ts
var TYPE_TO_SURVEYJS = {
  single_choice: { type: "radiogroup" },
  multi_choice: { type: "checkbox" },
  dropdown: { type: "dropdown" },
  boolean: { type: "boolean" },
  rating: { type: "rating" },
  ranking: { type: "ranking" },
  matrix: { type: "matrix" },
  numeric_input: { type: "text", inputType: "number" },
  slider: { type: "rating" }
};
var SURVEYJS_TO_TYPE = {
  radiogroup: "single_choice",
  buttongroup: "single_choice",
  imagepicker: "single_choice",
  dropdown: "dropdown",
  checkbox: "multi_choice",
  tagbox: "multi_choice",
  ranking: "ranking",
  boolean: "boolean",
  rating: "rating",
  matrix: "matrix",
  text: "numeric_input"
};
var CHOICE_SURVEYJS_TYPES = /* @__PURE__ */ new Set([
  "radiogroup",
  "checkbox",
  "dropdown",
  "tagbox",
  "buttongroup",
  "ranking"
]);
var CHOICE_BUILDER_TYPES = /* @__PURE__ */ new Set([
  "single_choice",
  "multi_choice",
  "dropdown",
  "ranking"
]);
function toSurveyModel(item) {
  const elements = (item.questions ?? []).map((q) => {
    const map = TYPE_TO_SURVEYJS[q.type] ?? { type: "radiogroup" };
    const el = { type: map.type, name: q.id, title: q.label };
    if (map.inputType) el.inputType = map.inputType;
    if (q.type === "single_choice" || q.type === "dropdown" || q.type === "boolean") {
      el.isRequired = true;
    }
    if (q.dimension) el.dimension = q.dimension;
    const asChoice = (o) => ({
      value: o.value,
      text: o.label,
      ...o.score != null ? { score: o.score } : {},
      ...o.conditionMap && Object.keys(o.conditionMap).length ? { condition_map: o.conditionMap } : {}
    });
    if (CHOICE_BUILDER_TYPES.has(q.type)) {
      el.choices = (q.options ?? []).map(asChoice);
    }
    if (q.type === "matrix") {
      el.columns = (q.options ?? []).map(asChoice);
      el.rows = (q.rows ?? []).map((r) => ({ value: r.value, text: r.label }));
    }
    if (q.type === "boolean") {
      if (q.scoreTrue != null) el.scoreTrue = q.scoreTrue;
      if (q.scoreFalse != null) el.scoreFalse = q.scoreFalse;
      el.renderAs = "radio";
    }
    if ((q.type === "rating" || q.type === "slider" || q.type === "numeric_input") && q.scale) {
      el.scale = q.scale;
      if (map.type === "rating") {
        el.rateMin = q.scale.min;
        el.rateMax = Math.min(q.scale.max, q.scale.min + 10);
        el.displayMode = "buttons";
      } else {
        el.min = q.scale.min;
        el.max = q.scale.max;
      }
    }
    return el;
  });
  return {
    title: item.name,
    ...item.description ? { description: item.description } : {},
    code: item.code,
    ...item.status ? { status: item.status } : {},
    pages: [{ name: "page1", elements }],
    ...item.calculationMethods && Object.keys(item.calculationMethods).length ? { calculation_methods: item.calculationMethods } : {}
  };
}
function isSurveyModel(raw) {
  return !!raw && typeof raw === "object" && !Array.isArray(raw.questions) && (Array.isArray(raw.pages) || Array.isArray(raw.elements));
}
function flattenElements(model) {
  return [
    ...(model.pages ?? []).flatMap((p) => p?.elements ?? []),
    ...model.elements ?? []
  ];
}
function fromSurveyModel(raw) {
  if (!isSurveyModel(raw)) {
    return {
      code: raw?.code ?? "",
      name: raw?.name ?? raw?.title ?? raw?.code ?? "",
      description: raw?.description ?? "",
      status: raw?.status ?? "draft",
      questions: raw?.questions ?? [],
      calculationMethods: raw?.calculationMethods ?? raw?.calculation_methods ?? {},
      questionsCount: raw?.questions?.length ?? 0
    };
  }
  const readChoice = (c) => typeof c === "string" ? { label: c, value: c } : {
    label: c.text ?? c.value,
    value: c.value,
    ...c.score != null ? { score: c.score } : {},
    ...c.condition_map ? { conditionMap: c.condition_map } : {}
  };
  const questions = flattenElements(raw).map((el, i) => {
    const type = SURVEYJS_TO_TYPE[el.type] ?? "single_choice";
    const source = type === "matrix" ? el.columns ?? [] : el.choices ?? [];
    const options = source.map(readChoice);
    const q = {
      id: el.name || `q_${i + 1}`,
      type,
      label: el.title || el.name || `Question ${i + 1}`,
      dimension: el.dimension || "",
      options
    };
    if (type === "matrix") {
      q.rows = (el.rows ?? []).map(
        (r) => typeof r === "string" ? { value: r, label: r } : { value: r.value, label: r.text ?? r.value }
      );
    }
    if (el.scoreTrue != null) q.scoreTrue = el.scoreTrue;
    if (el.scoreFalse != null) q.scoreFalse = el.scoreFalse;
    const min = el.scale?.min ?? el.rateMin ?? el.min;
    const max = el.scale?.max ?? el.rateMax ?? el.max;
    if (min != null && max != null) q.scale = { min, max };
    return q;
  });
  return {
    code: raw.code ?? "",
    name: raw.title ?? raw.code ?? "",
    description: raw.description ?? "",
    status: raw.status ?? "draft",
    questions,
    calculationMethods: raw.calculation_methods ?? {},
    questionsCount: questions.length
  };
}
function buildScoreRequest(model, data) {
  const answer_list = [];
  const customer_condition = {};
  const dimAnswers = {};
  const dimBounds = {};
  const bump = (dim, score, min, max) => {
    if (!dim) return;
    (dimAnswers[dim] ?? (dimAnswers[dim] = [])).push(score);
    const b = dimBounds[dim] ?? (dimBounds[dim] = { min: 0, max: 0 });
    if (min < b.min) b.min = min;
    if (max > b.max) b.max = max;
  };
  const scaleOf = (el) => [
    el.scale?.min ?? el.rateMin ?? el.min ?? 0,
    el.scale?.max ?? el.rateMax ?? el.max ?? 0
  ];
  const asChoice = (c) => typeof c === "string" ? { value: c, text: c } : c;
  for (const el of flattenElements(model)) {
    const ans = data[el.name];
    if (ans == null || ans === "") continue;
    const [minS, maxS] = scaleOf(el);
    if (el.type === "boolean") {
      const on = ans === true || ans === "true";
      const score = on ? el.scoreTrue ?? 1 : el.scoreFalse ?? 0;
      answer_list.push({ answer: String(on), score, min_score: minS, max_score: maxS || 1 });
      bump(el.dimension, score, minS, maxS || 1);
      continue;
    }
    if (CHOICE_SURVEYJS_TYPES.has(el.type) && el.choices?.length) {
      const picked = (Array.isArray(ans) ? ans : [ans]).map(String);
      for (const raw of el.choices) {
        const ch = asChoice(raw);
        if (!picked.includes(String(ch.value))) continue;
        const score = typeof ch.score === "number" ? ch.score : 0;
        answer_list.push({ answer: ch.text ?? String(ch.value), score, min_score: minS, max_score: maxS });
        if (ch.condition_map) Object.assign(customer_condition, ch.condition_map);
        bump(ch.dimension || el.dimension, score, minS, maxS);
      }
      continue;
    }
    if (el.type === "matrix" && el.columns?.length && typeof ans === "object") {
      const cols = el.columns.map(asChoice);
      for (const colVal of Object.values(ans)) {
        const col = cols.find((c) => String(c.value) === String(colVal));
        if (!col) continue;
        const score = typeof col.score === "number" ? col.score : 0;
        answer_list.push({ answer: col.text ?? String(col.value), score, min_score: minS, max_score: maxS });
        bump(el.dimension, score, minS, maxS);
      }
      continue;
    }
    const n = Number(ans);
    if (!Number.isNaN(n)) {
      answer_list.push({ answer: String(n), score: n, min_score: minS, max_score: maxS });
      bump(el.dimension, n, minS, maxS);
    }
  }
  const methods = model.calculation_methods || {};
  const dimensions = Object.entries(dimAnswers).map(([key, answers]) => {
    const b = dimBounds[key] || { min: 0, max: 0 };
    return {
      key,
      min_score: b.min,
      max_score: b.max || 100,
      calculation_method: methods[key] || "sum",
      answers
    };
  });
  return { answer_list, customer_condition, dimensions };
}
function scoreSurveyAnswers(model, data) {
  const byDimension = {};
  const push = (dim, n) => {
    if (!dim) return;
    (byDimension[dim] ?? (byDimension[dim] = [])).push(n);
  };
  for (const el of flattenElements(model)) {
    const answer = data[el.name];
    if (answer == null || answer === "") continue;
    if (el.type === "boolean") {
      const on = answer === true || answer === "true";
      push(el.dimension, on ? el.scoreTrue ?? 1 : el.scoreFalse ?? 0);
      continue;
    }
    if (CHOICE_SURVEYJS_TYPES.has(el.type) && el.choices?.length) {
      const picked = (Array.isArray(answer) ? answer : [answer]).map(String);
      for (const c of el.choices) {
        const choice = typeof c === "string" ? { value: c, text: c } : c;
        if (picked.includes(String(choice.value))) {
          push(
            choice.dimension || el.dimension,
            typeof choice.score === "number" ? choice.score : 0
          );
        }
      }
      continue;
    }
    if (el.type === "matrix" && el.columns?.length && typeof answer === "object") {
      const cols = el.columns.map(
        (c) => typeof c === "string" ? { value: c, text: c } : c
      );
      for (const colVal of Object.values(answer)) {
        const col = cols.find((c) => String(c.value) === String(colVal));
        if (col) {
          push(
            el.dimension,
            typeof col.score === "number" ? col.score : 0
          );
        }
      }
      continue;
    }
    const n = Number(answer);
    if (!Number.isNaN(n)) push(el.dimension, n);
  }
  return byDimension;
}

// src/form/survey-theme.ts
var XG_SURVEY_THEME = {
  themeName: "xg",
  colorPalette: "dark",
  isPanelless: false,
  cssVariables: {
    "--sjs-font-family": "var(--font-sans, ui-sans-serif, system-ui, sans-serif)",
    "--sjs-corner-radius": "var(--radius, 0.625rem)",
    "--sjs-base-unit": "7px",
    // SurveyJS defaults run large (16px base). Tighten to console scale.
    "--sjs-font-size": "13px",
    "--sjs-font-questiontitle-size": "14px",
    "--sjs-font-questiondescription-size": "12px",
    "--sjs-font-editorfont-size": "13px",
    "--sjs-font-pagetitle-size": "15px",
    "--sjs-font-pagedescription-size": "12px",
    "--sjs-primary-backcolor": "var(--primary)",
    "--sjs-primary-backcolor-light": "color-mix(in srgb, var(--primary) 16%, transparent)",
    "--sjs-primary-backcolor-dark": "color-mix(in srgb, var(--primary) 88%, #000)",
    "--sjs-primary-forecolor": "var(--primary-foreground)",
    "--sjs-primary-forecolor-light": "color-mix(in srgb, var(--primary-foreground) 65%, transparent)",
    "--sjs-general-backcolor": "var(--card)",
    "--sjs-general-backcolor-dark": "color-mix(in srgb, var(--card) 90%, #000)",
    "--sjs-general-backcolor-dim": "var(--background)",
    "--sjs-general-backcolor-dim-light": "var(--muted)",
    "--sjs-general-backcolor-dim-dark": "color-mix(in srgb, var(--muted) 82%, #000)",
    "--sjs-general-forecolor": "var(--foreground)",
    "--sjs-general-forecolor-light": "var(--muted-foreground)",
    "--sjs-general-dim-forecolor": "var(--foreground)",
    "--sjs-general-dim-forecolor-light": "var(--muted-foreground)",
    "--sjs-border-default": "var(--border)",
    "--sjs-border-light": "color-mix(in srgb, var(--border) 60%, transparent)",
    "--sjs-shadow-small": "none",
    "--sjs-shadow-medium": "none",
    "--sjs-shadow-large": "none",
    "--sjs-shadow-inner": "none"
  }
};

// src/form/components/tabs/FormSimulatorTab.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
var ANSWERS_KEY_PREFIX = "xg.formEngine.simulator.answers.";
var CUSTOMER_ID_KEY = "xg.formEngine.simulator.customerId";
var FormSimulatorTab = ({
  brandId,
  applicationId,
  questionnaires,
  selectedQCode,
  setSelectedQCode
}) => {
  const currentQ = questionnaires.find((q) => q.code === selectedQCode) || questionnaires[0];
  const hasQuestions = (currentQ?.questions?.length ?? 0) > 0;
  const schema = (0, import_react5.useMemo)(
    () => currentQ ? toSurveyModel(currentQ) : null,
    [currentQ]
  );
  const answersKey = currentQ?.code ? ANSWERS_KEY_PREFIX + currentQ.code : null;
  const [data, setData] = (0, import_shared7.usePersistentState)(answersKey, {});
  const [showPayload, setShowPayload] = (0, import_react5.useState)(false);
  const [customerId, setCustomerId] = (0, import_shared7.usePersistentState)(CUSTOMER_ID_KEY, "demo-customer-001");
  const [copied, setCopied] = (0, import_react5.useState)("");
  const copy = (text, tag) => {
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(tag);
        setTimeout(() => setCopied(""), 1500);
      },
      () => {
      }
    );
  };
  const survey = (0, import_react5.useMemo)(() => {
    if (!schema || !hasQuestions) return null;
    const m = new import_survey_core.Model(schema);
    m.showNavigationButtons = false;
    m.showCompleteButton = false;
    m.showProgressBar = "off";
    m.questionsOnPageMode = "singlePage";
    m.applyTheme(XG_SURVEY_THEME);
    m.getAllQuestions().forEach((q) => {
      if (q.getType() === "boolean") q.renderAs = "radio";
    });
    const saved = answersKey ? (0, import_shared7.readPersisted)(answersKey) : void 0;
    if (saved) m.data = saved;
    return m;
  }, [schema, hasQuestions, answersKey]);
  (0, import_react5.useEffect)(() => {
    setData({ ...survey?.data ?? {} });
    if (!survey) return;
    const onValue = (sender) => setData({ ...sender.data });
    survey.onValueChanged.add(onValue);
    return () => survey.onValueChanged.remove(onValue);
  }, [survey, setData]);
  const core = (0, import_react5.useMemo)(
    () => schema ? buildScoreRequest(schema, data) : { answer_list: [], customer_condition: {}, dimensions: [] },
    [schema, data]
  );
  const results = core.dimensions.map((d) => ({
    dc: d.key,
    method: d.calculation_method,
    scores: d.answers,
    value: Math.round(applyCalculationMethod(d.answers, d.calculation_method) * 100) / 100
  }));
  const submitBody = {
    brand_id: currentQ?.brandId || brandId,
    application_id: currentQ?.applicationId || applicationId,
    customer_id: customerId,
    data
  };
  const submitBodyJson = JSON.stringify(submitBody, null, 2);
  const payload = {
    code: currentQ?.code,
    brand_id: currentQ?.brandId || brandId,
    application_id: currentQ?.applicationId || applicationId,
    answer_list: core.answer_list,
    customer_condition: core.customer_condition,
    dimensions: core.dimensions,
    vision_signals: {}
  };
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-5", children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "lg:col-span-7 space-y-3", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "rounded-lg border border-border bg-card p-4 space-y-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("label", { className: "block space-y-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-muted-foreground text-xs font-semibold", children: "Questionnaire" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          "select",
          {
            value: selectedQCode,
            onChange: (e) => setSelectedQCode(e.target.value),
            className: "w-full h-9 rounded-md bg-muted/40 border border-border px-3 text-foreground text-xs outline-none focus:border-ring",
            style: { colorScheme: "dark" },
            children: questionnaires.map((q) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              "option",
              {
                value: q.code,
                style: { backgroundColor: "var(--popover)", color: "var(--popover-foreground)" },
                children: q.name
              },
              q.code
            ))
          }
        )
      ] }),
      !survey ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "text-muted-foreground text-xs py-6 text-center", children: "This questionnaire has no questions configured." }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_survey_react_ui.Survey, { model: survey })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "lg:col-span-5 space-y-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "rounded-lg border border-border bg-card p-4 space-y-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h3", { className: "text-foreground text-sm font-bold", children: "Score per dimension" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-[11px] text-muted-foreground", children: "Form Engine output" })
        ] }),
        results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          import_shared7.EmptyState,
          {
            icon: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.Play, { className: "h-5 w-5 text-muted-foreground" }),
            title: "Nothing to calculate yet",
            description: "Answer a question to see its dimension score.",
            className: "py-10"
          }
        ) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "space-y-2", children: results.map((r) => {
          const methodLabel2 = CALCULATION_METHODS.find((m) => m.value === r.method)?.label || r.method;
          return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "rounded-md border border-border bg-muted/20 p-3", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-xs font-semibold text-foreground", children: getDimensionMeta(r.dc).label }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-[10px] uppercase tracking-wide text-muted-foreground", children: methodLabel2 })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "mt-1 flex items-baseline justify-between", children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-lg font-black text-beak font-mono", children: r.value }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "text-[11px] text-muted-foreground font-mono", children: [
                "[",
                r.scores.join(", "),
                "] \u2192 ",
                r.method
              ] })
            ] })
          ] }, r.dc);
        }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "rounded-lg border border-border bg-card p-4 space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "min-w-0", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h3", { className: "text-foreground text-sm font-bold", children: "Submit Answers body" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("p", { className: "text-[11px] text-muted-foreground truncate", children: [
              "POST ",
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "font-mono", children: [
                "/v1/survey/",
                currentQ?.code,
                "/evaluate"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "button",
            {
              type: "button",
              onClick: () => copy(submitBodyJson, "submit"),
              className: "h-7 shrink-0 rounded-md border border-beak/40 bg-beak/10 px-2.5 text-[11px] font-semibold text-beak hover:bg-beak/20",
              children: copied === "submit" ? "Copied" : "Copy body"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("label", { className: "flex items-center gap-2 text-[11px] text-muted-foreground", children: [
          "customer_id",
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "input",
            {
              value: customerId,
              onChange: (e) => setCustomerId(e.target.value),
              className: "h-7 flex-1 rounded-md bg-muted/40 border border-border px-2 text-foreground font-mono outline-none focus:border-ring"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("pre", { className: "max-h-56 overflow-auto rounded-md bg-muted/40 border border-border p-2.5 text-[11px] text-foreground font-mono leading-relaxed whitespace-pre", children: submitBodyJson })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "rounded-lg border border-border bg-card", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
          "button",
          {
            type: "button",
            onClick: () => setShowPayload((v) => !v),
            className: "flex w-full items-center justify-between gap-2 px-4 py-3 text-xs font-bold text-foreground",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: "Internal: forwarded to Score Engine" }),
              showPayload ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.ChevronDown, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.ChevronRight, { className: "h-4 w-4 text-muted-foreground" })
            ]
          }
        ),
        showPayload && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("pre", { className: "border-t border-border px-4 py-3 text-[11px] text-muted-foreground whitespace-pre-wrap break-all font-mono leading-relaxed", children: JSON.stringify(payload, null, 2) })
      ] })
    ] })
  ] });
};

// src/form/components/modals/QuestionnaireModal.tsx
var import_react6 = require("react");
var import_lucide_react7 = require("lucide-react");
var import_shared8 = require("@gateway-experience/shared");

// src/form/api.ts
var FORM = "/core/form-engine";
var DEFAULT_BRAND = "wardah";
var DEFAULT_APP = "skinverse";
var tenantQuery = (brandId, applicationId) => `brand_id=${encodeURIComponent(brandId)}&application_id=${encodeURIComponent(applicationId)}`;
function parseSchema(row) {
  const s = row?.schema;
  if (s && typeof s === "object") return s;
  if (typeof s === "string") {
    try {
      return JSON.parse(s);
    } catch {
    }
  }
  return {};
}
function fromColumnStatus(s) {
  if (s === "active") return "published";
  return s || "";
}
function toColumnStatus(s) {
  if (s === "published" || s === "active") return "active";
  if (s === "archived") return "archived";
  return "draft";
}
function rowToItem(row) {
  const item = fromSurveyModel(parseSchema(row));
  return {
    ...item,
    // The DB row owns identity — the unique key is (brand, app, code, version).
    // A code/title embedded in the schema is only a copy and can go stale
    // (e.g. a questionnaire cloned from another one), so the row wins.
    code: row?.code || item.code || "",
    name: row?.title || item.name || row?.code || "",
    status: fromColumnStatus(row?.status) || item.status || "draft",
    brandId: row?.brandId || row?.brand_id || item.brandId,
    applicationId: row?.applicationId || row?.application_id || item.applicationId
  };
}
async function listRows(brandId = DEFAULT_BRAND, applicationId = DEFAULT_APP) {
  const res = await fetch(`${FORM}/survey?${tenantQuery(brandId, applicationId)}`, {
    cache: "no-store"
  });
  if (!res.ok) throw new Error(`form-engine list failed (${res.status})`);
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.surveys)) return data.surveys;
  if (Array.isArray(data?.forms)) return data.forms;
  return [];
}
var isArchived = (r) => (r?.status ?? "") === "archived";
async function listQuestionnaires(brandId = DEFAULT_BRAND, applicationId = DEFAULT_APP) {
  return (await listRows(brandId, applicationId)).filter((r) => !isArchived(r)).map(rowToItem);
}
async function getQuestionnaire(code, brandId = DEFAULT_BRAND, applicationId = DEFAULT_APP) {
  return (await listQuestionnaires(brandId, applicationId)).find((q) => q.code === code) ?? null;
}
async function getQuestionnaireModel(code, brandId = DEFAULT_BRAND, applicationId = DEFAULT_APP) {
  const row = (await listRows(brandId, applicationId)).find(
    (r) => r.code === code && !isArchived(r)
  );
  if (!row) return null;
  const model = parseSchema(row);
  if (!Array.isArray(model.pages) && !Array.isArray(model.elements)) {
    return toSurveyModel(rowToItem(row));
  }
  return { ...model, code: row.code || model.code, title: row.title || model.title };
}
async function saveQuestionnaire(item, brandId = DEFAULT_BRAND, applicationId = DEFAULT_APP) {
  const code = item.code || `form_${Date.now()}`;
  const res = await fetch(`${FORM}/survey`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      brand_id: item.brandId || brandId,
      application_id: item.applicationId || applicationId,
      code,
      title: item.name || code,
      status: toColumnStatus(item.status),
      schema: toSurveyModel({ ...item, code })
    })
  });
  if (!res.ok) throw new Error(`form-engine save failed (${res.status})`);
}
async function deleteQuestionnaire(code, brandId = DEFAULT_BRAND, applicationId = DEFAULT_APP) {
  const existing = (await listRows(brandId, applicationId)).find((r) => r.code === code);
  const schema = existing ? parseSchema(existing) : { code };
  const res = await fetch(`${FORM}/survey/${encodeURIComponent(code)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      brand_id: existing?.brandId || existing?.brand_id || brandId,
      application_id: existing?.applicationId || existing?.application_id || applicationId,
      code,
      title: existing?.title || code,
      status: "archived",
      schema
    })
  });
  if (!res.ok) throw new Error(`form-engine archive failed (${res.status})`);
}
async function getDimensions(routes) {
  try {
    const res = await fetch(routes.reference("dimensions"), { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    const arr = Array.isArray(data) ? data : Array.isArray(data?.dimensions) ? data.dimensions : Array.isArray(data?.data) ? data.data : [];
    return arr;
  } catch {
    return [];
  }
}
async function getSafetyFlags(routes) {
  try {
    const res = await fetch(routes.reference("conditions"), { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return arr;
  } catch {
    return [];
  }
}
async function createSafetyFlag(routes, code, name) {
  try {
    const res = await fetch(routes.reference("conditions"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, name })
    });
    if (!res.ok) return null;
    return { code, name };
  } catch {
    return null;
  }
}

// src/form/components/modals/QuestionnaireModal.tsx
var import_jsx_runtime8 = require("react/jsx-runtime");
var QUESTION_TYPES = [
  { value: "single_choice", label: "Choose one", hasOptions: true },
  { value: "multi_choice", label: "Select many", hasOptions: true },
  { value: "dropdown", label: "Dropdown", hasOptions: true },
  { value: "ranking", label: "Rank order", hasOptions: true },
  { value: "matrix", label: "Matrix (grid)", hasOptions: true },
  { value: "boolean", label: "Yes / No", hasOptions: false },
  { value: "rating", label: "Rating", hasOptions: false },
  { value: "numeric_input", label: "Number", hasOptions: false }
];
var typeHasOptions = (t) => QUESTION_TYPES.find((x) => x.value === t)?.hasOptions ?? true;
var TYPE_HINTS = {
  single_choice: "Respondent picks exactly one answer.",
  multi_choice: "Respondent ticks any number of answers; each ticked answer's score counts.",
  dropdown: "Pick one, shown as a dropdown. Good for long answer lists.",
  ranking: "Respondent drags the answers into order. Every answer's score counts.",
  matrix: "A grid: each row is scored against the shared answer columns.",
  boolean: "A single Yes / No toggle.",
  rating: "A small rating scale (2\u201310 buttons); the chosen number is the score. For a wider range use Number.",
  numeric_input: "A free number entry; the entered value is the score.",
  slider: "A slider; the chosen number is the score."
};
var field = "h-9 rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring transition";
var fieldSm = "h-8 rounded-md bg-muted/40 border border-border px-2 text-foreground text-xs outline-none focus:border-ring transition";
var selectStyle = { colorScheme: "dark" };
var optionStyle = {
  backgroundColor: "var(--popover)",
  color: "var(--popover-foreground)"
};
var clone = (v) => JSON.parse(JSON.stringify(v));
var slugify = (v) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/_{2,}/g, "_");
var newOption = () => ({
  label: "",
  value: `opt_${Math.random().toString(36).slice(2, 8)}`,
  score: 0
});
var newQuestion = (dimension) => ({
  id: `q_${Math.random().toString(36).slice(2, 9)}`,
  type: "single_choice",
  label: "",
  dimension,
  options: [newOption(), newOption()]
});
var SafetyFlagPicker = ({ flags, flagOptions, onAdd, onRemove, onAddCustom }) => {
  const [open, setOpen] = (0, import_react6.useState)(false);
  const [addingCustom, setAddingCustom] = (0, import_react6.useState)(false);
  const [customDraft, setCustomDraft] = (0, import_react6.useState)("");
  const [savingCustom, setSavingCustom] = (0, import_react6.useState)(false);
  const ref = (0, import_react6.useRef)(null);
  const hasFlags = flags.length > 0;
  (0, import_react6.useEffect)(() => {
    if (!open) return;
    const onDocDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setAddingCustom(false);
      }
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);
  const choices = flagOptions.filter((f) => !flags.includes(f.code));
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { ref, className: "relative shrink-0", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
      "button",
      {
        type: "button",
        title: hasFlags ? `Safety flags: ${flags.join(", ")}` : "Add safety flags",
        onClick: () => setOpen((o) => !o),
        className: `h-9 w-9 flex items-center justify-center rounded-md border-2 transition ${hasFlags ? "border-amber-500 bg-amber-500/10 text-amber-600" : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"}`,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.Flag, { className: "h-5 w-5", fill: hasFlags ? "currentColor" : "none" }),
          flags.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center leading-none", children: flags.length })
        ]
      }
    ),
    open && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "absolute right-0 top-full mt-1 z-20 w-56 rounded-md border border-border bg-popover shadow-lg p-2 space-y-1.5", children: [
      hasFlags && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "flex flex-wrap gap-1", children: flags.map((k) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
        "span",
        {
          className: "inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-600 text-[10px] px-1.5 py-0.5 rounded font-mono",
          children: [
            k,
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { type: "button", onClick: () => onRemove(k), children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.X, { className: "h-2.5 w-2.5" }) })
          ]
        },
        k
      )) }),
      addingCustom ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "input",
        {
          autoFocus: true,
          disabled: savingCustom,
          value: customDraft,
          onChange: (e) => setCustomDraft(e.target.value),
          onKeyDown: async (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const name = customDraft.trim();
              if (!name) return;
              setSavingCustom(true);
              const code = await onAddCustom(name);
              setSavingCustom(false);
              if (code) onAdd(code);
              setCustomDraft("");
              setAddingCustom(false);
            } else if (e.key === "Escape") {
              setAddingCustom(false);
            }
          },
          placeholder: "Flag name (e.g. Baru sunburn)",
          className: `${fieldSm} w-full`
        }
      ) : /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
        "select",
        {
          value: "",
          onChange: (e) => {
            const v = e.target.value;
            if (v === "__custom__") setAddingCustom(true);
            else if (v) onAdd(v);
          },
          className: `${fieldSm} w-full`,
          style: selectStyle,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("option", { style: optionStyle, value: "", children: "+ add flag" }),
            choices.map((f) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("option", { style: optionStyle, value: f.code, children: f.code }, f.code)),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("option", { style: optionStyle, value: "__custom__", children: "+ Custom\u2026" })
          ]
        }
      )
    ] })
  ] });
};
var QuestionnaireModal = ({
  isOpen,
  onClose,
  onSave,
  editingQ,
  brandId = "wardah",
  applicationId = "skinverse"
}) => {
  const hostRoutes = (0, import_shared8.useHostRoutes)();
  const [step, setStep] = (0, import_react6.useState)("setup");
  const [qCode, setQCode] = (0, import_react6.useState)("");
  const [qBrand, setQBrand] = (0, import_react6.useState)(brandId);
  const [qApp, setQApp] = (0, import_react6.useState)(applicationId);
  const [codeEdited, setCodeEdited] = (0, import_react6.useState)(false);
  const [showCodeField, setShowCodeField] = (0, import_react6.useState)(false);
  const [qName, setQName] = (0, import_react6.useState)("");
  const [qDesc, setQDesc] = (0, import_react6.useState)("");
  const [qStatus, setQStatus] = (0, import_react6.useState)("draft");
  const [questions, setQuestions] = (0, import_react6.useState)([]);
  const [calcMethods, setCalcMethods] = (0, import_react6.useState)({});
  const [apiDimensions, setApiDimensions] = (0, import_react6.useState)([]);
  const [safetyFlagCatalog, setSafetyFlagCatalog] = (0, import_react6.useState)([]);
  const [filterDim, setFilterDim] = (0, import_react6.useState)("all");
  const [collapsed, setCollapsed] = (0, import_react6.useState)({});
  const [scoreDrafts, setScoreDrafts] = (0, import_react6.useState)({});
  const [submitting, setSubmitting] = (0, import_react6.useState)(false);
  const [copied, setCopied] = (0, import_react6.useState)("");
  const copy = (text, tag) => {
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(tag);
        setTimeout(() => setCopied(""), 1500);
      },
      () => {
      }
    );
  };
  (0, import_react6.useEffect)(() => {
    if (!isOpen) return;
    setStep("setup");
    setFilterDim("all");
    if (editingQ) {
      setQCode(editingQ.code);
      setCodeEdited(true);
      setShowCodeField(false);
      setQName(editingQ.name);
      setQDesc(editingQ.description || "");
      setQStatus(editingQ.status || "draft");
      setQBrand(editingQ.brandId || brandId);
      setQApp(editingQ.applicationId || applicationId);
      setQuestions(clone(editingQ.questions || []));
      setCalcMethods(clone(editingQ.calculationMethods || {}));
      setCollapsed(Object.fromEntries((editingQ.questions || []).map((q) => [q.id, true])));
    } else {
      setQCode("");
      setCodeEdited(false);
      setShowCodeField(false);
      setQName("");
      setQDesc("");
      setQStatus("draft");
      setQBrand(brandId);
      setQApp(applicationId);
      setQuestions([]);
      setCalcMethods({});
      setCollapsed({});
    }
  }, [editingQ, isOpen]);
  (0, import_react6.useEffect)(() => {
    if (!isOpen) return;
    getDimensions(hostRoutes).then((raw) => {
      setApiDimensions(
        raw.filter((it) => it && it.code && !it.parentCode).map((it) => ({
          code: it.code,
          label: it.name || it.code,
          purpose: it.description || getDimensionMeta(it.code).purpose
        }))
      );
    }).catch(() => setApiDimensions([]));
  }, [isOpen, hostRoutes]);
  (0, import_react6.useEffect)(() => {
    if (!isOpen) return;
    getSafetyFlags(hostRoutes).then(setSafetyFlagCatalog).catch(() => setSafetyFlagCatalog([]));
  }, [isOpen, hostRoutes]);
  const effectiveCode = codeEdited ? qCode : slugify(qName);
  const usedDimensions = Array.from(new Set(questions.map((q) => q.dimension).filter(Boolean)));
  const flagOptions = (0, import_react6.useMemo)(() => {
    const byCode = /* @__PURE__ */ new Map();
    for (const f of safetyFlagCatalog) byCode.set(f.code, f);
    for (const q of questions) {
      for (const o of q.options || []) {
        for (const k of Object.keys(o.conditionMap || {})) {
          if (!byCode.has(k)) byCode.set(k, { code: k });
        }
      }
    }
    return Array.from(byCode.values()).sort(
      (a, b) => (a.name || a.code).localeCompare(b.name || b.code)
    );
  }, [safetyFlagCatalog, questions]);
  const handleAddCustomFlag = async (name) => {
    const code = slugify(name);
    if (!code) return null;
    const existing = safetyFlagCatalog.find((f) => f.code === code);
    if (existing) return existing.code;
    const created = await createSafetyFlag(hostRoutes, code, name);
    if (created) setSafetyFlagCatalog((prev) => [...prev, created]);
    return code;
  };
  const draftItem = (0, import_react6.useMemo)(
    () => ({
      code: effectiveCode.trim(),
      name: qName.trim(),
      description: qDesc.trim(),
      status: qStatus,
      brandId: qBrand,
      applicationId: qApp,
      questionsCount: questions.length,
      questions,
      calculationMethods: Object.fromEntries(
        usedDimensions.map((d) => [d, calcMethods[d] || "sum"])
      )
    }),
    [effectiveCode, qName, qDesc, qStatus, qBrand, qApp, questions, calcMethods, usedDimensions]
  );
  if (!isOpen) return null;
  const dimensionList = apiDimensions.length ? apiDimensions : FALLBACK_DIMENSIONS;
  const metaOf = (code) => getDimensionMeta(code, dimensionList);
  const schemaJson = JSON.stringify(toSurveyModel(draftItem), null, 2);
  const createBodyJson = JSON.stringify(
    {
      code: qCode || slugify(qName),
      title: qName,
      status: qStatus === "published" || qStatus === "active" ? "active" : qStatus === "archived" ? "archived" : "draft",
      schema: toSurveyModel(draftItem)
    },
    null,
    2
  );
  const updateQuestion = (id, patch) => setQuestions((cur) => cur.map((q) => q.id === id ? { ...q, ...patch } : q));
  const updateOption = (qid, idx, patch) => setQuestions(
    (cur) => cur.map(
      (q) => q.id === qid ? { ...q, options: q.options.map((o, i) => i === idx ? { ...o, ...patch } : o) } : q
    )
  );
  const addQuestion = () => {
    const dim = filterDim !== "all" ? filterDim : usedDimensions[0] || dimensionList[0]?.code || "sebum";
    const q = newQuestion(dim);
    setQuestions((cur) => [...cur, q]);
    setCollapsed((cur) => ({ ...cur, [q.id]: false }));
  };
  const removeQuestion = (id) => setQuestions((cur) => cur.filter((q) => q.id !== id));
  const loadTemplate = (id) => {
    const t = BUILTIN_TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    const built = t.build();
    setQuestions(clone(built.questions || []));
    setCalcMethods(clone(built.calculationMethods || {}));
    if (!qName.trim()) setQName(built.name);
    if (!qDesc.trim()) setQDesc(built.description);
    setCollapsed(Object.fromEntries((built.questions || []).map((q) => [q.id, true])));
    setStep("questions");
  };
  const submit = async (e) => {
    e.preventDefault();
    const code = effectiveCode.trim();
    if (!qName.trim() || !code) return;
    setSubmitting(true);
    try {
      await onSave({ ...draftItem, code });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };
  const visibleQuestions = questions.map((q, index) => ({ q, index })).filter(({ q }) => filterDim === "all" || q.dimension === filterDim);
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
    import_shared8.Modal,
    {
      isOpen,
      onClose,
      size: "3xl",
      icon: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.FileText, { className: "h-4 w-4" }),
      title: editingQ ? "Edit questionnaire" : "New questionnaire",
      subtitle: "Form Engine only calculates scores. Labelling and normalisation happen in the Score Engine.",
      isLoading: submitting,
      loadingText: submitting ? editingQ ? "Saving questionnaire..." : "Creating questionnaire..." : void 0,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center gap-1 rounded-md border border-border bg-muted/30 p-1 text-xs", children: [
          [
            ["setup", "1  Setup"],
            ["questions", `2  Questions (${questions.length})`],
            ["calculation", "3  Calculation"]
          ].map(([v, label]) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
            "button",
            {
              type: "button",
              onClick: () => setStep(v),
              className: `px-3 py-1.5 rounded font-semibold transition ${step === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
              children: label
            },
            v
          )),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
            "button",
            {
              type: "button",
              onClick: () => setStep("json"),
              className: `ml-auto px-3 py-1.5 rounded font-semibold transition ${step === "json" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
              title: "Preview the stored SurveyJS schema",
              children: "Schema"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("form", { onSubmit: submit, className: "mt-3 space-y-3", children: [
          step === "setup" && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "space-y-3", children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "rounded-lg border border-border bg-card p-3 space-y-3", children: [
              /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { className: "block space-y-1", children: [
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "text-muted-foreground text-xs font-semibold", children: "Name" }),
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                  "input",
                  {
                    required: true,
                    value: qName,
                    onChange: (e) => setQName(e.target.value),
                    placeholder: "e.g. Pixie Skin Analyzer",
                    className: `${field} w-full`
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { className: "block text-[11px] text-muted-foreground", children: [
                  "Saved as ",
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("code", { className: "text-foreground", children: effectiveCode || "\u2014" }),
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        setShowCodeField((s) => !s);
                        if (!codeEdited) setQCode(effectiveCode);
                      },
                      className: "ml-2 underline hover:text-foreground",
                      children: showCodeField ? "done" : "edit"
                    }
                  )
                ] }),
                showCodeField && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                  "input",
                  {
                    value: qCode,
                    disabled: !!editingQ,
                    onChange: (e) => {
                      setCodeEdited(true);
                      setQCode(slugify(e.target.value));
                    },
                    className: `${field} w-full font-mono disabled:opacity-50`
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { className: "block space-y-1", children: [
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "text-muted-foreground text-xs font-semibold", children: "Description" }),
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                  "textarea",
                  {
                    value: qDesc,
                    onChange: (e) => setQDesc(e.target.value),
                    rows: 3,
                    placeholder: "What this questionnaire is for.",
                    className: "w-full rounded-md bg-muted/40 border border-border px-2.5 py-2 text-foreground text-xs outline-none focus:border-ring transition resize-y",
                    style: { minHeight: "4.5rem" }
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { className: "block space-y-1", children: [
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "text-muted-foreground text-xs font-semibold", children: "Status" }),
                /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
                  "select",
                  {
                    value: qStatus,
                    onChange: (e) => setQStatus(e.target.value),
                    className: `${field} w-full`,
                    style: selectStyle,
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("option", { style: optionStyle, value: "draft", children: "Draft" }),
                      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("option", { style: optionStyle, value: "published", children: "Published" }),
                      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("option", { style: optionStyle, value: "archived", children: "Archived" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
                /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "text-muted-foreground text-xs font-semibold", children: "Brand" }),
                    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                      import_shared8.InfoTooltip,
                      {
                        content: `Saved under ${qBrand || "\u2014"} / ${qApp || "\u2014"}. Defaults to the Form Engine selector; change it to build for a different tenant.`,
                        label: "About brand / application"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                    import_shared8.BrandSelect,
                    {
                      value: qBrand,
                      includeUniversal: false,
                      label: "",
                      onChange: setQBrand
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "text-muted-foreground text-xs font-semibold", children: "Application" }),
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                    import_shared8.ApplicationSelect,
                    {
                      value: qApp,
                      includeUniversal: false,
                      label: "",
                      onChange: setQApp
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "rounded-lg border border-border bg-card p-3 space-y-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "text-foreground text-xs font-semibold", children: "Start from a template" }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: BUILTIN_TEMPLATES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
                "button",
                {
                  type: "button",
                  onClick: () => loadTemplate(t.id),
                  className: "text-left rounded-md border border-border bg-muted/30 hover:border-ring p-2.5 transition",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "text-foreground text-xs font-semibold", children: t.name }),
                    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "text-muted-foreground text-[11px] mt-0.5 leading-relaxed", children: t.description })
                  ]
                },
                t.id
              )) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "flex justify-end", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_shared8.Button, { type: "button", size: "sm", onClick: () => setStep("questions"), children: "Continue" }) })
          ] }),
          step === "questions" && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "space-y-3", children: [
            usedDimensions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "flex flex-wrap items-center gap-1.5", children: ["all", ...usedDimensions].map((d) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
              "button",
              {
                type: "button",
                onClick: () => setFilterDim(d),
                className: `px-2.5 py-1 rounded-full border text-[11px] font-medium transition ${filterDim === d ? "border-beak/50 bg-beak/15 text-beak" : "border-border text-muted-foreground hover:text-foreground"}`,
                children: d === "all" ? "All" : metaOf(d).label
              },
              d
            )) }),
            questions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "rounded-lg border border-dashed border-border p-8 text-center", children: [
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "text-foreground text-xs font-semibold", children: "No questions yet" }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "text-muted-foreground text-[11px] mt-1 mb-3", children: "Add questions or load a template from Setup." }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_shared8.Button, { type: "button", size: "sm", onClick: addQuestion, children: [
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.Plus, { className: "h-3.5 w-3.5" }),
                " Add question"
              ] })
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "space-y-2", children: [
              visibleQuestions.map(({ q, index }) => {
                const isCollapsed = collapsed[q.id];
                return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "rounded-md border border-border bg-card", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center gap-2 p-2", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "shrink-0 w-6 text-center text-[11px] font-bold text-muted-foreground", children: index + 1 }),
                    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                      "input",
                      {
                        value: q.label,
                        onChange: (e) => updateQuestion(q.id, { label: e.target.value }),
                        placeholder: "Question text",
                        className: `${fieldSm} flex-1 min-w-0`
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                      "button",
                      {
                        type: "button",
                        onClick: () => setCollapsed((c) => ({ ...c, [q.id]: !c[q.id] })),
                        className: "shrink-0 text-muted-foreground hover:text-foreground",
                        children: isCollapsed ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.ChevronRight, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.ChevronDown, { className: "h-4 w-4" })
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                      "button",
                      {
                        type: "button",
                        onClick: () => removeQuestion(q.id),
                        className: "shrink-0 text-muted-foreground hover:text-destructive",
                        children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.Trash2, { className: "h-3.5 w-3.5" })
                      }
                    )
                  ] }),
                  !isCollapsed && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "border-t border-border p-2.5 space-y-2", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
                      "div",
                      {
                        className: "flex flex-wrap items-center",
                        style: { columnGap: "2rem", rowGap: "0.5rem" },
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { className: "flex items-center gap-1 shrink-0 text-[11px] font-semibold text-muted-foreground", children: [
                              "Question type",
                              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                                import_shared8.InfoTooltip,
                                {
                                  content: TYPE_HINTS[q.type],
                                  label: "About this question type",
                                  iconClassName: "h-3 w-3"
                                }
                              )
                            ] }),
                            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                              "select",
                              {
                                value: q.type,
                                onChange: (e) => {
                                  const next = e.target.value;
                                  const patch = { type: next };
                                  if (typeHasOptions(next) && (!q.options || q.options.length === 0)) {
                                    patch.options = [newOption(), newOption()];
                                  }
                                  if ((next === "rating" || next === "numeric_input") && !q.scale) {
                                    patch.scale = { min: 0, max: next === "rating" ? 5 : 100 };
                                  }
                                  if (next === "matrix" && (!q.rows || q.rows.length === 0)) {
                                    patch.rows = [
                                      { value: `row_${Math.random().toString(36).slice(2, 7)}`, label: "" },
                                      { value: `row_${Math.random().toString(36).slice(2, 7)}`, label: "" }
                                    ];
                                  }
                                  updateQuestion(q.id, patch);
                                },
                                className: `${fieldSm} w-36`,
                                style: selectStyle,
                                children: QUESTION_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("option", { style: optionStyle, value: t.value, children: t.label }, t.value))
                              }
                            ),
                            typeHasOptions(q.type) && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { className: "text-[11px] text-muted-foreground", children: [
                              q.options.length,
                              " ",
                              q.type === "matrix" ? "columns" : "answers"
                            ] })
                          ] }),
                          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { className: "flex items-center gap-1 shrink-0 text-[11px] font-semibold text-muted-foreground", children: [
                              "Dimension",
                              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                                import_shared8.InfoTooltip,
                                {
                                  content: "On: this question's answer counts toward a dimension's score. Off: it's collected as a plain label only (e.g. a free-text main concern), with no effect on scoring.",
                                  label: "About scoring vs. labeling",
                                  iconClassName: "h-3 w-3"
                                }
                              )
                            ] }),
                            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                              "button",
                              {
                                type: "button",
                                role: "switch",
                                "aria-checked": Boolean(q.dimension),
                                onClick: () => updateQuestion(q.id, {
                                  dimension: q.dimension ? "" : usedDimensions[0] || dimensionList[0]?.code || ""
                                }),
                                title: q.dimension ? "Counts toward scoring" : "Label only \u2014 click to score it",
                                className: `relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${q.dimension ? "bg-emerald-500" : "bg-secondary border border-border"}`,
                                children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                                  "span",
                                  {
                                    className: `pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${q.dimension ? "translate-x-4" : "translate-x-0"}`
                                  }
                                )
                              }
                            ),
                            q.dimension && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                              "select",
                              {
                                value: q.dimension,
                                onChange: (e) => updateQuestion(q.id, { dimension: e.target.value }),
                                className: `${fieldSm} w-56`,
                                style: selectStyle,
                                children: dimensionList.map((d) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("option", { style: optionStyle, value: d.code, children: d.label }, d.code))
                              }
                            )
                          ] })
                        ]
                      }
                    ),
                    q.type === "boolean" && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "flex items-center gap-3", children: ["scoreTrue", "scoreFalse"].map((k) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
                      "label",
                      {
                        className: "flex items-center gap-1 text-[11px] text-muted-foreground",
                        children: [
                          k === "scoreTrue" ? "Score if Yes" : "Score if No",
                          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                            "input",
                            {
                              type: "text",
                              inputMode: "numeric",
                              value: scoreDrafts[`${q.id}:${k}`] ?? String(q[k] ?? (k === "scoreTrue" ? 1 : 0)),
                              onChange: (e) => {
                                const v = e.target.value;
                                if (!/^-?\d*$/.test(v)) return;
                                setScoreDrafts((d) => ({ ...d, [`${q.id}:${k}`]: v }));
                                updateQuestion(q.id, {
                                  [k]: v === "" || v === "-" ? 0 : parseInt(v, 10)
                                });
                              },
                              onBlur: () => setScoreDrafts((d) => {
                                const n = { ...d };
                                delete n[`${q.id}:${k}`];
                                return n;
                              }),
                              className: `${fieldSm} w-14 text-right`
                            }
                          )
                        ]
                      },
                      k
                    )) }),
                    (q.type === "rating" || q.type === "numeric_input") && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "flex items-center gap-3", children: ["min", "max"].map((k) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
                      "label",
                      {
                        className: "flex items-center gap-1 text-[11px] text-muted-foreground",
                        children: [
                          k,
                          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                            "input",
                            {
                              type: "number",
                              min: 0,
                              max: q.type === "rating" ? 10 : void 0,
                              value: q.scale?.[k] ?? (k === "min" ? 0 : q.type === "rating" ? 5 : 100),
                              onChange: (e) => {
                                let n = parseInt(e.target.value || "0", 10);
                                if (Number.isNaN(n)) n = 0;
                                if (q.type === "rating") {
                                  n = k === "max" ? Math.min(10, Math.max(2, n)) : Math.max(0, n);
                                }
                                updateQuestion(q.id, {
                                  scale: {
                                    min: q.scale?.min ?? 0,
                                    max: q.scale?.max ?? (q.type === "rating" ? 5 : 100),
                                    [k]: n
                                  }
                                });
                              },
                              className: `${fieldSm} w-16 text-right`
                            }
                          )
                        ]
                      },
                      k
                    )) }),
                    q.type === "matrix" && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "rounded-md border border-border bg-muted/20 p-2 space-y-1.5", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center gap-1.5", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "text-[11px] font-semibold text-foreground", children: "Rows" }),
                        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                          import_shared8.InfoTooltip,
                          {
                            content: "One score line per row.",
                            label: "About matrix rows",
                            iconClassName: "h-3 w-3"
                          }
                        )
                      ] }),
                      (q.rows ?? []).map((r, ri) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "text-[10px] text-muted-foreground w-4 text-right", children: ri + 1 }),
                        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                          "input",
                          {
                            value: r.label,
                            onChange: (e) => updateQuestion(q.id, {
                              rows: (q.rows ?? []).map(
                                (x, i) => i === ri ? { ...x, label: e.target.value } : x
                              )
                            }),
                            placeholder: `Row ${ri + 1} (e.g. "Forehead")`,
                            className: `${fieldSm} flex-1 min-w-0`
                          }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                          "button",
                          {
                            type: "button",
                            onClick: () => updateQuestion(q.id, {
                              rows: (q.rows ?? []).filter((_, i) => i !== ri)
                            }),
                            className: "shrink-0 text-muted-foreground hover:text-destructive",
                            children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.X, { className: "h-3.5 w-3.5" })
                          }
                        )
                      ] }, r.value)),
                      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
                        "button",
                        {
                          type: "button",
                          onClick: () => updateQuestion(q.id, {
                            rows: [
                              ...q.rows ?? [],
                              { value: `row_${Math.random().toString(36).slice(2, 7)}`, label: "" }
                            ]
                          }),
                          className: "text-beak text-[11px] font-semibold inline-flex items-center gap-1",
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.Plus, { className: "h-3 w-3" }),
                            " Add row"
                          ]
                        }
                      )
                    ] }),
                    typeHasOptions(q.type) && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: q.type === "matrix" ? "rounded-md border border-border bg-muted/20 p-2 space-y-1.5" : "space-y-1", children: [
                      q.type === "matrix" && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center gap-1.5", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "text-[11px] font-semibold text-foreground", children: "Answer columns" }),
                        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                          import_shared8.InfoTooltip,
                          {
                            content: "Shared by every row; each column carries a score.",
                            label: "About matrix answer columns",
                            iconClassName: "h-3 w-3"
                          }
                        )
                      ] }),
                      q.options.map((o, idx) => {
                        const currentFlags = Object.keys(o.conditionMap || {});
                        return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                            "input",
                            {
                              value: o.label,
                              onChange: (e) => updateOption(q.id, idx, { label: e.target.value }),
                              placeholder: q.type === "matrix" ? `Column ${idx + 1} (e.g. "Severe")` : `Answer ${idx + 1}`,
                              className: `${fieldSm} flex-1 min-w-0`
                            }
                          ),
                          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { className: "flex items-center gap-1 text-[11px] text-muted-foreground shrink-0", children: [
                            "score",
                            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                              "input",
                              {
                                type: "text",
                                inputMode: "numeric",
                                value: scoreDrafts[`${q.id}:${idx}`] ?? String(o.score ?? 0),
                                onChange: (e) => {
                                  const v = e.target.value;
                                  if (!/^-?\d*$/.test(v)) return;
                                  setScoreDrafts((d) => ({ ...d, [`${q.id}:${idx}`]: v }));
                                  updateOption(q.id, idx, {
                                    score: v === "" || v === "-" ? 0 : parseInt(v, 10)
                                  });
                                },
                                onBlur: () => setScoreDrafts((d) => {
                                  const next = { ...d };
                                  delete next[`${q.id}:${idx}`];
                                  return next;
                                }),
                                className: `${fieldSm} w-10 text-right`
                              }
                            )
                          ] }),
                          q.type !== "matrix" && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                            SafetyFlagPicker,
                            {
                              flags: currentFlags,
                              flagOptions,
                              onAddCustom: handleAddCustomFlag,
                              onAdd: (k) => updateOption(q.id, idx, {
                                conditionMap: { ...o.conditionMap || {}, [k]: true }
                              }),
                              onRemove: (k) => {
                                const next = { ...o.conditionMap || {} };
                                delete next[k];
                                updateOption(q.id, idx, {
                                  conditionMap: Object.keys(next).length ? next : void 0
                                });
                              }
                            }
                          ),
                          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                            "button",
                            {
                              type: "button",
                              onClick: () => updateQuestion(q.id, {
                                options: q.options.filter((_, i) => i !== idx)
                              }),
                              className: "shrink-0 text-muted-foreground hover:text-destructive",
                              children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.X, { className: "h-3.5 w-3.5" })
                            }
                          )
                        ] }, idx);
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
                        "button",
                        {
                          type: "button",
                          onClick: () => updateQuestion(q.id, { options: [...q.options, newOption()] }),
                          className: "text-beak text-[11px] font-semibold inline-flex items-center gap-1",
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.Plus, { className: "h-3 w-3" }),
                            " ",
                            q.type === "matrix" ? "Add column" : "Add answer"
                          ]
                        }
                      )
                    ] })
                  ] })
                ] }, q.id);
              }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
                "button",
                {
                  type: "button",
                  onClick: addQuestion,
                  className: "text-beak text-xs font-semibold inline-flex items-center gap-1",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.Plus, { className: "h-3.5 w-3.5" }),
                    " Add question"
                  ]
                }
              )
            ] })
          ] }),
          step === "calculation" && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "rounded-lg border border-border bg-card p-3 space-y-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "text-foreground text-xs font-semibold", children: "Calculation method per dimension" }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                import_shared8.InfoTooltip,
                {
                  content: "How every answer score for a dimension is combined into one number before it is sent to the Score Engine.",
                  label: "About calculation methods"
                }
              )
            ] }),
            usedDimensions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "text-muted-foreground text-xs py-4 text-center", children: "Add questions first." }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "space-y-2 pt-1", children: usedDimensions.map((d) => {
              const method = calcMethods[d] || "sum";
              const hint = CALCULATION_METHODS.find((m) => m.value === method)?.hint;
              return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { className: "w-40 shrink-0 text-xs font-semibold text-foreground", children: [
                  metaOf(d).label,
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { className: "block text-[10px] font-normal text-muted-foreground", children: [
                    questions.filter((q) => q.dimension === d).length,
                    " question(s)"
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                  "select",
                  {
                    value: method,
                    onChange: (e) => setCalcMethods((cur) => ({ ...cur, [d]: e.target.value })),
                    className: `${field} w-40 shrink-0`,
                    style: selectStyle,
                    children: CALCULATION_METHODS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("option", { style: optionStyle, value: m.value, children: m.label }, m.value))
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_shared8.InfoTooltip, { content: hint, label: "About this calculation method" })
              ] }, d);
            }) })
          ] }),
          step === "json" && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "rounded-lg border border-border bg-card p-3 space-y-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "text-foreground text-xs font-semibold", children: "Stored SurveyJS schema" }),
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                  import_shared8.InfoTooltip,
                  {
                    content: "The exact JSON persisted to the Form Engine and rendered to respondents. Custom keys (dimension, score, condition_map, calculation_methods) drive scoring. Copy Create body gives the ready-to-paste payload for POST /v1/survey (Create Questionnaire).",
                    label: "About the stored schema"
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                  "button",
                  {
                    type: "button",
                    onClick: () => copy(schemaJson, "schema"),
                    className: "h-7 rounded-md border border-border bg-muted/40 px-2.5 text-[11px] font-semibold text-foreground hover:bg-muted",
                    children: copied === "schema" ? "Copied" : "Copy schema"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                  "button",
                  {
                    type: "button",
                    onClick: () => copy(createBodyJson, "body"),
                    className: "h-7 rounded-md border border-border bg-beak/10 px-2.5 text-[11px] font-semibold text-beak hover:bg-beak/20",
                    children: copied === "body" ? "Copied" : "Copy Create body"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("pre", { className: "w-full max-h-96 overflow-auto rounded-md bg-muted/40 border border-border p-2.5 text-foreground text-[11px] font-mono leading-relaxed whitespace-pre", children: schemaJson })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "flex items-center justify-end pt-3 border-t border-border", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_shared8.Button, { type: "submit", size: "sm", isLoading: submitting, disabled: !qName.trim(), children: editingQ ? "Save changes" : "Create questionnaire" }) })
        ] })
      ]
    }
  );
};

// src/form/components/FormManager.tsx
var import_jsx_runtime9 = require("react/jsx-runtime");
var TENANT_KEY = "xg.formEngine.tenant";
var readTenant = () => {
  const t = (0, import_shared9.readPersisted)(TENANT_KEY);
  if (t?.brandId && t?.applicationId) return t;
  return { brandId: "wardah", applicationId: "skinverse" };
};
var FormManager = () => {
  const [activeTab, setActiveTab] = (0, import_shared9.usePersistentState)("xg.formEngine.activeTab", "questionnaires");
  const [searchQuery, setSearchQuery] = (0, import_react7.useState)("");
  const [deleteConfirm, setDeleteConfirm] = (0, import_react7.useState)({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {
    }
  });
  const [{ brandId, applicationId }, setTenant] = (0, import_react7.useState)(readTenant);
  const [questionnaires, setQuestionnaires] = (0, import_react7.useState)([]);
  const [isQuestionnaireModalOpen, setIsQuestionnaireModalOpen] = (0, import_react7.useState)(false);
  const [editingQ, setEditingQ] = (0, import_react7.useState)(null);
  const [selectedQCode, setSelectedQCode] = (0, import_shared9.usePersistentState)("xg.formEngine.simulator.questionnaire", "");
  const loadData = () => {
    listQuestionnaires(brandId, applicationId).then(setQuestionnaires).catch(() => setQuestionnaires([]));
  };
  (0, import_react7.useEffect)(() => {
    loadData();
    (0, import_shared9.writePersisted)(TENANT_KEY, { brandId, applicationId });
  }, [brandId, applicationId]);
  (0, import_react7.useEffect)(() => {
    if (questionnaires.length === 0) return;
    if (!questionnaires.some((q) => q.code === selectedQCode)) {
      setSelectedQCode(questionnaires[0].code);
    }
  }, [questionnaires, selectedQCode]);
  const formTabs = [
    { id: "questionnaires", label: "Questionnaires", icon: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_lucide_react8.FileText, { className: "h-4 w-4" }), badge: questionnaires.length },
    { id: "simulator", label: "Simulator", icon: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_lucide_react8.Play, { className: "h-4 w-4" }) }
  ];
  const handleSaveQuestionnaire = async (data) => {
    if (editingQ) {
      const updated = { ...editingQ, ...data };
      setQuestionnaires((prev) => prev.map((x) => x.code === editingQ.code ? updated : x));
      try {
        await saveQuestionnaire(updated, brandId, applicationId);
      } catch {
      }
    } else {
      const newItem = {
        ...data,
        brandId: data.brandId || brandId,
        applicationId: data.applicationId || applicationId,
        questionsCount: data.questions?.length || 0
      };
      setQuestionnaires((prev) => [...prev, newItem]);
      try {
        await saveQuestionnaire(newItem, brandId, applicationId);
      } catch {
      }
    }
    loadData();
  };
  const handleDeleteQuestionnaire = (code) => {
    const q = questionnaires.find((x) => x.code === code);
    setDeleteConfirm({
      isOpen: true,
      title: "Delete Questionnaire Form",
      message: `Are you sure you want to delete questionnaire form "${q?.name || code}" (${code})?`,
      onConfirm: async () => {
        setQuestionnaires((prev) => prev.filter((q2) => q2.code !== code));
        try {
          await deleteQuestionnaire(code, brandId, applicationId);
        } catch {
        }
        setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex-1 min-w-0 h-full overflow-y-auto bg-background text-foreground font-sans flex flex-col select-none", children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      import_shared9.PageHeader,
      {
        icon: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_lucide_react8.FileText, { className: "h-5 w-5" }),
        breadcrumbs: [
          { label: "Workbench", href: "/" },
          { label: "Core Engines" },
          { label: "Form Engine" }
        ],
        title: "Form Engine",
        children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          import_shared9.TabNav,
          {
            tabs: formTabs,
            activeTab,
            onTabChange: (id) => setActiveTab(id)
          }
        )
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("main", { className: "flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          import_shared9.BrandSelect,
          {
            value: brandId,
            includeUniversal: false,
            label: "Brand",
            className: "w-48",
            onChange: (v) => setTenant((t) => ({ ...t, brandId: v }))
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          import_shared9.ApplicationSelect,
          {
            value: applicationId,
            includeUniversal: false,
            label: "Application",
            className: "w-48",
            onChange: (v) => setTenant((t) => ({ ...t, applicationId: v }))
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "flex pb-2", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          import_shared9.InfoTooltip,
          {
            content: "Questionnaires below are scoped to this brand / application.",
            label: "About brand / application scope"
          }
        ) })
      ] }),
      activeTab === "questionnaires" && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        QuestionnairesTab,
        {
          questionnaires,
          searchQuery,
          onSearchChange: setSearchQuery,
          onOpenAddModal: () => {
            setEditingQ(null);
            setIsQuestionnaireModalOpen(true);
          },
          onOpenEditModal: (q) => {
            setEditingQ(q);
            setIsQuestionnaireModalOpen(true);
          },
          onDeleteQuestionnaire: handleDeleteQuestionnaire
        }
      ),
      activeTab === "simulator" && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        FormSimulatorTab,
        {
          brandId,
          applicationId,
          questionnaires,
          selectedQCode,
          setSelectedQCode
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      QuestionnaireModal,
      {
        isOpen: isQuestionnaireModalOpen,
        onClose: () => setIsQuestionnaireModalOpen(false),
        onSave: handleSaveQuestionnaire,
        editingQ,
        brandId,
        applicationId
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      import_shared9.ConfirmDialog,
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

// src/form/QuestionnaireRunner.tsx
var import_react8 = require("react");
var import_survey_core2 = require("survey-core");
var import_survey_react_ui2 = require("survey-react-ui");
var import_jsx_runtime10 = require("react/jsx-runtime");
function computeDimensions(schema, data) {
  const byDimension = scoreSurveyAnswers(schema, data);
  const methods = schema.calculation_methods || {};
  return Object.entries(byDimension).map(([code, raw]) => {
    const method = methods[code] || "sum";
    return {
      code,
      calculation_method: method,
      score: Math.round(applyCalculationMethod(raw, method) * 100) / 100,
      raw_scores: raw
    };
  });
}
var QuestionnaireRunner = ({
  questionnaireCode,
  model: modelProp,
  questionnaire,
  customerId,
  brandId,
  applicationId,
  onComplete,
  onAnswer,
  renderComplete,
  className = ""
}) => {
  const initialSchema = modelProp ? modelProp : questionnaire ? toSurveyModel(questionnaire) : null;
  const [schema, setSchema] = (0, import_react8.useState)(initialSchema);
  const [loading, setLoading] = (0, import_react8.useState)(!initialSchema);
  const [error, setError] = (0, import_react8.useState)(null);
  const [payload, setPayload] = (0, import_react8.useState)(null);
  (0, import_react8.useEffect)(() => {
    if (initialSchema) {
      setSchema(initialSchema);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    getQuestionnaireModel(questionnaireCode, brandId, applicationId).then((m) => {
      if (!alive) return;
      if (m) setSchema(m);
      else setError("This questionnaire is not available.");
    }).catch(() => alive && setError("Could not load the questionnaire.")).finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [questionnaireCode, modelProp, questionnaire, brandId, applicationId]);
  const survey = (0, import_react8.useMemo)(() => {
    if (!schema) return null;
    const m = new import_survey_core2.Model(schema);
    m.showCompletedPage = false;
    m.applyTheme(XG_SURVEY_THEME);
    m.getAllQuestions().forEach((q) => {
      if (q.getType() === "boolean") q.renderAs = "radio";
    });
    return m;
  }, [schema]);
  (0, import_react8.useEffect)(() => {
    if (!survey || !schema) return;
    const onValue = (_, opt2) => onAnswer?.(opt2.name, opt2.value);
    const onComplete_ = async (sender) => {
      const data = sender.data;
      let plain = [];
      try {
        plain = sender.getPlainData?.() ?? [];
      } catch {
        plain = [];
      }
      const result = {
        questionnaire_code: schema.code || questionnaireCode,
        customer_id: customerId,
        source: "questionnaire",
        brand_id: brandId,
        application_id: applicationId,
        answers: data,
        plain_data: plain,
        dimensions: computeDimensions(schema, data),
        completed_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      try {
        await onComplete(result);
      } finally {
        setPayload(result);
      }
    };
    survey.onValueChanged.add(onValue);
    survey.onComplete.add(onComplete_);
    return () => {
      survey.onValueChanged.remove(onValue);
      survey.onComplete.remove(onComplete_);
    };
  }, [survey, schema, customerId, brandId, applicationId]);
  const shell = `w-full max-w-2xl mx-auto text-foreground ${className}`;
  if (loading) {
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: shell, children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground", children: "Loading\u2026" }) });
  }
  if (error || !survey) {
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: shell, children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground", children: error || "This questionnaire is not available." }) });
  }
  if (payload) {
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: shell, children: renderComplete ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_jsx_runtime10.Fragment, { children: renderComplete(payload) }) : /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "rounded-xl border border-border bg-card p-8 text-center space-y-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-beak/15 text-beak text-xl", children: "\u2713" }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "text-sm font-semibold", children: "Thanks \u2014 your answers are in." }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "text-xs text-muted-foreground", children: "You can close this window now." })
    ] }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: shell, children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_survey_react_ui2.Survey, { model: survey }) });
};

// src/score/index.ts
var score_exports = {};
__export(score_exports, {
  BandTable: () => BandTable,
  BlendingTab: () => BlendingTab,
  ClinicalAxisCard: () => ClinicalAxisCard,
  ClinicalDimensionCard: () => ClinicalDimensionCard,
  DEFAULT_SCORE_RANGE_BANDS: () => DEFAULT_SCORE_RANGE_BANDS,
  DEFAULT_SEVERITY_BANDS: () => DEFAULT_SEVERITY_BANDS,
  DEFAULT_STARTER_AXES: () => DEFAULT_STARTER_AXES,
  DEFAULT_STARTER_PROFILES: () => DEFAULT_STARTER_PROFILES,
  ProfileMappingTable: () => ProfileMappingTable,
  ScoreManager: () => ScoreManager,
  SeverityTierTable: () => SeverityTierTable,
  compileVisualToJDM: () => compileVisualToJDM,
  decompileJDMToVisual: () => decompileJDMToVisual,
  decompileJDMToVisualComponents: () => decompileJDMToVisualComponents,
  defaultConcernLabel: () => defaultConcernLabel
});

// src/score/components/ScoreManager.tsx
var import_react15 = require("react");
var import_lucide_react15 = require("lucide-react");
var import_shared16 = require("@gateway-experience/shared");

// src/core/scope.ts
var ALL_TENANTS = "*";
function tenantScopeQuery(brandId = ALL_TENANTS, applicationId = ALL_TENANTS) {
  return `brand_id=${encodeURIComponent(brandId || ALL_TENANTS)}&application_id=${encodeURIComponent(applicationId || ALL_TENANTS)}`;
}
function withTenantScope(path, brandId, applicationId) {
  return `${path}${path.includes("?") ? "&" : "?"}${tenantScopeQuery(brandId, applicationId)}`;
}

// src/score/api.ts
var SCORE = "/core/score-engine";
async function listRulesets() {
  const data = await (await fetch(withTenantScope(`${SCORE}/rulesets`))).json();
  return Array.isArray(data.rulesets) ? data.rulesets : null;
}
async function throwFromBody(res, fallback) {
  const errData = await res.json().catch(() => ({}));
  const list2 = Array.isArray(errData?.errors) ? errData.errors : [];
  const items = list2.map((e) => typeof e === "string" ? e : e?.message || JSON.stringify(e));
  const head = errData?.error || fallback;
  throw new Error(items.length ? `${head}: ${items.join("; ")}` : head);
}
async function saveRuleset(ruleset) {
  const isEdit = !!ruleset.id;
  const res = await fetch(isEdit ? `${SCORE}/rulesets/${ruleset.id}` : `${SCORE}/rulesets`, {
    method: isEdit ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ruleset)
  });
  if (!res.ok) await throwFromBody(res, "Failed to save skin grading framework");
}
async function deleteRuleset(id) {
  const res = await fetch(`${SCORE}/rulesets/${id}`, { method: "DELETE" });
  if (!res.ok) await throwFromBody(res, "Failed to delete ruleset");
}
var SIMULATE_PATH = `${SCORE}/simulate`;
async function simulateRuleset(body) {
  const res = await fetch(SIMULATE_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.ok ? await res.json() : null;
}
async function fetchTenantSurveys(brandId, applicationId) {
  const res = await fetch(
    `/core/form-engine/survey?brand_id=${encodeURIComponent(brandId)}&application_id=${encodeURIComponent(applicationId)}`
  );
  return res.ok ? res.json() : null;
}
function surveyList(data) {
  const d = data;
  return Array.isArray(data) ? data : Array.isArray(d?.surveys) ? d.surveys : d?.code ? [data] : [];
}
async function listSkinConditions(routes) {
  const data = await (await fetch(routes.skinConditions)).json();
  return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
}

// src/score/components/tabs/RulesetsTab.tsx
var import_react9 = __toESM(require("react"));
var import_lucide_react9 = require("lucide-react");
var import_shared10 = require("@gateway-experience/shared");
var import_jsx_runtime11 = require("react/jsx-runtime");
var filterSelect = "h-8 rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring";
var RulesetsTab = ({
  rulesets,
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  onOpenEditModal,
  onSelectSimulatorRuleset,
  onDeleteRuleset
}) => {
  const [filterBrand, setFilterBrand] = import_react9.default.useState("ALL");
  const [filterStatus, setFilterStatus] = import_react9.default.useState("ALL");
  const [copiedId, setCopiedId] = import_react9.default.useState(null);
  const copyId = (id) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };
  const filteredRulesets = rulesets.filter((r) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || r.code.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q);
    const matchesBrand = filterBrand === "ALL" || r.brandId === filterBrand;
    const matchesStatus = filterStatus === "ALL" || r.status === filterStatus;
    return matchesSearch && matchesBrand && matchesStatus;
  });
  const uniqueBrands = Array.from(new Set(rulesets.map((r) => r.brandId).filter(Boolean)));
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "space-y-4", children: [
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
      import_shared10.SearchFilterBar,
      {
        searchQuery,
        onSearchChange,
        searchPlaceholder: "Search grading models by title, code, or brand\u2026",
        actionLabel: "New grading model",
        onAction: onOpenCreateModal,
        actionIcon: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_lucide_react9.Plus, { className: "h-4 w-4" }),
        customFilterContent: /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
            "select",
            {
              value: filterBrand,
              onChange: (e) => setFilterBrand(e.target.value),
              className: filterSelect,
              style: { colorScheme: "dark" },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("option", { value: "ALL", children: "All brands" }),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("option", { value: "*", children: "* (universal)" }),
                uniqueBrands.filter((b) => b !== "*").map((b) => /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("option", { value: b, children: b }, b))
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
            "select",
            {
              value: filterStatus,
              onChange: (e) => setFilterStatus(e.target.value),
              className: filterSelect,
              style: { colorScheme: "dark" },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("option", { value: "ALL", children: "All statuses" }),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("option", { value: "ACTIVE", children: "Active" }),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("option", { value: "DRAFT", children: "Draft" }),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("option", { value: "INACTIVE", children: "Inactive" }),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("option", { value: "ARCHIVED", children: "Archived" })
              ]
            }
          )
        ] })
      }
    ),
    filteredRulesets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
      import_shared10.EmptyState,
      {
        icon: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_lucide_react9.Sliders, { className: "h-6 w-6 text-muted-foreground" }),
        title: "No grading models yet",
        description: "A grading model turns 0\u2013100 dimension scores into Level 1\u20135 severity and a skin profile.",
        actionLabel: "New grading model",
        onAction: onOpenCreateModal,
        actionIcon: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_lucide_react9.Plus, { className: "h-4 w-4" }),
        className: "py-12 rounded-lg border border-border bg-card"
      }
    ) : /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: filteredRulesets.map((ruleset) => {
      let dimCount = 0;
      try {
        const parsed = JSON.parse(ruleset.schema);
        const dimKeys = parsed.dimension_weights || parsed.concern_labels || parsed.axis_codes || {};
        dimCount = Object.keys(dimKeys).length;
      } catch {
      }
      return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
        "div",
        {
          className: "rounded-lg border border-border bg-card p-4 flex flex-col justify-between transition-colors hover:border-beak/50",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "font-mono text-[10px] text-beak bg-beak/10 px-2 py-0.5 rounded border border-beak/30", children: ruleset.code }),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { className: "text-[11px] text-muted-foreground", children: [
                  "v",
                  ruleset.version
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_shared10.StatusBadge, { status: ruleset.status })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("h3", { className: "text-sm font-bold text-foreground mt-1.5", children: ruleset.title }),
              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { className: "text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed", children: ruleset.description || "Severity bands and skin-profile mapping for this brand." }),
              /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "flex items-center gap-4 text-[11px] text-muted-foreground mt-3", children: [
                /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { children: [
                  "Brand ",
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "text-foreground", children: ruleset.brandId })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { children: [
                  "App ",
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "text-foreground", children: ruleset.applicationId })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "text-foreground", children: dimCount }),
                  " dimensions"
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
                "button",
                {
                  type: "button",
                  onClick: () => copyId(ruleset.id),
                  title: "Copy ID \u2014 needed for PUT /core/score-engine/rulesets/:id",
                  className: "mt-2 flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground",
                  children: [
                    copiedId === ruleset.id ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_lucide_react9.Check, { className: "h-3 w-3 text-beak" }) : /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_lucide_react9.Copy, { className: "h-3 w-3" }),
                    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "truncate max-w-[16rem]", children: copiedId === ruleset.id ? "ID copied" : `ID ${ruleset.id}` })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "flex items-center justify-between pt-3 mt-3 border-t border-border", children: [
              /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
                  import_shared10.Button,
                  {
                    variant: "outline",
                    size: "sm",
                    onClick: () => onOpenEditModal(ruleset),
                    leftIcon: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_lucide_react9.Pencil, { className: "h-3.5 w-3.5" }),
                    children: "Edit"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
                  import_shared10.Button,
                  {
                    variant: "outline",
                    size: "sm",
                    onClick: () => onSelectSimulatorRuleset(ruleset),
                    leftIcon: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_lucide_react9.Play, { className: "h-3.5 w-3.5" }),
                    children: "Simulate"
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
                "button",
                {
                  onClick: () => onDeleteRuleset(ruleset.id, ruleset.code),
                  className: "p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted/40 rounded transition-colors",
                  title: "Delete grading model",
                  children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_lucide_react9.Trash2, { className: "h-4 w-4" })
                }
              )
            ] })
          ]
        },
        ruleset.id
      );
    }) })
  ] });
};

// src/score/components/tabs/BlendingTab.tsx
var import_react11 = require("react");
var import_lucide_react11 = require("lucide-react");
var import_shared12 = require("@gateway-experience/shared");

// src/score/types.ts
var LEGACY_SOURCES = {
  form: { scale: [0, 100], direction: "concern" },
  vision: { scale: [0, 100], direction: "health" }
};
var AGE_FIELD = "age_over_30";
var FORM_SOURCE = "form";
var VISION_SOURCE = "vision";
var DEFAULT_SCORE_RANGE_BANDS = [
  { id: "sr1", max: 40, label: "Perlu Perhatian Khusus" },
  { id: "sr2", max: 60, label: "Sedang" },
  { id: "sr3", max: 100, label: "Optimal" }
];
var DEFAULT_SEVERITY_BANDS = [
  { id: "sv1", max: 20, label: "Sangat Parah" },
  { id: "sv2", max: 40, label: "Parah" },
  { id: "sv3", max: 60, label: "Sedang" },
  { id: "sv4", max: 80, label: "Ringan" },
  { id: "sv5", max: 100, label: "Sehat" }
];
var KNOWN_VISION_FIELDS = [
  { code: "data.inference_result.results.skin_scoring.Darkspot", label: "Darkspot", description: "results.skin_scoring.Darkspot \u2014 feeds Pigmentation." },
  { code: "data.inference_result.results.skin_scoring.Wrinkle", label: "Wrinkle", description: "results.skin_scoring.Wrinkle \u2014 feeds Aging." },
  { code: "data.inference_result.results.skin_scoring.Pores", label: "Pores", description: "results.skin_scoring.Pores \u2014 feeds Pore Severity." },
  { code: "age_over_30", label: "Age > 30 (from DOB)", description: "Derived from date_of_birth on the identity questionnaire, not a Q1-Q6 question. 0 if <=30, 100 if >30." }
];

// src/score/utils/blend.ts
var WEIGHT_SUM_TOLERANCE = 1e-6;
var isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
var pct = (w) => typeof w === "number" && Number.isFinite(w) ? Math.round(w * 100 * 1e6) / 1e6 : void 0;
function convertLegacyDimension(key, fusion, mapping) {
  const formField = mapping?.form === AGE_FIELD ? AGE_FIELD : key;
  const visionField = mapping?.vision;
  if (fusion) {
    const out = [];
    if ((fusion.form ?? 0) > 0) out.push({ source: "form", field: formField, weight: pct(fusion.form) });
    if ((fusion.vision ?? 0) > 0 && visionField) out.push({ source: "vision", field: visionField, weight: pct(fusion.vision) });
    return out.length === 1 ? [{ ...out[0], weight: 100 }] : out;
  }
  const mapped = [];
  if (mapping?.form) mapped.push({ source: "form", field: formField, weight: void 0 });
  if (visionField) mapped.push({ source: "vision", field: visionField, weight: void 0 });
  if (mapped.length === 0) return [{ source: "form", field: key, weight: 100 }];
  if (mapped.length === 1) return [{ ...mapped[0], weight: 100 }];
  return mapped;
}
function readBlend(schema, legacyKeys = []) {
  if (isObj(schema.sources) || isObj(schema.dimension_inputs)) {
    const sources2 = {};
    for (const [name, s] of Object.entries(isObj(schema.sources) ? schema.sources : {})) {
      if (!isObj(s)) continue;
      const scale = Array.isArray(s.scale) && s.scale.length === 2 ? [Number(s.scale[0]), Number(s.scale[1])] : [NaN, NaN];
      sources2[name] = { scale, direction: s.direction };
    }
    const dims2 = {};
    for (const [key, d] of Object.entries(isObj(schema.dimension_inputs) ? schema.dimension_inputs : {})) {
      if (!isObj(d)) continue;
      const inputs = isObj(d.inputs) ? d.inputs : {};
      const weights = isObj(d.weights) ? d.weights : {};
      dims2[key] = {
        inputs: Object.entries(inputs).map(([source, field2]) => ({ source, field: String(field2), weight: pct(weights[source]) })),
        required: Array.isArray(d.required) ? d.required.map(String) : []
      };
    }
    return { sources: sources2, dims: dims2, converted: false };
  }
  const fusion = isObj(schema.dimension_fusion) ? schema.dimension_fusion : {};
  const mapping = isObj(schema.field_mapping) ? schema.field_mapping : {};
  const keys = /* @__PURE__ */ new Set([...Object.keys(fusion), ...Object.keys(mapping), ...legacyKeys]);
  const dims = {};
  for (const key of keys) dims[key] = { inputs: convertLegacyDimension(key, fusion[key], mapping[key]), required: [] };
  const used = new Set(Object.values(dims).flatMap((d) => d.inputs.map((i) => i.source)));
  const sources = {};
  for (const name of ["form", "vision"]) if (used.has(name)) sources[name] = { ...LEGACY_SOURCES[name], scale: [...LEGACY_SOURCES[name].scale] };
  return { sources, dims, converted: keys.size > 0 };
}
function toDimensionInputs(axis) {
  const rows = (axis.inputs || []).filter((i) => i.source && i.field);
  if (rows.length === 0) return void 0;
  const out = {
    inputs: Object.fromEntries(rows.map((i) => [i.source, i.field])),
    weights: Object.fromEntries(rows.map((i) => [i.source, typeof i.weight === "number" ? i.weight / 100 : NaN]))
  };
  const required = (axis.required || []).filter((r) => rows.some((i) => i.source === r));
  if (required.length > 0) out.required = required;
  return out;
}
function validateBlend(sources, axes) {
  const problems = [];
  for (const [name, s] of Object.entries(sources)) {
    const [min, max] = s.scale || [];
    if (!Number.isFinite(min) || !Number.isFinite(max) || !(min < max)) problems.push(`Source "${name}": scale needs two numbers, min below max.`);
    if (s.direction !== "concern" && s.direction !== "health") problems.push(`Source "${name}": direction must be concern or health.`);
  }
  for (const a of axes) {
    const label = a.name || a.dimensionKey;
    const rows = a.inputs || [];
    if (rows.length === 0) continue;
    const seen = /* @__PURE__ */ new Set();
    let sum = 0;
    for (const i of rows) {
      if (!i.source) {
        problems.push(`${label}: a row has no source.`);
        continue;
      }
      if (seen.has(i.source)) problems.push(`${label}: source "${i.source}" is used twice.`);
      seen.add(i.source);
      if (!sources[i.source]) problems.push(`${label}: source "${i.source}" is not declared.`);
      if (!i.field) problems.push(`${label}: source "${i.source}" has no field.`);
      if (typeof i.weight !== "number" || !Number.isFinite(i.weight)) problems.push(`${label}: source "${i.source}" has no weight.`);
      else if (i.weight <= 0) problems.push(`${label}: source "${i.source}" weight must be above 0.`);
      else sum += i.weight;
    }
    if (Math.abs(sum / 100 - 1) > WEIGHT_SUM_TOLERANCE && rows.every((i) => typeof i.weight === "number")) {
      problems.push(`${label}: weights add up to ${Math.round(sum * 100) / 100}%, not 100%.`);
    }
    for (const r of a.required || []) if (!seen.has(r)) problems.push(`${label}: required source "${r}" is not one of its inputs.`);
  }
  return problems;
}

// src/score/utils/jdm-compiler.ts
var visionFieldLabel = (code) => KNOWN_VISION_FIELDS.find((f) => f.code === code)?.label || code;
var DEFAULT_CONCERN_LABELS = {
  sebum: "Minyak Berlebih",
  oiliness: "Minyak Berlebih",
  sensitivity: "Kulit Sensitif",
  pigmentation: "Noda Gelap",
  dark_spot: "Noda Gelap",
  aging: "Garis Halus & Kerutan",
  hydration: "Kulit Kering",
  acne: "Jerawat",
  pores: "Pori Besar",
  barrier: "Barier Kulit Rusak"
};
function defaultConcernLabel(dimKey) {
  const k = (dimKey || "").toLowerCase();
  if (DEFAULT_CONCERN_LABELS[k]) return DEFAULT_CONCERN_LABELS[k];
  return k.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
var DEFAULT_STARTER_AXES = [
  {
    id: "axis_sebum",
    axisCode: "SEBUM",
    name: "Sebum Secretion",
    dimensionKey: "sebum",
    weight: 1,
    concernLabel: "Minyak Berlebih"
  }
];
var DEFAULT_STARTER_PROFILES = {
  strategy: "total_score",
  profiles: [
    {
      id: "prof_1",
      minScore: 61,
      maxScore: 100,
      code: "OPTIMAL",
      title: "Kulit Optimal",
      category: "Optimal",
      summary: "Kondisi kulit seimbang, tidak ada keluhan menonjol."
    },
    {
      id: "prof_2",
      minScore: 41,
      maxScore: 60,
      code: "MODERATE",
      title: "Perlu Perawatan Aktif",
      category: "Sedang",
      summary: "Ada keluhan sedang yang perlu perawatan aktif."
    },
    {
      id: "prof_3",
      minScore: 0,
      maxScore: 40,
      code: "CONCERN",
      title: "Perlu Perhatian Khusus",
      category: "Perlu Perhatian Khusus",
      summary: "Keluhan menonjol, perlu perhatian dan rutinitas terarah."
    }
  ]
};
var bandsToSchema = (bands) => bands.map((b) => ({ max: Math.max(0, Math.min(100, Number(b.max) || 0)), label: b.label || "" }));
var cleanVal = (v) => `"${(v || "").replace(/"/g, "")}"`;
var rangeCell = (min, max) => `[${Math.max(0, Math.min(100, min ?? 0))}..${Math.max(0, Math.min(100, max ?? 100))}]`;
function compileVisualToJDM(axes, profileConfig = DEFAULT_STARTER_PROFILES, scoreRangeBands = DEFAULT_SCORE_RANGE_BANDS, severityBands = DEFAULT_SEVERITY_BANDS, existingSchema, sources) {
  const effectiveAxes = axes.length > 0 ? axes : DEFAULT_STARTER_AXES;
  const nodes = [
    { id: "input_node", name: "Input", type: "inputNode", position: { x: 40, y: 40 } }
  ];
  const edges = [];
  const ownedNodeIds = /* @__PURE__ */ new Set(["input_node", "profile", ...effectiveAxes.map((a) => `${a.dimensionKey.toLowerCase()}-band`)]);
  const preservedNodes = [];
  if (existingSchema) {
    try {
      const prev = JSON.parse(existingSchema);
      for (const n of prev?.nodes || []) {
        if (!ownedNodeIds.has(n?.id)) preservedNodes.push(n);
      }
    } catch {
    }
  }
  const profileOutputs = [
    { id: "code", field: "skin_profile.code", label: "Code" },
    { id: "name", field: "skin_profile.name", label: "Name" },
    { id: "cat", field: "skin_profile.category", label: "Category" },
    { id: "desc", field: "skin_profile.description", label: "Summary" }
  ];
  const profileInputs = [];
  const profileRules = [];
  const strategy = profileConfig.strategy;
  if (strategy === "total_score") {
    profileInputs.push({ id: "in", field: "total_score", label: "Overall score (0-100, 100 = optimal)" });
    for (const p of profileConfig.profiles || []) {
      profileRules.push({
        _id: p.id,
        in: rangeCell(p.minScore, p.maxScore),
        code: cleanVal(p.code),
        name: cleanVal(p.title),
        cat: cleanVal(p.category),
        desc: cleanVal(p.summary)
      });
    }
  } else if (strategy === "combination_matrix") {
    effectiveAxes.forEach((a) => {
      const axisCode = (a.axisCode || a.dimensionKey).toUpperCase();
      profileInputs.push({ id: `c_${axisCode.toLowerCase()}`, field: `axis_values.${axisCode}`, label: `${a.name || axisCode} code` });
    });
    for (const p of profileConfig.profiles || []) {
      const rule = {
        _id: p.id,
        code: cleanVal(p.code),
        name: cleanVal(p.title),
        cat: cleanVal(p.category),
        desc: cleanVal(p.summary)
      };
      effectiveAxes.forEach((a) => {
        const axisCode = (a.axisCode || a.dimensionKey).toUpperCase();
        const v = p.dimensionCodes?.[a.dimensionKey] || p.dimensionCodes?.[axisCode] || "";
        rule[`c_${axisCode.toLowerCase()}`] = v ? cleanVal(v) : "-";
      });
      profileRules.push(rule);
    }
  } else {
    profileInputs.push(
      { id: "pc_dim", field: "primary_concern.dimension", label: "Dominant dimension" },
      { id: "pc_sev", field: "primary_concern.severity", label: "Severity Level" }
    );
    for (const p of profileConfig.profiles || []) {
      profileRules.push({
        _id: p.id,
        pc_dim: p.primaryDimension ? cleanVal(p.primaryDimension) : "-",
        pc_sev: p.severityLevel ? cleanVal(p.severityLevel) : "-",
        code: cleanVal(p.code),
        name: cleanVal(p.title),
        cat: cleanVal(p.category),
        desc: cleanVal(p.summary)
      });
    }
  }
  nodes.push({
    id: "profile",
    name: "Skin Profile",
    type: "decisionTableNode",
    position: { x: 360, y: 40 },
    content: { hitPolicy: "first", inputs: profileInputs, outputs: profileOutputs, rules: profileRules }
  });
  edges.push({ id: "e_profile", sourceId: "input_node", targetId: "profile" });
  const dimension_weights = {};
  const dimension_inputs = {};
  const concern_labels = {};
  const axis_codes = {};
  for (const a of effectiveAxes) {
    const key = a.dimensionKey.toLowerCase();
    dimension_weights[key] = a.weight ?? 1;
    concern_labels[key] = a.concernLabel || defaultConcernLabel(key);
    const di = toDimensionInputs(a);
    if (di) dimension_inputs[key] = di;
    const bands = (a.bands || []).slice().sort((x, y) => x.min - y.min);
    if (bands.length === 2) {
      const [lo, hi] = bands;
      axis_codes[key] = {
        threshold: Math.max(0, Math.min(100, hi.min)),
        low: lo.letter || "",
        high: hi.letter || ""
      };
    } else if (bands.length >= 3) {
      nodes.push({
        id: `${key}-band`,
        name: `${a.name || key} bands`,
        type: "decisionTableNode",
        content: {
          hitPolicy: "first",
          inputs: [{ id: "in", field: `dimension_scores.${key}`, label: `${a.name || key} Health Score` }],
          outputs: [{ id: "out", field: `axis_values.${key.toUpperCase()}`, label: `${a.name || key} Axis` }],
          rules: bands.slice().reverse().map((b) => ({ in: rangeCell(b.min, b.max), out: cleanVal(b.letter) }))
        }
      });
    } else if ((a.axisCodeLow || "").trim() && (a.axisCodeHigh || "").trim()) {
      axis_codes[key] = {
        threshold: Math.max(0, Math.min(100, Number(a.axisCodeThreshold ?? 50))),
        low: (a.axisCodeLow || "").trim(),
        high: (a.axisCodeHigh || "").trim()
      };
    }
  }
  let base = {};
  if (existingSchema) {
    try {
      base = JSON.parse(existingSchema) || {};
    } catch {
      base = {};
    }
  }
  const ownedDimKeys = new Set(effectiveAxes.map((a) => a.dimensionKey.toLowerCase()));
  const mergeOwned = (baseMap, fresh) => {
    const merged = { ...baseMap || {} };
    for (const k of ownedDimKeys) delete merged[k];
    return { ...merged, ...fresh };
  };
  const prevBlend = readBlend(base, [...Object.keys(base.dimension_weights || {}), ...Object.keys(base.concern_labels || {})]);
  const carried = {};
  for (const [k, d] of Object.entries(prevBlend.dims)) {
    if (ownedDimKeys.has(k)) continue;
    const di = toDimensionInputs(d);
    if (di) carried[k] = di;
  }
  const mergedInputs = mergeOwned(carried, dimension_inputs);
  const usedSources = new Set(Object.values(mergedInputs).flatMap((d) => Object.keys(d.inputs)));
  const declared = sources ?? prevBlend.sources;
  const model = {
    ...base,
    nodes: [...nodes, ...preservedNodes],
    edges,
    dimension_weights: mergeOwned(base.dimension_weights, dimension_weights),
    concern_labels: mergeOwned(base.concern_labels, concern_labels),
    score_range_bands: bandsToSchema(scoreRangeBands),
    severity_bands: bandsToSchema(severityBands)
  };
  const mergedAxisCodes = mergeOwned(base.axis_codes, axis_codes);
  if (Object.keys(mergedAxisCodes).length > 0) model.axis_codes = mergedAxisCodes;
  else delete model.axis_codes;
  delete model.field_mapping;
  delete model.dimension_fusion;
  const sourcesOut = sources ? { ...declared } : Object.fromEntries(Object.entries(declared).filter(([n]) => usedSources.has(n)));
  if (Object.keys(sourcesOut).length > 0 || Object.keys(mergedInputs).length > 0) {
    model.sources = sourcesOut;
    model.dimension_inputs = mergedInputs;
  } else {
    delete model.sources;
    delete model.dimension_inputs;
  }
  return JSON.stringify(model, null, 2);
}
var bandsFromSchema = (raw, fallback, prefix) => {
  if (!Array.isArray(raw) || raw.length === 0) return fallback.map((b) => ({ ...b }));
  return raw.map((b, i) => ({
    id: `${prefix}${i + 1}`,
    max: Number(b?.max) || 0,
    label: String(b?.label ?? "")
  }));
};
function decompileJDMToVisualComponents(schemaStr) {
  const fallback = {
    axes: DEFAULT_STARTER_AXES.map((a) => ({ ...a })),
    profileConfig: DEFAULT_STARTER_PROFILES,
    scoreRangeBands: DEFAULT_SCORE_RANGE_BANDS.map((b) => ({ ...b })),
    severityBands: DEFAULT_SEVERITY_BANDS.map((b) => ({ ...b })),
    sources: {},
    convertedBlend: false,
    legacy: false
  };
  if (!schemaStr || !schemaStr.trim()) return fallback;
  let parsed;
  try {
    parsed = JSON.parse(schemaStr);
  } catch {
    return fallback;
  }
  const clean = (v) => typeof v === "string" ? v.replace(/["']/g, "").trim() : "";
  const parseRange = (s) => {
    const m = String(s ?? "").match(/(-?\d+)\s*\.\.\s*(-?\d+)/);
    return m ? { min: Number(m[1]), max: Number(m[2]) } : null;
  };
  const weights = parsed.dimension_weights || {};
  const concernLabels = parsed.concern_labels || {};
  const axisCodes = parsed.axis_codes || {};
  const allNodes = Array.isArray(parsed.nodes) ? parsed.nodes : [];
  const nodeContents = allNodes.map(
    (n) => typeof n?.content === "string" ? safeParse(n.content) : n?.content
  );
  const hasProfileNode = nodeContents.some(
    (c) => (c?.outputs || []).some(
      (o) => typeof o?.field === "string" && o.field.startsWith("skin_profile.")
    )
  );
  const salvagedKeys = /* @__PURE__ */ new Set();
  for (const c of nodeContents) {
    for (const col of c?.outputs || []) {
      const m = String(col?.field || "").match(/^(?:tiers|axis_values)\.([a-z0-9_]+)/i);
      if (m) salvagedKeys.add(m[1].toLowerCase());
    }
  }
  const dimKeys = Array.from(
    /* @__PURE__ */ new Set([
      ...Object.keys(weights),
      ...Object.keys(concernLabels),
      ...Object.keys(axisCodes),
      ...salvagedKeys
    ])
  );
  const blend = readBlend(parsed, dimKeys);
  for (const k of Object.keys(blend.dims)) if (!dimKeys.includes(k)) dimKeys.push(k);
  const legacy = Object.keys(weights).length === 0 && Object.keys(concernLabels).length === 0 && !hasProfileNode;
  const bandNodeFor = (key) => nodeContents.find((c) => {
    const ins = c?.inputs || [];
    const outs = c?.outputs || [];
    return ins.length === 1 && ins[0]?.field === `dimension_scores.${key}` && outs.length === 1 && outs[0]?.field === `axis_values.${key.toUpperCase()}`;
  });
  const axes = dimKeys.map((key, i) => {
    const ac = axisCodes[key.toLowerCase()];
    const bd = blend.dims[key];
    const bandNode = bandNodeFor(key);
    let bands;
    if (bandNode) {
      const inId = bandNode.inputs?.[0]?.id ?? "in";
      const outId = bandNode.outputs?.[0]?.id ?? "out";
      bands = (bandNode.rules || []).map((r, ri) => {
        const range = parseRange(r[inId]);
        if (!range) return null;
        return { id: `${key}_b${ri}`, min: range.min, max: range.max, letter: clean(r[outId]) };
      }).filter(Boolean);
    } else if (ac && (ac.low || ac.high)) {
      const t = typeof ac.threshold === "number" ? ac.threshold : 50;
      bands = [
        { id: `${key}_lo`, min: 0, max: Math.max(0, t - 1), letter: ac.low || "" },
        { id: `${key}_hi`, min: t, max: 100, letter: ac.high || "" }
      ];
    }
    return {
      id: `axis_${key}`,
      axisCode: key.toUpperCase(),
      name: key.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      dimensionKey: key,
      weight: typeof weights[key] === "number" ? weights[key] : 1,
      concernLabel: concernLabels[key] || defaultConcernLabel(key),
      inputs: (bd?.inputs || []).map((i2) => ({ ...i2, label: i2.source === VISION_SOURCE ? visionFieldLabel(i2.field) : i2.field })),
      required: bd?.required || [],
      bands,
      ...ac && (ac.low || ac.high) ? {
        axisCodeLow: ac.low || "",
        axisCodeHigh: ac.high || "",
        axisCodeThreshold: typeof ac.threshold === "number" ? ac.threshold : 50
      } : {}
    };
  });
  const profileNode = allNodes.find((n, idx) => {
    if (n?.type !== "decisionTableNode") return false;
    const c = nodeContents[idx];
    return (c?.outputs || []).some((o) => typeof o?.field === "string" && o.field.startsWith("skin_profile."));
  });
  let profileConfig = DEFAULT_STARTER_PROFILES;
  if (profileNode) {
    const c = typeof profileNode.content === "string" ? safeParse(profileNode.content) : profileNode.content;
    const inputs = c?.inputs || [];
    const outputs = c?.outputs || [];
    const rules = (c?.rules || []).filter((r) => r._id !== "p_rule_fallback");
    const outId = (test) => outputs.find((o) => typeof o?.field === "string" && test(o.field))?.id;
    const codeId = outId((f) => f === "skin_profile.code") ?? "code";
    const nameId = outId((f) => f === "skin_profile.name") ?? "name";
    const catId = outId((f) => f === "skin_profile.category") ?? "cat";
    const descId = outId((f) => f === "skin_profile.description") ?? "desc";
    let strategy = "total_score";
    if (inputs.some((i) => i.field === "total_score")) strategy = "total_score";
    else if (inputs.some((i) => String(i.field || "").startsWith("axis_values."))) strategy = "combination_matrix";
    else if (inputs.some((i) => String(i.field || "").startsWith("primary_concern."))) strategy = "primary_concern";
    const totalInId = inputs.find((i) => i.field === "total_score")?.id ?? "in";
    const pcDimId = inputs.find((i) => i.field === "primary_concern.dimension")?.id ?? "pc_dim";
    const pcSevId = inputs.find((i) => i.field === "primary_concern.severity")?.id ?? "pc_sev";
    const profiles = rules.map((r, i) => {
      const entry = {
        id: r._id || `prof_${i + 1}`,
        code: clean(r[codeId]) || `PROFILE_${i + 1}`,
        title: clean(r[nameId]) || `Profile ${i + 1}`,
        category: clean(r[catId]) || "General",
        summary: clean(r[descId]) || ""
      };
      if (strategy === "total_score") {
        const rng = parseRange(r[totalInId]) ?? { min: 0, max: 100 };
        entry.minScore = rng.min;
        entry.maxScore = rng.max;
      } else if (strategy === "combination_matrix") {
        const dimCodes = {};
        inputs.forEach((inp) => {
          const axisCode = String(inp.field || "").replace("axis_values.", "").trim();
          const v = clean(r[inp.id]);
          if (v && v !== "-") dimCodes[axisCode.toLowerCase()] = v;
        });
        entry.dimensionCodes = dimCodes;
      } else {
        entry.primaryDimension = clean(r[pcDimId]);
        entry.severityLevel = clean(r[pcSevId]);
      }
      return entry;
    });
    profileConfig = { strategy, profiles: profiles.length ? profiles : DEFAULT_STARTER_PROFILES.profiles };
  }
  return {
    axes: axes.length ? axes : fallback.axes,
    profileConfig,
    scoreRangeBands: bandsFromSchema(parsed.score_range_bands, DEFAULT_SCORE_RANGE_BANDS, "sr"),
    severityBands: bandsFromSchema(parsed.severity_bands, DEFAULT_SEVERITY_BANDS, "sv"),
    sources: blend.sources,
    convertedBlend: blend.converted,
    legacy
  };
}
function safeParse(s) {
  try {
    return typeof s === "string" ? JSON.parse(s) : s;
  } catch {
    return null;
  }
}
function decompileJDMToVisual(schemaStr) {
  return decompileJDMToVisualComponents(schemaStr).axes;
}

// src/score/components/reusable/ClinicalAxisCard.tsx
var import_react10 = require("react");
var import_lucide_react10 = require("lucide-react");
var import_shared11 = require("@gateway-experience/shared");
var import_jsx_runtime12 = require("react/jsx-runtime");
function useVisionFields() {
  const [conditions, setConditions] = (0, import_react10.useState)([]);
  const hostRoutes = (0, import_shared11.useHostRoutes)();
  (0, import_react10.useEffect)(() => {
    listSkinConditions(hostRoutes).then(setConditions).catch(() => {
    });
  }, [hostRoutes]);
  return (0, import_react10.useMemo)(
    () => conditions.flatMap(
      (c) => (c.visionCapabilities || []).map((cap) => ({ code: cap, label: `${c.name} (${cap})` }))
    ),
    [conditions]
  );
}
var fieldCls = "w-full h-8 rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring disabled:opacity-50";
var FieldPicker = ({ source, field: field2, onChange, disabled }) => {
  const visionFields = useVisionFields();
  if (source === FORM_SOURCE) {
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
      import_shared11.DimensionSelect,
      {
        value: field2,
        disabled,
        onChange: (code, meta) => onChange(code || "", meta?.name || code || ""),
        label: ""
      }
    );
  }
  if (source === VISION_SOURCE) {
    const known = visionFields.some((f) => f.code === field2);
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
      "select",
      {
        disabled,
        value: field2,
        onChange: (e) => {
          const code = e.target.value;
          onChange(code, visionFields.find((f) => f.code === code)?.label || code);
        },
        className: fieldCls,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("option", { value: "", children: "\u2014 pick a CV field (ref_skin_conditions) \u2014" }),
          field2 && !known && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("option", { value: field2, children: field2 }),
          visionFields.map((f) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("option", { value: f.code, children: f.label }, `${f.code}:${f.label}`))
        ]
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
    "input",
    {
      type: "text",
      disabled,
      value: field2,
      placeholder: `${source} field, e.g. its signal name`,
      onChange: (e) => onChange(e.target.value.trim(), e.target.value.trim()),
      className: fieldCls + " font-mono"
    }
  );
};
var ClinicalDimensionCard = ({
  axis,
  index,
  onUpdate,
  onDelete,
  canDelete = true,
  disabled = false,
  defaultOpen = false,
  siblingWeightTotal
}) => {
  const [open, setOpen] = (0, import_react10.useState)(defaultOpen);
  const share = typeof siblingWeightTotal === "number" && siblingWeightTotal > 0 ? Math.round(axis.weight / siblingWeightTotal * 100) : null;
  const concern = axis.concernLabel || defaultConcernLabel(axis.dimensionKey);
  const handleDimensionChange = (dimKey, dimMeta) => {
    const wasDefault = !axis.concernLabel || axis.concernLabel === defaultConcernLabel(axis.dimensionKey);
    onUpdate({
      ...axis,
      dimensionKey: dimKey,
      axisCode: dimKey.toUpperCase(),
      name: dimMeta?.name || dimKey.toUpperCase(),
      concernLabel: wasDefault ? defaultConcernLabel(dimKey) : axis.concernLabel
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "rounded-lg border border-border bg-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "flex items-center gap-2 px-3 py-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
        "button",
        {
          type: "button",
          onClick: () => setOpen((v) => !v),
          className: "flex flex-1 items-center gap-2 text-left",
          children: [
            open ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_lucide_react10.ChevronDown, { className: "h-4 w-4 text-muted-foreground shrink-0" }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_lucide_react10.ChevronRight, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "text-sm font-semibold text-foreground", children: axis.name || axis.dimensionKey.toUpperCase() }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "text-[11px] text-muted-foreground", children: share !== null ? `\u2248${share}% of overall` : `weight ${axis.weight}` }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "text-[11px] text-muted-foreground", children: [
              "\xB7 ",
              concern
            ] })
          ]
        }
      ),
      canDelete && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
        "button",
        {
          type: "button",
          disabled,
          onClick: onDelete,
          className: "p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted/40 rounded transition-colors disabled:opacity-30",
          title: "Remove dimension",
          children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_lucide_react10.Trash2, { className: "h-4 w-4" })
        }
      )
    ] }),
    open && /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "border-t border-border p-3 space-y-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
          import_shared11.DimensionSelect,
          {
            value: axis.dimensionKey,
            disabled,
            onChange: handleDimensionChange,
            label: "Dimension"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "flex items-center gap-1.5 mb-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("label", { className: "block text-[11px] font-semibold text-muted-foreground", children: "Weight" }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
              import_shared11.InfoTooltip,
              {
                content: share !== null ? `Relative to the other dimensions \u2014 counts as \u2248${share}% of the overall score.` : "Relative to the other dimensions.",
                label: "About weight",
                iconClassName: "h-3 w-3"
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
            "input",
            {
              type: "number",
              min: 0,
              step: 1,
              disabled,
              value: axis.weight,
              onChange: (e) => onUpdate({ ...axis, weight: Number(e.target.value) }),
              className: fieldCls
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "flex items-center gap-1.5 mb-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("label", { className: "block text-[11px] font-semibold text-muted-foreground", children: "Concern label" }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
            import_shared11.InfoTooltip,
            {
              content: "Shown when this dimension is the customer\u2019s dominant concern.",
              label: "About concern label",
              iconClassName: "h-3 w-3"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
          "input",
          {
            type: "text",
            disabled,
            value: axis.concernLabel ?? concern,
            onChange: (e) => onUpdate({ ...axis, concernLabel: e.target.value }),
            placeholder: defaultConcernLabel(axis.dimensionKey),
            className: fieldCls
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("p", { className: "text-[10px] text-muted-foreground italic", children: "How this axis's number is computed (its sources and their weights) and turned into a letter (bands) is set in the Blending tab, not here." })
    ] })
  ] });
};
var ClinicalAxisCard = ClinicalDimensionCard;

// src/score/components/tabs/BlendingTab.tsx
var import_jsx_runtime13 = require("react/jsx-runtime");
var fieldCls2 = "h-8 rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring disabled:opacity-50";
var SOURCE_NAME = /^[a-z][a-z0-9_]*$/;
var BlendingTab = ({
  rulesets,
  selectedRuleset,
  onSelectRuleset,
  onSaveRuleset
}) => {
  const activeRuleset = selectedRuleset || rulesets[0] || null;
  const [axes, setAxes] = (0, import_react11.useState)([]);
  const [sources, setSources] = (0, import_react11.useState)({});
  const [loaded, setLoaded] = (0, import_react11.useState)(null);
  const [newSource, setNewSource] = (0, import_react11.useState)("");
  const [isSaving, setIsSaving] = (0, import_react11.useState)(false);
  const [saveSuccess, setSaveSuccess] = (0, import_react11.useState)(false);
  const [saveError, setSaveError] = (0, import_react11.useState)(null);
  (0, import_react11.useEffect)(() => {
    if (activeRuleset && activeRuleset.schema) {
      try {
        const decompiled = decompileJDMToVisualComponents(activeRuleset.schema);
        setLoaded(decompiled);
        setAxes(decompiled.axes);
        setSources(decompiled.sources);
        setSaveError(null);
      } catch (err) {
        setSaveError("Could not read this ruleset: " + (err instanceof Error ? err.message : "invalid schema"));
      }
    }
  }, [activeRuleset]);
  const problems = (0, import_react11.useMemo)(() => validateBlend(sources, axes), [sources, axes]);
  const usedSources = (0, import_react11.useMemo)(() => new Set(axes.flatMap((a) => (a.inputs || []).map((i) => i.source))), [axes]);
  const sourceNames = Object.keys(sources);
  const updateAxis = (id, patch) => setAxes((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a));
  const updateSource = (name, patch) => setSources((prev) => ({ ...prev, [name]: { ...prev[name], ...patch } }));
  const addSource = () => {
    const name = newSource.trim();
    if (!SOURCE_NAME.test(name) || sources[name]) return;
    setSources((prev) => ({ ...prev, [name]: { scale: [NaN, NaN], direction: "" } }));
    setNewSource("");
  };
  const removeSource = (name) => setSources((prev) => Object.fromEntries(Object.entries(prev).filter(([n]) => n !== name)));
  const handleSave = async () => {
    if (!activeRuleset || !loaded || problems.length > 0) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      const updatedSchema = compileVisualToJDM(axes, loaded.profileConfig, loaded.scoreRangeBands, loaded.severityBands, activeRuleset.schema, sources);
      await onSaveRuleset({
        id: activeRuleset.id,
        code: activeRuleset.code,
        title: activeRuleset.title,
        description: activeRuleset.description,
        brandId: activeRuleset.brandId,
        applicationId: activeRuleset.applicationId,
        status: activeRuleset.status,
        // Core's update replaces the whole row, so leaving the version out reset it to 0.
        version: activeRuleset.version,
        schema: updatedSchema
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3e3);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save blending");
    } finally {
      setIsSaving(false);
    }
  };
  if (!activeRuleset) {
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
      import_shared12.EmptyState,
      {
        icon: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_lucide_react11.Sliders, { className: "h-6 w-6 text-muted-foreground" }),
        title: "No grading model selected",
        description: "Create or pick a grading model to set its blending weights.",
        className: "py-16 rounded-lg border border-border bg-card"
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "space-y-4", children: [
    /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "rounded-lg border border-border bg-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0", children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: "text-xs font-semibold text-muted-foreground whitespace-nowrap", children: "Grading model" }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
          "select",
          {
            value: activeRuleset.id,
            onChange: (e) => {
              const r = rulesets.find((item) => item.id === e.target.value);
              if (r) onSelectRuleset(r);
            },
            className: "h-8 max-w-md w-full truncate rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring",
            style: { colorScheme: "dark" },
            children: rulesets.map((r) => /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("option", { value: r.id, children: [
              r.title,
              " (",
              r.code,
              " v",
              r.version,
              ")"
            ] }, r.id))
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "flex items-center gap-3 shrink-0", children: [
        saveSuccess && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("span", { className: "text-xs text-beak flex items-center gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_lucide_react11.Check, { className: "h-3.5 w-3.5" }),
          "Saved"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_shared12.Button, { variant: "primary", size: "sm", onClick: handleSave, isLoading: isSaving, disabled: problems.length > 0, children: isSaving ? "Saving\u2026" : "Save blending" })
      ] })
    ] }),
    saveError && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "p-3 rounded-md border border-destructive/40 bg-destructive/10 text-xs text-destructive flex items-start gap-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_lucide_react11.AlertTriangle, { className: "h-4 w-4 shrink-0 mt-0.5" }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: "break-words", children: saveError })
    ] }),
    loaded?.convertedBlend && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "p-3 rounded-md border border-border bg-muted/30 text-[11px] text-muted-foreground flex items-start gap-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_lucide_react11.Info, { className: "h-4 w-4 shrink-0 mt-0.5" }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { children: "This ruleset uses the old form/vision blend. It is shown here converted to sources, the way the engine reads it today; saving stores it in the new format with the same scores." })
    ] }),
    problems.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "p-3 rounded-md border border-amber-500/40 bg-amber-500/10 text-[11px] text-amber-700 dark:text-amber-300 space-y-0.5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "font-semibold flex items-center gap-1.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_lucide_react11.AlertTriangle, { className: "h-3.5 w-3.5" }),
        "Fix before saving \u2014 the engine would refuse:"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("ul", { className: "list-disc pl-5", children: problems.map((p) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("li", { children: p }, p)) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "rounded-lg border border-border bg-card p-4 space-y-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("h3", { className: "text-sm font-bold text-foreground", children: "Sources" }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
          import_shared12.InfoTooltip,
          {
            content: "Each kind of signal a dimension can be scored from, and how to read its raw values: the scale they arrive on and whether higher means worse (concern) or better (health). The engine turns every input into 0-100 concern before blending.",
            label: "About sources"
          }
        )
      ] }),
      sourceNames.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("p", { className: "text-[11px] text-muted-foreground italic", children: "No sources declared yet." }),
      sourceNames.map((name) => {
        const s = sources[name];
        const scale = s.scale || [NaN, NaN];
        const num = (v) => Number.isFinite(v) ? v : "";
        return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: "w-24 truncate font-mono text-xs font-semibold text-foreground", children: name }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("label", { className: "flex items-center gap-1 text-[10px] text-muted-foreground", children: [
            "scale",
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("input", { type: "number", value: num(scale[0]), onChange: (e) => updateSource(name, { scale: [e.target.value === "" ? NaN : Number(e.target.value), scale[1]] }), className: fieldCls2 + " w-20 text-center", "aria-label": `${name} scale minimum` }),
            "\u2013",
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("input", { type: "number", value: num(scale[1]), onChange: (e) => updateSource(name, { scale: [scale[0], e.target.value === "" ? NaN : Number(e.target.value)] }), className: fieldCls2 + " w-20 text-center", "aria-label": `${name} scale maximum` })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("select", { value: s.direction || "", onChange: (e) => updateSource(name, { direction: e.target.value }), className: fieldCls2, "aria-label": `${name} direction`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("option", { value: "", children: "\u2014 direction \u2014" }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("option", { value: "concern", children: "concern (higher = worse)" }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("option", { value: "health", children: "health (higher = better)" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
            "button",
            {
              type: "button",
              onClick: () => removeSource(name),
              disabled: usedSources.has(name),
              title: usedSources.has(name) ? "Used by a dimension \u2014 remove it there first" : "Remove source",
              className: "p-1 text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:hover:text-muted-foreground",
              children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_lucide_react11.Trash2, { className: "h-3.5 w-3.5" })
            }
          )
        ] }, name);
      }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "flex items-center gap-2 pt-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
          "input",
          {
            type: "text",
            value: newSource,
            onChange: (e) => setNewSource(e.target.value.toLowerCase()),
            onKeyDown: (e) => {
              if (e.key === "Enter") addSource();
            },
            placeholder: "new source, e.g. device",
            className: fieldCls2 + " w-48 font-mono"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
          "button",
          {
            type: "button",
            onClick: addSource,
            disabled: !SOURCE_NAME.test(newSource.trim()) || !!sources[newSource.trim()],
            className: "flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border rounded disabled:opacity-40",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_lucide_react11.Plus, { className: "h-3 w-3" }),
              "Add source"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "rounded-lg border border-border bg-card p-4 space-y-1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("h3", { className: "text-sm font-bold text-foreground", children: "Per-dimension blend" }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
          import_shared12.InfoTooltip,
          {
            content: "For each dimension, which sources its score comes from and how much each counts. Weights must add up to 100%. When a source does not arrive (e.g. no photo), its weight is shared among the ones that did; a dimension missing a required source, or every source, is not scored.",
            label: "About blending"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("p", { className: "text-[11px] text-muted-foreground", children: "e.g. Sebum: form 30%, vision 50%, device 20%." })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "rounded-lg border border-border bg-card divide-y divide-border", children: [
      axes.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "p-6 text-center text-xs text-muted-foreground italic", children: "This ruleset has no dimensions yet \u2014 add some in Skin Grading first." }),
      axes.map((axis) => {
        const inputs = axis.inputs || [];
        const required = axis.required || [];
        const bands = axis.bands || [];
        const sum = inputs.reduce((s, i) => s + (typeof i.weight === "number" && Number.isFinite(i.weight) ? i.weight : 0), 0);
        const sumOk = Math.abs(sum / 100 - 1) <= WEIGHT_SUM_TOLERANCE;
        const free = sourceNames.filter((n) => !inputs.some((i) => i.source === n));
        const setInputs = (next) => updateAxis(axis.id, { inputs: next, required: required.filter((r) => next.some((i) => i.source === r)) });
        const updateInput = (idx, patch) => setInputs(inputs.map((i, j) => j === idx ? { ...i, ...patch } : i));
        const addInput = () => free.length > 0 && setInputs([...inputs, { source: free[0], field: "", weight: void 0 }]);
        const toggleRequired = (src) => updateAxis(axis.id, { required: required.includes(src) ? required.filter((r) => r !== src) : [...required, src] });
        const updateBand = (id, patch) => updateAxis(axis.id, { bands: bands.map((b) => b.id === id ? { ...b, ...patch } : b) });
        const addBand = () => updateAxis(axis.id, { bands: [...bands, { id: `b_${Date.now()}`, min: 0, max: 100, letter: "" }] });
        const removeBand = (id) => updateAxis(axis.id, { bands: bands.filter((b) => b.id !== id) });
        return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "p-3.5 space-y-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: "text-sm font-semibold text-foreground", children: axis.name || axis.dimensionKey.toUpperCase() }),
            inputs.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("span", { className: `text-[11px] font-semibold tabular-nums ${sumOk ? "text-muted-foreground" : "text-destructive"}`, children: [
              Math.round(sum * 100) / 100,
              "% ",
              sumOk ? "" : "\u2014 must be 100%"
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: "text-[11px] text-amber-700 dark:text-amber-300", children: "No inputs \u2014 this dimension is not scored" })
          ] }),
          inputs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "grid grid-cols-[7rem_1fr_5rem_4.5rem_1.5rem] gap-2 text-[10px] font-semibold text-muted-foreground", children: [
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { children: "Source" }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { children: "Field" }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: "text-center", children: "Weight %" }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: "text-center", children: "Required" }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", {})
            ] }),
            inputs.map((inp, idx) => /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "grid grid-cols-[7rem_1fr_5rem_4.5rem_1.5rem] items-center gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                "select",
                {
                  value: inp.source,
                  onChange: (e) => updateInput(idx, { source: e.target.value, field: "", label: "" }),
                  className: fieldCls2 + " font-mono",
                  "aria-label": "Source",
                  children: [inp.source, ...free].filter((n, i, a) => a.indexOf(n) === i).map((n) => /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("option", { value: n, children: [
                    n,
                    sources[n] ? "" : " (undeclared)"
                  ] }, n))
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(FieldPicker, { source: inp.source, field: inp.field, onChange: (field2, label) => updateInput(idx, { field: field2, label }) }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                "input",
                {
                  type: "number",
                  min: 0,
                  max: 100,
                  step: 1,
                  value: typeof inp.weight === "number" && Number.isFinite(inp.weight) ? inp.weight : "",
                  onChange: (e) => updateInput(idx, { weight: e.target.value === "" ? void 0 : Number(e.target.value) }),
                  className: fieldCls2 + " text-center tabular-nums",
                  "aria-label": `${inp.source} weight percent`
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("label", { className: "flex justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("input", { type: "checkbox", checked: required.includes(inp.source), onChange: () => toggleRequired(inp.source), "aria-label": `${inp.source} required` }) }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("button", { type: "button", onClick: () => setInputs(inputs.filter((_, j) => j !== idx)), className: "p-1 text-muted-foreground hover:text-destructive", "aria-label": `Remove ${inp.source}`, children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_lucide_react11.Trash2, { className: "h-3.5 w-3.5" }) })
            ] }, `${inp.source}-${idx}`))
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
            "button",
            {
              type: "button",
              onClick: addInput,
              disabled: free.length === 0,
              title: free.length === 0 ? "Every declared source is already an input; declare another above" : void 0,
              className: "flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border rounded disabled:opacity-40",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_lucide_react11.Plus, { className: "h-3 w-3" }),
                "Add input"
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "pt-2 border-t border-border space-y-1.5", children: [
            /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("label", { className: "block text-[10px] font-semibold text-muted-foreground", children: "Bands (axis & threshold)" }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                import_shared12.InfoTooltip,
                {
                  content: "Health-oriented (100 = optimal). Exactly 2 bands compiles to a simple threshold; 3+ compiles to a small rule table (e.g. Pore Severity's Smooth/Visible/Enlarged). Bands should be ordered and cover 0-100 with no gaps.",
                  label: "About bands"
                }
              )
            ] }),
            bands.map((b) => /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("input", { type: "number", min: 0, max: 100, value: b.min, onChange: (e) => updateBand(b.id, { min: Number(e.target.value) }), className: fieldCls2 + " w-16 text-center" }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: "text-muted-foreground text-[10px]", children: "\u2013" }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("input", { type: "number", min: 0, max: 100, value: b.max, onChange: (e) => updateBand(b.id, { max: Number(e.target.value) }), className: fieldCls2 + " w-16 text-center" }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: "text-muted-foreground text-[10px]", children: "\u2192" }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("input", { type: "text", maxLength: 12, value: b.letter, onChange: (e) => updateBand(b.id, { letter: e.target.value.toUpperCase() }), placeholder: "D", className: fieldCls2 + " flex-1 min-w-0 text-center font-bold text-beak" }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("button", { type: "button", onClick: () => removeBand(b.id), className: "p-1 text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_lucide_react11.Trash2, { className: "h-3.5 w-3.5" }) })
            ] }, b.id)),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("button", { type: "button", onClick: addBand, className: "flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border rounded", children: [
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_lucide_react11.Plus, { className: "h-3 w-3" }),
              "Add band"
            ] })
          ] })
        ] }, axis.id);
      })
    ] })
  ] });
};

// src/score/components/tabs/ScoreSimulatorTab.tsx
var import_react12 = require("react");
var import_lucide_react12 = require("lucide-react");
var import_shared13 = require("@gateway-experience/shared");

// src/score/utils/safety-flags.ts
function safetyFlagsFromSurveys(surveys, surveyCode) {
  if (!Array.isArray(surveys)) return [];
  const rows = surveys;
  const selected = surveyCode ? rows.filter((s) => s.code === surveyCode) : rows;
  const flags = /* @__PURE__ */ new Set();
  for (const survey of selected) {
    if (!survey.schema) continue;
    try {
      const parsed = JSON.parse(survey.schema);
      for (const page of parsed.pages || []) {
        for (const el of page.elements || []) {
          for (const choice of el.choices || []) {
            const conditionMap = typeof choice === "object" ? choice.condition_map || choice.conditionMap : null;
            if (conditionMap) Object.keys(conditionMap).forEach((k) => flags.add(k));
          }
        }
      }
    } catch {
    }
  }
  return Array.from(flags);
}

// src/score/components/tabs/ScoreSimulatorTab.tsx
var import_jsx_runtime14 = require("react/jsx-runtime");
var card = "rounded-lg border border-border bg-card p-4";
var sliderCls = "w-full h-1.5 rounded appearance-none cursor-pointer bg-muted accent-[#d97706]";
var ScoreSimulatorTab = ({
  rulesets,
  selectedRuleset,
  onSelectRuleset
}) => {
  const hostRoutes = (0, import_shared13.useHostRoutes)();
  const activeRuleset = selectedRuleset || rulesets[0] || null;
  const rulesetDims = (0, import_react12.useMemo)(() => {
    if (!activeRuleset?.schema) return [];
    try {
      const s = JSON.parse(activeRuleset.schema);
      const keys = /* @__PURE__ */ new Set([
        ...Object.keys(s.dimension_weights || {}),
        ...Object.keys(s.concern_labels || {}),
        ...Object.keys(s.axis_codes || {}),
        ...Object.keys(readBlend(s).dims)
      ]);
      for (const node of s.nodes || []) {
        if (node?.type !== "decisionTableNode") continue;
        const content = typeof node.content === "string" ? JSON.parse(node.content) : node.content;
        for (const input of content?.inputs || []) {
          const field2 = String(input?.field || "");
          if (field2.startsWith("dimension_scores.")) {
            keys.add(field2.slice("dimension_scores.".length));
          }
        }
      }
      return Array.from(keys);
    } catch {
      return [];
    }
  }, [activeRuleset]);
  const blend = (0, import_react12.useMemo)(() => {
    try {
      return readBlend(JSON.parse(activeRuleset?.schema || "{}"), rulesetDims);
    } catch {
      return readBlend({});
    }
  }, [activeRuleset, rulesetDims]);
  const fieldOf = (0, import_react12.useCallback)(
    (d, source) => blend.dims[d]?.inputs.find((i) => i.source === source)?.field,
    [blend]
  );
  const ageAxisKeys = (0, import_react12.useMemo)(() => rulesetDims.filter((d) => fieldOf(d, FORM_SOURCE) === AGE_FIELD), [rulesetDims, fieldOf]);
  const formDims = (0, import_react12.useMemo)(
    () => rulesetDims.filter((d) => !ageAxisKeys.includes(d) && !!fieldOf(d, FORM_SOURCE)),
    [rulesetDims, fieldOf, ageAxisKeys]
  );
  const visionDims = (0, import_react12.useMemo)(() => rulesetDims.filter((d) => !!fieldOf(d, VISION_SOURCE)), [rulesetDims, fieldOf]);
  const otherSources = (0, import_react12.useMemo)(
    () => Array.from(new Set(Object.values(blend.dims).flatMap((d) => d.inputs.map((i) => i.source)))).filter((s) => s !== FORM_SOURCE && s !== VISION_SOURCE),
    [blend]
  );
  const [questionnaireValues, setQuestionnaireValues] = (0, import_shared13.usePersistentState)(
    "xg.scoreEngine.simulator.questionnaireValues",
    {}
  );
  const [visionValues, setVisionValues] = (0, import_shared13.usePersistentState)(
    "xg.scoreEngine.simulator.visionValues",
    {}
  );
  const [respondentAge, setRespondentAge] = (0, import_shared13.usePersistentState)("xg.scoreEngine.simulator.respondentAge", 25);
  const rulesetSafetyFlags = (0, import_react12.useMemo)(() => {
    if (!activeRuleset?.schema) return [];
    try {
      const s = JSON.parse(activeRuleset.schema);
      if (Array.isArray(s.safety_flags)) {
        return s.safety_flags.map(
          (f) => typeof f === "string" ? f : f.key
        );
      }
      return [];
    } catch {
      return [];
    }
  }, [activeRuleset]);
  const formSurveyCode = (0, import_react12.useMemo)(() => {
    try {
      return JSON.parse(activeRuleset?.schema || "{}").form_survey_code || "";
    } catch {
      return "";
    }
  }, [activeRuleset]);
  const [surveySafetyFlags, setSurveySafetyFlags] = (0, import_react12.useState)([]);
  (0, import_react12.useEffect)(() => {
    if (!activeRuleset?.brandId || !activeRuleset?.applicationId) {
      setSurveySafetyFlags([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const surveys = await fetchTenantSurveys(activeRuleset.brandId, activeRuleset.applicationId);
        if (surveys === null) return;
        const flags = safetyFlagsFromSurveys(surveys, formSurveyCode);
        if (!cancelled) setSurveySafetyFlags(flags);
      } catch {
        if (!cancelled) setSurveySafetyFlags([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeRuleset?.brandId, activeRuleset?.applicationId, formSurveyCode]);
  const [catalogSafetyFlags, setCatalogSafetyFlags] = (0, import_react12.useState)([]);
  (0, import_react12.useEffect)(() => {
    getSafetyFlags(hostRoutes).then((rows) => setCatalogSafetyFlags(rows.map((r) => r.code))).catch(() => setCatalogSafetyFlags([]));
  }, [hostRoutes]);
  const allSafetyFlags = (0, import_react12.useMemo)(
    () => Array.from(/* @__PURE__ */ new Set([...rulesetSafetyFlags, ...surveySafetyFlags])),
    [rulesetSafetyFlags, surveySafetyFlags]
  );
  const [conditionChoices, setConditionChoices] = (0, import_shared13.usePersistentState)(
    "xg.scoreEngine.simulator.conditions",
    {}
  );
  const selectedConditions = (0, import_react12.useMemo)(() => {
    const keys = allSafetyFlags.length > 0 ? allSafetyFlags : catalogSafetyFlags;
    const out = {};
    for (const k of keys) out[k] = conditionChoices[k] ?? false;
    return out;
  }, [allSafetyFlags, catalogSafetyFlags, conditionChoices]);
  const [simResponse, setSimResponse] = (0, import_react12.useState)(null);
  const [copiedReq, setCopiedReq] = (0, import_react12.useState)(false);
  const formScores = (0, import_react12.useMemo)(() => {
    const out = {};
    for (const d of formDims) out[d] = questionnaireValues[d] ?? 50;
    return out;
  }, [formDims, questionnaireValues]);
  const visionScores = (0, import_react12.useMemo)(() => {
    const out = {};
    for (const d of visionDims) out[d] = visionValues[d] ?? 50;
    return out;
  }, [visionDims, visionValues]);
  const ageYears = ageAxisKeys.length > 0 ? respondentAge : void 0;
  const requestBody = (0, import_react12.useMemo)(
    () => JSON.stringify(
      {
        schema: activeRuleset?.schema ?? "",
        form_scores: formScores,
        vision_scores: visionScores,
        age_years: ageYears,
        customer_condition: selectedConditions
      },
      null,
      2
    ),
    [activeRuleset, formScores, visionScores, ageYears, selectedConditions]
  );
  const copyRequest = () => {
    navigator.clipboard?.writeText(requestBody);
    setCopiedReq(true);
    setTimeout(() => setCopiedReq(false), 1500);
  };
  const runSimulation = (0, import_react12.useCallback)(async () => {
    if (!activeRuleset?.schema) return;
    try {
      const response = await simulateRuleset({
        schema: activeRuleset.schema,
        form_scores: formScores,
        vision_scores: visionScores,
        age_years: ageYears,
        customer_condition: selectedConditions
      });
      if (response) setSimResponse(response);
    } catch (err) {
      console.error("Simulation request failed", err);
    }
  }, [activeRuleset, formScores, visionScores, ageYears, selectedConditions]);
  (0, import_react12.useEffect)(() => {
    const timer = setTimeout(runSimulation, 250);
    return () => clearTimeout(timer);
  }, [runSimulation]);
  const result = simResponse?.result;
  const dimensions = result?.dimensions || {};
  const breakdown = result?.dimension_breakdown || {};
  const breakdownKeys = Array.from(/* @__PURE__ */ new Set([...Object.keys(dimensions), ...Object.keys(breakdown)]));
  const skinProfile = result?.skin_profile;
  const subClassification = result?.sub_classification || {};
  const warnings = result?.warnings || [];
  const totalScore = Math.round(result?.total_score || 0);
  const profileCode = skinProfile?.code || "CUSTOM";
  const profileName = skinProfile?.name || "Answer to see a profile";
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex flex-col lg:flex-row gap-5 items-start", children: [
    /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "w-full lg:w-80 lg:shrink-0 space-y-3 min-w-0", children: [
      /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: card + " space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "block text-xs font-semibold text-muted-foreground", children: "Grading model" }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
          "select",
          {
            value: activeRuleset?.id || "",
            onChange: (e) => {
              const r = rulesets.find((item) => item.id === e.target.value);
              if (r) onSelectRuleset(r);
            },
            className: "w-full h-9 rounded-md bg-muted/40 border border-border px-3 text-foreground text-xs outline-none focus:border-ring",
            style: { colorScheme: "dark" },
            children: rulesets.map((r) => /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("option", { value: r.id, children: [
              r.title,
              " (",
              r.code,
              " v",
              r.version,
              ")"
            ] }, r.id))
          }
        )
      ] }),
      ageAxisKeys.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: card + " space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("h3", { className: "text-sm font-bold text-foreground", children: "Usia" }),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
            import_shared13.InfoTooltip,
            {
              content: "Bukan slider form biasa \u2014 dihitung dari date_of_birth di kuisioner data pribadi, bukan Q1-Q6. Dikirim sebagai age_years, dipakai axis: aging.",
              label: "About Usia"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex items-center justify-between text-xs mb-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "text-foreground", children: "Umur (tahun)" }),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("span", { className: "text-beak font-semibold font-mono", children: [
            respondentAge,
            " (",
            respondentAge <= 30 ? "sehat" : "faktor W",
            ")"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
          "input",
          {
            type: "range",
            min: 13,
            max: 70,
            value: respondentAge,
            onChange: (e) => setRespondentAge(Number(e.target.value)),
            className: sliderCls
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex items-center justify-between text-[10px] text-muted-foreground mt-0.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { children: "\u226430 = sehat" }),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { children: ">30 = faktor W" })
        ] })
      ] }),
      formDims.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: card + " space-y-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("h3", { className: "text-sm font-bold text-foreground", children: "Questionnaire result" }),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_shared13.InfoTooltip, { content: "Per-dimensi, hanya yang dihitung dari kuisioner (form_source). 0 = parah, 100 = sehat.", label: "About questionnaire result" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "space-y-3", children: formDims.map((dimKey) => /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex items-center justify-between text-xs mb-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "text-foreground", children: dimKey }),
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "text-beak font-semibold font-mono", children: questionnaireValues[dimKey] ?? 50 })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
            "input",
            {
              type: "range",
              min: 0,
              max: 100,
              value: questionnaireValues[dimKey] ?? 50,
              onChange: (e) => setQuestionnaireValues((p) => ({ ...p, [dimKey]: Number(e.target.value) })),
              className: sliderCls
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex items-center justify-between text-[10px] text-muted-foreground mt-0.5", children: [
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { children: "0 = parah" }),
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { children: "100 = sehat" })
          ] })
        ] }, dimKey)) })
      ] }),
      visionDims.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: card + " space-y-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("h3", { className: "text-sm font-bold text-foreground", children: "Vision result" }),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_shared13.InfoTooltip, { content: "Per-dimensi, hanya yang dihitung dari foto vendor (vision_source). 0 = parah, 100 = sehat.", label: "About vision result" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "space-y-3", children: visionDims.map((dimKey) => /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex items-center justify-between text-xs mb-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "text-foreground", children: dimKey }),
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "text-beak font-semibold font-mono", children: visionValues[dimKey] ?? 50 })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
            "input",
            {
              type: "range",
              min: 0,
              max: 100,
              value: visionValues[dimKey] ?? 50,
              onChange: (e) => setVisionValues((p) => ({ ...p, [dimKey]: Number(e.target.value) })),
              className: sliderCls
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex items-center justify-between text-[10px] text-muted-foreground mt-0.5", children: [
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { children: "0 = parah" }),
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { children: "100 = sehat" })
          ] })
        ] }, dimKey)) })
      ] }),
      otherSources.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: card + " text-[11px] text-muted-foreground", children: [
        "The simulator cannot send ",
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "font-mono", children: otherSources.join(", ") }),
        " yet, so those inputs count as missing and their weight is shared among the sources above."
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: card + " space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("h3", { className: "text-sm font-bold text-foreground", children: "Safety flags" }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "grid grid-cols-2 gap-2 text-xs", children: Object.entries(selectedConditions).map(([key, isChecked]) => /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(
          "button",
          {
            type: "button",
            onClick: () => setConditionChoices((p) => ({ ...p, [key]: !isChecked })),
            className: `p-2.5 rounded-md border text-left transition-colors flex items-center justify-between ${isChecked ? "border-beak/50 bg-beak/10 text-beak" : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"}`,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { children: key }),
              /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
                "span",
                {
                  className: `w-2 h-2 rounded-full ${isChecked ? "bg-beak" : "bg-border"}`
                }
              )
            ]
          },
          key
        )) })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "w-full lg:flex-1 space-y-3 min-w-0", children: [
      /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: card, children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("h3", { className: "text-sm font-bold text-foreground", children: "Result" }),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex items-center gap-2", children: [
            simResponse?.performance && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "text-[11px] text-muted-foreground font-mono", children: simResponse.performance }),
            /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(
              "button",
              {
                type: "button",
                onClick: copyRequest,
                title: `POST ${SIMULATE_PATH}`,
                className: "flex items-center gap-1 rounded border border-border bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-beak/50",
                children: [
                  copiedReq ? /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_lucide_react12.Check, { className: "h-3 w-3 text-beak" }) : /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_lucide_react12.Copy, { className: "h-3 w-3" }),
                  copiedReq ? "Copied" : "Copy request"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("p", { className: "mt-1 text-[10px] text-muted-foreground font-mono", children: [
          "POST ",
          SIMULATE_PATH
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "mt-3 rounded-md border border-border bg-muted/20 p-4 text-center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex items-center justify-center gap-1.5", children: [
            skinProfile?.category && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "text-[10px] font-semibold text-muted-foreground", children: skinProfile.category }),
            skinProfile && !skinProfile.complete && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "text-[10px] font-semibold text-amber-500 bg-amber-500/10 rounded px-1.5 py-0.5", children: "Incomplete" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "text-2xl font-black tracking-tight text-foreground font-mono my-1", children: profileCode }),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "text-xs font-semibold text-foreground", children: profileName }),
          skinProfile?.description && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("p", { className: "text-[11px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed", children: skinProfile.description })
        ] }),
        skinProfile?.axis_values && Object.keys(skinProfile.axis_values).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "mt-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("h4", { className: "text-[11px] font-semibold text-muted-foreground mb-2", children: "Axis codes" }),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "flex flex-wrap gap-2 text-xs", children: Object.entries(skinProfile.axis_values).map(([axis, val]) => /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(
            "div",
            {
              className: "min-w-[4.5rem] flex-1 rounded-md border border-border bg-muted/20 p-2.5 text-center",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "text-muted-foreground text-[10px] truncate", children: axis }),
                /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "text-sm font-bold text-beak font-mono mt-0.5", children: String(val) })
              ]
            },
            axis
          )) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "mt-4 rounded-md border border-border bg-muted/20 p-2.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "text-[10px] text-muted-foreground", children: "Overall score" }),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "text-sm font-bold text-foreground font-mono mt-0.5", children: totalScore }),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "text-[10px] text-muted-foreground", children: "100 = sehat" })
        ] }),
        warnings.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs space-y-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "text-[10px] font-semibold text-amber-500", children: "Warnings" }),
          warnings.map((w) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "text-amber-500/90 font-mono text-[11px]", children: w }, w))
        ] }),
        Object.keys(subClassification).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "mt-3 rounded-md border border-border bg-muted/20 p-2.5 text-xs space-y-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "text-[10px] text-muted-foreground mb-0.5", children: "Sub-classification" }),
          Object.entries(subClassification).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "text-foreground", children: k }),
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "text-muted-foreground font-mono", children: v === null ? "\u2014" : String(v) })
          ] }, k))
        ] })
      ] }),
      breakdownKeys.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: card, children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("h3", { className: "text-sm font-bold text-foreground mb-3", children: "Dimension breakdown" }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "space-y-2", children: breakdownKeys.map((dimKey) => {
          const d = dimensions[dimKey];
          const b = breakdown[dimKey];
          const contributions = Object.entries(b?.contributions || d?.contributions || {}).sort((x, y) => y[1].weight - x[1].weight);
          const missing = b?.missing || d?.missing || [];
          const scored = b ? b.scored : d?.scored !== false && d?.final_score !== null;
          const finalScore = d?.final_score ?? b?.score;
          return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "rounded-md border border-border bg-muted/20 p-2.5 text-xs space-y-1.5", children: [
            /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "text-foreground font-semibold truncate", children: dimKey }),
              /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex items-center gap-2 shrink-0 font-mono", children: [
                scored ? /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "text-beak font-semibold", title: "final score (100 = healthy)", children: typeof finalScore === "number" ? Math.round(finalScore * 10) / 10 : "\u2014" }) : /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "text-muted-foreground text-[11px] font-sans", children: "Not scored" }),
                d?.axis && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "text-foreground font-semibold bg-card border border-border rounded px-1.5 py-0.5", children: d.axis })
              ] })
            ] }),
            contributions.map(([src, c]) => /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex items-center gap-2 text-[10px]", children: [
              /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "w-16 truncate font-mono text-muted-foreground", children: src }),
              /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "h-1.5 flex-1 overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "block h-full rounded-full bg-beak", style: { width: `${Math.max(0, Math.min(1, c.weight)) * 100}%` } }) }),
              /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("span", { className: "w-10 text-right font-mono text-muted-foreground", children: [
                Math.round(c.weight * 1e3) / 10,
                "%"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "w-10 text-right font-mono text-foreground", children: Math.round(c.score * 10) / 10 })
            ] }, src)),
            missing.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "text-[10px] text-amber-600 dark:text-amber-400", children: [
              "Missing: ",
              missing.join(", ")
            ] }),
            !scored && (b?.reason || d?.reason) && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "text-[10px] text-muted-foreground", children: b?.reason || d?.reason })
          ] }, dimKey);
        }) })
      ] })
    ] })
  ] });
};

// src/score/components/modals/RulesetModal.tsx
var import_react14 = require("react");
var import_lucide_react14 = require("lucide-react");
var import_shared15 = require("@gateway-experience/shared");

// src/score/components/reusable/BandTable.tsx
var import_jsx_runtime15 = require("react/jsx-runtime");
var BandTable = ({
  bands,
  onChange,
  disabled = false,
  fixed = false,
  idPrefix = "band"
}) => {
  const setMax = (idx, raw) => {
    const next = bands.map((b) => ({ ...b }));
    const lower = idx === 0 ? 0 : next[idx - 1].max + 1;
    const upper = idx === next.length - 1 ? 100 : next[idx + 1].max - 1;
    next[idx].max = Math.max(lower, Math.min(upper, Math.round(raw)));
    onChange(next);
  };
  const setLabel = (idx, label) => {
    const next = bands.map((b) => ({ ...b }));
    next[idx].label = label;
    onChange(next);
  };
  const addRow = () => {
    const last = bands[bands.length - 1];
    const prev = bands[bands.length - 2];
    const mid = prev ? Math.round((prev.max + last.max) / 2) : Math.max(1, last.max - 1);
    const inserted = { id: `${idPrefix}_${Date.now()}`, max: mid, label: "New band" };
    onChange([...bands.slice(0, -1), inserted, last]);
  };
  const removeRow = (idx) => {
    if (bands.length <= 2) return;
    onChange(bands.filter((_, i) => i !== idx));
  };
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "rounded-md border border-border bg-card divide-y divide-border", children: [
    /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "flex items-center gap-2 px-3 py-1.5 bg-muted/20 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", children: [
      /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "w-24 shrink-0", children: "Score" }),
      /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "flex-1", children: "Label" }),
      !fixed && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "w-6 shrink-0", "aria-hidden": "true" })
    ] }),
    bands.map((b, idx) => {
      const lower = idx === 0 ? 0 : bands[idx - 1].max + 1;
      return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "flex items-center gap-2 px-3 py-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "flex w-24 shrink-0 items-center gap-1 text-xs tabular-nums text-muted-foreground", children: [
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "w-6 text-right", children: lower }),
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { children: "\u2013" }),
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
            "input",
            {
              type: "number",
              min: lower,
              max: 100,
              disabled: disabled || idx === bands.length - 1,
              value: b.max,
              onChange: (e) => setMax(idx, Number(e.target.value)),
              className: "w-12 h-7 rounded bg-muted/40 border border-border px-1 text-center text-foreground text-xs outline-none focus:border-ring disabled:opacity-60"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
          "input",
          {
            type: "text",
            disabled,
            value: b.label,
            onChange: (e) => setLabel(idx, e.target.value),
            placeholder: "e.g. Optimal",
            className: "flex-1 min-w-0 h-7 rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring disabled:opacity-50"
          }
        ),
        !fixed && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
          "button",
          {
            type: "button",
            disabled: disabled || bands.length <= 2,
            onClick: () => removeRow(idx),
            className: "w-6 shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-30 text-sm",
            title: "Remove band",
            children: "\xD7"
          }
        )
      ] }, b.id);
    }),
    !fixed && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "px-3 py-1.5", children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
      "button",
      {
        type: "button",
        disabled,
        onClick: addRow,
        className: "text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-50",
        children: "+ Add band"
      }
    ) })
  ] });
};

// src/score/components/reusable/ProfileMappingTable.tsx
var import_react13 = __toESM(require("react"));
var import_lucide_react13 = require("lucide-react");
var import_shared14 = require("@gateway-experience/shared");
var import_jsx_runtime16 = require("react/jsx-runtime");
var ProfileMappingTable = ({
  axes,
  config,
  onChange,
  disabled = false
}) => {
  const { strategy, profiles } = config;
  const [expandedRows, setExpandedRows] = (0, import_react13.useState)({});
  const [cache, setCache] = (0, import_react13.useState)({});
  const wide = strategy === "combination_matrix";
  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const handleStrategyChange = (newStrategy) => {
    if (newStrategy === strategy) return;
    setCache((prev) => ({ ...prev, [strategy]: profiles }));
    const cached = cache[newStrategy];
    let initialProfiles = cached ?? [];
    if (!cached) {
      if (newStrategy === "total_score") {
        initialProfiles = [
          { id: `prof_${Date.now()}_1`, minScore: 80, maxScore: 100, code: "OPTIMAL_RESILIENT", title: "Optimal Vitality", category: "Resilient Barrier", summary: "Healthy barrier balance." },
          { id: `prof_${Date.now()}_2`, minScore: 50, maxScore: 79, code: "MODERATE_FATIGUE", title: "Moderate Fatigue", category: "Early Stress", summary: "Mild cellular stress." },
          { id: `prof_${Date.now()}_3`, minScore: 0, maxScore: 49, code: "ACCELERATED_DEFICIT", title: "Accelerated Deficit", category: "High Concern", summary: "Elevated concern." }
        ];
      } else if (newStrategy === "combination_matrix") {
        initialProfiles = generateCartesianCombinations(axes);
      } else if (newStrategy === "primary_concern") {
        initialProfiles = axes.map((a, idx) => ({
          id: `prof_${Date.now()}_${idx + 1}`,
          primaryDimension: a.dimensionKey,
          severityLevel: "Sangat Parah",
          code: `${a.dimensionKey.toUpperCase()}_CRITICAL`,
          title: `${a.name} Critical Concern`,
          category: "Acute Concern",
          summary: `Acute focus required on ${a.name}.`
        }));
      }
    }
    onChange({
      strategy: newStrategy,
      profiles: initialProfiles
    });
  };
  const handleAddProfile = () => {
    let newEntry;
    const pIdx = profiles.length + 1;
    if (strategy === "total_score") {
      const last = profiles[profiles.length - 1];
      const max = last && last.minScore !== void 0 ? Math.max(0, last.minScore - 1) : 49;
      newEntry = {
        id: `prof_${Date.now()}`,
        minScore: 0,
        maxScore: max,
        code: `TIER_${pIdx}`,
        title: `Health Tier ${pIdx}`,
        category: "Standard",
        summary: ""
      };
    } else if (strategy === "combination_matrix") {
      const dimCodes = {};
      axes.forEach((a) => {
        dimCodes[a.dimensionKey] = axisLetters(a)[0];
      });
      newEntry = {
        id: `prof_${Date.now()}`,
        dimensionCodes: dimCodes,
        code: Object.values(dimCodes).join(""),
        title: `Profile ${pIdx}`,
        category: "General",
        summary: ""
      };
    } else {
      newEntry = {
        id: `prof_${Date.now()}`,
        primaryDimension: axes[0]?.dimensionKey || "sebum",
        severityLevel: "Parah",
        code: `CONCERN_${pIdx}`,
        title: `Concern Profile ${pIdx}`,
        category: "Targeted",
        summary: ""
      };
    }
    onChange({
      ...config,
      profiles: [...profiles, newEntry]
    });
  };
  const handleDeleteProfile = (id) => {
    if (profiles.length <= 1) return;
    onChange({
      ...config,
      profiles: profiles.filter((p) => p.id !== id)
    });
  };
  const handleUpdateProfile = (id, field2, val) => {
    const updated = profiles.map((p) => {
      if (p.id === id) {
        return { ...p, [field2]: val };
      }
      return p;
    });
    onChange({ ...config, profiles: updated });
  };
  const handleUpdateDimCode = (id, dimKey, codeVal) => {
    const updated = profiles.map((p) => {
      if (p.id === id) {
        const nextCodes = { ...p.dimensionCodes || {}, [dimKey]: codeVal.toUpperCase() };
        return { ...p, dimensionCodes: nextCodes };
      }
      return p;
    });
    onChange({ ...config, profiles: updated });
  };
  const handleAutoGenerateMatrix = () => {
    const generated = generateCartesianCombinations(axes);
    onChange({
      ...config,
      profiles: generated
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "space-y-4", children: [
    /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "bg-card p-3.5 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("label", { className: "text-sm font-bold text-foreground block", children: "How the profile is chosen" }),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
          import_shared14.InfoTooltip,
          {
            content: "Sets skin_profile.code and skin_profile.name \u2014 a different result than Score Range and Severity Level above, which only set score_range and severity_level. 'Total Score' reads the same overall score as those two, just to pick a different output.",
            label: "About profile strategy"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "flex items-center gap-1.5 bg-muted/40 p-1 rounded-md border border-border shrink-0", children: [
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
          "button",
          {
            type: "button",
            disabled,
            onClick: () => handleStrategyChange("total_score"),
            className: `px-3 py-1.5 rounded text-xs font-semibold transition-colors ${strategy === "total_score" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"}`,
            children: "Total Score"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
          "button",
          {
            type: "button",
            disabled,
            onClick: () => handleStrategyChange("combination_matrix"),
            className: `px-3 py-1.5 rounded text-xs font-semibold transition-colors ${strategy === "combination_matrix" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"}`,
            children: "Combination Matrix"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
          "button",
          {
            type: "button",
            disabled,
            onClick: () => handleStrategyChange("primary_concern"),
            className: `px-3 py-1.5 rounded text-xs font-semibold transition-colors ${strategy === "primary_concern" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"}`,
            children: "Primary Concern"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("p", { className: "text-[11px] text-muted-foreground -mt-2", children: "Only the highlighted method above is saved to this ruleset \u2014 the other two are kept in this browser tab so you can switch back without losing what you typed, but they're discarded on reload." }),
    strategy === "total_score" && /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("p", { className: "text-[11px] text-muted-foreground bg-muted/40 border border-border rounded-lg px-3 py-2", children: [
      `"Trigger range" reads the same overall score as the Score Range / Severity Level labels above, but this table picks the profile's own`,
      " ",
      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "font-mono", children: "skin_profile.code" }),
      " /",
      " ",
      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "font-mono", children: "skin_profile.name" }),
      " \u2014 a different result than",
      " ",
      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "font-mono", children: "score_range" }),
      " /",
      " ",
      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "font-mono", children: "severity_level" }),
      ". Editing one does not change the others."
    ] }),
    strategy === "combination_matrix" && /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "flex items-center justify-between bg-muted/40 border border-border p-2.5 rounded-lg", children: [
      /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("span", { className: "text-xs text-muted-foreground", children: [
        "One row per combination of ",
        axes.length,
        " dimensions (",
        profiles.length,
        " rows)."
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
        "button",
        {
          type: "button",
          disabled: disabled || axes.length === 0,
          onClick: handleAutoGenerateMatrix,
          className: "px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded text-xs flex items-center gap-1 transition-colors disabled:opacity-50",
          children: "Generate all combinations"
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "border border-border rounded-lg overflow-hidden bg-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "overflow-x-auto", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
        "table",
        {
          className: `${wide ? "min-w-full" : "w-full"} text-left text-xs border-collapse`,
          style: wide ? { width: "max-content" } : void 0,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("tr", { className: "bg-muted/40 border-b border-border text-[11px] text-muted-foreground", children: [
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("th", { className: "py-2.5 px-3 text-center", style: { width: 40 }, children: "#" }),
              strategy === "total_score" && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("th", { className: "py-2.5 px-3", style: { minWidth: 160 }, children: "Trigger range" }),
              strategy === "combination_matrix" && axes.map((a) => {
                const letters = axisLetters(a);
                const bipolar = !!(a.axisCodeLow?.trim() && a.axisCodeHigh?.trim());
                return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
                  "th",
                  {
                    className: "py-2.5 px-3 text-center whitespace-nowrap",
                    style: { minWidth: 120 },
                    children: [
                      a.name || a.dimensionKey,
                      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "block text-[10px] font-normal text-muted-foreground", children: bipolar ? letters.join(" / ") : "O / S / P" })
                    ]
                  },
                  a.id
                );
              }),
              strategy === "primary_concern" && /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(import_jsx_runtime16.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("th", { className: "py-2.5 px-3", style: { minWidth: 224 }, children: "Dimension" }),
                /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("th", { className: "py-2.5 px-3", style: { minWidth: 150 }, children: "Level" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("th", { className: "py-2.5 px-3", style: { minWidth: 150 }, children: "Code" }),
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("th", { className: "py-2.5 px-3", style: { minWidth: 240 }, children: "Name" }),
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("th", { className: "py-2.5 px-3 text-center", style: { width: 80 } })
            ] }) }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("tbody", { className: "divide-y divide-border", children: profiles.map((p, pIdx) => {
              const isExpanded = !!expandedRows[p.id];
              return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(import_react13.default.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("tr", { className: "hover:bg-muted/40 transition-colors", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("td", { className: "py-2.5 px-3 text-center text-muted-foreground font-semibold", children: pIdx + 1 }),
                  strategy === "total_score" && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("td", { className: "py-2.5 px-3", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                    import_shared14.ScoreRangeInput,
                    {
                      minScore: p.minScore ?? 0,
                      maxScore: p.maxScore ?? 100,
                      disabled,
                      onChange: (min, max) => {
                        const updated = profiles.map(
                          (item) => item.id === p.id ? { ...item, minScore: min, maxScore: max } : item
                        );
                        onChange({ ...config, profiles: updated });
                      }
                    }
                  ) }),
                  strategy === "combination_matrix" && axes.map((a) => {
                    const codeVal = p.dimensionCodes?.[a.dimensionKey] || p.dimensionCodes?.[a.axisCode] || axisLetters(a)[0];
                    return /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("td", { className: "py-2.5 px-3 text-center", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                      "input",
                      {
                        type: "text",
                        disabled,
                        value: codeVal,
                        onChange: (e) => handleUpdateDimCode(p.id, a.dimensionKey, e.target.value),
                        placeholder: "D",
                        className: "w-12 px-1.5 py-1 bg-muted/40 border border-border rounded text-beak font-bold text-center focus:outline-none focus:border-ring disabled:opacity-50 text-xs"
                      }
                    ) }, a.id);
                  }),
                  strategy === "primary_concern" && /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(import_jsx_runtime16.Fragment, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("td", { className: "py-2 px-3 align-middle", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                      import_shared14.DimensionSelect,
                      {
                        label: "",
                        value: p.primaryDimension || axes[0]?.dimensionKey || "sebum",
                        disabled,
                        onChange: (dimKey) => handleUpdateProfile(p.id, "primaryDimension", dimKey)
                      }
                    ) }),
                    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("td", { className: "py-2 px-3 align-middle", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                      import_shared14.SeveritySelect,
                      {
                        value: p.severityLevel || "Parah",
                        disabled,
                        onChange: (sev) => handleUpdateProfile(p.id, "severityLevel", sev)
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("td", { className: "py-2.5 px-3", style: { minWidth: 150 }, children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                    "input",
                    {
                      type: "text",
                      disabled,
                      value: p.code,
                      onChange: (e) => handleUpdateProfile(p.id, "code", e.target.value.toUpperCase().replace(/\s+/g, "_")),
                      placeholder: "DSPW",
                      className: "w-full px-2.5 py-1.5 bg-muted/40 border border-border rounded text-beak font-bold focus:outline-none focus:border-ring disabled:opacity-50 text-xs"
                    }
                  ) }),
                  /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("td", { className: "py-2.5 px-3", style: { minWidth: 240 }, children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                    "input",
                    {
                      type: "text",
                      disabled,
                      value: p.title,
                      onChange: (e) => handleUpdateProfile(p.id, "title", e.target.value),
                      placeholder: "e.g. Dry Sensitive Pigmented Wrinkled",
                      className: "w-full px-2.5 py-1.5 bg-muted/40 border border-border rounded text-foreground focus:outline-none focus:border-ring disabled:opacity-50 text-xs font-medium"
                    }
                  ) }),
                  /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("td", { className: "py-2.5 px-3 text-center", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "flex items-center justify-center gap-1", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                      "button",
                      {
                        type: "button",
                        onClick: () => toggleRow(p.id),
                        className: `p-1.5 rounded transition-colors ${isExpanded ? "text-beak bg-beak/10 border border-beak/40" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`,
                        title: "Show category & description",
                        children: isExpanded ? /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(import_lucide_react13.ChevronDown, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(import_lucide_react13.ChevronRight, { className: "h-3.5 w-3.5" })
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                      "button",
                      {
                        type: "button",
                        disabled: disabled || profiles.length <= 1,
                        onClick: () => handleDeleteProfile(p.id),
                        className: "p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-30 rounded transition-colors",
                        title: "Delete Profile Row",
                        children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(import_lucide_react13.Trash2, { className: "h-3.5 w-3.5" })
                      }
                    )
                  ] }) })
                ] }),
                isExpanded && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("tr", { className: "bg-muted/40 border-b border-border", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                  "td",
                  {
                    colSpan: strategy === "combination_matrix" ? axes.length + 4 : strategy === "primary_concern" ? 6 : 5,
                    className: "px-4 py-3",
                    children: /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3 text-xs", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { children: [
                        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("label", { className: "text-muted-foreground text-[11px] font-semibold block mb-1", children: "Category" }),
                        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                          "input",
                          {
                            type: "text",
                            disabled,
                            value: p.category,
                            onChange: (e) => handleUpdateProfile(p.id, "category", e.target.value),
                            placeholder: "e.g. Dry Reactive",
                            className: "w-full px-2.5 py-1.5 bg-card border border-border rounded text-foreground focus:outline-none focus:border-ring disabled:opacity-50 text-xs"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "md:col-span-2", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("label", { className: "text-muted-foreground text-[11px] font-semibold block mb-1", children: "Description" }),
                        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                          "input",
                          {
                            type: "text",
                            disabled,
                            value: p.summary || "",
                            onChange: (e) => handleUpdateProfile(p.id, "summary", e.target.value),
                            placeholder: "Short description of this profile",
                            className: "w-full px-2.5 py-1.5 bg-card border border-border rounded text-muted-foreground focus:outline-none focus:border-ring disabled:opacity-50 text-xs"
                          }
                        )
                      ] })
                    ] })
                  }
                ) })
              ] }, p.id);
            }) })
          ]
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "p-2.5 bg-muted/40 border-t border-border flex items-center justify-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
          "button",
          {
            type: "button",
            disabled,
            onClick: handleAddProfile,
            className: "px-2.5 py-1 bg-card hover:bg-muted text-foreground rounded text-xs font-medium flex items-center gap-1 transition-colors border border-border disabled:opacity-50",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(import_lucide_react13.Plus, { className: "h-3 w-3" }),
              "Add profile"
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("span", { className: "text-[11px] text-muted-foreground", children: [
          profiles.length,
          " profiles"
        ] })
      ] })
    ] })
  ] });
};
var MAX_COMBINATIONS = 64;
var SCORE_RANGE_CODES = ["O", "S", "P"];
function axisLetters(a) {
  const low = (a.axisCodeLow || "").trim().toUpperCase();
  const high = (a.axisCodeHigh || "").trim().toUpperCase();
  return low && high ? [low, high] : SCORE_RANGE_CODES;
}
function generateCartesianCombinations(axes) {
  if (axes.length === 0) return [];
  const dimTierArrays = axes.map((a) => {
    return axisLetters(a).map((code) => ({ dimKey: a.dimensionKey, code }));
  });
  let combinations = [[]];
  for (const curr of dimTierArrays) {
    const next = [];
    for (const partial of combinations) {
      for (const item of curr) {
        next.push([...partial, item]);
        if (next.length >= MAX_COMBINATIONS) break;
      }
      if (next.length >= MAX_COMBINATIONS) break;
    }
    combinations = next;
  }
  return combinations.map((combo, idx) => {
    const dimCodes = {};
    const codeParts = [];
    const nameParts = [];
    combo.forEach((item) => {
      dimCodes[item.dimKey] = item.code;
      codeParts.push(item.code);
      if (item.tier?.gradeName) {
        nameParts.push(item.tier.gradeName);
      }
    });
    const fullCode = codeParts.join("");
    const fullTitle = nameParts.length > 0 ? nameParts.join(", ") : `Profile ${fullCode}`;
    return {
      id: `prof_${Date.now()}_${idx + 1}`,
      dimensionCodes: dimCodes,
      code: fullCode,
      title: fullTitle,
      category: "Diagnostic Profile",
      summary: `Combination evaluation for ${fullCode}.`
    };
  });
}

// src/score/components/modals/RulesetModal.tsx
var import_jsx_runtime17 = require("react/jsx-runtime");
var inputCls = "w-full h-9 rounded-md bg-muted/40 border border-border px-3 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:border-ring disabled:opacity-50";
var labelCls = "block text-xs font-semibold text-foreground mb-1.5";
var slugify2 = (v) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
var RulesetModal = ({
  isOpen,
  onClose,
  onSave,
  editingRuleset
}) => {
  const [name, setName] = (0, import_react14.useState)("");
  const [code, setCode] = (0, import_react14.useState)("");
  const [codeEdited, setCodeEdited] = (0, import_react14.useState)(false);
  const [showCodeField, setShowCodeField] = (0, import_react14.useState)(false);
  const [description, setDescription] = (0, import_react14.useState)("");
  const [brandId, setBrandId] = (0, import_react14.useState)("*");
  const [applicationId, setApplicationId] = (0, import_react14.useState)("*");
  const [status, setStatus] = (0, import_react14.useState)("ACTIVE");
  const [formSurveyCode, setFormSurveyCode] = (0, import_react14.useState)("");
  const [visionSourceCode, setVisionSourceCode] = (0, import_react14.useState)("");
  const [surveys, setSurveys] = (0, import_react14.useState)([]);
  const [axes, setAxes] = (0, import_react14.useState)(DEFAULT_STARTER_AXES);
  const [profileConfig, setProfileConfig] = (0, import_react14.useState)(DEFAULT_STARTER_PROFILES);
  const [scoreRangeBands, setScoreRangeBands] = (0, import_react14.useState)(DEFAULT_SCORE_RANGE_BANDS);
  const [severityBands, setSeverityBands] = (0, import_react14.useState)(DEFAULT_SEVERITY_BANDS);
  const [tab, setTab] = (0, import_react14.useState)("setup");
  const [schemaOpen, setSchemaOpen] = (0, import_react14.useState)(true);
  const notesRef = (0, import_react14.useRef)(null);
  const fitNotes = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };
  const [copied, setCopied] = (0, import_react14.useState)(null);
  const [isSubmitting, setIsSubmitting] = (0, import_react14.useState)(false);
  const [formError, setFormError] = (0, import_react14.useState)(null);
  const [isLegacy, setIsLegacy] = (0, import_react14.useState)(false);
  (0, import_react14.useEffect)(() => {
    if (editingRuleset) {
      setName(editingRuleset.title);
      setCode(editingRuleset.code);
      setCodeEdited(true);
      setShowCodeField(false);
      setDescription(editingRuleset.description || "");
      setBrandId(editingRuleset.brandId || "*");
      setApplicationId(editingRuleset.applicationId || "*");
      setStatus(editingRuleset.status || "ACTIVE");
      const { axes: a, profileConfig: p, scoreRangeBands: sr, severityBands: sv, legacy } = decompileJDMToVisualComponents(editingRuleset.schema);
      setAxes(a);
      setProfileConfig(p);
      setScoreRangeBands(sr);
      setSeverityBands(sv);
      setIsLegacy(legacy);
      try {
        const parsed = JSON.parse(editingRuleset.schema || "{}");
        setFormSurveyCode(parsed.form_survey_code || "");
        setVisionSourceCode(parsed.vision_source_code || "");
      } catch {
        setFormSurveyCode("");
        setVisionSourceCode("");
      }
    } else {
      setName("");
      setCode("");
      setCodeEdited(false);
      setShowCodeField(false);
      setDescription("");
      setBrandId("*");
      setApplicationId("*");
      setStatus("ACTIVE");
      setAxes(DEFAULT_STARTER_AXES);
      setProfileConfig(DEFAULT_STARTER_PROFILES);
      setScoreRangeBands(DEFAULT_SCORE_RANGE_BANDS);
      setSeverityBands(DEFAULT_SEVERITY_BANDS);
      setIsLegacy(false);
      setFormSurveyCode("");
      setVisionSourceCode("");
    }
    setTab("setup");
    setFormError(null);
  }, [editingRuleset, isOpen]);
  (0, import_react14.useEffect)(() => {
    fitNotes(notesRef.current);
  }, [description, tab, isOpen]);
  (0, import_react14.useEffect)(() => {
    if (!isOpen) return;
    fetchTenantSurveys(brandId, applicationId).then((data) => setSurveys(surveyList(data))).catch(() => setSurveys([]));
  }, [isOpen, brandId, applicationId]);
  const effectiveCode = codeEdited ? code : slugify2(name);
  const totalWeight = axes.reduce((sum, a) => sum + (Number(a.weight) || 0), 0);
  const addAxis = () => {
    const n = axes.length + 1;
    setAxes((prev) => [
      ...prev,
      {
        id: `axis_${Date.now()}`,
        axisCode: `DIM_${n}`,
        name: `Dimension ${n}`,
        dimensionKey: "sensitivity",
        weight: 1,
        concernLabel: defaultConcernLabel("sensitivity")
      }
    ]);
  };
  const withSetupFields = (schemaStr) => {
    try {
      const parsed = JSON.parse(schemaStr);
      if (formSurveyCode) parsed.form_survey_code = formSurveyCode;
      else delete parsed.form_survey_code;
      if (visionSourceCode) parsed.vision_source_code = visionSourceCode;
      else delete parsed.vision_source_code;
      return JSON.stringify(parsed, null, 2);
    } catch {
      return schemaStr;
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setTab("setup");
      return setFormError("Name is required.");
    }
    if (!effectiveCode) {
      setTab("setup");
      return setFormError("Could not derive a code \u2014 set one manually.");
    }
    setIsSubmitting(true);
    try {
      await onSave({
        id: editingRuleset?.id,
        code: effectiveCode,
        title: name.trim(),
        description: description.trim(),
        brandId,
        applicationId,
        status,
        // Core's update replaces the whole row, so leaving the version out reset it to 0.
        ...editingRuleset ? { version: editingRuleset.version } : {},
        schema: withSetupFields(compileVisualToJDM(axes, profileConfig, scoreRangeBands, severityBands, editingRuleset?.schema))
      });
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save grading model");
    } finally {
      setIsSubmitting(false);
    }
  };
  const jsonText = withSetupFields(compileVisualToJDM(axes, profileConfig, scoreRangeBands, severityBands, editingRuleset?.schema));
  const createRequestBody = JSON.stringify(
    {
      brandId,
      applicationId,
      code: effectiveCode || "<code>",
      title: name.trim() || "<name>",
      description: description.trim(),
      status,
      schema: jsonText
    },
    null,
    2
  );
  const simulateRequestBody = JSON.stringify(
    {
      schema: jsonText,
      dimension_scores: Object.fromEntries(
        axes.map((a) => [a.dimensionKey.toLowerCase(), 50])
      ),
      customer_condition: {}
    },
    null,
    2
  );
  const copyAs = (label, text) => {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
    import_shared15.Modal,
    {
      isOpen,
      onClose,
      title: editingRuleset ? `Edit: ${editingRuleset.title}` : "New grading model",
      maxWidth: "max-w-5xl",
      children: /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        isLegacy && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "p-3 rounded-md border border-beak/40 bg-beak/10 text-xs text-foreground flex items-start gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_lucide_react14.AlertTriangle, { className: "h-4 w-4 shrink-0 text-beak" }),
          /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("span", { children: [
            "Ruleset ini dibuat dengan format lama. Dimensi, band, dan profil di bawah adalah hasil konversi terbaik \u2014 periksa dulu sebelum ",
            /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("strong", { children: "Save changes" }),
            ", karena menyimpan akan menulis ulang ruleset ke format baru."
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "flex flex-col lg:flex-row gap-4 items-start", children: [
          /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "w-full lg:flex-1 min-w-0 space-y-3", children: [
            /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "flex items-center gap-1 rounded-md border border-border bg-muted/40 p-1", children: [
              ["setup", "Setup"],
              ["dimensions", `Dimensions${axes.length ? ` (${axes.length})` : ""}`],
              ["bands", "Skin Profile"]
            ].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
              "button",
              {
                type: "button",
                onClick: () => setTab(id),
                className: `flex-1 rounded px-3 py-1.5 text-xs font-semibold transition-colors ${tab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
                children: label
              },
              id
            )) }),
            tab === "setup" && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "space-y-3", children: [
              /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("label", { className: labelCls, children: [
                  "Name ",
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "text-destructive", children: "*" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                  "input",
                  {
                    type: "text",
                    required: true,
                    value: name,
                    onChange: (e) => setName(e.target.value),
                    placeholder: "e.g. Wardah Skinverse grading",
                    className: inputCls
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("p", { className: "mt-1 text-[11px] text-muted-foreground", children: [
                  "saved as ",
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "text-foreground font-mono", children: effectiveCode || "\u2026" }),
                  !editingRuleset && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        setShowCodeField((v) => !v);
                        if (!codeEdited) setCode(effectiveCode);
                      },
                      className: "ml-2 underline hover:text-foreground",
                      children: "edit"
                    }
                  )
                ] }),
                showCodeField && !editingRuleset && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                  "input",
                  {
                    type: "text",
                    value: code,
                    onChange: (e) => {
                      setCode(slugify2(e.target.value));
                      setCodeEdited(true);
                    },
                    className: inputCls + " mt-1.5 font-mono"
                  }
                ),
                editingRuleset?.id && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                  "button",
                  {
                    type: "button",
                    onClick: () => copyAs("ID", editingRuleset.id),
                    title: "Copy ID \u2014 needed for PUT /core/score-engine/rulesets/:id",
                    className: "mt-1 flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground",
                    children: [
                      copied === "ID" ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_lucide_react14.Check, { className: "h-3 w-3 text-beak" }) : /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_lucide_react14.Copy, { className: "h-3 w-3" }),
                      copied === "ID" ? "ID copied" : `ID ${editingRuleset.id}`
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "max-w-xs", children: [
                /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("label", { className: labelCls, children: "Status" }),
                /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_shared15.StatusSelect, { value: status, onChange: setStatus, label: "" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "rounded-md border border-border bg-muted/20", children: [
                /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "px-3 py-2 text-xs font-semibold text-muted-foreground", children: "Scope & notes" }),
                /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "border-t border-border p-3 space-y-3", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_shared15.BrandSelect, { value: brandId, onChange: setBrandId, includeUniversal: true, label: "Brand" }),
                    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                      import_shared15.ApplicationSelect,
                      {
                        value: applicationId,
                        onChange: setApplicationId,
                        includeUniversal: true,
                        label: "Application"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "flex items-center gap-1.5 mb-1.5", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("label", { className: labelCls + " mb-0", children: "Form input" }),
                        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                          import_shared15.InfoTooltip,
                          {
                            content: "Which Form Engine survey this ruleset pairs with. Scopes what shows up when adding/wiring a dimension's Form source in Blending.",
                            label: "About Form input"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                        "select",
                        {
                          value: formSurveyCode,
                          onChange: (e) => setFormSurveyCode(e.target.value),
                          className: inputCls,
                          style: { colorScheme: "dark" },
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("option", { value: "", children: "\u2014 none selected \u2014" }),
                            surveys.map((s) => /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("option", { value: s.code, children: [
                              s.title || s.name || s.code,
                              " (",
                              s.code,
                              ")"
                            ] }, s.code))
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "flex items-center gap-1.5 mb-1.5", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("label", { className: labelCls + " mb-0", children: "Vision input" }),
                        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                          import_shared15.InfoTooltip,
                          {
                            content: "Which CV/vendor source this ruleset pairs with. Only one is registered today (Paradev Skin Analyzer) \u2014 more get added as new vendors are wired up.",
                            label: "About Vision input"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                        "select",
                        {
                          value: visionSourceCode,
                          onChange: (e) => setVisionSourceCode(e.target.value),
                          className: inputCls,
                          style: { colorScheme: "dark" },
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("option", { value: "", children: "\u2014 none selected \u2014" }),
                            /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("option", { value: "paradev_skin_analyzer", children: "Paradev Skin Analyzer" })
                          ]
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("label", { className: labelCls, children: "Notes" }),
                    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                      "textarea",
                      {
                        ref: (el) => {
                          notesRef.current = el;
                          fitNotes(el);
                        },
                        rows: 2,
                        value: description,
                        onChange: (e) => {
                          setDescription(e.target.value);
                          fitNotes(e.target);
                        },
                        placeholder: "What this model covers and why the thresholds are set this way\u2026",
                        className: inputCls + " h-auto py-2 resize-none overflow-hidden"
                      }
                    )
                  ] })
                ] })
              ] })
            ] }),
            tab === "dimensions" && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "space-y-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("h3", { className: "text-sm font-bold text-foreground", children: "Dimensions" }),
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                    import_shared15.InfoTooltip,
                    {
                      content: "Weights are relative \u2014 a dimension\u2019s share of the overall score is its weight \xF7 the total of all weights. The concern label is what the customer sees when that dimension is their dominant concern. Form/Vision blend per dimension moved to the Blending tab.",
                      label: "About dimensions"
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                  import_shared15.Button,
                  {
                    type: "button",
                    variant: "outline",
                    size: "sm",
                    onClick: addAxis,
                    leftIcon: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_lucide_react14.Plus, { className: "h-3.5 w-3.5" }),
                    children: "Add dimension"
                  }
                )
              ] }),
              axes.map((axis, i) => /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                ClinicalAxisCard,
                {
                  axis,
                  index: i,
                  defaultOpen: axes.length === 1,
                  siblingWeightTotal: totalWeight,
                  onUpdate: (updated) => setAxes((prev) => prev.map((a) => a.id === axis.id ? updated : a)),
                  onDelete: () => {
                    if (axes.length <= 1) {
                      setFormError("Keep at least one dimension.");
                      return;
                    }
                    setAxes((prev) => prev.filter((a) => a.id !== axis.id));
                    setFormError(null);
                  },
                  canDelete: axes.length > 1
                },
                axis.id
              ))
            ] }),
            tab === "bands" && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "space-y-4", children: [
              /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "space-y-1", children: [
                /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("h3", { className: "text-base font-bold text-foreground", children: "Skin Profile" }),
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                    import_shared15.InfoTooltip,
                    {
                      content: "Everything here is derived from the same overall score (0-100). The two label tables below just name a bracket of that score; the method further down decides skin_profile.code/name, the actual profile result.",
                      label: "About Skin Profile"
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("p", { className: "text-[11px] text-muted-foreground", children: "Score Range and Severity Level are two labels for the same overall score \u2014 handy for a quick badge, not required by the profile method below." })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
                /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("h4", { className: "text-xs font-semibold text-foreground", children: "Score Range label" }),
                    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                      import_shared15.InfoTooltip,
                      {
                        content: "Sets score_range only \u2014 a coarse 3-tier badge for the overall score.",
                        label: "About Score Range"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(BandTable, { bands: scoreRangeBands, onChange: setScoreRangeBands, idPrefix: "sr" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("h4", { className: "text-xs font-semibold text-foreground", children: "Severity Level label" }),
                    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                      import_shared15.InfoTooltip,
                      {
                        content: "Sets severity_level only \u2014 a finer 5-tier badge for the same overall score.",
                        label: "About Severity Level"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(BandTable, { bands: severityBands, onChange: setSeverityBands, idPrefix: "sv" })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "space-y-1.5 border-t border-border pt-4", children: [
                /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("h4", { className: "text-xs font-semibold text-foreground", children: "Profile method" }),
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                    import_shared15.InfoTooltip,
                    {
                      content: "Decides skin_profile.code and skin_profile.name \u2014 the actual profile result, separate from the two labels above. Only one method runs at a time: they'd otherwise write conflicting values to the same code/name.",
                      label: "About profile method"
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(ProfileMappingTable, { axes, config: profileConfig, onChange: setProfileConfig })
              ] })
            ] })
          ] }),
          !schemaOpen ? /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
            "button",
            {
              type: "button",
              onClick: () => setSchemaOpen(true),
              title: "Show schema & API",
              className: "rounded-md border border-border bg-muted/20 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:border-beak/50",
              style: {
                flex: "0 0 34px",
                width: 34,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "12px 0"
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_lucide_react14.PanelRightOpen, { className: "h-3.5 w-3.5", style: { flexShrink: 0 } }),
                /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { style: { writingMode: "vertical-rl", transform: "rotate(180deg)", whiteSpace: "nowrap" }, children: "Schema & API" })
              ]
            }
          ) : /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "w-full lg:w-64 lg:shrink-0", children: /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "rounded-md border border-border bg-muted/20 lg:sticky lg:top-0", children: [
            /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
              "button",
              {
                type: "button",
                onClick: () => setSchemaOpen(false),
                className: "flex w-full items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { children: "Schema & API" }),
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_lucide_react14.PanelRightClose, { className: "h-3.5 w-3.5 shrink-0" })
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "border-t border-border", children: [
              /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "flex flex-wrap items-center gap-1.5 px-3 py-2", children: [
                { label: "Schema", text: jsonText },
                { label: "Copy request body", text: createRequestBody },
                { label: "Simulate request", text: simulateRequestBody }
              ].map(({ label, text }) => /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                "button",
                {
                  type: "button",
                  onClick: () => copyAs(label, text),
                  className: "flex items-center gap-1 rounded border border-border bg-card px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-beak/50",
                  children: [
                    copied === label ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_lucide_react14.Check, { className: "h-3 w-3 text-beak" }) : /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_lucide_react14.Copy, { className: "h-3 w-3" }),
                    copied === label ? "Copied" : label
                  ]
                },
                label
              )) }),
              /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                "textarea",
                {
                  rows: 10,
                  readOnly: true,
                  value: jsonText,
                  className: "w-full border-t border-border bg-card px-3 py-2 font-mono text-[11px] text-foreground outline-none leading-relaxed lg:max-h-[30vh]"
                }
              )
            ] })
          ] }) })
        ] }),
        formError && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "p-3 rounded-md border border-destructive/40 bg-destructive/10 text-xs text-destructive flex items-center gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_lucide_react14.AlertTriangle, { className: "h-4 w-4 shrink-0" }),
          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { children: formError })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "flex items-center justify-end gap-2 pt-3 border-t border-border", children: [
          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_shared15.Button, { type: "button", variant: "outline", size: "sm", onClick: onClose, children: "Cancel" }),
          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_shared15.Button, { type: "submit", variant: "primary", size: "sm", isLoading: isSubmitting, disabled: !name.trim(), children: editingRuleset ? "Save changes" : "Create" })
        ] })
      ] })
    }
  );
};

// src/score/components/ScoreManager.tsx
var import_jsx_runtime18 = require("react/jsx-runtime");
var ScoreManager = () => {
  const [activeTab, setActiveTab] = (0, import_shared16.usePersistentState)("xg.scoreEngine.activeTab", "rulesets");
  const [searchQuery, setSearchQuery] = (0, import_react15.useState)("");
  const [rulesets, setRulesets] = (0, import_react15.useState)([]);
  const [selectedRulesetId, setSelectedRulesetId] = (0, import_shared16.usePersistentState)("xg.scoreEngine.selectedRulesetId", null);
  const selectedRuleset = rulesets.find((r) => r.id === selectedRulesetId) ?? null;
  const setSelectedRuleset = (r) => setSelectedRulesetId(r?.id ?? null);
  const [isRulesetModalOpen, setIsRulesetModalOpen] = (0, import_react15.useState)(false);
  const [editingRuleset, setEditingRuleset] = (0, import_react15.useState)(null);
  const [deleteConfirm, setDeleteConfirm] = (0, import_react15.useState)({
    isOpen: false,
    title: "",
    message: "",
    isLoading: false,
    onConfirm: () => {
    }
  });
  const loadRulesets = (0, import_react15.useCallback)(() => {
    listRulesets().then((list2) => {
      if (list2) setRulesets(list2);
    }).catch(() => {
    });
  }, []);
  (0, import_react15.useEffect)(() => {
    loadRulesets();
  }, [loadRulesets]);
  const scoreTabs = [
    {
      id: "rulesets",
      label: "Skin Grading",
      icon: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(import_lucide_react15.Sliders, { className: "h-4 w-4" }),
      badge: rulesets.length
    },
    {
      id: "blending",
      label: "Blending",
      icon: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(import_lucide_react15.SlidersHorizontal, { className: "h-4 w-4" })
    },
    {
      id: "simulator",
      label: "Simulator",
      icon: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(import_lucide_react15.Play, { className: "h-4 w-4" })
    }
  ];
  const handleSaveRuleset = async (rulesetData) => {
    await saveRuleset(rulesetData);
    loadRulesets();
  };
  const handleDeleteRuleset = (id, code) => {
    setDeleteConfirm({
      isOpen: true,
      title: "Delete Skin Grading Framework",
      message: `Are you sure you want to delete skin grading framework "${code}"? This cannot be undone.`,
      onConfirm: async () => {
        setDeleteConfirm((prev) => ({ ...prev, isLoading: true }));
        try {
          await deleteRuleset(id);
          loadRulesets();
        } catch (err) {
          alert(err.message);
        } finally {
          setDeleteConfirm((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        }
      }
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex-1 min-w-0 h-full overflow-y-auto bg-background text-foreground font-sans flex flex-col select-none", children: [
    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
      import_shared16.PageHeader,
      {
        icon: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(import_lucide_react15.FileText, { className: "h-5 w-5" }),
        breadcrumbs: [
          { label: "Workbench", href: "/api-client" },
          { label: "Core Engines" },
          { label: "Score Engine" }
        ],
        title: "Score Engine",
        children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
          import_shared16.TabNav,
          {
            tabs: scoreTabs,
            activeTab,
            onTabChange: (id) => {
              setActiveTab(id);
              setSearchQuery("");
            }
          }
        )
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("main", { className: "flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto", children: [
      activeTab === "rulesets" && /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
        RulesetsTab,
        {
          rulesets,
          searchQuery,
          onSearchChange: setSearchQuery,
          onOpenCreateModal: () => {
            setEditingRuleset(null);
            setIsRulesetModalOpen(true);
          },
          onOpenEditModal: (r) => {
            setEditingRuleset(r);
            setIsRulesetModalOpen(true);
          },
          onSelectSimulatorRuleset: (r) => {
            setSelectedRuleset(r);
            setActiveTab("simulator");
          },
          onDeleteRuleset: handleDeleteRuleset
        }
      ),
      activeTab === "blending" && /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
        BlendingTab,
        {
          rulesets,
          selectedRuleset,
          onSelectRuleset: setSelectedRuleset,
          onSaveRuleset: handleSaveRuleset
        }
      ),
      activeTab === "simulator" && /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
        ScoreSimulatorTab,
        {
          rulesets,
          selectedRuleset,
          onSelectRuleset: setSelectedRuleset
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
      RulesetModal,
      {
        isOpen: isRulesetModalOpen,
        onClose: () => setIsRulesetModalOpen(false),
        onSave: handleSaveRuleset,
        editingRuleset
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
      import_shared16.ConfirmDialog,
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

// src/score/components/reusable/SeverityTierTable.tsx
var import_react16 = require("react");
var import_lucide_react16 = require("lucide-react");
var import_shared17 = require("@gateway-experience/shared");
var import_jsx_runtime19 = require("react/jsx-runtime");
var SEV_LABEL = {
  optimal: "Level 5 \xB7 Healthy",
  mild: "Level 4 \xB7 Mild",
  moderate: "Level 3 \xB7 Moderate",
  severe: "Level 2 \xB7 Poor",
  critical: "Level 1 \xB7 Critical"
};
var fieldCls3 = "h-8 rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring disabled:opacity-50";
var W_RANGE = 160;
var W_SEVERITY = 160;
var W_CODE = 48;
var W_TAG = 112;
var W_DELETE = 28;
var SeverityTierTable = ({
  tiers,
  onChange,
  disabled = false,
  showValueCode = false
}) => {
  const [customize, setCustomize] = (0, import_react16.useState)(false);
  const update = (id, patch) => onChange(tiers.map((t) => t.id === id ? { ...t, ...patch } : t));
  const addLevel = () => {
    const last = tiers[tiers.length - 1];
    onChange([
      ...tiers,
      {
        id: `t_${Date.now()}`,
        minScore: last ? Math.min(100, last.maxScore + 1) : 0,
        maxScore: 100,
        valueCode: "X",
        gradeName: `Level ${tiers.length + 1}`,
        severity: "optimal",
        trait: "Normal"
      }
    ]);
  };
  const rowMinWidth = W_RANGE + 140 + W_SEVERITY + (showValueCode ? W_CODE + 8 : 0) + W_TAG + W_DELETE + 4 * 8;
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "rounded-md border border-border bg-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "flex items-center justify-between px-3 py-2 border-b border-border", children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: "text-[11px] font-semibold text-muted-foreground", children: "Score \u2192 level" }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
        "button",
        {
          type: "button",
          onClick: () => setCustomize((v) => !v),
          className: "text-[11px] text-muted-foreground hover:text-foreground underline",
          children: customize ? "Done" : "Customize levels"
        }
      )
    ] }),
    !customize && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "divide-y divide-border", children: tiers.map((tier) => /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "flex items-center gap-3 px-3 py-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("span", { className: "w-16 shrink-0 text-xs tabular-nums text-muted-foreground", children: [
        tier.minScore,
        "\u2013",
        tier.maxScore
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
        "input",
        {
          type: "text",
          disabled,
          value: tier.gradeName,
          onChange: (e) => update(tier.id, { gradeName: e.target.value }),
          placeholder: "e.g. Balanced",
          className: `flex-1 min-w-0 ${fieldCls3}`
        }
      ),
      showValueCode && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: "w-7 shrink-0 text-center text-xs font-semibold text-beak", children: tier.valueCode }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: "w-36 shrink-0 text-right text-[11px] text-muted-foreground", children: SEV_LABEL[tier.severity] ?? tier.severity })
    ] }, tier.id)) }),
    customize && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "overflow-x-auto", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { style: { minWidth: rowMinWidth }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "flex items-center gap-2 px-3 py-1.5 border-b border-border bg-muted/20 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: "shrink-0", style: { width: W_RANGE }, children: "Range" }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: "flex-1 min-w-0", children: "Label" }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: "shrink-0", style: { width: W_SEVERITY }, children: "Severity" }),
        showValueCode && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: "shrink-0 text-center", style: { width: W_CODE }, children: "Code" }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: "shrink-0", style: { width: W_TAG }, children: "Tag" }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: "shrink-0", style: { width: W_DELETE }, "aria-hidden": "true" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "divide-y divide-border", children: tiers.map((tier) => /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "flex items-center gap-2 px-3 py-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "shrink-0", style: { width: W_RANGE }, children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          import_shared17.ScoreRangeInput,
          {
            minScore: tier.minScore,
            maxScore: tier.maxScore,
            disabled,
            onChange: (min, max) => update(tier.id, { minScore: min, maxScore: max })
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          "input",
          {
            type: "text",
            disabled,
            value: tier.gradeName,
            onChange: (e) => update(tier.id, { gradeName: e.target.value }),
            placeholder: "e.g. Balanced",
            className: `flex-1 min-w-0 ${fieldCls3}`
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "shrink-0", style: { width: W_SEVERITY }, children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          import_shared17.SeveritySelect,
          {
            value: tier.severity,
            disabled,
            onChange: (sev) => update(tier.id, { severity: sev })
          }
        ) }),
        showValueCode && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          "input",
          {
            type: "text",
            disabled,
            value: tier.valueCode,
            onChange: (e) => update(tier.id, { valueCode: e.target.value.toUpperCase().slice(0, 2) }),
            placeholder: "D",
            title: "Short code for this level (Combination Matrix)",
            className: `shrink-0 h-8 rounded-md bg-muted/40 border border-border px-1 text-center text-beak text-xs font-semibold outline-none focus:border-ring disabled:opacity-50`,
            style: { width: W_CODE }
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          "input",
          {
            type: "text",
            disabled,
            value: tier.trait,
            onChange: (e) => update(tier.id, { trait: e.target.value }),
            placeholder: "tag",
            title: "Concern tag surfaced when this level is hit",
            className: `shrink-0 ${fieldCls3}`,
            style: { width: W_TAG }
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          "button",
          {
            type: "button",
            disabled: disabled || tiers.length <= 1,
            onClick: () => tiers.length > 1 && onChange(tiers.filter((t) => t.id !== tier.id)),
            className: "shrink-0 flex h-7 items-center justify-center rounded text-muted-foreground hover:text-destructive disabled:opacity-30",
            style: { width: W_DELETE },
            title: "Remove level",
            children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_lucide_react16.Trash2, { className: "h-3.5 w-3.5" })
          }
        )
      ] }, tier.id)) })
    ] }) }),
    customize && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "px-3 py-2 border-t border-border", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
      "button",
      {
        type: "button",
        disabled,
        onClick: addLevel,
        className: "text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 disabled:opacity-50",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_lucide_react16.Plus, { className: "h-3 w-3" }),
          "Add level"
        ]
      }
    ) })
  ] });
};

// src/match/index.ts
var match_exports = {};
__export(match_exports, {
  MatchManager: () => MatchManager
});

// src/match/components/MatchManager.tsx
var import_react21 = require("react");
var import_lucide_react25 = require("lucide-react");
var import_shared26 = require("@gateway-experience/shared");

// src/match/components/tabs/ConflictMatrixTab.tsx
var import_lucide_react17 = require("lucide-react");
var import_shared18 = require("@gateway-experience/shared");
var import_jsx_runtime20 = require("react/jsx-runtime");
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
  const customFilterContent = /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-3.5", children: [
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center justify-between border-b border-border pb-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "text-xs font-bold text-foreground uppercase tracking-wider", children: "Multi-Tenant Filters" }),
      activeFilterCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("label", { className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react17.Building, { className: "h-3 w-3 text-beak" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { children: "Brand Scope" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
        "select",
        {
          value: selectedBrand,
          onChange: (e) => setSelectedBrand(e.target.value),
          className: "w-full bg-secondary/50 border border-border rounded-lg p-2 text-xs font-bold text-beak focus:border-ring outline-none cursor-pointer",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: "*", className: "bg-popover text-popover-foreground", children: "All Brands (*)" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: "wardah", className: "bg-popover text-popover-foreground", children: "Wardah Beauty" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: "kahf", className: "bg-popover text-popover-foreground", children: "Kahf Men Care" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: "labore", className: "bg-popover text-popover-foreground", children: "Labor\xE9 Sensitive Skin" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: "emina", className: "bg-popover text-popover-foreground", children: "Emina Teen & Young" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("label", { className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react17.Smartphone, { className: "h-3 w-3 text-sky-400" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { children: "Channel / Application" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
        "select",
        {
          value: selectedApp,
          onChange: (e) => setSelectedApp(e.target.value),
          className: "w-full bg-secondary/50 border border-border rounded-lg p-2 text-xs font-bold text-sky-400 focus:border-ring outline-none cursor-pointer",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: "*", className: "bg-popover text-popover-foreground", children: "Omnichannel (*)" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: "ecommerce_mobile", className: "bg-popover text-popover-foreground", children: "Mobile App" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: "store_kiosk", className: "bg-popover text-popover-foreground", children: "Skin Kiosk" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: "web_consult", className: "bg-popover text-popover-foreground", children: "Online Portal" })
          ]
        }
      )
    ] })
  ] });
  const columns = [
    {
      key: "ingredientA",
      header: "Ingredient A",
      render: (c) => /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "font-semibold text-rose-400 flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react17.ShieldAlert, { className: "h-3.5 w-3.5" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { children: c.ingredientA })
      ] })
    },
    {
      key: "ingredientB",
      header: "Ingredient B",
      render: (c) => /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "font-semibold text-rose-300 font-mono", children: c.ingredientB })
    },
    {
      key: "conflictType",
      header: "Conflict Type",
      render: (c) => /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "bg-rose-500/15 text-rose-400 font-mono px-2 py-0.5 rounded text-[10px] uppercase border border-rose-500/30 font-bold", children: c.conflictType })
    },
    {
      key: "resolutionAction",
      header: "Routine Resolution",
      render: (c) => /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "font-mono font-bold text-amber-300 uppercase text-[11px]", children: c.resolutionAction })
    },
    {
      key: "warningMessage",
      header: "Clinical Warning Copy",
      render: (c) => /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "text-muted-foreground text-xs max-w-xs truncate block", title: c.warningMessage, children: c.warningMessage || "-" })
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (c) => /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center justify-end gap-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          import_shared18.Button,
          {
            variant: "ghost",
            size: "icon-xs",
            onClick: () => onOpenEditModal(c),
            title: "Edit Conflict",
            children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react17.Pencil, { className: "h-3.5 w-3.5" })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          import_shared18.Button,
          {
            variant: "ghost",
            size: "icon-xs",
            onClick: () => onDeleteConflict(c.id),
            title: "Delete Conflict",
            className: "hover:text-destructive",
            children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react17.Trash2, { className: "h-3.5 w-3.5" })
          }
        )
      ] })
    }
  ];
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-4", children: [
    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
      import_shared18.SearchFilterBar,
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
    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
      import_shared18.DataTable,
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
var import_lucide_react18 = require("lucide-react");
var import_shared19 = require("@gateway-experience/shared");
var import_jsx_runtime21 = require("react/jsx-runtime");
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
  const customFilterContent = /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: "space-y-3.5", children: [
    /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: "flex items-center justify-between border-b border-border pb-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { className: "text-xs font-bold text-foreground uppercase tracking-wider", children: "Multi-Tenant Filters" }),
      activeFilterCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("label", { className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(import_lucide_react18.Building, { className: "h-3 w-3 text-primary" }),
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { children: "Brand Scope" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)(
        "select",
        {
          value: selectedBrand,
          onChange: (e) => setSelectedBrand(e.target.value),
          className: "w-full bg-secondary/50 border border-border rounded-lg p-2 text-xs font-bold text-primary focus:border-ring outline-none cursor-pointer",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("option", { value: "*", className: "bg-popover text-popover-foreground", children: "All Brands (*)" }),
            /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("option", { value: "wardah", className: "bg-popover text-popover-foreground", children: "Wardah Beauty" }),
            /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("option", { value: "kahf", className: "bg-popover text-popover-foreground", children: "Kahf Men Care" }),
            /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("option", { value: "labore", className: "bg-popover text-popover-foreground", children: "Labor\xE9 Sensitive Skin" }),
            /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("option", { value: "emina", className: "bg-popover text-popover-foreground", children: "Emina Teen & Young" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("label", { className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(import_lucide_react18.Smartphone, { className: "h-3 w-3 text-sky-400" }),
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { children: "Channel / Application" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)(
        "select",
        {
          value: selectedApp,
          onChange: (e) => setSelectedApp(e.target.value),
          className: "w-full bg-secondary/50 border border-border rounded-lg p-2 text-xs font-bold text-sky-400 focus:border-ring outline-none cursor-pointer",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("option", { value: "*", className: "bg-popover text-popover-foreground", children: "Omnichannel (*)" }),
            /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("option", { value: "ecommerce_mobile", className: "bg-popover text-popover-foreground", children: "Mobile App" }),
            /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("option", { value: "store_kiosk", className: "bg-popover text-popover-foreground", children: "Skin Kiosk" }),
            /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("option", { value: "web_consult", className: "bg-popover text-popover-foreground", children: "Online Portal" })
          ]
        }
      )
    ] })
  ] });
  const columns = [
    {
      key: "name",
      header: "Campaign Group",
      render: (g) => /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: "flex flex-col gap-0.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: "font-semibold text-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(import_lucide_react18.Boxes, { className: "h-3.5 w-3.5 text-primary" }),
          /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { children: g.name })
        ] }),
        g.code && /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { className: "text-[10px] font-mono text-muted-foreground", children: g.code })
      ] })
    },
    {
      key: "brandId",
      header: "Brand",
      render: (g) => /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { className: "bg-primary/10 text-primary font-mono px-2 py-0.5 rounded text-[10px] uppercase border border-primary/30 font-bold", children: g.brandId || "*" })
    },
    {
      key: "products",
      header: "Products",
      render: (g) => /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("span", { className: "font-mono text-xs text-muted-foreground", children: [
        g.productIds?.length || 0,
        " product(s)"
      ] })
    },
    {
      key: "categories",
      header: "Categories",
      render: (g) => {
        if (!g.categories || g.categories.length === 0) {
          return /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { className: "text-muted-foreground text-xs", children: "\u2014" });
        }
        return /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("div", { className: "flex flex-wrap items-center gap-1 max-w-xs", children: g.categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
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
      render: (g) => g.isActive ? /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("span", { className: "flex items-center gap-1 text-emerald-400 text-[11px] font-semibold", children: [
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(import_lucide_react18.CheckCircle2, { className: "h-3.5 w-3.5" }),
        " Active"
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("span", { className: "flex items-center gap-1 text-muted-foreground text-[11px] font-semibold", children: [
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(import_lucide_react18.XCircle, { className: "h-3.5 w-3.5" }),
        " Inactive"
      ] })
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (g) => /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: "flex items-center justify-end gap-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
          import_shared19.Button,
          {
            variant: "ghost",
            size: "icon-xs",
            onClick: () => onOpenEditModal(g),
            title: "Edit Product Group",
            children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(import_lucide_react18.Pencil, { className: "h-3.5 w-3.5" })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
          import_shared19.Button,
          {
            variant: "ghost",
            size: "icon-xs",
            onClick: () => onDeleteGroup(g.id),
            title: "Delete Product Group",
            className: "hover:text-destructive",
            children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(import_lucide_react18.Trash2, { className: "h-3.5 w-3.5" })
          }
        )
      ] })
    }
  ];
  return /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: "space-y-4", children: [
    /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
      import_shared19.SearchFilterBar,
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
    /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
      import_shared19.DataTable,
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
var import_lucide_react19 = require("lucide-react");
var import_shared20 = require("@gateway-experience/shared");
var import_jsx_runtime22 = require("react/jsx-runtime");
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
      render: (s) => /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("span", { className: "h-4 w-4 rounded-full border border-white/10 shrink-0", style: { backgroundColor: s.hexColor } }),
        /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("span", { className: "font-semibold text-foreground", children: s.name }),
          /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("span", { className: "text-[10px] font-mono text-muted-foreground", children: s.hexColor })
        ] })
      ] })
    },
    {
      key: "region",
      header: "Applies To",
      render: (s) => /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("span", { className: "font-mono text-[10px] uppercase text-muted-foreground", children: s.region })
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (s) => /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("div", { className: "flex items-center justify-end gap-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(import_shared20.Button, { variant: "ghost", size: "icon-xs", onClick: () => onOpenEditModal(s), title: "Edit Shade", children: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(import_lucide_react19.Pencil, { className: "h-3.5 w-3.5" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(import_shared20.Button, { variant: "ghost", size: "icon-xs", onClick: () => onDeleteShade(s.id), title: "Delete Shade", className: "hover:text-destructive", children: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(import_lucide_react19.Trash2, { className: "h-3.5 w-3.5" }) })
      ] })
    }
  ];
  return /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("div", { className: "space-y-4", children: [
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
      import_shared20.SearchFilterBar,
      {
        searchQuery,
        onSearchChange,
        searchPlaceholder: "Search shades by name or hex color...",
        actionLabel: "New Shade",
        onAction: onOpenAddModal
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(import_shared20.DataTable, { columns, data: filtered, keyExtractor: (s) => s.id, emptyMessage: "No shades defined for this product yet." })
  ] });
};

// src/match/components/tabs/MatchSimulatorTab.tsx
var import_lucide_react20 = require("lucide-react");
var import_shared21 = require("@gateway-experience/shared");
var import_jsx_runtime23 = require("react/jsx-runtime");
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
      return /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react20.Sun, { className: "h-4 w-4 text-amber-400" });
    }
    if (lower.includes("night") || lower.includes("pm") || lower.includes("evening") || lower.includes("restoration")) {
      return /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react20.Moon, { className: "h-4 w-4 text-sky-400" });
    }
    if (lower.includes("prep") || lower.includes("base") || lower.includes("complexion") || lower.includes("makeup")) {
      return /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react20.Sparkles, { className: "h-4 w-4 text-purple-400" });
    }
    if (lower.includes("shave") || lower.includes("grooming")) {
      return /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react20.Layers, { className: "h-4 w-4 text-teal-400" });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react20.Zap, { className: "h-4 w-4 text-emerald-400" });
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
  return /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6", children: [
    /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("div", { className: "lg:col-span-4 space-y-4", children: /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "bg-card border border-border rounded-lg p-5 space-y-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "flex items-center justify-between border-b border-border pb-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("h3", { className: "font-bold text-foreground text-sm", children: "Consumer Clinical Profile" }),
        /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: "text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded font-mono font-bold", children: "2-Tier Engine" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "space-y-3 text-xs", children: [
        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "space-y-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("label", { className: "text-muted-foreground", children: "Brand Scoping & Routine Paradigm:" }),
          /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(
            "select",
            {
              value: simBrand,
              onChange: (e) => setSimBrand(e.target.value),
              className: "w-full bg-muted/40 border border-border rounded px-3 py-2 text-foreground",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("option", { value: "*", children: "All Brands (*)" }),
                /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("option", { value: "wardah", children: "Wardah Beauty (Clinical AM/PM)" }),
                /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("option", { value: "makeover", children: "Make Over (Skin Prep & Complexion)" }),
                /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("option", { value: "kahf", children: "Kahf Men Care (Daily & Post-Shave)" }),
                /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("option", { value: "biodef", children: "Biodef (Hygiene & Barrier)" }),
                /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("option", { value: "labore", children: "Labor\xE9 Sensitive Skin" }),
                /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("option", { value: "emina", children: "Emina Teen & Young" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "space-y-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("label", { className: "text-muted-foreground", children: "Skin Profile (Phenotype):" }),
          /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(
            "select",
            {
              value: simSkinType,
              onChange: (e) => setSimSkinType(e.target.value),
              className: "w-full bg-muted/40 border border-border rounded px-3 py-2 text-foreground font-mono",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("option", { value: "OSPT", children: "OSPT (Oily, Sensitive, Pigmented, Tight)" }),
                /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("option", { value: "OSPW", children: "OSPW (Oily, Sensitive, Pigmented, Wrinkled)" }),
                /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("option", { value: "DRNT", children: "DRNT (Dry, Resistant, Non-Pigmented, Tight)" }),
                /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("option", { value: "DSPT", children: "DSPT (Dry, Sensitive, Pigmented, Tight)" }),
                /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("option", { value: "ORNT", children: "ORNT (Oily, Resistant, Non-Pigmented, Tight)" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "space-y-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "flex justify-between text-muted-foreground", children: [
            /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { children: "Sebum Dimension:" }),
            /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { className: "font-mono text-foreground font-bold", children: [
              simSebum,
              " pts"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "space-y-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "flex justify-between text-muted-foreground", children: [
            /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { children: "Hydration Level:" }),
            /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { className: "font-mono text-foreground font-bold", children: [
              simHydration,
              " pts"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "space-y-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "flex justify-between text-muted-foreground", children: [
            /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { children: "Sensitivity Level:" }),
            /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { className: "font-mono text-foreground font-bold", children: [
              simSensitivity,
              " pts"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "pt-2 border-t border-border space-y-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("label", { className: "text-muted-foreground font-bold block", children: "Safety Gatekeeper Flags:" }),
          /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("label", { className: "flex items-center gap-2 p-2 bg-muted/40 border border-border rounded cursor-pointer", children: [
            /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
              "input",
              {
                type: "checkbox",
                checked: simPregnant,
                onChange: (e) => setSimPregnant(e.target.checked),
                className: "accent-rose-400 rounded"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: "text-foreground", children: "Is Pregnant / Nursing Consumer (Zero Retinoids)" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("label", { className: "flex items-center gap-2 p-2 bg-muted/40 border border-border rounded cursor-pointer", children: [
            /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
              "input",
              {
                type: "checkbox",
                checked: simRetinol,
                onChange: (e) => setSimRetinol(e.target.checked),
                className: "accent-amber-400 rounded"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: "text-foreground", children: "Active Retinol / Direct Acid User" })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(
          "button",
          {
            onClick: onRunSimulator,
            disabled: isSimulating,
            className: "w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 mt-4 cursor-pointer disabled:opacity-50",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react20.Play, { className: "h-4 w-4 fill-black" }),
              /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { children: isSimulating ? "Evaluating 2-Tier Rules..." : "Run Regimen Matching" })
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("div", { className: "lg:col-span-8 space-y-6", children: simResult ? /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(import_jsx_runtime23.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "bg-card border border-border rounded-lg p-5 flex items-center justify-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-xs font-mono font-bold px-2 py-0.5 rounded", children: simResult.profileSummary.skinType }),
            /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("h3", { className: "font-bold text-foreground text-base", children: "Personalized Prescription" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("div", { className: "flex flex-wrap gap-2 mt-2", children: simResult.profileSummary.primaryConcerns.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: "text-[10px] bg-muted text-foreground px-2 py-0.5 rounded border border-border", children: c }, i)) })
        ] }),
        typeof simResult.profileSummary.overallSuitabilityScore === "number" && /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "text-right", children: [
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: "text-[10px] text-muted-foreground font-bold uppercase tracking-wider block", children: "Clinical Match" }),
          /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { className: "text-3xl font-black text-emerald-400 font-mono", children: [
            simResult.profileSummary.overallSuitabilityScore,
            "%"
          ] })
        ] })
      ] }),
      simResult.clinicalConflictMatrix.layeringRulesApplied.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "bg-amber-950/20 border border-amber-800/40 rounded-lg p-4 space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "flex items-center gap-2 text-amber-400 font-bold text-xs", children: [
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react20.AlertTriangle, { className: "h-4 w-4" }),
          /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { children: [
            "Clinical Conflict Matrix Directives (",
            simResult.clinicalConflictMatrix.conflictsDetected,
            " detected)"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("ul", { className: "space-y-1 text-xs text-amber-200/90 pl-6 list-disc", children: simResult.clinicalConflictMatrix.layeringRulesApplied.map((rule, idx) => /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("li", { children: rule }, idx)) })
      ] }),
      routinePhases.map((phase) => /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "space-y-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("h4", { className: "font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-2", children: [
          getPhaseIcon(phase.key),
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { children: phase.title })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("div", { className: "space-y-2", children: phase.steps.map((step) => /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "bg-card border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "space-y-1.5 flex-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: "w-5 h-5 rounded-full bg-muted text-amber-300 text-[10px] font-bold flex items-center justify-center font-mono shrink-0", children: step.stepNumber }),
              /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: "font-bold text-foreground text-sm", children: step.primaryProduct.name }),
              /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: "bg-muted text-amber-400 text-[10px] px-1.5 py-0.5 rounded font-medium border border-border", children: step.primaryProduct.brand })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "text-xs text-muted-foreground flex items-center gap-3 pl-7", children: [
              /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { children: [
                "Category: ",
                /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("strong", { className: "text-foreground", children: step.category })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { children: [
                "Texture: ",
                /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("strong", { className: "text-foreground", children: step.recommendedTexture || step.primaryProduct.texture })
              ] })
            ] }),
            step.primaryProduct.whySelected && step.primaryProduct.whySelected.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("div", { className: "pl-7 flex flex-wrap gap-1.5 pt-1", children: step.primaryProduct.whySelected.map((reason, rIdx) => /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { className: "text-[10px] bg-emerald-950/40 text-emerald-300 border border-emerald-800/30 px-2 py-0.5 rounded flex items-center gap-1", children: [
              /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react20.Tag, { className: "h-2.5 w-2.5" }),
              reason
            ] }, rIdx)) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "text-right shrink-0 sm:pl-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-border", children: [
            /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "font-mono text-emerald-400 font-bold text-sm", children: [
              step.primaryProduct.matchScore,
              " pts"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { className: "text-[10px] text-emerald-400 flex items-center justify-end gap-1", children: [
              /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react20.ShieldCheck, { className: "h-3 w-3" }),
              " Zero Contraindications"
            ] })
          ] })
        ] }, step.stepNumber)) })
      ] }, phase.key))
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
      import_shared21.EmptyState,
      {
        icon: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react20.Sparkles, { className: "h-6 w-6 text-emerald-400" }),
        title: "Regimen Matching Standby",
        description: "Adjust clinical scores & safety flags on the left, then click 'Run Regimen Matching' to simulate prescription routine.",
        className: "py-16"
      }
    ) })
  ] });
};

// src/match/components/tabs/PhotoTryOnTab.tsx
var import_react17 = require("react");
var import_lucide_react21 = require("lucide-react");
var import_shared22 = require("@gateway-experience/shared");

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

// src/match/api.ts
var ep = (path) => resolveDynamicEndpoint("match", path);
async function list(path, field2, doFetch) {
  const data = await (await doFetch(path)).json();
  return Array.isArray(data[field2]) ? data[field2] : null;
}
var sendJson = (doFetch, url, method, body) => doFetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
function resource(path, field2) {
  return {
    list: (doFetch = fetch) => list(ep(withTenantScope(path)), field2, doFetch),
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
var import_jsx_runtime24 = require("react/jsx-runtime");
var errorMessage = (e) => e instanceof Error && e.message ? e.message : String(e);
function useObjectUrl(blob) {
  const [url, setUrl] = (0, import_react17.useState)(null);
  (0, import_react17.useEffect)(() => {
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
  const [catalog, setCatalog] = (0, import_react17.useState)(null);
  const [catalogLoading, setCatalogLoading] = (0, import_react17.useState)(true);
  const [catalogError, setCatalogError] = (0, import_react17.useState)(null);
  const [photo, setPhoto] = (0, import_react17.useState)(null);
  const [selected, setSelected] = (0, import_react17.useState)({});
  const [result, setResult] = (0, import_react17.useState)(null);
  const [rendering, setRendering] = (0, import_react17.useState)(false);
  const [renderError, setRenderError] = (0, import_react17.useState)(null);
  const requestId = (0, import_react17.useRef)(0);
  const photoUrl = useObjectUrl(photo);
  const resultUrl = useObjectUrl(result);
  const loadCatalog = (0, import_react17.useCallback)(() => {
    setCatalogLoading(true);
    setCatalogError(null);
    fetchColourCatalog().then(setCatalog).catch((e) => setCatalogError(errorMessage(e))).finally(() => setCatalogLoading(false));
  }, []);
  (0, import_react17.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4 sm:gap-6", children: [
    /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("div", { className: "space-y-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("div", { className: "bg-card border border-border rounded-xl p-4 space-y-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("h3", { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground", children: "1. Face photo" }),
        /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("label", { className: "flex items-center gap-1.5 px-3 py-2 rounded border border-border bg-secondary/40 hover:border-primary/60 text-xs font-semibold cursor-pointer", children: [
            /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(import_lucide_react21.ImagePlus, { className: "h-3.5 w-3.5" }),
            /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("span", { children: photo ? "Change photo" : "Choose photo" }),
            /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(
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
          photo && /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)(import_jsx_runtime24.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("span", { className: "text-[11px] text-muted-foreground truncate max-w-[180px]", title: photo.name, children: photo.name }),
            /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(import_shared22.Button, { variant: "ghost", size: "icon-xs", onClick: () => choosePhoto(null), title: "Remove photo", children: /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(import_lucide_react21.X, { className: "h-3.5 w-3.5" }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("div", { className: "bg-card border border-border rounded-xl p-4 space-y-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("h3", { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground", children: "2. Shades (one per category)" }),
          shadeIds.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(
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
        catalogLoading && /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("p", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(import_lucide_react21.Loader2, { className: "h-3.5 w-3.5 animate-spin" }),
          " Loading the try-on catalog..."
        ] }),
        !catalogLoading && catalogError && /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("div", { className: "flex items-start justify-between gap-2 rounded border border-destructive/40 bg-destructive/10 px-3 py-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("p", { className: "text-xs text-destructive", children: [
            "Could not load the catalog: ",
            catalogError
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(import_shared22.Button, { variant: "ghost", size: "icon-xs", onClick: loadCatalog, title: "Retry", children: /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(import_lucide_react21.RefreshCw, { className: "h-3.5 w-3.5" }) })
        ] }),
        !catalogLoading && !catalogError && categories.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("p", { className: "text-xs text-muted-foreground", children: "The colour engine's catalog has no shades to try." }),
        categories.map(([category, shades]) => /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("p", { className: "text-[11px] font-semibold capitalize text-foreground", children: category }),
          /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("div", { className: "flex flex-wrap gap-2", children: shades.map((s) => {
            const isSelected = selected[category] === s.shadeId;
            return /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)(
              "button",
              {
                type: "button",
                "aria-pressed": isSelected,
                onClick: () => toggleShade(category, s.shadeId),
                title: `${s.productName} \u2014 ${s.shadeName} (${s.hexColor})`,
                className: `flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer ${isSelected ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/60"}`,
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("span", { className: "h-4 w-4 rounded-full border border-black/10 shrink-0", style: { backgroundColor: s.hexColor } }),
                  /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("span", { children: s.shadeName })
                ]
              },
              s.shadeId
            );
          }) })
        ] }, category))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)(import_shared22.Button, { onClick: render, disabled: !photo || shadeIds.length === 0 || rendering, className: "w-full", children: [
        rendering ? /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(import_lucide_react21.Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(import_lucide_react21.Wand2, { className: "h-4 w-4" }),
        /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("span", { children: rendering ? "Rendering..." : "Render try-on" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("div", { className: "bg-card border border-border rounded-xl p-4 space-y-3", children: !photoUrl ? /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(
      import_shared22.EmptyState,
      {
        icon: /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(import_lucide_react21.ImagePlus, { className: "h-6 w-6" }),
        title: "No photo yet",
        description: "Choose a face photo and the shades to try; the colour engine renders the look onto it."
      }
    ) : /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("figure", { className: "space-y-1.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("figcaption", { className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Before" }),
        /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("img", { src: photoUrl, alt: "Original photo", className: "w-full rounded-lg border border-border object-contain bg-black/40" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("figure", { className: "space-y-1.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("figcaption", { className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "After" }),
        resultUrl ? /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("img", { src: resultUrl, alt: "Photo with the selected shades rendered", className: "w-full rounded-lg border border-border object-contain bg-black/40" }) : /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("div", { className: "flex aspect-[3/4] items-center justify-center rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground", children: rendering ? /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(import_lucide_react21.Loader2, { className: "h-4 w-4 animate-spin" }),
          " Rendering..."
        ] }) : renderError ? /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("span", { className: "flex flex-col items-center gap-1.5 text-destructive", children: [
          /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(import_lucide_react21.AlertTriangle, { className: "h-4 w-4" }),
          /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("span", { children: [
            "Try-on failed: ",
            renderError
          ] })
        ] }) : shadeIds.length === 0 ? "Pick at least one shade." : 'Press "Render try-on".' })
      ] })
    ] }) })
  ] });
};

// src/match/components/modals/ConflictRuleModal.tsx
var import_react18 = require("react");
var import_lucide_react22 = require("lucide-react");
var import_shared23 = require("@gateway-experience/shared");
var import_jsx_runtime25 = require("react/jsx-runtime");
var ConflictRuleModal = ({
  isOpen,
  onClose,
  onSave,
  editingConflict
}) => {
  const hostRoutes = (0, import_shared23.useHostRoutes)();
  const [confA, setConfA] = (0, import_react18.useState)("");
  const [confB, setConfB] = (0, import_react18.useState)("");
  const [confType, setConfType] = (0, import_react18.useState)("over_exfoliation");
  const [confAction, setConfAction] = (0, import_react18.useState)("split_am_pm");
  const [confWarning, setConfWarning] = (0, import_react18.useState)("");
  const [isSubmitting, setIsSubmitting] = (0, import_react18.useState)(false);
  const [ingredients, setIngredients] = (0, import_react18.useState)([]);
  (0, import_react18.useEffect)(() => {
    listReferenceIngredients(hostRoutes).then((list2) => {
      if (list2.length > 0) setIngredients(list2);
    }).catch(() => {
    });
  }, [isOpen, hostRoutes]);
  (0, import_react18.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
    import_shared23.Modal,
    {
      isOpen,
      onClose,
      size: "md",
      icon: /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(import_lucide_react22.ShieldAlert, { className: "h-4 w-4 text-rose-400" }),
      title: editingConflict ? "Edit Conflict Rule" : "New Ingredient Conflict",
      isLoading: isSubmitting,
      loadingText: isSubmitting ? editingConflict ? "Updating Conflict Rule..." : "Saving Conflict Rule..." : void 0,
      children: /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-4 text-xs", children: [
        /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "space-y-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("label", { className: "text-muted-foreground", children: "Primary Ingredient (A):" }),
            /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
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
          /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "space-y-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("label", { className: "text-muted-foreground", children: "Conflicting Ingredient (B):" }),
            /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
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
          /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("datalist", { id: "conflict-ing-list", children: ingredients.map((ing) => /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("option", { value: ing.name }, ing.code)) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "space-y-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("label", { className: "text-muted-foreground", children: "Conflict Type:" }),
            /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)(
              "select",
              {
                value: confType,
                onChange: (e) => setConfType(e.target.value),
                className: "w-full bg-muted/40 border border-border rounded px-3 py-2 text-foreground font-mono",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("option", { value: "incompatible", children: "Strictly Incompatible" }),
                  /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("option", { value: "over_exfoliation", children: "Over-exfoliation Risk" }),
                  /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("option", { value: "pH_clash", children: "pH Neutralization Clash" }),
                  /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("option", { value: "barrier_irritation", children: "Barrier Irritation Risk" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "space-y-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("label", { className: "text-muted-foreground", children: "Resolution Protocol:" }),
            /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)(
              "select",
              {
                value: confAction,
                onChange: (e) => setConfAction(e.target.value),
                className: "w-full bg-muted/40 border border-border rounded px-3 py-2 text-foreground font-mono",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("option", { value: "split_am_pm", children: "Split Routine (AM vs PM)" }),
                  /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("option", { value: "alternate_days", children: "Alternate Use Days" }),
                  /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("option", { value: "strict_block", children: "Strict Product Exclusion" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "space-y-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("label", { className: "text-muted-foreground", children: "Clinical Warning Message:" }),
          /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("div", { className: "flex justify-end pt-2", children: /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)(
          "button",
          {
            type: "submit",
            disabled: isSubmitting,
            className: "px-4 py-2 bg-rose-600 hover:bg-rose-500 text-foreground font-bold rounded disabled:opacity-50 cursor-pointer flex items-center gap-1.5",
            children: [
              isSubmitting ? /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(import_lucide_react22.Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : null,
              /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("span", { children: isSubmitting ? editingConflict ? "Updating..." : "Saving..." : editingConflict ? "Update Rule" : "Save Rule" })
            ]
          }
        ) })
      ] })
    }
  );
};

// src/match/components/modals/ProductGroupModal.tsx
var import_react19 = require("react");
var import_lucide_react23 = require("lucide-react");
var import_shared24 = require("@gateway-experience/shared");
var import_jsx_runtime26 = require("react/jsx-runtime");
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
  const [brandId, setBrandId] = (0, import_react19.useState)(defaultBrand && defaultBrand !== "*" ? defaultBrand : "wardah");
  const [applicationId, setApplicationId] = (0, import_react19.useState)("*");
  const [name, setName] = (0, import_react19.useState)("");
  const [code, setCode] = (0, import_react19.useState)("");
  const [description, setDescription] = (0, import_react19.useState)("");
  const [productIds, setProductIds] = (0, import_react19.useState)([]);
  const [categories, setCategories] = (0, import_react19.useState)([]);
  const [categoryDraft, setCategoryDraft] = (0, import_react19.useState)("");
  const [isActive, setIsActive] = (0, import_react19.useState)(true);
  const [isSubmitting, setIsSubmitting] = (0, import_react19.useState)(false);
  const [products, setProducts] = (0, import_react19.useState)([]);
  (0, import_react19.useEffect)(() => {
    if (!isOpen) return;
    productsApi.listForBrand(brandId).then((list2) => {
      if (list2) setProducts(list2);
    }).catch(() => {
    });
  }, [isOpen, brandId]);
  (0, import_react19.useEffect)(() => {
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
  const productOptions = (0, import_react19.useMemo)(
    () => products.map((p) => ({ value: p.id, label: p.name, description: p.category })),
    [products]
  );
  const availableCategories = (0, import_react19.useMemo)(
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
  return /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
    import_shared24.Modal,
    {
      isOpen,
      onClose,
      size: "lg",
      icon: /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(import_lucide_react23.Boxes, { className: "h-4 w-4 text-primary" }),
      title: editingGroup ? "Edit Product Group" : "New Product Group",
      isLoading: isSubmitting,
      loadingText: isSubmitting ? editingGroup ? "Updating Product Group..." : "Saving Product Group..." : void 0,
      children: /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-4 text-xs", children: [
        /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("div", { className: "space-y-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("label", { className: "text-[#888888]", children: "Brand:" }),
            /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
              "select",
              {
                value: brandId,
                onChange: (e) => setBrandId(e.target.value),
                disabled: !!editingGroup,
                className: "w-full bg-[#161616] border border-[#333333] rounded px-3 py-2 text-white font-mono disabled:opacity-60",
                children: BRAND_OPTIONS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("option", { value: b.value, children: b.label }, b.value))
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("div", { className: "space-y-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("label", { className: "text-[#888888]", children: "Group Name:" }),
            /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("div", { className: "space-y-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("label", { className: "text-[#888888]", children: "Group Code:" }),
            /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
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
          /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("div", { className: "space-y-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("label", { className: "text-[#888888] flex items-center justify-between", children: /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("span", { children: "Status:" }) }),
            /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("label", { className: "flex items-center gap-2 bg-[#161616] border border-[#333333] rounded px-3 py-2 cursor-pointer", children: [
              /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
                "input",
                {
                  type: "checkbox",
                  checked: isActive,
                  onChange: (e) => setIsActive(e.target.checked),
                  className: "accent-primary"
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("span", { className: "text-white", children: "Active in matching engine" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("div", { className: "space-y-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("label", { className: "text-[#888888]", children: "Campaign Description:" }),
          /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("div", { className: "space-y-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("label", { className: "text-[#888888]", children: "Products in Group:" }),
          /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
            import_shared24.SearchableSelect,
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
        /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("div", { className: "space-y-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("label", { className: "text-[#888888]", children: "Categories in Group:" }),
            /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(import_shared24.InfoTooltip, { content: "Every product in each listed category is included in the group.", label: "About Categories in Group" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("div", { className: "flex flex-wrap items-center gap-1.5 mb-1.5", children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)(
            "span",
            {
              className: "flex items-center gap-1 bg-amber-500/15 text-amber-400 font-mono px-2 py-0.5 rounded text-[10px] uppercase border border-amber-500/30 font-bold",
              children: [
                c,
                /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
                  "button",
                  {
                    type: "button",
                    onClick: () => setCategories((prev) => prev.filter((x) => x !== c)),
                    className: "hover:text-white cursor-pointer",
                    children: /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(import_lucide_react23.X, { className: "h-3 w-3" })
                  }
                )
              ]
            },
            c
          )) }),
          /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
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
          /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("datalist", { id: "product-group-category-list", children: availableCategories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("option", { value: c }, c)) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("div", { className: "flex justify-end pt-2", children: /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)(
          "button",
          {
            type: "submit",
            disabled: isSubmitting,
            className: "px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground font-bold rounded disabled:opacity-50 cursor-pointer flex items-center gap-1.5",
            children: [
              isSubmitting ? /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(import_lucide_react23.Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : null,
              /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("span", { children: isSubmitting ? editingGroup ? "Updating..." : "Saving..." : editingGroup ? "Update Group" : "Save Group" })
            ]
          }
        ) })
      ] })
    }
  );
};

// src/match/components/modals/ShadeModal.tsx
var import_react20 = require("react");
var import_lucide_react24 = require("lucide-react");
var import_shared25 = require("@gateway-experience/shared");
var import_jsx_runtime27 = require("react/jsx-runtime");
var ShadeModal = ({ isOpen, onClose, onSave, editingShade, productId }) => {
  const [name, setName] = (0, import_react20.useState)("");
  const [hexColor, setHexColor] = (0, import_react20.useState)("#C41E3A");
  const [region, setRegion] = (0, import_react20.useState)("lip");
  const [isSubmitting, setIsSubmitting] = (0, import_react20.useState)(false);
  (0, import_react20.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(
    import_shared25.Modal,
    {
      isOpen,
      onClose,
      size: "md",
      icon: /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(import_lucide_react24.Palette, { className: "h-4 w-4 text-primary" }),
      title: editingShade ? "Edit Shade" : "New Shade",
      isLoading: isSubmitting,
      loadingText: isSubmitting ? editingShade ? "Updating Shade..." : "Saving Shade..." : void 0,
      children: /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-4 text-xs", children: [
        /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("div", { className: "space-y-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("label", { className: "text-[#888888]", children: "Shade Name:" }),
            /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(
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
          /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("div", { className: "space-y-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("label", { className: "text-[#888888]", children: "Exact Color:" }),
            /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(
                "input",
                {
                  type: "color",
                  value: hexColor,
                  onChange: (e) => setHexColor(e.target.value),
                  className: "h-9 w-9 rounded border border-[#333333] bg-transparent cursor-pointer"
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("div", { className: "space-y-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("label", { className: "text-[#888888]", children: "Applies To:" }),
          /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)(
            "select",
            {
              value: region,
              onChange: (e) => setRegion(e.target.value),
              className: "w-full bg-[#161616] border border-[#333333] rounded px-3 py-2 text-white font-mono",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("option", { value: "lip", children: "Lips" }),
                /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("option", { value: "eye", children: "Eyes" }),
                /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("option", { value: "cheek", children: "Cheeks" }),
                /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("option", { value: "skin", children: "Skin / Foundation" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("div", { className: "flex justify-end pt-2", children: /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)(
          "button",
          {
            type: "submit",
            disabled: isSubmitting,
            className: "px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground font-bold rounded disabled:opacity-50 cursor-pointer flex items-center gap-1.5",
            children: [
              isSubmitting ? /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(import_lucide_react24.Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : null,
              /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("span", { children: isSubmitting ? editingShade ? "Updating..." : "Saving..." : editingShade ? "Update Shade" : "Save Shade" })
            ]
          }
        ) })
      ] })
    }
  );
};

// src/match/components/MatchManager.tsx
var import_jsx_runtime28 = require("react/jsx-runtime");
var MatchManager = () => {
  const [activeTab, setActiveTab] = (0, import_shared26.usePersistentState)("xg.matchEngine.activeTab", "conflicts");
  const [searchQuery, setSearchQuery] = (0, import_react21.useState)("");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = (0, import_react21.useState)(false);
  const [activeFilters, setActiveFilters] = (0, import_react21.useState)({});
  const [deleteConfirm, setDeleteConfirm] = (0, import_react21.useState)({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {
    }
  });
  const [selectedBrand, setSelectedBrand] = (0, import_shared26.usePersistentState)("xg.matchEngine.brand", "*");
  const [selectedApp, setSelectedApp] = (0, import_shared26.usePersistentState)("xg.matchEngine.application", "*");
  const [conflicts, setConflicts] = (0, import_react21.useState)([]);
  const [productGroups, setProductGroups] = (0, import_react21.useState)([]);
  const [products, setProducts] = (0, import_react21.useState)([]);
  const [shades, setShades] = (0, import_react21.useState)([]);
  const [shadeProductId, setShadeProductId] = (0, import_react21.useState)("");
  const [isConflictModalOpen, setIsConflictModalOpen] = (0, import_react21.useState)(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = (0, import_react21.useState)(false);
  const [isShadeModalOpen, setIsShadeModalOpen] = (0, import_react21.useState)(false);
  const [editingConflict, setEditingConflict] = (0, import_react21.useState)(null);
  const [editingGroup, setEditingGroup] = (0, import_react21.useState)(null);
  const [editingShade, setEditingShade] = (0, import_react21.useState)(null);
  const [simBrand, setSimBrand] = (0, import_shared26.usePersistentState)("xg.matchEngine.simulator.brand", "*");
  const [simSkinType, setSimSkinType] = (0, import_shared26.usePersistentState)("xg.matchEngine.simulator.skinType", "OSPT");
  const [simSebum, setSimSebum] = (0, import_shared26.usePersistentState)("xg.matchEngine.simulator.sebum", 75);
  const [simHydration, setSimHydration] = (0, import_shared26.usePersistentState)("xg.matchEngine.simulator.hydration", 40);
  const [simSensitivity, setSimSensitivity] = (0, import_shared26.usePersistentState)("xg.matchEngine.simulator.sensitivity", 65);
  const [simPregnant, setSimPregnant] = (0, import_shared26.usePersistentState)("xg.matchEngine.simulator.pregnant", false);
  const [simRetinol, setSimRetinol] = (0, import_shared26.usePersistentState)("xg.matchEngine.simulator.retinol", true);
  const [isSimulating, setIsSimulating] = (0, import_react21.useState)(false);
  const [simResult, setSimResult] = (0, import_shared26.usePersistentState)("xg.matchEngine.simulator.result", null);
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
  (0, import_react21.useEffect)(() => {
    loadData();
  }, []);
  (0, import_react21.useEffect)(() => {
    loadShades(shadeProductId);
  }, [shadeProductId]);
  const matchTabs = [
    { id: "conflicts", label: "Contraindication Matrix", icon: /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(import_lucide_react25.ShieldAlert, { className: "h-4 w-4 text-rose-400" }), badge: conflicts.length },
    { id: "groups", label: "Product Groups", icon: /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(import_lucide_react25.Boxes, { className: "h-4 w-4 text-amber-400" }), badge: productGroups.length },
    { id: "shades", label: "Shades", icon: /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(import_lucide_react25.Palette, { className: "h-4 w-4 text-rose-400" }), badge: shades.length },
    { id: "tryon", label: "Photo Try-On", icon: /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(import_lucide_react25.Wand2, { className: "h-4 w-4 text-purple-400" }) },
    { id: "simulator", label: "Match Simulator", icon: /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(import_lucide_react25.Play, { className: "h-4 w-4 text-emerald-400" }) }
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
  return /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("div", { className: "flex-1 min-w-0 h-full overflow-y-auto bg-background text-foreground font-sans flex flex-col select-none", children: [
    /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(
      import_shared26.PageHeader,
      {
        icon: /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(import_lucide_react25.Sparkles, { className: "h-5 w-5 text-beak" }),
        breadcrumbs: [
          { label: "Workbench", href: "/" },
          { label: "Core Engines" },
          { label: "Match Engine" }
        ],
        title: "Clinical Product Matcher & Routine Generator",
        children: /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(
          import_shared26.TabNav,
          {
            tabs: matchTabs,
            activeTab,
            onTabChange: (id) => setActiveTab(id)
          }
        )
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("main", { className: "flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto", children: [
      activeTab === "conflicts" && /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(
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
      activeTab === "groups" && /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(
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
      activeTab === "shades" && /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("div", { className: "space-y-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("div", { className: "flex items-center gap-2 bg-secondary/40 border border-border rounded-lg px-3 py-2 w-fit", children: [
          /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("label", { className: "text-xs font-semibold text-muted-foreground", children: "Product:" }),
          /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)(
            "select",
            {
              value: shadeProductId,
              onChange: (e) => setShadeProductId(e.target.value),
              className: "bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer",
              children: [
                products.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("option", { value: "", children: "No products found" }),
                products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("option", { value: p.id, children: p.name }, p.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(
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
      activeTab === "tryon" && /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(PhotoTryOnTab, {}),
      activeTab === "simulator" && /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(
      ConflictRuleModal,
      {
        isOpen: isConflictModalOpen,
        onClose: () => setIsConflictModalOpen(false),
        onSave: handleSaveConflict,
        editingConflict
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(
      ProductGroupModal,
      {
        isOpen: isGroupModalOpen,
        onClose: () => setIsGroupModalOpen(false),
        onSave: handleSaveGroup,
        editingGroup,
        defaultBrand: selectedBrand
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(
      ShadeModal,
      {
        isOpen: isShadeModalOpen,
        onClose: () => setIsShadeModalOpen(false),
        onSave: handleSaveShade,
        editingShade,
        productId: shadeProductId
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(
      import_shared26.ConfirmDialog,
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FormManager,
  FormStudio,
  MatchManager,
  MatchStudio,
  ReferenceManager,
  ReferenceStudio,
  ScoreManager,
  ScoreStudio
});
//# sourceMappingURL=index.js.map