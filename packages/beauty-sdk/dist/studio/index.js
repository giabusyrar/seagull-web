'use strict';

var React9 = require('react');
var lucideReact = require('lucide-react');
var shared = require('@gateway-experience/shared');
var jsxRuntime = require('react/jsx-runtime');
var surveyCore = require('survey-core');
var surveyReactUi = require('survey-react-ui');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React9__default = /*#__PURE__*/_interopDefault(React9);

var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/studio/reference/index.ts
var reference_exports = {};
__export(reference_exports, {
  REFERENCE_ENTITY_CONFIGS: () => REFERENCE_ENTITY_CONFIGS,
  ReferenceEntityDashboard: () => ReferenceEntityDashboard,
  ReferenceFormModal: () => ReferenceFormModal,
  ReferenceManager: () => ReferenceManager,
  ReferenceTable: () => ReferenceTable,
  SearchFilterBar: () => shared.SearchFilterBar
});

// src/studio/reference/config/reference-entity-configs.ts
var REFERENCE_ENTITY_CONFIGS = {
  brands: {
    slug: "brands",
    title: "Brands Master Reference",
    singularTitle: "Brand",
    description: "Manage brand identities and master reference items",
    iconName: "Tag",
    apiEndpoint: "/api/reference/brands",
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
    apiEndpoint: "/api/reference/products",
    dataKey: "products",
    fields: [
      { key: "name", label: "Product Name", type: "text", required: true },
      { key: "code", label: "Product Code", type: "text" },
      { key: "brandId", label: "Brand", type: "relation", relationEntity: "brands", required: true },
      { key: "ingredientIds", label: "Active Ingredients", type: "multi-relation", relationEntity: "ingredients" },
      { key: "description", label: "Description", type: "textarea" }
    ]
  },
  dimensions: {
    slug: "dimensions",
    title: "Dimensions",
    singularTitle: "Dimension",
    description: "Master assessment metrics and diagnostic domains (MOVE, NUT, SLP, STR, GUT, SKN, sebum, etc.)",
    iconName: "Target",
    apiEndpoint: "/api/reference/dimensions",
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
    apiEndpoint: "/api/reference/conditions",
    dataKey: "conditions",
    fields: [
      { key: "code", label: "Condition Code (e.g. is_pregnant, uses_retinol)", type: "text", required: true },
      { key: "name", label: "Condition Display Name", type: "text", required: true },
      { key: "description", label: "Safety Gatekeeper Description", type: "textarea" }
    ]
  },
  statuses: {
    slug: "statuses",
    title: "Statuses Reference",
    singularTitle: "Status",
    description: "Manage operational status codes and definitions",
    iconName: "CheckCircle",
    apiEndpoint: "/api/reference/statuses",
    dataKey: "statuses",
    fields: [
      { key: "name", label: "Status Name", type: "text", required: true },
      { key: "code", label: "Status Code", type: "text" },
      { key: "description", label: "Description", type: "textarea" }
    ]
  },
  ingredients: {
    slug: "ingredients",
    title: "Ingredients Master Reference",
    singularTitle: "Ingredient",
    description: "Manage skincare actives, botanical extracts, and chemical formulation ingredients",
    iconName: "Sparkles",
    apiEndpoint: "/api/reference/ingredients",
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
    apiEndpoint: "/api/reference/severity-tier-groups",
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
    apiEndpoint: "/api/reference/skin-conditions",
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
    apiEndpoint: "/api/reference/applications",
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
REFERENCE_ENTITY_CONFIGS["status"] = REFERENCE_ENTITY_CONFIGS["statuses"];
REFERENCE_ENTITY_CONFIGS["ingredient"] = REFERENCE_ENTITY_CONFIGS["ingredients"];
REFERENCE_ENTITY_CONFIGS["active-ingredients"] = REFERENCE_ENTITY_CONFIGS["ingredients"];
REFERENCE_ENTITY_CONFIGS["application"] = REFERENCE_ENTITY_CONFIGS["applications"];
var ReferenceTable = ({
  config,
  items,
  onEdit,
  onDelete,
  searchQuery = ""
}) => {
  if (items.length === 0) {
    return /* @__PURE__ */ jsxRuntime.jsx(
      shared.EmptyState,
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
      render: (item) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5 whitespace-nowrap", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            onClick: () => onEdit(item),
            className: "p-1.5 hover:bg-muted hover:text-amber-600 rounded text-muted-foreground transition cursor-pointer",
            title: `Edit ${config.singularTitle}`,
            children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Edit2, { className: "h-3.5 w-3.5" })
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            onClick: () => onDelete(item),
            className: "p-1.5 hover:bg-rose-500/10 hover:text-rose-600 rounded text-muted-foreground transition cursor-pointer",
            title: `Delete ${config.singularTitle}`,
            children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { className: "h-3.5 w-3.5" })
          }
        )
      ] })
    },
    {
      key: "name",
      header: "Name",
      render: (item) => {
        if (["brands", "brand"].includes(config.slug)) {
          return /* @__PURE__ */ jsxRuntime.jsx(
            shared.BrandTag,
            {
              name: item.name,
              website: item.website,
              colorCode: item.colorCode,
              showWebsiteLink: false
            }
          );
        }
        return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "font-bold text-foreground text-xs truncate max-w-[200px] sm:max-w-none", title: item.name, children: item.name });
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
          statuses: "ST",
          status: "ST"
        };
        const prefix = fallbackPrefixMap[config.slug] || "REF";
        const formattedCode = item.code || item.axisCode || `${prefix}-${(item.name || "ITEM").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12)}`;
        return /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded tracking-wider whitespace-nowrap", children: formattedCode });
      }
    },
    // Entity Specific: Brands
    ...["brands", "brand"].includes(config.slug) ? [
      {
        key: "website",
        header: "Website",
        render: (item) => {
          const site = item.website;
          const domain = shared.getDomainFromUrl(site);
          if (!site && !domain) return /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-muted-foreground italic text-[11px]", children: "\u2014" });
          const href = site ? site.startsWith("http") ? site : `https://${site}` : `https://${domain}`;
          return /* @__PURE__ */ jsxRuntime.jsxs(
            "a",
            {
              href,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-amber-600 hover:text-amber-500 hover:underline flex items-center gap-1 font-mono text-[11px] w-fit whitespace-nowrap",
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Globe, { className: "h-3 w-3 text-amber-600/80 shrink-0" }),
                /* @__PURE__ */ jsxRuntime.jsx("span", { children: domain || site }),
                /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ExternalLink, { className: "h-2.5 w-2.5 opacity-70 shrink-0" })
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
          return /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "flex items-center gap-1.5 font-mono text-[11px] font-bold text-foreground bg-secondary/60 border border-border px-2 py-0.5 rounded w-fit whitespace-nowrap", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "h-3.5 w-3.5 rounded-full shrink-0 border border-border shadow-xs", style: { backgroundColor: hex } }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { children: hex })
          ] });
        }
      }
    ] : [],
    // Entity Specific: Products
    ...["products", "product"].includes(config.slug) ? [
      {
        key: "brand",
        header: "Brand",
        render: (item) => /* @__PURE__ */ jsxRuntime.jsx(
          shared.BrandTag,
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
        render: (item) => /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "px-2 py-0.5 bg-purple-500/15 border border-purple-500/40 text-purple-300 text-[10px] font-bold rounded flex items-center gap-1 w-fit whitespace-nowrap", children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Sparkles, { className: "h-3 w-3 text-purple-400" }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { children: item.category || "Active Active" })
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
            return /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-zinc-600 text-xs italic", children: "No tiers defined" });
          }
          return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap items-center gap-1.5 max-w-md", children: tierItems.map((t, idx) => {
            const hex = t.colorCode || "#10b981";
            return /* @__PURE__ */ jsxRuntime.jsxs(
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
                  /* @__PURE__ */ jsxRuntime.jsx(
                    "span",
                    {
                      className: "w-2 h-2 rounded-full shrink-0",
                      style: { backgroundColor: hex }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntime.jsx("span", { children: t.name || t.code })
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
          return /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "font-mono text-[10px] font-bold px-2 py-0.5 bg-secondary/60 border border-border text-amber-600 rounded whitespace-nowrap", children: [
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
        render: (item) => /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "px-2 py-0.5 bg-blue-500/15 border border-blue-500/40 text-blue-600 text-[10px] font-bold rounded flex items-center gap-1 w-fit whitespace-nowrap", children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Target, { className: "h-3 w-3" }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { children: item.dimensionCode || item.dimension_code || "sebum" })
        ] })
      }
    ] : [],
    {
      key: "description",
      header: "Description",
      render: (item) => /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-muted-foreground text-xs leading-relaxed max-w-sm sm:max-w-md line-clamp-2 block", title: item.description, children: item.description || /* @__PURE__ */ jsxRuntime.jsx("span", { className: "italic", children: "No description" }) })
    },
    {
      key: "createdAt",
      header: "Created At",
      className: "hidden md:table-cell w-28",
      render: (item) => /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-muted-foreground font-mono text-[11px] whitespace-nowrap", children: item.createdAt && !item.createdAt.startsWith("0001") ? new Date(item.createdAt).toLocaleDateString() : "\u2014" })
    }
  ];
  return /* @__PURE__ */ jsxRuntime.jsx(shared.DataTable, { columns, data: items, keyField: "id" });
};
var ReferenceFormModal = ({
  isOpen,
  config,
  initialData,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = React9.useState({});
  const [relationOptions, setRelationOptions] = React9.useState({});
  const [isSubmitting, setIsSubmitting] = React9.useState(false);
  const [error, setError] = React9.useState(null);
  React9.useEffect(() => {
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
            const res = await fetch(`/api/reference/${field2.relationEntity}`);
            const data = await res.json();
            const list = data.data || data[field2.relationEntity] || data.dimensions || data.statuses || data.items || data.brands || data.products || data.ingredients || [];
            if (data.success && Array.isArray(list)) {
              setRelationOptions((prev) => ({ ...prev, [field2.relationEntity]: list }));
            }
          } catch {
          }
        }
      });
    }
  }, [isOpen, initialData, config]);
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
  return /* @__PURE__ */ jsxRuntime.jsx(
    shared.Modal,
    {
      isOpen,
      onClose,
      size: "lg",
      title: initialData ? `Edit ${config.singularTitle}` : `New ${config.singularTitle}`,
      isLoading: isSubmitting,
      loadingText: isSubmitting ? initialData ? `Updating ${config.singularTitle}...` : `Saving ${config.singularTitle}...` : void 0,
      children: /* @__PURE__ */ jsxRuntime.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 pb-12 relative", children: [
        error && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded text-xs", children: error }),
        config.fields.map((field2, idx) => {
          const zIndexVal = (config.fields.length - idx) * 10;
          return /* @__PURE__ */ jsxRuntime.jsxs("div", { style: { zIndex: zIndexVal }, className: "space-y-1.5 relative", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "block text-muted-foreground font-medium", children: [
              field2.label,
              " ",
              field2.required && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-amber-500", children: "*" })
            ] }),
            field2.type === "number" && /* @__PURE__ */ jsxRuntime.jsx(
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
            field2.type === "text" && /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                type: "text",
                required: field2.required,
                value: formData[field2.key] ?? "",
                onChange: (e) => setFormData({ ...formData, [field2.key]: e.target.value }),
                className: "w-full h-9 bg-background border border-border rounded-lg px-3 text-foreground outline-none focus:border-ring transition"
              }
            ),
            field2.type === "textarea" && /* @__PURE__ */ jsxRuntime.jsx(
              "textarea",
              {
                rows: 3,
                value: formData[field2.key] || "",
                onChange: (e) => setFormData({ ...formData, [field2.key]: e.target.value }),
                className: "w-full bg-background border border-border rounded-lg p-2.5 text-foreground outline-none focus:border-ring transition"
              }
            ),
            field2.type === "select" && /* @__PURE__ */ jsxRuntime.jsx(
              "select",
              {
                value: formData[field2.key] || field2.options?.[0]?.value || "",
                onChange: (e) => setFormData({ ...formData, [field2.key]: e.target.value }),
                className: "w-full h-9 bg-background border border-border rounded-lg px-3 text-foreground outline-none focus:border-ring transition cursor-pointer",
                children: field2.options?.map((opt2) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: opt2.value, children: opt2.label }, opt2.value))
              }
            ),
            field2.type === "relation" && field2.relationEntity && (() => {
              const opts = relationOptions[field2.relationEntity] || [];
              const isCodeBased = ["dimensions", "statuses"].includes(field2.relationEntity);
              field2.relationEntity === "dimensions";
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
              return /* @__PURE__ */ jsxRuntime.jsx(
                shared.SearchableSelect,
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
              const isCodeBased = ["dimensions", "statuses"].includes(field2.relationEntity);
              const rawVal = formData[field2.key] ?? (formData["ingredientIds"] || []);
              const selectedValues = Array.isArray(rawVal) ? rawVal.map((v) => {
                if (typeof v === "string") {
                  const found = opts.find((o) => (isCodeBased ? o.code === v : o.id === v) || o.id === v || o.name === v);
                  return found ? isCodeBased && found.code ? found.code : found.id : v;
                }
                return isCodeBased && v?.code ? v.code : v?.id || v?.ingredientId;
              }).filter(Boolean) : typeof rawVal === "string" && rawVal ? [rawVal] : [];
              return /* @__PURE__ */ jsxRuntime.jsx(
                shared.SearchableSelect,
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
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "pt-3 flex items-center justify-end border-t border-border shrink-0", children: /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "submit",
            disabled: isSubmitting,
            className: "px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-sm",
            children: [
              isSubmitting ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Save, { className: "h-3.5 w-3.5" }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { children: isSubmitting ? initialData ? "Updating..." : "Saving..." : initialData ? "Update Item" : "Save Item" })
            ]
          }
        ) })
      ] })
    }
  );
};
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
  const [code, setCode] = React9.useState("");
  const [name, setName] = React9.useState("");
  const [description, setDescription] = React9.useState("");
  const [items, setItems] = React9.useState([]);
  const [isSubmitting, setIsSubmitting] = React9.useState(false);
  const [error, setError] = React9.useState(null);
  React9.useEffect(() => {
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
  return /* @__PURE__ */ jsxRuntime.jsx(
    shared.Modal,
    {
      isOpen,
      onClose,
      size: "3xl",
      icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ShieldAlert, { className: "h-5 w-5 text-amber-400" }),
      title: initialData ? `Edit Classification Group (${code})` : "New Severity Classification Group",
      subtitle: "Define a diagnostic group (e.g. Severity Level, Acne Prone Level) and configure its classification tier items.",
      isLoading: isSubmitting,
      loadingText: isSubmitting ? initialData ? "Updating Classification Group..." : "Creating Classification Group..." : void 0,
      children: /* @__PURE__ */ jsxRuntime.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 text-xs", children: [
        error && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded text-xs font-semibold", children: error }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 bg-secondary/40 p-3.5 rounded-xl border border-border", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "text-muted-foreground font-bold", children: [
              "Group Display Name ",
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-amber-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx(
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
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "text-muted-foreground font-bold", children: [
              "Group Code ",
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-amber-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx(
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
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "col-span-1 sm:col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-muted-foreground font-bold", children: "Clinical / Operational Description" }),
            /* @__PURE__ */ jsxRuntime.jsx(
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
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2.5 pt-1", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-foreground font-bold flex items-center gap-1.5 text-xs", children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Layers, { className: "h-4 w-4 text-amber-500" }),
              /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
                "Classification Tier Items (",
                items.length,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs(
              "button",
              {
                type: "button",
                onClick: handleAddItem,
                className: "px-2.5 py-1 bg-secondary hover:bg-accent border border-border text-amber-600 hover:text-foreground rounded-lg flex items-center gap-1.5 font-semibold text-xs transition cursor-pointer",
                children: [
                  /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { className: "h-3.5 w-3.5" }),
                  /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Add Tier Item" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs(
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
                /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-center", children: "#" }),
                /* @__PURE__ */ jsxRuntime.jsx("div", { children: "Display Name" }),
                /* @__PURE__ */ jsxRuntime.jsx("div", { children: "Code" }),
                /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-center", children: "Badge Color" }),
                /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-center", children: "Act" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "space-y-2 max-h-64 overflow-y-auto pr-1", children: items.map((item, idx) => /* @__PURE__ */ jsxRuntime.jsxs(
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
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-center font-mono font-bold text-amber-600 bg-secondary/60 border border-border rounded py-1", children: [
                  "#",
                  idx + 1
                ] }),
                /* @__PURE__ */ jsxRuntime.jsx("div", { children: /* @__PURE__ */ jsxRuntime.jsx(
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
                /* @__PURE__ */ jsxRuntime.jsx("div", { children: /* @__PURE__ */ jsxRuntime.jsx(
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
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5 justify-center", children: [
                  /* @__PURE__ */ jsxRuntime.jsx(
                    "input",
                    {
                      type: "color",
                      value: item.colorCode || "#10b981",
                      onChange: (e) => handleUpdateItem(idx, "colorCode", e.target.value),
                      className: "w-6 h-6 rounded border border-border cursor-pointer bg-transparent shrink-0",
                      title: "Choose Badge Color"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    "input",
                    {
                      type: "text",
                      value: item.colorCode || "#10b981",
                      onChange: (e) => handleUpdateItem(idx, "colorCode", e.target.value),
                      className: "w-16 bg-background border border-border rounded px-1.5 py-1 text-[11px] font-mono text-foreground outline-none"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntime.jsx(
                  "button",
                  {
                    type: "button",
                    disabled: items.length <= 1,
                    onClick: () => handleRemoveItem(idx),
                    className: "p-1 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 disabled:opacity-30 rounded transition cursor-pointer",
                    title: items.length <= 1 ? "Minimum 1 tier required" : "Remove Tier",
                    children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { className: "h-3.5 w-3.5" })
                  }
                ) })
              ]
            },
            idx
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "pt-3 flex items-center justify-end border-t border-border", children: /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "submit",
            disabled: isSubmitting,
            className: "px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-md",
            children: [
              isSubmitting ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Save, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { children: isSubmitting ? initialData ? "Updating..." : "Creating..." : initialData ? "Update Group" : "Create Group" })
            ]
          }
        ) })
      ] })
    }
  );
};
var ReferenceEntityDashboard = ({ slug }) => {
  const [activeSlug, setActiveSlug] = React9.useState(slug);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = React9.useState(false);
  const [activeFilters, setActiveFilters] = React9.useState({});
  React9.useEffect(() => {
    setActiveSlug(slug);
  }, [slug]);
  const config = REFERENCE_ENTITY_CONFIGS[activeSlug] || REFERENCE_ENTITY_CONFIGS["brands"];
  const [items, setItems] = React9.useState([]);
  const [loading, setLoading] = React9.useState(true);
  const [searchQuery, setSearchQuery] = React9.useState("");
  const [searchColumn, setSearchColumn] = React9.useState("all");
  const [filterOption, setFilterOption] = React9.useState("all");
  const [currentPage, setCurrentPage] = React9.useState(1);
  const [pageSize, setPageSize] = React9.useState(10);
  const [isModalOpen, setIsModalOpen] = React9.useState(false);
  const [editingItem, setEditingItem] = React9.useState(null);
  const [deleteConfig, setDeleteConfig] = React9.useState({
    isOpen: false,
    item: null,
    isDeleting: false
  });
  React9.useEffect(() => {
    setSearchColumn("all");
    setFilterOption("all");
    setActiveFilters({});
    setCurrentPage(1);
  }, [activeSlug]);
  React9.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, searchColumn, filterOption]);
  const columnOptions = React9.useMemo(() => {
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
  const brandOptions = React9.useMemo(() => {
    const brands = Array.from(
      new Set(
        (items || []).map((i) => i.brandName || i.brandId).filter((b) => typeof b === "string" && b.trim().length > 0)
      )
    );
    return brands.map((b) => ({ value: b, label: b }));
  }, [items]);
  const fetchItems = React9.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(config.apiEndpoint, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch reference items");
      const data = await res.json();
      const rawList = data.data || (config.dataKey ? data[config.dataKey] : null) || (config.slug ? data[config.slug] : null) || // reference-service wraps every collection as { data: [...], success: true }
      (Array.isArray(data?.data) ? data.data : null) || data.items || data.brands || data.products || data.ingredients || data.statuses || data.eventTypes || data.reference || [];
      setItems(Array.isArray(rawList) ? rawList : []);
    } catch (err) {
      console.error("Fetch items error:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [config.apiEndpoint, config.slug]);
  React9.useEffect(() => {
    fetchItems();
  }, [fetchItems]);
  const handleSave = async (formData) => {
    try {
      const isEdit = !!editingItem;
      const url = config.apiEndpoint;
      const method = isEdit ? "PUT" : "POST";
      const payload = isEdit ? { ...editingItem, ...formData, id: editingItem.id } : formData;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to ${isEdit ? "update" : "create"} item`);
      }
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
      const url = config.apiEndpoint.includes("?") ? `${config.apiEndpoint}&id=${targetId}` : `${config.apiEndpoint}?id=${targetId}`;
      let res = await fetch(url, { method: "DELETE" });
      if (!res.ok) {
        res = await fetch(`${config.apiEndpoint}/${targetId}`, { method: "DELETE" });
      }
      if (!res.ok) throw new Error("Failed to delete item");
      await fetchItems();
      setDeleteConfig({ isOpen: false, item: null, isDeleting: false });
    } catch (err) {
      alert(err.message || "Delete failed");
      setDeleteConfig((prev) => ({ ...prev, isDeleting: false }));
    }
  };
  const filterItemList = React9.useCallback(
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
  const filteredItems = React9.useMemo(
    () => filterItemList(safeItems, searchQuery, searchColumn, activeFilters),
    [filterItemList, safeItems, searchQuery, searchColumn, activeFilters]
  );
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex-1 min-w-0 h-full overflow-y-auto bg-background text-foreground font-sans flex flex-col select-none", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      shared.PageHeader,
      {
        icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Database, { className: "h-5 w-5 text-beak" }),
        breadcrumbs: [
          { label: "Workbench", href: "/" },
          { label: "Reference Data" },
          { label: config.title }
        ],
        title: config.title,
        description: config.description
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs("main", { className: "flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto flex flex-col", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        shared.SearchFilterBar,
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
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full", children: /* @__PURE__ */ jsxRuntime.jsx(
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
      !loading && totalItems > 0 && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxRuntime.jsx(
        shared.Pagination,
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
    ["severity-tier-groups", "severity-tier-group", "severity-tiers", "severity-tier", "severity-groups", "severity-group"].includes(config.slug) ? /* @__PURE__ */ jsxRuntime.jsx(
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
    ) : /* @__PURE__ */ jsxRuntime.jsx(
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
    /* @__PURE__ */ jsxRuntime.jsx(
      shared.ConfirmDialog,
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
    config.slug !== "brands" && /* @__PURE__ */ jsxRuntime.jsx(
      shared.FilterPanel,
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
var ReferenceManager = ({ initialEntity = "brands" }) => {
  const slugMap = {
    brand: "brands",
    brands: "brands",
    product: "products",
    products: "products",
    "event-type": "event-types",
    "event-types": "event-types",
    status: "statuses",
    statuses: "statuses",
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
  return /* @__PURE__ */ jsxRuntime.jsx(ReferenceEntityDashboard, { slug });
};

// src/studio/form/index.ts
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

// src/studio/form/catalog.ts
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
  const [expandedCode, setExpandedCode] = React9.useState(null);
  const filtered = questionnaires.filter((q) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return q.name.toLowerCase().includes(query) || q.code.toLowerCase().includes(query) || q.description?.toLowerCase().includes(query);
  });
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      shared.SearchFilterBar,
      {
        searchQuery,
        onSearchChange,
        searchPlaceholder: "Search questionnaires by name, code, or description\u2026",
        actionLabel: "New questionnaire",
        onAction: onOpenAddModal
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "space-y-3", children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx(
      shared.EmptyState,
      {
        icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.FileText, { className: "h-6 w-6 text-muted-foreground" }),
        title: "No questionnaires yet",
        description: "Build a questionnaire that turns answers into one score per dimension.",
        actionLabel: "New questionnaire",
        onAction: onOpenAddModal,
        actionIcon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { className: "h-4 w-4" }),
        className: "py-14"
      }
    ) : filtered.map((q) => {
      const isExpanded = expandedCode === q.code;
      const questions = q.questions || [];
      const dimensions = Array.from(new Set(questions.map((qu) => qu.dimension)));
      return /* @__PURE__ */ jsxRuntime.jsxs(
        "div",
        {
          className: "rounded-lg border border-border bg-card overflow-hidden transition hover:border-beak/50",
          children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-4 flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1.5 flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntime.jsx("code", { className: "text-[11px] font-mono text-beak bg-beak/10 border border-beak/30 px-1.5 py-0.5 rounded", children: q.code }),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    "span",
                    {
                      className: `px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold ${q.status === "published" ? "bg-beak/15 text-beak" : "bg-muted text-muted-foreground"}`,
                      children: q.status || "draft"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntime.jsx("h4", { className: "font-bold text-foreground text-sm", children: q.name }),
                q.description && /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: q.description }),
                dimensions.length > 0 && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap gap-1.5 pt-1", children: dimensions.map((dim) => /* @__PURE__ */ jsxRuntime.jsxs(
                  "span",
                  {
                    className: "rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground",
                    children: [
                      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-foreground font-medium", children: getDimensionMeta(dim).label }),
                      " ",
                      "\xB7 ",
                      methodLabel(q, dim)
                    ]
                  },
                  dim
                )) })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2 self-end md:self-center shrink-0", children: [
                /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-[11px] text-muted-foreground hidden sm:block", children: [
                  questions.length || q.questionsCount || 0,
                  " questions"
                ] }),
                /* @__PURE__ */ jsxRuntime.jsxs(
                  "button",
                  {
                    onClick: () => setExpandedCode(isExpanded ? null : q.code),
                    className: "h-8 px-2.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-ring transition flex items-center gap-1.5",
                    children: [
                      isExpanded ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronUp, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDown, { className: "h-3.5 w-3.5" }),
                      isExpanded ? "Hide" : "Preview"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntime.jsx(
                  "button",
                  {
                    onClick: () => onOpenEditModal(q),
                    className: "h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-ring transition flex items-center justify-center",
                    title: "Edit",
                    children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Pencil, { className: "h-3.5 w-3.5" })
                  }
                ),
                /* @__PURE__ */ jsxRuntime.jsx(
                  "button",
                  {
                    onClick: () => onDeleteQuestionnaire(q.code),
                    className: "h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 transition flex items-center justify-center",
                    title: "Delete",
                    children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { className: "h-3.5 w-3.5" })
                  }
                )
              ] })
            ] }),
            isExpanded && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "border-t border-border bg-muted/20 p-4 space-y-2", children: questions.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-muted-foreground", children: "No questions configured." }) : questions.map((qu, qIdx) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-md border border-border bg-card p-3 space-y-2", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between gap-2 text-xs", children: [
                /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-foreground", children: [
                  /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-muted-foreground mr-1", children: [
                    qIdx + 1,
                    "."
                  ] }),
                  qu.label
                ] }),
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[10px] uppercase tracking-wide text-beak shrink-0", children: getDimensionMeta(qu.dimension).label })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-1.5", children: qu.options.map((opt2, oi) => /* @__PURE__ */ jsxRuntime.jsxs(
                "div",
                {
                  className: "rounded border border-border px-2 py-1 flex items-center justify-between text-xs",
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-muted-foreground truncate pr-2", children: opt2.label }),
                    /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-foreground font-mono shrink-0", children: [
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

// src/studio/form/surveyjs.ts
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
        const choice = typeof c === "string" ? { value: c} : c;
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

// src/studio/form/survey-theme.ts
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
var FormSimulatorTab = ({
  questionnaires,
  selectedQCode,
  setSelectedQCode
}) => {
  const currentQ = questionnaires.find((q) => q.code === selectedQCode) || questionnaires[0];
  const hasQuestions = (currentQ?.questions?.length ?? 0) > 0;
  const schema = React9.useMemo(
    () => currentQ ? toSurveyModel(currentQ) : null,
    [currentQ]
  );
  const [data, setData] = React9.useState({});
  const [showPayload, setShowPayload] = React9.useState(false);
  const [customerId, setCustomerId] = React9.useState("demo-customer-001");
  const [copied, setCopied] = React9.useState("");
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
  const survey = React9.useMemo(() => {
    if (!schema || !hasQuestions) return null;
    const m = new surveyCore.Model(schema);
    m.showNavigationButtons = false;
    m.showCompleteButton = false;
    m.showProgressBar = "off";
    m.questionsOnPageMode = "singlePage";
    m.applyTheme(XG_SURVEY_THEME);
    m.getAllQuestions().forEach((q) => {
      if (q.getType() === "boolean") q.renderAs = "radio";
    });
    return m;
  }, [schema, hasQuestions]);
  React9.useEffect(() => {
    setData({});
    if (!survey) return;
    const onValue = (sender) => setData({ ...sender.data });
    survey.onValueChanged.add(onValue);
    return () => survey.onValueChanged.remove(onValue);
  }, [survey]);
  const core = React9.useMemo(
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
    brand_id: "wardah",
    application_id: "skinverse",
    customer_id: customerId,
    data
  };
  const submitBodyJson = JSON.stringify(submitBody, null, 2);
  const payload = {
    code: currentQ?.code,
    brand_id: "wardah",
    application_id: "skinverse",
    answer_list: core.answer_list,
    customer_condition: core.customer_condition,
    dimensions: core.dimensions,
    vision_signals: {}
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-5", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "lg:col-span-7 space-y-3", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-lg border border-border bg-card p-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "block space-y-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-muted-foreground text-xs font-semibold", children: "Questionnaire" }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "select",
          {
            value: selectedQCode,
            onChange: (e) => setSelectedQCode(e.target.value),
            className: "w-full h-9 rounded-md bg-muted/40 border border-border px-3 text-foreground text-xs outline-none focus:border-ring",
            style: { colorScheme: "dark" },
            children: questionnaires.map((q) => /* @__PURE__ */ jsxRuntime.jsx(
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
      !survey ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-muted-foreground text-xs py-6 text-center", children: "This questionnaire has no questions configured." }) : /* @__PURE__ */ jsxRuntime.jsx(surveyReactUi.Survey, { model: survey })
    ] }) }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "lg:col-span-5 space-y-3", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-lg border border-border bg-card p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-foreground text-sm font-bold", children: "Score per dimension" }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[11px] text-muted-foreground", children: "Form Engine output" })
        ] }),
        results.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx(
          shared.EmptyState,
          {
            icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Play, { className: "h-5 w-5 text-muted-foreground" }),
            title: "Nothing to calculate yet",
            description: "Answer a question to see its dimension score.",
            className: "py-10"
          }
        ) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "space-y-2", children: results.map((r) => {
          const methodLabel2 = CALCULATION_METHODS.find((m) => m.value === r.method)?.label || r.method;
          return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-md border border-border bg-muted/20 p-3", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs font-semibold text-foreground", children: getDimensionMeta(r.dc).label }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[10px] uppercase tracking-wide text-muted-foreground", children: methodLabel2 })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-1 flex items-baseline justify-between", children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-lg font-black text-beak font-mono", children: r.value }),
              /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-[11px] text-muted-foreground font-mono", children: [
                "[",
                r.scores.join(", "),
                "] \u2192 ",
                r.method
              ] })
            ] })
          ] }, r.dc);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-lg border border-border bg-card p-4 space-y-2", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-foreground text-sm font-bold", children: "Submit Answers body" }),
            /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-[11px] text-muted-foreground truncate", children: [
              "POST ",
              /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "font-mono", children: [
                "/v1/survey/",
                currentQ?.code,
                "/evaluate"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              type: "button",
              onClick: () => copy(submitBodyJson, "submit"),
              className: "h-7 shrink-0 rounded-md border border-beak/40 bg-beak/10 px-2.5 text-[11px] font-semibold text-beak hover:bg-beak/20",
              children: copied === "submit" ? "Copied" : "Copy body"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-center gap-2 text-[11px] text-muted-foreground", children: [
          "customer_id",
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              value: customerId,
              onChange: (e) => setCustomerId(e.target.value),
              className: "h-7 flex-1 rounded-md bg-muted/40 border border-border px-2 text-foreground font-mono outline-none focus:border-ring"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("pre", { className: "max-h-56 overflow-auto rounded-md bg-muted/40 border border-border p-2.5 text-[11px] text-foreground font-mono leading-relaxed whitespace-pre", children: submitBodyJson })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-lg border border-border bg-card", children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setShowPayload((v) => !v),
            className: "flex w-full items-center justify-between gap-2 px-4 py-3 text-xs font-bold text-foreground",
            children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Internal: forwarded to Score Engine" }),
              showPayload ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDown, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronRight, { className: "h-4 w-4 text-muted-foreground" })
            ]
          }
        ),
        showPayload && /* @__PURE__ */ jsxRuntime.jsx("pre", { className: "border-t border-border px-4 py-3 text-[11px] text-muted-foreground whitespace-pre-wrap break-all font-mono leading-relaxed", children: JSON.stringify(payload, null, 2) })
      ] })
    ] })
  ] });
};

// src/studio/form/api.ts
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
async function getDimensions() {
  try {
    const res = await fetch(`/api/reference/dimensions`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    const arr = Array.isArray(data) ? data : Array.isArray(data?.dimensions) ? data.dimensions : Array.isArray(data?.data) ? data.data : [];
    return arr;
  } catch {
    return [];
  }
}
async function getSafetyFlags() {
  try {
    const res = await fetch(`/api/reference/conditions`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return arr;
  } catch {
    return [];
  }
}
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
var SafetyFlagPicker = ({ flags, flagOptions, onAdd, onRemove }) => {
  const [open, setOpen] = React9.useState(false);
  const [addingCustom, setAddingCustom] = React9.useState(false);
  const [customDraft, setCustomDraft] = React9.useState("");
  const ref = React9.useRef(null);
  const hasFlags = flags.length > 0;
  React9.useEffect(() => {
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
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { ref, className: "relative shrink-0", children: [
    /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        type: "button",
        title: hasFlags ? `Safety flags: ${flags.join(", ")}` : "Add safety flags",
        onClick: () => setOpen((o) => !o),
        className: `h-9 w-9 flex items-center justify-center rounded-md border-2 transition ${hasFlags ? "border-amber-500 bg-amber-500/10 text-amber-600" : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"}`,
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Flag, { className: "h-5 w-5", fill: hasFlags ? "currentColor" : "none" }),
          flags.length > 1 && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center leading-none", children: flags.length })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "absolute right-0 top-full mt-1 z-20 w-56 rounded-md border border-border bg-popover shadow-lg p-2 space-y-1.5", children: [
      hasFlags && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap gap-1", children: flags.map((k) => {
        const meta = flagOptions.find((f) => f.code === k);
        return /* @__PURE__ */ jsxRuntime.jsxs(
          "span",
          {
            className: "inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-600 text-[10px] px-1.5 py-0.5 rounded",
            children: [
              meta?.name || k,
              /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", onClick: () => onRemove(k), children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { className: "h-2.5 w-2.5" }) })
            ]
          },
          k
        );
      }) }),
      addingCustom ? /* @__PURE__ */ jsxRuntime.jsx(
        "input",
        {
          autoFocus: true,
          value: customDraft,
          onChange: (e) => setCustomDraft(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const v = slugify(customDraft);
              if (v) onAdd(v);
              setCustomDraft("");
              setAddingCustom(false);
            } else if (e.key === "Escape") {
              setAddingCustom(false);
            }
          },
          placeholder: "new_flag_key",
          className: `${fieldSm} w-full font-mono`
        }
      ) : /* @__PURE__ */ jsxRuntime.jsxs(
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
            /* @__PURE__ */ jsxRuntime.jsx("option", { style: optionStyle, value: "", children: "+ add flag" }),
            choices.map((f) => /* @__PURE__ */ jsxRuntime.jsx("option", { style: optionStyle, value: f.code, children: f.name || f.code }, f.code)),
            /* @__PURE__ */ jsxRuntime.jsx("option", { style: optionStyle, value: "__custom__", children: "+ Custom\u2026" })
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
  const [step, setStep] = React9.useState("setup");
  const [qCode, setQCode] = React9.useState("");
  const [qBrand, setQBrand] = React9.useState(brandId);
  const [qApp, setQApp] = React9.useState(applicationId);
  const [codeEdited, setCodeEdited] = React9.useState(false);
  const [showCodeField, setShowCodeField] = React9.useState(false);
  const [qName, setQName] = React9.useState("");
  const [qDesc, setQDesc] = React9.useState("");
  const [qStatus, setQStatus] = React9.useState("draft");
  const [questions, setQuestions] = React9.useState([]);
  const [calcMethods, setCalcMethods] = React9.useState({});
  const [apiDimensions, setApiDimensions] = React9.useState([]);
  const [safetyFlagCatalog, setSafetyFlagCatalog] = React9.useState([]);
  const [filterDim, setFilterDim] = React9.useState("all");
  const [collapsed, setCollapsed] = React9.useState({});
  const [scoreDrafts, setScoreDrafts] = React9.useState({});
  const [submitting, setSubmitting] = React9.useState(false);
  const [copied, setCopied] = React9.useState("");
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
  React9.useEffect(() => {
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
  React9.useEffect(() => {
    if (!isOpen) return;
    getDimensions().then((raw) => {
      setApiDimensions(
        raw.filter((it) => it && it.code && !it.parentCode).map((it) => ({
          code: it.code,
          label: it.name || it.code,
          purpose: it.description || getDimensionMeta(it.code).purpose
        }))
      );
    }).catch(() => setApiDimensions([]));
  }, [isOpen]);
  React9.useEffect(() => {
    if (!isOpen) return;
    getSafetyFlags().then(setSafetyFlagCatalog).catch(() => setSafetyFlagCatalog([]));
  }, [isOpen]);
  const effectiveCode = codeEdited ? qCode : slugify(qName);
  const usedDimensions = Array.from(new Set(questions.map((q) => q.dimension).filter(Boolean)));
  const flagOptions = React9.useMemo(() => {
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
  const draftItem = React9.useMemo(
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
  return /* @__PURE__ */ jsxRuntime.jsxs(
    shared.Modal,
    {
      isOpen,
      onClose,
      size: "3xl",
      icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.FileText, { className: "h-4 w-4" }),
      title: editingQ ? "Edit questionnaire" : "New questionnaire",
      subtitle: "Form Engine only calculates scores. Labelling and normalisation happen in the Score Engine.",
      isLoading: submitting,
      loadingText: submitting ? editingQ ? "Saving questionnaire..." : "Creating questionnaire..." : void 0,
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1 rounded-md border border-border bg-muted/30 p-1 text-xs", children: [
          [
            ["setup", "1  Setup"],
            ["questions", `2  Questions (${questions.length})`],
            ["calculation", "3  Calculation"]
          ].map(([v, label]) => /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              type: "button",
              onClick: () => setStep(v),
              className: `px-3 py-1.5 rounded font-semibold transition ${step === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
              children: label
            },
            v
          )),
          /* @__PURE__ */ jsxRuntime.jsx(
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
        /* @__PURE__ */ jsxRuntime.jsxs("form", { onSubmit: submit, className: "mt-3 space-y-3", children: [
          step === "setup" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-lg border border-border bg-card p-3 space-y-3", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "block space-y-1", children: [
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-muted-foreground text-xs font-semibold", children: "Name" }),
                /* @__PURE__ */ jsxRuntime.jsx(
                  "input",
                  {
                    required: true,
                    value: qName,
                    onChange: (e) => setQName(e.target.value),
                    placeholder: "e.g. Pixie Skin Analyzer",
                    className: `${field} w-full`
                  }
                ),
                /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "block text-[11px] text-muted-foreground", children: [
                  "Saved as ",
                  /* @__PURE__ */ jsxRuntime.jsx("code", { className: "text-foreground", children: effectiveCode || "\u2014" }),
                  /* @__PURE__ */ jsxRuntime.jsx(
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
                showCodeField && /* @__PURE__ */ jsxRuntime.jsx(
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
              /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "block space-y-1", children: [
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-muted-foreground text-xs font-semibold", children: "Description" }),
                /* @__PURE__ */ jsxRuntime.jsx(
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
              /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "block space-y-1", children: [
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-muted-foreground text-xs font-semibold", children: "Status" }),
                /* @__PURE__ */ jsxRuntime.jsxs(
                  "select",
                  {
                    value: qStatus,
                    onChange: (e) => setQStatus(e.target.value),
                    className: `${field} w-full`,
                    style: selectStyle,
                    children: [
                      /* @__PURE__ */ jsxRuntime.jsx("option", { style: optionStyle, value: "draft", children: "Draft" }),
                      /* @__PURE__ */ jsxRuntime.jsx("option", { style: optionStyle, value: "published", children: "Published" }),
                      /* @__PURE__ */ jsxRuntime.jsx("option", { style: optionStyle, value: "archived", children: "Archived" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-muted-foreground text-xs font-semibold", children: "Brand" }),
                    /* @__PURE__ */ jsxRuntime.jsx(
                      shared.InfoTooltip,
                      {
                        content: `Saved under ${qBrand || "\u2014"} / ${qApp || "\u2014"}. Defaults to the Form Engine selector; change it to build for a different tenant.`,
                        label: "About brand / application"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    shared.BrandSelect,
                    {
                      value: qBrand,
                      includeUniversal: false,
                      label: "",
                      onChange: setQBrand
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-muted-foreground text-xs font-semibold", children: "Application" }),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    shared.ApplicationSelect,
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
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-lg border border-border bg-card p-3 space-y-2", children: [
              /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-foreground text-xs font-semibold", children: "Start from a template" }),
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: BUILTIN_TEMPLATES.map((t) => /* @__PURE__ */ jsxRuntime.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => loadTemplate(t.id),
                  className: "text-left rounded-md border border-border bg-muted/30 hover:border-ring p-2.5 transition",
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-foreground text-xs font-semibold", children: t.name }),
                    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-muted-foreground text-[11px] mt-0.5 leading-relaxed", children: t.description })
                  ]
                },
                t.id
              )) })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntime.jsx(shared.Button, { type: "button", size: "sm", onClick: () => setStep("questions"), children: "Continue" }) })
          ] }),
          step === "questions" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-3", children: [
            usedDimensions.length > 0 && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap items-center gap-1.5", children: ["all", ...usedDimensions].map((d) => /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                type: "button",
                onClick: () => setFilterDim(d),
                className: `px-2.5 py-1 rounded-full border text-[11px] font-medium transition ${filterDim === d ? "border-beak/50 bg-beak/15 text-beak" : "border-border text-muted-foreground hover:text-foreground"}`,
                children: d === "all" ? "All" : metaOf(d).label
              },
              d
            )) }),
            questions.length === 0 ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-lg border border-dashed border-border p-8 text-center", children: [
              /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-foreground text-xs font-semibold", children: "No questions yet" }),
              /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-muted-foreground text-[11px] mt-1 mb-3", children: "Add questions or load a template from Setup." }),
              /* @__PURE__ */ jsxRuntime.jsxs(shared.Button, { type: "button", size: "sm", onClick: addQuestion, children: [
                /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { className: "h-3.5 w-3.5" }),
                " Add question"
              ] })
            ] }) : /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
              visibleQuestions.map(({ q, index }) => {
                const isCollapsed = collapsed[q.id];
                return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-md border border-border bg-card", children: [
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2 p-2", children: [
                    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "shrink-0 w-6 text-center text-[11px] font-bold text-muted-foreground", children: index + 1 }),
                    /* @__PURE__ */ jsxRuntime.jsx(
                      "input",
                      {
                        value: q.label,
                        onChange: (e) => updateQuestion(q.id, { label: e.target.value }),
                        placeholder: "Question text",
                        className: `${fieldSm} flex-1 min-w-0`
                      }
                    ),
                    /* @__PURE__ */ jsxRuntime.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setCollapsed((c) => ({ ...c, [q.id]: !c[q.id] })),
                        className: "shrink-0 text-muted-foreground hover:text-foreground",
                        children: isCollapsed ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronRight, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDown, { className: "h-4 w-4" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntime.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => removeQuestion(q.id),
                        className: "shrink-0 text-muted-foreground hover:text-destructive",
                        children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { className: "h-3.5 w-3.5" })
                      }
                    )
                  ] }),
                  !isCollapsed && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "border-t border-border p-2.5 space-y-2", children: [
                    /* @__PURE__ */ jsxRuntime.jsxs(
                      "div",
                      {
                        className: "flex flex-wrap items-center",
                        style: { columnGap: "2rem", rowGap: "0.5rem" },
                        children: [
                          /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "flex items-center gap-1 shrink-0 text-[11px] font-semibold text-muted-foreground", children: [
                              "Question type",
                              /* @__PURE__ */ jsxRuntime.jsx(
                                shared.InfoTooltip,
                                {
                                  content: TYPE_HINTS[q.type],
                                  label: "About this question type",
                                  iconClassName: "h-3 w-3"
                                }
                              )
                            ] }),
                            /* @__PURE__ */ jsxRuntime.jsx(
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
                                children: QUESTION_TYPES.map((t) => /* @__PURE__ */ jsxRuntime.jsx("option", { style: optionStyle, value: t.value, children: t.label }, t.value))
                              }
                            ),
                            typeHasOptions(q.type) && /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-[11px] text-muted-foreground", children: [
                              q.options.length,
                              " ",
                              q.type === "matrix" ? "columns" : "answers"
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "shrink-0 text-[11px] font-semibold text-muted-foreground", children: "Choose dimension" }),
                            /* @__PURE__ */ jsxRuntime.jsxs(
                              "select",
                              {
                                value: q.dimension,
                                onChange: (e) => updateQuestion(q.id, { dimension: e.target.value }),
                                className: `${fieldSm} w-56 ${q.dimension ? "" : "text-muted-foreground"}`,
                                style: selectStyle,
                                children: [
                                  /* @__PURE__ */ jsxRuntime.jsx("option", { style: optionStyle, value: "", children: "\u2014 dimension \u2014" }),
                                  dimensionList.map((d) => /* @__PURE__ */ jsxRuntime.jsx("option", { style: optionStyle, value: d.code, children: d.label }, d.code))
                                ]
                              }
                            )
                          ] })
                        ]
                      }
                    ),
                    q.type === "boolean" && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center gap-3", children: ["scoreTrue", "scoreFalse"].map((k) => /* @__PURE__ */ jsxRuntime.jsxs(
                      "label",
                      {
                        className: "flex items-center gap-1 text-[11px] text-muted-foreground",
                        children: [
                          k === "scoreTrue" ? "Score if Yes" : "Score if No",
                          /* @__PURE__ */ jsxRuntime.jsx(
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
                    (q.type === "rating" || q.type === "numeric_input") && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center gap-3", children: ["min", "max"].map((k) => /* @__PURE__ */ jsxRuntime.jsxs(
                      "label",
                      {
                        className: "flex items-center gap-1 text-[11px] text-muted-foreground",
                        children: [
                          k,
                          /* @__PURE__ */ jsxRuntime.jsx(
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
                    q.type === "matrix" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-md border border-border bg-muted/20 p-2 space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
                        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[11px] font-semibold text-foreground", children: "Rows" }),
                        /* @__PURE__ */ jsxRuntime.jsx(
                          shared.InfoTooltip,
                          {
                            content: "One score line per row.",
                            label: "About matrix rows",
                            iconClassName: "h-3 w-3"
                          }
                        )
                      ] }),
                      (q.rows ?? []).map((r, ri) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[10px] text-muted-foreground w-4 text-right", children: ri + 1 }),
                        /* @__PURE__ */ jsxRuntime.jsx(
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
                        /* @__PURE__ */ jsxRuntime.jsx(
                          "button",
                          {
                            type: "button",
                            onClick: () => updateQuestion(q.id, {
                              rows: (q.rows ?? []).filter((_, i) => i !== ri)
                            }),
                            className: "shrink-0 text-muted-foreground hover:text-destructive",
                            children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { className: "h-3.5 w-3.5" })
                          }
                        )
                      ] }, r.value)),
                      /* @__PURE__ */ jsxRuntime.jsxs(
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
                            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { className: "h-3 w-3" }),
                            " Add row"
                          ]
                        }
                      )
                    ] }),
                    typeHasOptions(q.type) && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: q.type === "matrix" ? "rounded-md border border-border bg-muted/20 p-2 space-y-1.5" : "space-y-1", children: [
                      q.type === "matrix" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
                        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[11px] font-semibold text-foreground", children: "Answer columns" }),
                        /* @__PURE__ */ jsxRuntime.jsx(
                          shared.InfoTooltip,
                          {
                            content: "Shared by every row; each column carries a score.",
                            label: "About matrix answer columns",
                            iconClassName: "h-3 w-3"
                          }
                        )
                      ] }),
                      q.options.map((o, idx) => {
                        const currentFlags = Object.keys(o.conditionMap || {});
                        return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsxRuntime.jsx(
                            "input",
                            {
                              value: o.label,
                              onChange: (e) => updateOption(q.id, idx, { label: e.target.value }),
                              placeholder: q.type === "matrix" ? `Column ${idx + 1} (e.g. "Severe")` : `Answer ${idx + 1}`,
                              className: `${fieldSm} flex-1 min-w-0`
                            }
                          ),
                          /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-center gap-1 text-[11px] text-muted-foreground shrink-0", children: [
                            "score",
                            /* @__PURE__ */ jsxRuntime.jsx(
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
                          q.type !== "matrix" && /* @__PURE__ */ jsxRuntime.jsx(
                            SafetyFlagPicker,
                            {
                              flags: currentFlags,
                              flagOptions,
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
                          /* @__PURE__ */ jsxRuntime.jsx(
                            "button",
                            {
                              type: "button",
                              onClick: () => updateQuestion(q.id, {
                                options: q.options.filter((_, i) => i !== idx)
                              }),
                              className: "shrink-0 text-muted-foreground hover:text-destructive",
                              children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { className: "h-3.5 w-3.5" })
                            }
                          )
                        ] }, idx);
                      }),
                      /* @__PURE__ */ jsxRuntime.jsxs(
                        "button",
                        {
                          type: "button",
                          onClick: () => updateQuestion(q.id, { options: [...q.options, newOption()] }),
                          className: "text-beak text-[11px] font-semibold inline-flex items-center gap-1",
                          children: [
                            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { className: "h-3 w-3" }),
                            " ",
                            q.type === "matrix" ? "Add column" : "Add answer"
                          ]
                        }
                      )
                    ] })
                  ] })
                ] }, q.id);
              }),
              /* @__PURE__ */ jsxRuntime.jsxs(
                "button",
                {
                  type: "button",
                  onClick: addQuestion,
                  className: "text-beak text-xs font-semibold inline-flex items-center gap-1",
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { className: "h-3.5 w-3.5" }),
                    " Add question"
                  ]
                }
              )
            ] })
          ] }),
          step === "calculation" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-lg border border-border bg-card p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-foreground text-xs font-semibold", children: "Calculation method per dimension" }),
              /* @__PURE__ */ jsxRuntime.jsx(
                shared.InfoTooltip,
                {
                  content: "How every answer score for a dimension is combined into one number before it is sent to the Score Engine.",
                  label: "About calculation methods"
                }
              )
            ] }),
            usedDimensions.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-muted-foreground text-xs py-4 text-center", children: "Add questions first." }) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "space-y-2 pt-1", children: usedDimensions.map((d) => {
              const method = calcMethods[d] || "sum";
              const hint = CALCULATION_METHODS.find((m) => m.value === method)?.hint;
              return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "w-40 shrink-0 text-xs font-semibold text-foreground", children: [
                  metaOf(d).label,
                  /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "block text-[10px] font-normal text-muted-foreground", children: [
                    questions.filter((q) => q.dimension === d).length,
                    " question(s)"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntime.jsx(
                  "select",
                  {
                    value: method,
                    onChange: (e) => setCalcMethods((cur) => ({ ...cur, [d]: e.target.value })),
                    className: `${field} w-40 shrink-0`,
                    style: selectStyle,
                    children: CALCULATION_METHODS.map((m) => /* @__PURE__ */ jsxRuntime.jsx("option", { style: optionStyle, value: m.value, children: m.label }, m.value))
                  }
                ),
                /* @__PURE__ */ jsxRuntime.jsx(shared.InfoTooltip, { content: hint, label: "About this calculation method" })
              ] }, d);
            }) })
          ] }),
          step === "json" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-lg border border-border bg-card p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-foreground text-xs font-semibold", children: "Stored SurveyJS schema" }),
                /* @__PURE__ */ jsxRuntime.jsx(
                  shared.InfoTooltip,
                  {
                    content: "The exact JSON persisted to the Form Engine and rendered to respondents. Custom keys (dimension, score, condition_map, calculation_methods) drive scoring. Copy Create body gives the ready-to-paste payload for POST /v1/survey (Create Questionnaire).",
                    label: "About the stored schema"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntime.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => copy(schemaJson, "schema"),
                    className: "h-7 rounded-md border border-border bg-muted/40 px-2.5 text-[11px] font-semibold text-foreground hover:bg-muted",
                    children: copied === "schema" ? "Copied" : "Copy schema"
                  }
                ),
                /* @__PURE__ */ jsxRuntime.jsx(
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
            /* @__PURE__ */ jsxRuntime.jsx("pre", { className: "w-full max-h-96 overflow-auto rounded-md bg-muted/40 border border-border p-2.5 text-foreground text-[11px] font-mono leading-relaxed whitespace-pre", children: schemaJson })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center justify-end pt-3 border-t border-border", children: /* @__PURE__ */ jsxRuntime.jsx(shared.Button, { type: "submit", size: "sm", isLoading: submitting, disabled: !qName.trim(), children: editingQ ? "Save changes" : "Create questionnaire" }) })
        ] })
      ]
    }
  );
};
var TENANT_KEY = "xg.formEngine.tenant";
var readTenant = () => {
  try {
    const raw = localStorage.getItem(TENANT_KEY);
    if (raw) {
      const t = JSON.parse(raw);
      if (t?.brandId && t?.applicationId) return t;
    }
  } catch {
  }
  return { brandId: "wardah", applicationId: "skinverse" };
};
var FormManager = () => {
  const [activeTab, setActiveTab] = React9.useState("questionnaires");
  const [searchQuery, setSearchQuery] = React9.useState("");
  const [deleteConfirm, setDeleteConfirm] = React9.useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {
    }
  });
  const [{ brandId, applicationId }, setTenant] = React9.useState(readTenant);
  const [questionnaires, setQuestionnaires] = React9.useState([]);
  const [isQuestionnaireModalOpen, setIsQuestionnaireModalOpen] = React9.useState(false);
  const [editingQ, setEditingQ] = React9.useState(null);
  const [selectedQCode, setSelectedQCode] = React9.useState("");
  const loadData = () => {
    listQuestionnaires(brandId, applicationId).then(setQuestionnaires).catch(() => setQuestionnaires([]));
  };
  React9.useEffect(() => {
    loadData();
    try {
      localStorage.setItem(TENANT_KEY, JSON.stringify({ brandId, applicationId }));
    } catch {
    }
  }, [brandId, applicationId]);
  React9.useEffect(() => {
    if (questionnaires.length === 0) return;
    if (!questionnaires.some((q) => q.code === selectedQCode)) {
      setSelectedQCode(questionnaires[0].code);
    }
  }, [questionnaires, selectedQCode]);
  const formTabs = [
    { id: "questionnaires", label: "Questionnaires", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.FileText, { className: "h-4 w-4" }), badge: questionnaires.length },
    { id: "simulator", label: "Simulator", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Play, { className: "h-4 w-4" }) }
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
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex-1 min-w-0 h-full overflow-y-auto bg-background text-foreground font-sans flex flex-col select-none", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      shared.PageHeader,
      {
        icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.FileText, { className: "h-5 w-5" }),
        breadcrumbs: [
          { label: "Workbench", href: "/" },
          { label: "Core Engines" },
          { label: "Form Engine" }
        ],
        title: "Form Engine",
        children: /* @__PURE__ */ jsxRuntime.jsx(
          shared.TabNav,
          {
            tabs: formTabs,
            activeTab,
            onTabChange: (id) => setActiveTab(id)
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs("main", { className: "flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-3", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          shared.BrandSelect,
          {
            value: brandId,
            includeUniversal: false,
            label: "Brand",
            className: "w-48",
            onChange: (v) => setTenant((t) => ({ ...t, brandId: v }))
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          shared.ApplicationSelect,
          {
            value: applicationId,
            includeUniversal: false,
            label: "Application",
            className: "w-48",
            onChange: (v) => setTenant((t) => ({ ...t, applicationId: v }))
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex pb-2", children: /* @__PURE__ */ jsxRuntime.jsx(
          shared.InfoTooltip,
          {
            content: "Questionnaires below are scoped to this brand / application.",
            label: "About brand / application scope"
          }
        ) })
      ] }),
      activeTab === "questionnaires" && /* @__PURE__ */ jsxRuntime.jsx(
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
      activeTab === "simulator" && /* @__PURE__ */ jsxRuntime.jsx(
        FormSimulatorTab,
        {
          questionnaires,
          selectedQCode,
          setSelectedQCode
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(
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
    /* @__PURE__ */ jsxRuntime.jsx(
      shared.ConfirmDialog,
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
  const [schema, setSchema] = React9.useState(initialSchema);
  const [loading, setLoading] = React9.useState(!initialSchema);
  const [error, setError] = React9.useState(null);
  const [payload, setPayload] = React9.useState(null);
  React9.useEffect(() => {
    if (initialSchema) {
      setSchema(initialSchema);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    getQuestionnaireModel(questionnaireCode).then((m) => {
      if (!alive) return;
      if (m) setSchema(m);
      else setError("This questionnaire is not available.");
    }).catch(() => alive && setError("Could not load the questionnaire.")).finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [questionnaireCode, modelProp, questionnaire]);
  const survey = React9.useMemo(() => {
    if (!schema) return null;
    const m = new surveyCore.Model(schema);
    m.showCompletedPage = false;
    m.applyTheme(XG_SURVEY_THEME);
    m.getAllQuestions().forEach((q) => {
      if (q.getType() === "boolean") q.renderAs = "radio";
    });
    return m;
  }, [schema]);
  React9.useEffect(() => {
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
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: shell, children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground", children: "Loading\u2026" }) });
  }
  if (error || !survey) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: shell, children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground", children: error || "This questionnaire is not available." }) });
  }
  if (payload) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: shell, children: renderComplete ? /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: renderComplete(payload) }) : /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-xl border border-border bg-card p-8 text-center space-y-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-beak/15 text-beak text-xl", children: "\u2713" }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm font-semibold", children: "Thanks \u2014 your answers are in." }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-muted-foreground", children: "You can close this window now." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: shell, children: /* @__PURE__ */ jsxRuntime.jsx(surveyReactUi.Survey, { model: survey }) });
};

// src/studio/score/index.ts
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
  const [filterBrand, setFilterBrand] = React9__default.default.useState("ALL");
  const [filterStatus, setFilterStatus] = React9__default.default.useState("ALL");
  const [copiedId, setCopiedId] = React9__default.default.useState(null);
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
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      shared.SearchFilterBar,
      {
        searchQuery,
        onSearchChange,
        searchPlaceholder: "Search grading models by title, code, or brand\u2026",
        actionLabel: "New grading model",
        onAction: onOpenCreateModal,
        actionIcon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { className: "h-4 w-4" }),
        customFilterContent: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsxs(
            "select",
            {
              value: filterBrand,
              onChange: (e) => setFilterBrand(e.target.value),
              className: filterSelect,
              style: { colorScheme: "dark" },
              children: [
                /* @__PURE__ */ jsxRuntime.jsx("option", { value: "ALL", children: "All brands" }),
                /* @__PURE__ */ jsxRuntime.jsx("option", { value: "*", children: "* (universal)" }),
                uniqueBrands.filter((b) => b !== "*").map((b) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: b, children: b }, b))
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs(
            "select",
            {
              value: filterStatus,
              onChange: (e) => setFilterStatus(e.target.value),
              className: filterSelect,
              style: { colorScheme: "dark" },
              children: [
                /* @__PURE__ */ jsxRuntime.jsx("option", { value: "ALL", children: "All statuses" }),
                /* @__PURE__ */ jsxRuntime.jsx("option", { value: "ACTIVE", children: "Active" }),
                /* @__PURE__ */ jsxRuntime.jsx("option", { value: "DRAFT", children: "Draft" }),
                /* @__PURE__ */ jsxRuntime.jsx("option", { value: "INACTIVE", children: "Inactive" }),
                /* @__PURE__ */ jsxRuntime.jsx("option", { value: "ARCHIVED", children: "Archived" })
              ]
            }
          )
        ] })
      }
    ),
    filteredRulesets.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx(
      shared.EmptyState,
      {
        icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Sliders, { className: "h-6 w-6 text-muted-foreground" }),
        title: "No grading models yet",
        description: "A grading model turns 0\u2013100 dimension scores into Level 1\u20135 severity and a skin profile.",
        actionLabel: "New grading model",
        onAction: onOpenCreateModal,
        actionIcon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { className: "h-4 w-4" }),
        className: "py-12 rounded-lg border border-border bg-card"
      }
    ) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: filteredRulesets.map((ruleset) => {
      let dimCount = 0;
      try {
        const parsed = JSON.parse(ruleset.schema);
        const dimKeys = parsed.dimension_weights || parsed.concern_labels || parsed.axis_codes || {};
        dimCount = Object.keys(dimKeys).length;
      } catch {
      }
      return /* @__PURE__ */ jsxRuntime.jsxs(
        "div",
        {
          className: "rounded-lg border border-border bg-card p-4 flex flex-col justify-between transition-colors hover:border-beak/50",
          children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono text-[10px] text-beak bg-beak/10 px-2 py-0.5 rounded border border-beak/30", children: ruleset.code }),
                /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-[11px] text-muted-foreground", children: [
                  "v",
                  ruleset.version
                ] }),
                /* @__PURE__ */ jsxRuntime.jsx(shared.StatusBadge, { status: ruleset.status })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-sm font-bold text-foreground mt-1.5", children: ruleset.title }),
              /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed", children: ruleset.description || "Severity bands and skin-profile mapping for this brand." }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-4 text-[11px] text-muted-foreground mt-3", children: [
                /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
                  "Brand ",
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-foreground", children: ruleset.brandId })
                ] }),
                /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
                  "App ",
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-foreground", children: ruleset.applicationId })
                ] }),
                /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-foreground", children: dimCount }),
                  " dimensions"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => copyId(ruleset.id),
                  title: "Copy ID \u2014 needed for PUT /core/score-engine/rulesets/:id",
                  className: "mt-2 flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground",
                  children: [
                    copiedId === ruleset.id ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Check, { className: "h-3 w-3 text-beak" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Copy, { className: "h-3 w-3" }),
                    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "truncate max-w-[16rem]", children: copiedId === ruleset.id ? "ID copied" : `ID ${ruleset.id}` })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between pt-3 mt-3 border-t border-border", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntime.jsx(
                  shared.Button,
                  {
                    variant: "outline",
                    size: "sm",
                    onClick: () => onOpenEditModal(ruleset),
                    leftIcon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Pencil, { className: "h-3.5 w-3.5" }),
                    children: "Edit"
                  }
                ),
                /* @__PURE__ */ jsxRuntime.jsx(
                  shared.Button,
                  {
                    variant: "outline",
                    size: "sm",
                    onClick: () => onSelectSimulatorRuleset(ruleset),
                    leftIcon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Play, { className: "h-3.5 w-3.5" }),
                    children: "Simulate"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntime.jsx(
                "button",
                {
                  onClick: () => onDeleteRuleset(ruleset.id, ruleset.code),
                  className: "p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted/40 rounded transition-colors",
                  title: "Delete grading model",
                  children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { className: "h-4 w-4" })
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

// src/studio/score/types.ts
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
  { code: "score_darkspot", label: "Darkspot", description: "baumann.dimensions.pigmentation.score_darkspot \u2014 feeds Pigmentation." },
  { code: "score_wrinkle", label: "Wrinkle", description: "baumann.dimensions.wrinkle.score_wrinkle \u2014 feeds Aging." },
  { code: "score_elasticity", label: "Elasticity", description: "baumann.dimensions.wrinkle.score_elasticity." },
  { code: "score_oiliness", label: "Oiliness", description: "baumann.dimensions.oiliness.score_oiliness \u2014 informational only, D/O stays form-only." },
  { code: "score_hydration", label: "Hydration", description: "baumann.dimensions.oiliness.score_hydration." },
  { code: "score_acne", label: "Acne", description: "baumann.dimensions.sensitivity.score_acne \u2014 informational only, S/R stays form-only." },
  { code: "score_redness", label: "Redness", description: "baumann.dimensions.sensitivity.score_redness \u2014 informational only, S/R stays form-only." },
  { code: "pores", label: "Pores", description: "results.skin_scoring.Pores \u2014 feeds Pore Severity." },
  { code: "age_over_30", label: "Age > 30 (from DOB)", description: "Derived from date_of_birth on the identity questionnaire, not a Q1-Q6 question. 0 if <=30, 100 if >30." }
];

// src/studio/score/utils/jdm-compiler.ts
var visionFieldLabel = (code) => KNOWN_VISION_FIELDS.find((f) => f.code === code)?.label || code;
var makeSource = (fieldCode, origin) => fieldCode ? {
  origin,
  fieldCode,
  label: origin === "vision" ? visionFieldLabel(fieldCode) : fieldCode
} : void 0;
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
function compileVisualToJDM(axes, profileConfig = DEFAULT_STARTER_PROFILES, scoreRangeBands = DEFAULT_SCORE_RANGE_BANDS, severityBands = DEFAULT_SEVERITY_BANDS, existingSchema) {
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
  const dimension_fusion = {};
  const concern_labels = {};
  const axis_codes = {};
  const field_mapping = {};
  for (const a of effectiveAxes) {
    const key = a.dimensionKey.toLowerCase();
    dimension_weights[key] = a.weight ?? 1;
    concern_labels[key] = a.concernLabel || defaultConcernLabel(key);
    if (a.inputComposition === "weighted_blend") {
      const fw = a.formWeight ?? 50;
      dimension_fusion[key] = { form: fw / 100, vision: (100 - fw) / 100 };
      const mapping = {};
      if (a.formSource?.fieldCode) mapping.form = a.formSource.fieldCode;
      if (a.visionSource?.fieldCode) mapping.vision = a.visionSource.fieldCode;
      if (Object.keys(mapping).length > 0) field_mapping[key] = mapping;
    } else if (a.source?.fieldCode) {
      field_mapping[key] = a.source.origin === "form" ? { form: a.source.fieldCode } : { vision: a.source.fieldCode };
    }
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
  const model = {
    ...base,
    nodes: [...nodes, ...preservedNodes],
    edges,
    dimension_weights,
    dimension_fusion,
    concern_labels,
    score_range_bands: bandsToSchema(scoreRangeBands),
    severity_bands: bandsToSchema(severityBands)
  };
  if (Object.keys(axis_codes).length > 0) model.axis_codes = axis_codes;
  else delete model.axis_codes;
  if (Object.keys(field_mapping).length > 0) model.field_mapping = field_mapping;
  else delete model.field_mapping;
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
  const fusion = parsed.dimension_fusion || {};
  const concernLabels = parsed.concern_labels || {};
  const axisCodes = parsed.axis_codes || {};
  const fieldMapping = parsed.field_mapping || {};
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
    /* @__PURE__ */ new Set([...Object.keys(weights), ...Object.keys(concernLabels), ...Object.keys(axisCodes), ...salvagedKeys])
  );
  const legacy = Object.keys(weights).length === 0 && Object.keys(concernLabels).length === 0 && !hasProfileNode;
  const bandNodeFor = (key) => nodeContents.find((c) => {
    const ins = c?.inputs || [];
    const outs = c?.outputs || [];
    return ins.length === 1 && ins[0]?.field === `dimension_scores.${key}` && outs.length === 1 && outs[0]?.field === `axis_values.${key.toUpperCase()}`;
  });
  const axes = dimKeys.map((key, i) => {
    const df = fusion[key];
    const ac = axisCodes[key.toLowerCase()];
    const fm = fieldMapping[key];
    const bandNode = bandNodeFor(key);
    let bands;
    if (bandNode) {
      bands = (bandNode.rules || []).map((r, ri) => {
        const range = parseRange(r.in);
        if (!range) return null;
        return { id: `${key}_b${ri}`, min: range.min, max: range.max, letter: clean(r.out) };
      }).filter(Boolean);
    } else if (ac && (ac.low || ac.high)) {
      const t = typeof ac.threshold === "number" ? ac.threshold : 50;
      bands = [
        { id: `${key}_lo`, min: 0, max: Math.max(0, t - 1), letter: ac.low || "" },
        { id: `${key}_hi`, min: t, max: 100, letter: ac.high || "" }
      ];
    }
    const inputComposition = df ? "weighted_blend" : fm ? "single_source" : void 0;
    return {
      id: `axis_${key}`,
      axisCode: key.toUpperCase(),
      name: key.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      dimensionKey: key,
      weight: typeof weights[key] === "number" ? weights[key] : 1,
      concernLabel: concernLabels[key] || defaultConcernLabel(key),
      inputComposition,
      source: !df ? makeSource(fm?.form, "form") || makeSource(fm?.vision, "vision") : void 0,
      formSource: df ? makeSource(fm?.form, "form") : void 0,
      visionSource: df ? makeSource(fm?.vision, "vision") : void 0,
      formWeight: df ? Math.round(df.form * 100) : 100,
      visionWeight: df ? Math.round(df.vision * 100) : 0,
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
function useVisionFields() {
  const [conditions, setConditions] = React9.useState([]);
  React9.useEffect(() => {
    fetch("/api/skin-conditions").then((res) => res.json()).then((data) => {
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setConditions(list);
    }).catch(() => {
    });
  }, []);
  return React9.useMemo(
    () => conditions.flatMap(
      (c) => (c.visionCapabilities || []).map((cap) => ({ code: cap, label: `${c.name} (${cap})` }))
    ),
    [conditions]
  );
}
var fieldCls = "w-full h-8 rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring disabled:opacity-50";
var SourcePicker = ({ label, origin, onOriginChange, value, onChange, disabled }) => {
  const visionFields = useVisionFields();
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx("label", { className: "block text-[10px] font-semibold text-muted-foreground", children: label }),
      onOriginChange && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex gap-1", children: ["form", "vision"].map((o) => /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          disabled,
          onClick: () => onOriginChange(o),
          className: `px-1.5 py-0.5 rounded text-[9px] font-semibold border ${origin === o ? "border-beak bg-beak/10 text-beak" : "border-border text-muted-foreground"}`,
          children: o
        },
        o
      )) })
    ] }),
    origin === "form" ? /* @__PURE__ */ jsxRuntime.jsx(
      shared.DimensionSelect,
      {
        value: value?.fieldCode || "",
        disabled,
        onChange: (code, meta) => onChange(code ? { origin: "form", fieldCode: code, label: meta?.name || code } : void 0),
        label: ""
      }
    ) : /* @__PURE__ */ jsxRuntime.jsxs(
      "select",
      {
        disabled,
        value: value?.fieldCode || "",
        onChange: (e) => {
          const code = e.target.value;
          const meta = visionFields.find((f) => f.code === code);
          onChange(code ? { origin: "vision", fieldCode: code, label: meta?.label || code } : void 0);
        },
        className: fieldCls,
        children: [
          /* @__PURE__ */ jsxRuntime.jsx("option", { value: "", children: "\u2014 pilih field CV (dari ref_skin_conditions) \u2014" }),
          visionFields.map((f) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: f.code, children: f.label }, f.code))
        ]
      }
    )
  ] });
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
  const [open, setOpen] = React9.useState(defaultOpen);
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
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-lg border border-border bg-card", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2 px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setOpen((v) => !v),
          className: "flex flex-1 items-center gap-2 text-left",
          children: [
            open ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDown, { className: "h-4 w-4 text-muted-foreground shrink-0" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronRight, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-sm font-semibold text-foreground", children: axis.name || axis.dimensionKey.toUpperCase() }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[11px] text-muted-foreground", children: share !== null ? `\u2248${share}% of overall` : `weight ${axis.weight}` }),
            /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-[11px] text-muted-foreground", children: [
              "\xB7 ",
              concern
            ] })
          ]
        }
      ),
      canDelete && /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          disabled,
          onClick: onDelete,
          className: "p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted/40 rounded transition-colors disabled:opacity-30",
          title: "Remove dimension",
          children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { className: "h-4 w-4" })
        }
      )
    ] }),
    open && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "border-t border-border p-3 space-y-3", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          shared.DimensionSelect,
          {
            value: axis.dimensionKey,
            disabled,
            onChange: handleDimensionChange,
            label: "Dimension"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: "block text-[11px] font-semibold text-muted-foreground", children: "Weight" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              shared.InfoTooltip,
              {
                content: share !== null ? `Relative to the other dimensions \u2014 counts as \u2248${share}% of the overall score.` : "Relative to the other dimensions.",
                label: "About weight",
                iconClassName: "h-3 w-3"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(
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
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
          /* @__PURE__ */ jsxRuntime.jsx("label", { className: "block text-[11px] font-semibold text-muted-foreground", children: "Concern label" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            shared.InfoTooltip,
            {
              content: "Shown when this dimension is the customer\u2019s dominant concern.",
              label: "About concern label",
              iconClassName: "h-3 w-3"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(
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
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[10px] text-muted-foreground italic", children: "How this axis's number is computed (form/vision source, blend %) and turned into a letter (bands) is set in the Blending tab, not here." })
    ] })
  ] });
};
var ClinicalAxisCard = ClinicalDimensionCard;
var fieldCls2 = "h-8 rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring disabled:opacity-50";
var BlendingTab = ({
  rulesets,
  selectedRuleset,
  onSelectRuleset,
  onSaveRuleset
}) => {
  const activeRuleset = selectedRuleset || rulesets[0] || null;
  const [axes, setAxes] = React9.useState([]);
  const [profileConfig, setProfileConfig] = React9.useState(null);
  const [scoreRangeBands, setScoreRangeBands] = React9.useState(null);
  const [severityBands, setSeverityBands] = React9.useState(null);
  const [isSaving, setIsSaving] = React9.useState(false);
  const [saveSuccess, setSaveSuccess] = React9.useState(false);
  const [saveError, setSaveError] = React9.useState(null);
  React9.useEffect(() => {
    if (activeRuleset && activeRuleset.schema) {
      try {
        const decompiled = decompileJDMToVisualComponents(activeRuleset.schema);
        setAxes(decompiled.axes);
        setProfileConfig(decompiled.profileConfig);
        setScoreRangeBands(decompiled.scoreRangeBands);
        setSeverityBands(decompiled.severityBands);
        setSaveError(null);
      } catch (err) {
        setSaveError("Could not read this ruleset: " + (err instanceof Error ? err.message : "invalid schema"));
      }
    }
  }, [activeRuleset]);
  const updateAxis = (id, patch) => setAxes((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a));
  const handleSave = async () => {
    if (!activeRuleset || !profileConfig || !scoreRangeBands || !severityBands) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      const updatedSchema = compileVisualToJDM(axes, profileConfig, scoreRangeBands, severityBands, activeRuleset.schema);
      await onSaveRuleset({
        id: activeRuleset.id,
        code: activeRuleset.code,
        title: activeRuleset.title,
        description: activeRuleset.description,
        brandId: activeRuleset.brandId,
        applicationId: activeRuleset.applicationId,
        status: activeRuleset.status,
        schema: updatedSchema
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3e3);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save blending weights");
    } finally {
      setIsSaving(false);
    }
  };
  if (!activeRuleset) {
    return /* @__PURE__ */ jsxRuntime.jsx(
      shared.EmptyState,
      {
        icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Sliders, { className: "h-6 w-6 text-muted-foreground" }),
        title: "No grading model selected",
        description: "Create or pick a grading model to set its blending weights.",
        className: "py-16 rounded-lg border border-border bg-card"
      }
    );
  }
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-lg border border-border bg-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs font-semibold text-muted-foreground whitespace-nowrap", children: "Grading model" }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "select",
          {
            value: activeRuleset.id,
            onChange: (e) => {
              const r = rulesets.find((item) => item.id === e.target.value);
              if (r) onSelectRuleset(r);
            },
            className: "h-8 max-w-md w-full truncate rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring",
            style: { colorScheme: "dark" },
            children: rulesets.map((r) => /* @__PURE__ */ jsxRuntime.jsxs("option", { value: r.id, children: [
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
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [
        saveSuccess && /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-xs text-beak flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Check, { className: "h-3.5 w-3.5" }),
          "Saved"
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(shared.Button, { variant: "primary", size: "sm", onClick: handleSave, isLoading: isSaving, children: isSaving ? "Saving\u2026" : "Save blending" })
      ] })
    ] }),
    saveError && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-3 rounded-md border border-destructive/40 bg-destructive/10 text-xs text-destructive flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx(lucideReact.AlertTriangle, { className: "h-4 w-4 shrink-0" }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { children: saveError })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-lg border border-border bg-card p-4 space-y-1", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-sm font-bold text-foreground", children: "Per-dimension blend" }),
        /* @__PURE__ */ jsxRuntime.jsx(
          shared.InfoTooltip,
          {
            content: "For each dimension, how much of its score comes from the questionnaire (form) vs. vision (camera analysis). Only applies once vision_signals is sent for that dimension \u2014 a form-only dimension with no matching vision_signals key ignores this and stays 100% form regardless of the slider.",
            label: "About blending"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[11px] text-muted-foreground", children: "e.g. set Sebum to 0% form / 100% vision to trust vision fully for that dimension." })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-lg border border-border bg-card divide-y divide-border", children: [
      axes.length === 0 && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-6 text-center text-xs text-muted-foreground italic", children: "This ruleset has no dimensions yet \u2014 add some in Skin Grading first." }),
      axes.map((axis) => {
        const formW = axis.formWeight ?? 50;
        const composition = axis.inputComposition || (axis.source ? "single_source" : axis.formSource || axis.visionSource ? "weighted_blend" : "single_source");
        const singleOrigin = axis.source?.origin || "form";
        const bands = axis.bands || [];
        const updateBand = (id, patch) => updateAxis(axis.id, { bands: bands.map((b) => b.id === id ? { ...b, ...patch } : b) });
        const addBand = () => updateAxis(axis.id, { bands: [...bands, { id: `b_${Date.now()}`, min: 0, max: 100, letter: "" }] });
        const removeBand = (id) => updateAxis(axis.id, { bands: bands.filter((b) => b.id !== id) });
        return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-3.5 space-y-3", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-sm font-semibold text-foreground block", children: axis.name || axis.dimensionKey.toUpperCase() }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center gap-1.5 bg-muted/40 p-1 rounded-md border border-border w-fit", children: ["single_source", "weighted_blend"].map((c) => /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              type: "button",
              onClick: () => updateAxis(axis.id, { inputComposition: c }),
              className: `px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${composition === c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
              children: c === "single_source" ? "Single source" : "Weighted blend"
            },
            c
          )) }),
          composition === "single_source" ? /* @__PURE__ */ jsxRuntime.jsx(
            SourcePicker,
            {
              label: "Sumber",
              origin: singleOrigin,
              onOriginChange: (o) => updateAxis(axis.id, { source: axis.source ? { ...axis.source, origin: o, fieldCode: "" } : { origin: o, fieldCode: "", label: "" } }),
              value: axis.source,
              onChange: (source) => updateAxis(axis.id, { source })
            }
          ) : /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between text-[11px]", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-foreground", children: [
                "Form ",
                formW,
                "%"
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-muted-foreground", children: [
                "Vision ",
                100 - formW,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                type: "range",
                min: 0,
                max: 100,
                step: 5,
                value: formW,
                onChange: (e) => updateAxis(axis.id, { formWeight: Number(e.target.value) }),
                className: "w-full h-1.5 rounded appearance-none cursor-pointer bg-muted accent-[#d97706]"
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntime.jsx(SourcePicker, { label: "Form source", origin: "form", value: axis.formSource, onChange: (source) => updateAxis(axis.id, { formSource: source }) }),
              /* @__PURE__ */ jsxRuntime.jsx(SourcePicker, { label: "Vision source", origin: "vision", value: axis.visionSource, onChange: (source) => updateAxis(axis.id, { visionSource: source }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "pt-2 border-t border-border space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntime.jsx("label", { className: "block text-[10px] font-semibold text-muted-foreground", children: "Bands (axis & threshold)" }),
              /* @__PURE__ */ jsxRuntime.jsx(
                shared.InfoTooltip,
                {
                  content: "Health-oriented (100 = optimal). Exactly 2 bands compiles to a simple threshold; 3+ compiles to a small rule table (e.g. Pore Severity's Smooth/Visible/Enlarged). Bands should be ordered and cover 0-100 with no gaps.",
                  label: "About bands"
                }
              )
            ] }),
            bands.map((b) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntime.jsx("input", { type: "number", min: 0, max: 100, value: b.min, onChange: (e) => updateBand(b.id, { min: Number(e.target.value) }), className: fieldCls2 + " w-16 text-center" }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-muted-foreground text-[10px]", children: "\u2013" }),
              /* @__PURE__ */ jsxRuntime.jsx("input", { type: "number", min: 0, max: 100, value: b.max, onChange: (e) => updateBand(b.id, { max: Number(e.target.value) }), className: fieldCls2 + " w-16 text-center" }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-muted-foreground text-[10px]", children: "\u2192" }),
              /* @__PURE__ */ jsxRuntime.jsx("input", { type: "text", maxLength: 12, value: b.letter, onChange: (e) => updateBand(b.id, { letter: e.target.value.toUpperCase() }), placeholder: "D", className: fieldCls2 + " flex-1 min-w-0 text-center font-bold text-beak" }),
              /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", onClick: () => removeBand(b.id), className: "p-1 text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { className: "h-3.5 w-3.5" }) })
            ] }, b.id)),
            /* @__PURE__ */ jsxRuntime.jsxs("button", { type: "button", onClick: addBand, className: "flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border rounded", children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { className: "h-3 w-3" }),
              "Add band"
            ] })
          ] })
        ] }, axis.id);
      })
    ] })
  ] });
};
var card = "rounded-lg border border-border bg-card p-4";
var sliderCls = "w-full h-1.5 rounded appearance-none cursor-pointer bg-muted accent-[#d97706]";
var ScoreSimulatorTab = ({
  rulesets,
  selectedRuleset,
  onSelectRuleset
}) => {
  const activeRuleset = selectedRuleset || rulesets[0] || null;
  const rulesetDims = React9.useMemo(() => {
    if (!activeRuleset?.schema) return [];
    try {
      const s = JSON.parse(activeRuleset.schema);
      const keys = /* @__PURE__ */ new Set([
        ...Object.keys(s.dimension_weights || {}),
        ...Object.keys(s.concern_labels || {}),
        ...Object.keys(s.axis_codes || {})
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
  const fieldMapping = React9.useMemo(() => {
    try {
      return JSON.parse(activeRuleset?.schema || "{}").field_mapping || {};
    } catch {
      return {};
    }
  }, [activeRuleset]);
  const dimensionFusion = React9.useMemo(() => {
    try {
      return JSON.parse(activeRuleset?.schema || "{}").dimension_fusion || {};
    } catch {
      return {};
    }
  }, [activeRuleset]);
  const ageAxisKeys = React9.useMemo(() => rulesetDims.filter((d) => fieldMapping[d]?.form === "age_over_30"), [rulesetDims, fieldMapping]);
  const formDims = React9.useMemo(
    () => rulesetDims.filter((d) => !ageAxisKeys.includes(d) && (fieldMapping[d]?.form || !fieldMapping[d]?.vision)),
    [rulesetDims, fieldMapping, ageAxisKeys]
  );
  const visionDims = React9.useMemo(() => rulesetDims.filter((d) => fieldMapping[d]?.vision), [rulesetDims, fieldMapping]);
  const formDimsKey = formDims.join(",");
  const visionDimsKey = visionDims.join(",");
  const [questionnaireValues, setQuestionnaireValues] = React9.useState({});
  const [visionValues, setVisionValues] = React9.useState({});
  const [respondentAge, setRespondentAge] = React9.useState(25);
  React9.useEffect(() => {
    setQuestionnaireValues((prev) => {
      const next = {};
      for (const d of formDims) next[d] = prev[d] ?? 50;
      return next;
    });
  }, [formDimsKey]);
  React9.useEffect(() => {
    setVisionValues((prev) => {
      const next = {};
      for (const d of visionDims) next[d] = prev[d] ?? 50;
      return next;
    });
  }, [visionDimsKey]);
  const dimensionScores = React9.useMemo(() => {
    const out = {};
    for (const d of rulesetDims) {
      const isAgeForm = ageAxisKeys.includes(d);
      const formVal = isAgeForm ? respondentAge <= 30 ? 100 : 0 : questionnaireValues[d];
      const visionVal = visionValues[d];
      const df = dimensionFusion[d];
      if (df) {
        const fw = typeof df.form === "number" ? df.form : 0.5;
        const vw = typeof df.vision === "number" ? df.vision : 0.5;
        out[d] = Math.round(((formVal ?? 50) * fw + (visionVal ?? 50) * vw) * 10) / 10;
      } else if (fieldMapping[d]?.vision && !fieldMapping[d]?.form) {
        out[d] = visionVal ?? 50;
      } else {
        out[d] = formVal ?? 50;
      }
    }
    return out;
  }, [rulesetDims, ageAxisKeys, questionnaireValues, visionValues, dimensionFusion, fieldMapping, respondentAge]);
  const rulesetSafetyFlags = React9.useMemo(() => {
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
  const formSurveyCode = React9.useMemo(() => {
    try {
      return JSON.parse(activeRuleset?.schema || "{}").form_survey_code || "";
    } catch {
      return "";
    }
  }, [activeRuleset]);
  const [surveySafetyFlags, setSurveySafetyFlags] = React9.useState([]);
  React9.useEffect(() => {
    if (!activeRuleset?.brandId || !activeRuleset?.applicationId) {
      setSurveySafetyFlags([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/core/form-engine/survey?brand_id=${encodeURIComponent(activeRuleset.brandId)}&application_id=${encodeURIComponent(activeRuleset.applicationId)}`
        );
        if (!res.ok) return;
        const allSurveys = await res.json();
        const surveys = formSurveyCode ? allSurveys.filter((s) => s.code === formSurveyCode) : allSurveys;
        const flags = /* @__PURE__ */ new Set();
        for (const survey of surveys || []) {
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
        if (!cancelled) setSurveySafetyFlags(Array.from(flags));
      } catch {
        if (!cancelled) setSurveySafetyFlags([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeRuleset?.brandId, activeRuleset?.applicationId, formSurveyCode]);
  const allSafetyFlags = React9.useMemo(
    () => Array.from(/* @__PURE__ */ new Set([...rulesetSafetyFlags, ...surveySafetyFlags])),
    [rulesetSafetyFlags, surveySafetyFlags]
  );
  const [selectedConditions, setSelectedConditions] = React9.useState({});
  React9.useEffect(() => {
    setSelectedConditions((prev) => {
      const keys = allSafetyFlags.length > 0 ? allSafetyFlags : ["is_pregnant", "uses_retinol"];
      const next = {};
      for (const k of keys) next[k] = prev[k] ?? false;
      return next;
    });
  }, [allSafetyFlags]);
  const [simResponse, setSimResponse] = React9.useState(null);
  const [copiedReq, setCopiedReq] = React9.useState(false);
  const SIMULATE_PATH = "/core/score-engine/simulate";
  const requestBody = React9.useMemo(
    () => JSON.stringify(
      {
        schema: activeRuleset?.schema ?? "",
        dimension_scores: dimensionScores,
        customer_condition: selectedConditions
      },
      null,
      2
    ),
    [activeRuleset, dimensionScores, selectedConditions]
  );
  const copyRequest = () => {
    navigator.clipboard?.writeText(requestBody);
    setCopiedReq(true);
    setTimeout(() => setCopiedReq(false), 1500);
  };
  const runSimulation = React9.useCallback(async () => {
    if (!activeRuleset?.schema) return;
    try {
      const res = await fetch(SIMULATE_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schema: activeRuleset.schema,
          dimension_scores: dimensionScores,
          customer_condition: selectedConditions
        })
      });
      if (res.ok) setSimResponse(await res.json());
    } catch (err) {
      console.error("Simulation request failed", err);
    }
  }, [activeRuleset, dimensionScores, selectedConditions]);
  React9.useEffect(() => {
    const timer = setTimeout(runSimulation, 250);
    return () => clearTimeout(timer);
  }, [runSimulation]);
  const axisValues = simResponse?.result?.axis_values || {};
  const traits = simResponse?.result?.traits || {};
  const scoreRange = simResponse?.result?.score_range || "";
  const severityLevel = simResponse?.result?.severity_level || "";
  const skinConcern = simResponse?.result?.skin_concern;
  const axisOutputDims = React9.useMemo(() => {
    if (!activeRuleset?.schema) return [];
    try {
      const s = JSON.parse(activeRuleset.schema);
      const keys = new Set(Object.keys(s.axis_codes || {}));
      for (const node of s.nodes || []) {
        if (node?.type !== "decisionTableNode") continue;
        const content = typeof node.content === "string" ? JSON.parse(node.content) : node.content;
        for (const output of content?.outputs || []) {
          const field2 = String(output?.field || "");
          if (field2.startsWith("axis_values.")) {
            keys.add(field2.slice("axis_values.".length).toLowerCase());
          }
        }
      }
      return Array.from(keys);
    } catch {
      return [];
    }
  }, [activeRuleset]);
  const BAUMANN_AXIS_ORDER = ["sebum", "oiliness", "sensitivity", "pigmentation", "aging", "wrinkle"];
  const orderedDims = React9.useMemo(() => {
    const known = BAUMANN_AXIS_ORDER.filter((k) => axisOutputDims.includes(k));
    const rest = axisOutputDims.filter((k) => !BAUMANN_AXIS_ORDER.includes(k));
    return [...known, ...rest];
  }, [axisOutputDims]);
  const generatedCode = React9.useMemo(() => {
    if (orderedDims.length === 0) return "CUSTOM";
    return orderedDims.map((k) => axisValues[k.toUpperCase()] || "-").join("");
  }, [axisValues, orderedDims]);
  const traitsList = React9.useMemo(() => Object.values(traits).filter(Boolean), [traits]);
  const profile = simResponse?.result?.skin_profile;
  const profileStrategyIsAxisBased = React9.useMemo(() => {
    try {
      const s = JSON.parse(activeRuleset?.schema || "{}");
      const profileNode = (s.nodes || []).find((n) => {
        const c2 = typeof n?.content === "string" ? JSON.parse(n.content) : n?.content;
        return (c2?.outputs || []).some((o) => o?.field === "skin_profile.code");
      });
      if (!profileNode) return false;
      const c = typeof profileNode.content === "string" ? JSON.parse(profileNode.content) : profileNode.content;
      return (c?.inputs || []).some((i) => String(i?.field || "").startsWith("axis_values."));
    } catch {
      return false;
    }
  }, [activeRuleset]);
  const hasAxes = axisOutputDims.length > 0;
  const useAxisProfile = hasAxes && !profileStrategyIsAxisBased;
  const profileCode = useAxisProfile ? generatedCode : profile?.code || generatedCode;
  const profileName = useAxisProfile ? orderedDims.map((k) => k.charAt(0).toUpperCase() + k.slice(1)).join(" \xB7 ") || "Baumann Skin Character" : profile?.name || traitsList.join(" \xB7 ") || "Answer to see a profile";
  const totalScore = Math.round(simResponse?.result?.total_score || 0);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col lg:flex-row gap-5 items-start", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "w-full lg:w-80 lg:shrink-0 space-y-3 min-w-0", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: card + " space-y-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "block text-xs font-semibold text-muted-foreground", children: "Grading model" }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "select",
          {
            value: activeRuleset?.id || "",
            onChange: (e) => {
              const r = rulesets.find((item) => item.id === e.target.value);
              if (r) onSelectRuleset(r);
            },
            className: "w-full h-9 rounded-md bg-muted/40 border border-border px-3 text-foreground text-xs outline-none focus:border-ring",
            style: { colorScheme: "dark" },
            children: rulesets.map((r) => /* @__PURE__ */ jsxRuntime.jsxs("option", { value: r.id, children: [
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
      ageAxisKeys.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: card + " space-y-2", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-sm font-bold text-foreground", children: "Usia" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            shared.InfoTooltip,
            {
              content: "Bukan slider form biasa \u2014 dihitung dari date_of_birth di kuisioner data pribadi, bukan Q1-Q6. Dipakai axis: aging.",
              label: "About Usia"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between text-xs mb-1", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-foreground", children: "Umur (tahun)" }),
          /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-beak font-semibold font-mono", children: [
            respondentAge,
            " (",
            respondentAge <= 30 ? "sehat" : "faktor W",
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "range",
            min: 13,
            max: 70,
            value: respondentAge,
            onChange: (e) => setRespondentAge(Number(e.target.value)),
            className: sliderCls
          }
        )
      ] }),
      formDims.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: card + " space-y-3", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-sm font-bold text-foreground", children: "Questionnaire result" }),
          /* @__PURE__ */ jsxRuntime.jsx(shared.InfoTooltip, { content: "Per-dimensi, hanya yang dihitung dari kuisioner (form_source).", label: "About questionnaire result" })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "space-y-3", children: formDims.map((dimKey) => /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between text-xs mb-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-foreground", children: dimKey }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-beak font-semibold font-mono", children: questionnaireValues[dimKey] ?? 50 })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              type: "range",
              min: 0,
              max: 100,
              value: questionnaireValues[dimKey] ?? 50,
              onChange: (e) => setQuestionnaireValues((p) => ({ ...p, [dimKey]: Number(e.target.value) })),
              className: sliderCls
            }
          )
        ] }, dimKey)) })
      ] }),
      visionDims.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: card + " space-y-3", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-sm font-bold text-foreground", children: "Vision result" }),
          /* @__PURE__ */ jsxRuntime.jsx(shared.InfoTooltip, { content: "Per-dimensi, hanya yang dihitung dari foto vendor (vision_source).", label: "About vision result" })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "space-y-3", children: visionDims.map((dimKey) => /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between text-xs mb-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-foreground", children: dimKey }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-beak font-semibold font-mono", children: visionValues[dimKey] ?? 50 })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              type: "range",
              min: 0,
              max: 100,
              value: visionValues[dimKey] ?? 50,
              onChange: (e) => setVisionValues((p) => ({ ...p, [dimKey]: Number(e.target.value) })),
              className: sliderCls
            }
          )
        ] }, dimKey)) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: card + " space-y-3", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-sm font-bold text-foreground", children: "Dimension scores" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              shared.InfoTooltip,
              {
                content: "Hasil FINAL per axis \u2014 sudah lewat normalisasi + blend form/vision sesuai bobot di Blending tab. Read-only, ini yang beneran dipakai buat klasifikasi di bawah.",
                label: "About dimension scores"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-[11px] text-muted-foreground font-mono", children: [
            "overall ",
            totalScore
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "space-y-1.5", children: Object.keys(dimensionScores).map((dimKey) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-foreground", children: dimKey }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-beak font-semibold font-mono", children: dimensionScores[dimKey] })
        ] }, dimKey)) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: card + " space-y-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-sm font-bold text-foreground", children: "Safety flags" }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "grid grid-cols-2 gap-2 text-xs", children: Object.entries(selectedConditions).map(([key, isChecked]) => /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setSelectedConditions((p) => ({ ...p, [key]: !p[key] })),
            className: `p-2.5 rounded-md border text-left transition-colors flex items-center justify-between ${isChecked ? "border-beak/50 bg-beak/10 text-beak" : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"}`,
            children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { children: key }),
              /* @__PURE__ */ jsxRuntime.jsx(
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
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full lg:flex-1 space-y-3 min-w-0", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: card, children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-sm font-bold text-foreground", children: "Result" }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
          simResponse?.performance && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[11px] text-muted-foreground font-mono", children: simResponse.performance }),
          /* @__PURE__ */ jsxRuntime.jsxs(
            "button",
            {
              type: "button",
              onClick: copyRequest,
              title: `POST ${SIMULATE_PATH}`,
              className: "flex items-center gap-1 rounded border border-border bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-beak/50",
              children: [
                copiedReq ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Check, { className: "h-3 w-3 text-beak" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Copy, { className: "h-3 w-3" }),
                copiedReq ? "Copied" : "Copy request"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "mt-1 text-[10px] text-muted-foreground font-mono", children: [
        "POST ",
        SIMULATE_PATH
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-3 rounded-md border border-border bg-muted/20 p-4 text-center", children: [
        profile?.category && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[10px] font-semibold text-muted-foreground", children: profile.category }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-2xl font-black tracking-tight text-foreground font-mono my-1", children: profileCode }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-xs font-semibold text-foreground", children: profileName }),
        profile?.description && /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[11px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed", children: profile.description }),
        traitsList.length > 0 && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap items-center justify-center gap-1.5 mt-3 pt-3 border-t border-border", children: traitsList.map((t) => /* @__PURE__ */ jsxRuntime.jsx(
          "span",
          {
            className: "text-[11px] text-muted-foreground bg-card px-2 py-0.5 rounded border border-border",
            children: String(t)
          },
          String(t)
        )) })
      ] }),
      Object.keys(axisValues).length > 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h4", { className: "text-[11px] font-semibold text-muted-foreground mb-2", children: "Axis codes" }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap gap-2 text-xs", children: Object.entries(axisValues).map(([axis, val]) => /* @__PURE__ */ jsxRuntime.jsxs(
          "div",
          {
            className: "min-w-[4.5rem] flex-1 rounded-md border border-border bg-muted/20 p-2.5 text-center",
            children: [
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-muted-foreground text-[10px] truncate", children: axis }),
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-sm font-bold text-beak font-mono mt-0.5", children: String(val) })
            ]
          },
          axis
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-4 flex flex-wrap gap-2 text-xs", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "min-w-[8rem] flex-1 rounded-md border border-border bg-muted/20 p-2.5", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-[10px] text-muted-foreground", children: "Overall score" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-sm font-bold text-foreground font-mono mt-0.5", children: totalScore }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-[10px] text-muted-foreground", children: "100 = optimal" })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "min-w-[8rem] flex-1 rounded-md border border-border bg-muted/20 p-2.5", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-[10px] text-muted-foreground", children: "Score Range" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-sm font-semibold text-foreground mt-0.5", children: scoreRange || "\u2014" })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "min-w-[8rem] flex-1 rounded-md border border-border bg-muted/20 p-2.5", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-[10px] text-muted-foreground", children: "Severity Level" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-sm font-semibold text-beak mt-0.5", children: severityLevel || "\u2014" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-3 rounded-md border border-border bg-muted/20 p-2.5 text-xs", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-[10px] text-muted-foreground mb-0.5", children: "Skin Concern" }),
        skinConcern ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-semibold text-foreground", children: skinConcern.label }),
          /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-muted-foreground font-mono", children: [
            skinConcern.dimension,
            " \xB7 ",
            Math.round(skinConcern.score ?? 0)
          ] })
        ] }) : /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-muted-foreground", children: "No dominant concern (optimal)" })
      ] })
    ] }) })
  ] });
};
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
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-md border border-border bg-card divide-y divide-border", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 bg-muted/20 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "w-24 shrink-0", children: "Score" }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-1", children: "Label" }),
      !fixed && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "w-6 shrink-0", "aria-hidden": "true" })
    ] }),
    bands.map((b, idx) => {
      const lower = idx === 0 ? 0 : bands[idx - 1].max + 1;
      return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2 px-3 py-2", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex w-24 shrink-0 items-center gap-1 text-xs tabular-nums text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "w-6 text-right", children: lower }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { children: "\u2013" }),
          /* @__PURE__ */ jsxRuntime.jsx(
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
        /* @__PURE__ */ jsxRuntime.jsx(
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
        !fixed && /* @__PURE__ */ jsxRuntime.jsx(
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
    !fixed && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-3 py-1.5", children: /* @__PURE__ */ jsxRuntime.jsx(
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
var ProfileMappingTable = ({
  axes,
  config,
  onChange,
  disabled = false
}) => {
  const { strategy, profiles } = config;
  const [expandedRows, setExpandedRows] = React9.useState({});
  const [cache, setCache] = React9.useState({});
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
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-card p-3.5 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-sm font-bold text-foreground block", children: "How the profile is chosen" }),
        /* @__PURE__ */ jsxRuntime.jsx(
          shared.InfoTooltip,
          {
            content: "Sets skin_profile.code and skin_profile.name \u2014 a different result than Score Range and Severity Level above, which only set score_range and severity_level. 'Total Score' reads the same overall score as those two, just to pick a different output.",
            label: "About profile strategy"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5 bg-muted/40 p-1 rounded-md border border-border shrink-0", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            disabled,
            onClick: () => handleStrategyChange("total_score"),
            className: `px-3 py-1.5 rounded text-xs font-semibold transition-colors ${strategy === "total_score" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"}`,
            children: "Total Score"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            disabled,
            onClick: () => handleStrategyChange("combination_matrix"),
            className: `px-3 py-1.5 rounded text-xs font-semibold transition-colors ${strategy === "combination_matrix" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"}`,
            children: "Combination Matrix"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
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
    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[11px] text-muted-foreground -mt-2", children: "Only the highlighted method above is saved to this ruleset \u2014 the other two are kept in this browser tab so you can switch back without losing what you typed, but they're discarded on reload." }),
    strategy === "total_score" && /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-[11px] text-muted-foreground bg-muted/40 border border-border rounded-lg px-3 py-2", children: [
      `"Trigger range" reads the same overall score as the Score Range / Severity Level labels above, but this table picks the profile's own`,
      " ",
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono", children: "skin_profile.code" }),
      " /",
      " ",
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono", children: "skin_profile.name" }),
      " \u2014 a different result than",
      " ",
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono", children: "score_range" }),
      " /",
      " ",
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono", children: "severity_level" }),
      ". Editing one does not change the others."
    ] }),
    strategy === "combination_matrix" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between bg-muted/40 border border-border p-2.5 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-xs text-muted-foreground", children: [
        "One row per combination of ",
        axes.length,
        " dimensions (",
        profiles.length,
        " rows)."
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(
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
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "border border-border rounded-lg overflow-hidden bg-card", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntime.jsxs(
        "table",
        {
          className: `${wide ? "min-w-full" : "w-full"} text-left text-xs border-collapse`,
          style: wide ? { width: "max-content" } : void 0,
          children: [
            /* @__PURE__ */ jsxRuntime.jsx("thead", { children: /* @__PURE__ */ jsxRuntime.jsxs("tr", { className: "bg-muted/40 border-b border-border text-[11px] text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntime.jsx("th", { className: "py-2.5 px-3 text-center", style: { width: 40 }, children: "#" }),
              strategy === "total_score" && /* @__PURE__ */ jsxRuntime.jsx("th", { className: "py-2.5 px-3", style: { minWidth: 160 }, children: "Trigger range" }),
              strategy === "combination_matrix" && axes.map((a) => {
                const letters = axisLetters(a);
                const bipolar = !!(a.axisCodeLow?.trim() && a.axisCodeHigh?.trim());
                return /* @__PURE__ */ jsxRuntime.jsxs(
                  "th",
                  {
                    className: "py-2.5 px-3 text-center whitespace-nowrap",
                    style: { minWidth: 120 },
                    children: [
                      a.name || a.dimensionKey,
                      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "block text-[10px] font-normal text-muted-foreground", children: bipolar ? letters.join(" / ") : "O / S / P" })
                    ]
                  },
                  a.id
                );
              }),
              strategy === "primary_concern" && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
                /* @__PURE__ */ jsxRuntime.jsx("th", { className: "py-2.5 px-3", style: { minWidth: 224 }, children: "Dimension" }),
                /* @__PURE__ */ jsxRuntime.jsx("th", { className: "py-2.5 px-3", style: { minWidth: 150 }, children: "Level" })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsx("th", { className: "py-2.5 px-3", style: { minWidth: 150 }, children: "Code" }),
              /* @__PURE__ */ jsxRuntime.jsx("th", { className: "py-2.5 px-3", style: { minWidth: 240 }, children: "Name" }),
              /* @__PURE__ */ jsxRuntime.jsx("th", { className: "py-2.5 px-3 text-center", style: { width: 80 } })
            ] }) }),
            /* @__PURE__ */ jsxRuntime.jsx("tbody", { className: "divide-y divide-border", children: profiles.map((p, pIdx) => {
              const isExpanded = !!expandedRows[p.id];
              return /* @__PURE__ */ jsxRuntime.jsxs(React9__default.default.Fragment, { children: [
                /* @__PURE__ */ jsxRuntime.jsxs("tr", { className: "hover:bg-muted/40 transition-colors", children: [
                  /* @__PURE__ */ jsxRuntime.jsx("td", { className: "py-2.5 px-3 text-center text-muted-foreground font-semibold", children: pIdx + 1 }),
                  strategy === "total_score" && /* @__PURE__ */ jsxRuntime.jsx("td", { className: "py-2.5 px-3", children: /* @__PURE__ */ jsxRuntime.jsx(
                    shared.ScoreRangeInput,
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
                    return /* @__PURE__ */ jsxRuntime.jsx("td", { className: "py-2.5 px-3 text-center", children: /* @__PURE__ */ jsxRuntime.jsx(
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
                  strategy === "primary_concern" && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntime.jsx("td", { className: "py-2 px-3 align-middle", children: /* @__PURE__ */ jsxRuntime.jsx(
                      shared.DimensionSelect,
                      {
                        label: "",
                        value: p.primaryDimension || axes[0]?.dimensionKey || "sebum",
                        disabled,
                        onChange: (dimKey) => handleUpdateProfile(p.id, "primaryDimension", dimKey)
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntime.jsx("td", { className: "py-2 px-3 align-middle", children: /* @__PURE__ */ jsxRuntime.jsx(
                      shared.SeveritySelect,
                      {
                        value: p.severityLevel || "Parah",
                        disabled,
                        onChange: (sev) => handleUpdateProfile(p.id, "severityLevel", sev)
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsx("td", { className: "py-2.5 px-3", style: { minWidth: 150 }, children: /* @__PURE__ */ jsxRuntime.jsx(
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
                  /* @__PURE__ */ jsxRuntime.jsx("td", { className: "py-2.5 px-3", style: { minWidth: 240 }, children: /* @__PURE__ */ jsxRuntime.jsx(
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
                  /* @__PURE__ */ jsxRuntime.jsx("td", { className: "py-2.5 px-3 text-center", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntime.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => toggleRow(p.id),
                        className: `p-1.5 rounded transition-colors ${isExpanded ? "text-beak bg-beak/10 border border-beak/40" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`,
                        title: "Show category & description",
                        children: isExpanded ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDown, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronRight, { className: "h-3.5 w-3.5" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntime.jsx(
                      "button",
                      {
                        type: "button",
                        disabled: disabled || profiles.length <= 1,
                        onClick: () => handleDeleteProfile(p.id),
                        className: "p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-30 rounded transition-colors",
                        title: "Delete Profile Row",
                        children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { className: "h-3.5 w-3.5" })
                      }
                    )
                  ] }) })
                ] }),
                isExpanded && /* @__PURE__ */ jsxRuntime.jsx("tr", { className: "bg-muted/40 border-b border-border", children: /* @__PURE__ */ jsxRuntime.jsx(
                  "td",
                  {
                    colSpan: strategy === "combination_matrix" ? axes.length + 4 : strategy === "primary_concern" ? 6 : 5,
                    className: "px-4 py-3",
                    children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3 text-xs", children: [
                      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-muted-foreground text-[11px] font-semibold block mb-1", children: "Category" }),
                        /* @__PURE__ */ jsxRuntime.jsx(
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
                      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "md:col-span-2", children: [
                        /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-muted-foreground text-[11px] font-semibold block mb-1", children: "Description" }),
                        /* @__PURE__ */ jsxRuntime.jsx(
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
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-2.5 bg-muted/40 border-t border-border flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "button",
            disabled,
            onClick: handleAddProfile,
            className: "px-2.5 py-1 bg-card hover:bg-muted text-foreground rounded text-xs font-medium flex items-center gap-1 transition-colors border border-border disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { className: "h-3 w-3" }),
              "Add profile"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-[11px] text-muted-foreground", children: [
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
var inputCls = "w-full h-9 rounded-md bg-muted/40 border border-border px-3 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:border-ring disabled:opacity-50";
var labelCls = "block text-xs font-semibold text-foreground mb-1.5";
var slugify2 = (v) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
var RulesetModal = ({
  isOpen,
  onClose,
  onSave,
  editingRuleset
}) => {
  const [name, setName] = React9.useState("");
  const [code, setCode] = React9.useState("");
  const [codeEdited, setCodeEdited] = React9.useState(false);
  const [showCodeField, setShowCodeField] = React9.useState(false);
  const [description, setDescription] = React9.useState("");
  const [brandId, setBrandId] = React9.useState("*");
  const [applicationId, setApplicationId] = React9.useState("*");
  const [status, setStatus] = React9.useState("ACTIVE");
  const [formSurveyCode, setFormSurveyCode] = React9.useState("");
  const [visionSourceCode, setVisionSourceCode] = React9.useState("");
  const [surveys, setSurveys] = React9.useState([]);
  const [axes, setAxes] = React9.useState(DEFAULT_STARTER_AXES);
  const [profileConfig, setProfileConfig] = React9.useState(DEFAULT_STARTER_PROFILES);
  const [scoreRangeBands, setScoreRangeBands] = React9.useState(DEFAULT_SCORE_RANGE_BANDS);
  const [severityBands, setSeverityBands] = React9.useState(DEFAULT_SEVERITY_BANDS);
  const [tab, setTab] = React9.useState("setup");
  const [schemaOpen, setSchemaOpen] = React9.useState(true);
  const notesRef = React9.useRef(null);
  const fitNotes = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };
  const [copied, setCopied] = React9.useState(null);
  const [isSubmitting, setIsSubmitting] = React9.useState(false);
  const [formError, setFormError] = React9.useState(null);
  const [isLegacy, setIsLegacy] = React9.useState(false);
  React9.useEffect(() => {
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
  React9.useEffect(() => {
    fitNotes(notesRef.current);
  }, [description, tab, isOpen]);
  React9.useEffect(() => {
    if (!isOpen) return;
    fetch(`/core/form-engine/survey?brand_id=${encodeURIComponent(brandId)}&application_id=${encodeURIComponent(applicationId)}`).then((res) => res.json()).then((data) => {
      const list = Array.isArray(data) ? data : Array.isArray(data?.surveys) ? data.surveys : data?.code ? [data] : [];
      setSurveys(list);
    }).catch(() => setSurveys([]));
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
  return /* @__PURE__ */ jsxRuntime.jsx(
    shared.Modal,
    {
      isOpen,
      onClose,
      title: editingRuleset ? `Edit: ${editingRuleset.title}` : "New grading model",
      maxWidth: "max-w-5xl",
      children: /* @__PURE__ */ jsxRuntime.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        isLegacy && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-3 rounded-md border border-beak/40 bg-beak/10 text-xs text-foreground flex items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.AlertTriangle, { className: "h-4 w-4 shrink-0 text-beak" }),
          /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
            "Ruleset ini dibuat dengan format lama. Dimensi, band, dan profil di bawah adalah hasil konversi terbaik \u2014 periksa dulu sebelum ",
            /* @__PURE__ */ jsxRuntime.jsx("strong", { children: "Save changes" }),
            ", karena menyimpan akan menulis ulang ruleset ke format baru."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col lg:flex-row gap-4 items-start", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "w-full lg:flex-1 min-w-0 space-y-3", children: [
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center gap-1 rounded-md border border-border bg-muted/40 p-1", children: [
              ["setup", "Setup"],
              ["dimensions", `Dimensions${axes.length ? ` (${axes.length})` : ""}`],
              ["bands", "Skin Profile"]
            ].map(([id, label]) => /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                type: "button",
                onClick: () => setTab(id),
                className: `flex-1 rounded px-3 py-1.5 text-xs font-semibold transition-colors ${tab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
                children: label
              },
              id
            )) }),
            tab === "setup" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntime.jsxs("label", { className: labelCls, children: [
                  "Name ",
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-destructive", children: "*" })
                ] }),
                /* @__PURE__ */ jsxRuntime.jsx(
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
                /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "mt-1 text-[11px] text-muted-foreground", children: [
                  "saved as ",
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-foreground font-mono", children: effectiveCode || "\u2026" }),
                  !editingRuleset && /* @__PURE__ */ jsxRuntime.jsx(
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
                showCodeField && !editingRuleset && /* @__PURE__ */ jsxRuntime.jsx(
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
                editingRuleset?.id && /* @__PURE__ */ jsxRuntime.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => copyAs("ID", editingRuleset.id),
                    title: "Copy ID \u2014 needed for PUT /core/score-engine/rulesets/:id",
                    className: "mt-1 flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground",
                    children: [
                      copied === "ID" ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Check, { className: "h-3 w-3 text-beak" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Copy, { className: "h-3 w-3" }),
                      copied === "ID" ? "ID copied" : `ID ${editingRuleset.id}`
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "max-w-xs", children: [
                /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelCls, children: "Status" }),
                /* @__PURE__ */ jsxRuntime.jsx(shared.StatusSelect, { value: status, onChange: setStatus, label: "" })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-md border border-border bg-muted/20", children: [
                /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-3 py-2 text-xs font-semibold text-muted-foreground", children: "Scope & notes" }),
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "border-t border-border p-3 space-y-3", children: [
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
                    /* @__PURE__ */ jsxRuntime.jsx(shared.BrandSelect, { value: brandId, onChange: setBrandId, includeUniversal: true, label: "Brand" }),
                    /* @__PURE__ */ jsxRuntime.jsx(
                      shared.ApplicationSelect,
                      {
                        value: applicationId,
                        onChange: setApplicationId,
                        includeUniversal: true,
                        label: "Application"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
                    /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5 mb-1.5", children: [
                        /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelCls + " mb-0", children: "Form input" }),
                        /* @__PURE__ */ jsxRuntime.jsx(
                          shared.InfoTooltip,
                          {
                            content: "Which Form Engine survey this ruleset pairs with. Scopes what shows up when adding/wiring a dimension's Form source in Blending.",
                            label: "About Form input"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxRuntime.jsxs(
                        "select",
                        {
                          value: formSurveyCode,
                          onChange: (e) => setFormSurveyCode(e.target.value),
                          className: inputCls,
                          style: { colorScheme: "dark" },
                          children: [
                            /* @__PURE__ */ jsxRuntime.jsx("option", { value: "", children: "\u2014 none selected \u2014" }),
                            surveys.map((s) => /* @__PURE__ */ jsxRuntime.jsxs("option", { value: s.code, children: [
                              s.title || s.name || s.code,
                              " (",
                              s.code,
                              ")"
                            ] }, s.code))
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5 mb-1.5", children: [
                        /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelCls + " mb-0", children: "Vision input" }),
                        /* @__PURE__ */ jsxRuntime.jsx(
                          shared.InfoTooltip,
                          {
                            content: "Which CV/vendor source this ruleset pairs with. Only one is registered today (Paradev Skin Analyzer) \u2014 more get added as new vendors are wired up.",
                            label: "About Vision input"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxRuntime.jsxs(
                        "select",
                        {
                          value: visionSourceCode,
                          onChange: (e) => setVisionSourceCode(e.target.value),
                          className: inputCls,
                          style: { colorScheme: "dark" },
                          children: [
                            /* @__PURE__ */ jsxRuntime.jsx("option", { value: "", children: "\u2014 none selected \u2014" }),
                            /* @__PURE__ */ jsxRuntime.jsx("option", { value: "paradev_skin_analyzer", children: "Paradev Skin Analyzer" })
                          ]
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelCls, children: "Notes" }),
                    /* @__PURE__ */ jsxRuntime.jsx(
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
            tab === "dimensions" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-sm font-bold text-foreground", children: "Dimensions" }),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    shared.InfoTooltip,
                    {
                      content: "Weights are relative \u2014 a dimension\u2019s share of the overall score is its weight \xF7 the total of all weights. The concern label is what the customer sees when that dimension is their dominant concern. Form/Vision blend per dimension moved to the Blending tab.",
                      label: "About dimensions"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntime.jsx(
                  shared.Button,
                  {
                    type: "button",
                    variant: "outline",
                    size: "sm",
                    onClick: addAxis,
                    leftIcon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { className: "h-3.5 w-3.5" }),
                    children: "Add dimension"
                  }
                )
              ] }),
              axes.map((axis, i) => /* @__PURE__ */ jsxRuntime.jsx(
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
            tab === "bands" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-base font-bold text-foreground", children: "Skin Profile" }),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    shared.InfoTooltip,
                    {
                      content: "Everything here is derived from the same overall score (0-100). The two label tables below just name a bracket of that score; the method further down decides skin_profile.code/name, the actual profile result.",
                      label: "About Skin Profile"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Score Range and Severity Level are two labels for the same overall score \u2014 handy for a quick badge, not required by the profile method below." })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntime.jsx("h4", { className: "text-xs font-semibold text-foreground", children: "Score Range label" }),
                    /* @__PURE__ */ jsxRuntime.jsx(
                      shared.InfoTooltip,
                      {
                        content: "Sets score_range only \u2014 a coarse 3-tier badge for the overall score.",
                        label: "About Score Range"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsx(BandTable, { bands: scoreRangeBands, onChange: setScoreRangeBands, idPrefix: "sr" })
                ] }),
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntime.jsx("h4", { className: "text-xs font-semibold text-foreground", children: "Severity Level label" }),
                    /* @__PURE__ */ jsxRuntime.jsx(
                      shared.InfoTooltip,
                      {
                        content: "Sets severity_level only \u2014 a finer 5-tier badge for the same overall score.",
                        label: "About Severity Level"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsx(BandTable, { bands: severityBands, onChange: setSeverityBands, idPrefix: "sv" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1.5 border-t border-border pt-4", children: [
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntime.jsx("h4", { className: "text-xs font-semibold text-foreground", children: "Profile method" }),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    shared.InfoTooltip,
                    {
                      content: "Decides skin_profile.code and skin_profile.name \u2014 the actual profile result, separate from the two labels above. Only one method runs at a time: they'd otherwise write conflicting values to the same code/name.",
                      label: "About profile method"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntime.jsx(ProfileMappingTable, { axes, config: profileConfig, onChange: setProfileConfig })
              ] })
            ] })
          ] }),
          !schemaOpen ? /* @__PURE__ */ jsxRuntime.jsxs(
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
                /* @__PURE__ */ jsxRuntime.jsx(lucideReact.PanelRightOpen, { className: "h-3.5 w-3.5", style: { flexShrink: 0 } }),
                /* @__PURE__ */ jsxRuntime.jsx("span", { style: { writingMode: "vertical-rl", transform: "rotate(180deg)", whiteSpace: "nowrap" }, children: "Schema & API" })
              ]
            }
          ) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full lg:w-64 lg:shrink-0", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-md border border-border bg-muted/20 lg:sticky lg:top-0", children: [
            /* @__PURE__ */ jsxRuntime.jsxs(
              "button",
              {
                type: "button",
                onClick: () => setSchemaOpen(false),
                className: "flex w-full items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground",
                children: [
                  /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Schema & API" }),
                  /* @__PURE__ */ jsxRuntime.jsx(lucideReact.PanelRightClose, { className: "h-3.5 w-3.5 shrink-0" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "border-t border-border", children: [
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap items-center gap-1.5 px-3 py-2", children: [
                { label: "Schema", text: jsonText },
                { label: "Copy request body", text: createRequestBody },
                { label: "Simulate request", text: simulateRequestBody }
              ].map(({ label, text }) => /* @__PURE__ */ jsxRuntime.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => copyAs(label, text),
                  className: "flex items-center gap-1 rounded border border-border bg-card px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-beak/50",
                  children: [
                    copied === label ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Check, { className: "h-3 w-3 text-beak" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Copy, { className: "h-3 w-3" }),
                    copied === label ? "Copied" : label
                  ]
                },
                label
              )) }),
              /* @__PURE__ */ jsxRuntime.jsx(
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
        formError && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-3 rounded-md border border-destructive/40 bg-destructive/10 text-xs text-destructive flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.AlertTriangle, { className: "h-4 w-4 shrink-0" }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { children: formError })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-end gap-2 pt-3 border-t border-border", children: [
          /* @__PURE__ */ jsxRuntime.jsx(shared.Button, { type: "button", variant: "outline", size: "sm", onClick: onClose, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntime.jsx(shared.Button, { type: "submit", variant: "primary", size: "sm", isLoading: isSubmitting, disabled: !name.trim(), children: editingRuleset ? "Save changes" : "Create" })
        ] })
      ] })
    }
  );
};
var SCORE = "/core/score-engine";
var ScoreManager = () => {
  const [activeTab, setActiveTab] = React9.useState("rulesets");
  const [searchQuery, setSearchQuery] = React9.useState("");
  const [rulesets, setRulesets] = React9.useState([]);
  const [selectedRuleset, setSelectedRuleset] = React9.useState(null);
  const [isRulesetModalOpen, setIsRulesetModalOpen] = React9.useState(false);
  const [editingRuleset, setEditingRuleset] = React9.useState(null);
  const [deleteConfirm, setDeleteConfirm] = React9.useState({
    isOpen: false,
    title: "",
    message: "",
    isLoading: false,
    onConfirm: () => {
    }
  });
  const loadRulesets = React9.useCallback(() => {
    fetch(`${SCORE}/rulesets`).then((res) => res.json()).then((data) => {
      if (Array.isArray(data.rulesets)) {
        setRulesets(data.rulesets);
        if (data.rulesets.length > 0) {
          setSelectedRuleset((prev) => prev || data.rulesets[0]);
        }
      }
    }).catch(() => {
    });
  }, []);
  React9.useEffect(() => {
    loadRulesets();
  }, [loadRulesets]);
  const scoreTabs = [
    {
      id: "rulesets",
      label: "Skin Grading",
      icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Sliders, { className: "h-4 w-4" }),
      badge: rulesets.length
    },
    {
      id: "blending",
      label: "Blending",
      icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.SlidersHorizontal, { className: "h-4 w-4" })
    },
    {
      id: "simulator",
      label: "Simulator",
      icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Play, { className: "h-4 w-4" })
    }
  ];
  const handleSaveRuleset = async (rulesetData) => {
    const isEdit = !!rulesetData.id;
    const url = isEdit ? `${SCORE}/rulesets/${rulesetData.id}` : `${SCORE}/rulesets`;
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rulesetData)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to save skin grading framework");
    }
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
          const res = await fetch(`${SCORE}/rulesets/${id}`, { method: "DELETE" });
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Failed to delete ruleset");
          }
          loadRulesets();
        } catch (err) {
          alert(err.message);
        } finally {
          setDeleteConfirm((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        }
      }
    });
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex-1 min-w-0 h-full overflow-y-auto bg-background text-foreground font-sans flex flex-col select-none", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      shared.PageHeader,
      {
        icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.FileText, { className: "h-5 w-5" }),
        breadcrumbs: [
          { label: "Workbench", href: "/api-client" },
          { label: "Core Engines" },
          { label: "Score Engine" }
        ],
        title: "Score Engine",
        children: /* @__PURE__ */ jsxRuntime.jsx(
          shared.TabNav,
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
    /* @__PURE__ */ jsxRuntime.jsxs("main", { className: "flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto", children: [
      activeTab === "rulesets" && /* @__PURE__ */ jsxRuntime.jsx(
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
      activeTab === "blending" && /* @__PURE__ */ jsxRuntime.jsx(
        BlendingTab,
        {
          rulesets,
          selectedRuleset,
          onSelectRuleset: setSelectedRuleset,
          onSaveRuleset: handleSaveRuleset
        }
      ),
      activeTab === "simulator" && /* @__PURE__ */ jsxRuntime.jsx(
        ScoreSimulatorTab,
        {
          rulesets,
          selectedRuleset,
          onSelectRuleset: setSelectedRuleset
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(
      RulesetModal,
      {
        isOpen: isRulesetModalOpen,
        onClose: () => setIsRulesetModalOpen(false),
        onSave: handleSaveRuleset,
        editingRuleset
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      shared.ConfirmDialog,
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
  const [customize, setCustomize] = React9.useState(false);
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
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-md border border-border bg-card", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between px-3 py-2 border-b border-border", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[11px] font-semibold text-muted-foreground", children: "Score \u2192 level" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          onClick: () => setCustomize((v) => !v),
          className: "text-[11px] text-muted-foreground hover:text-foreground underline",
          children: customize ? "Done" : "Customize levels"
        }
      )
    ] }),
    !customize && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "divide-y divide-border", children: tiers.map((tier) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-3 px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "w-16 shrink-0 text-xs tabular-nums text-muted-foreground", children: [
        tier.minScore,
        "\u2013",
        tier.maxScore
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(
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
      showValueCode && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "w-7 shrink-0 text-center text-xs font-semibold text-beak", children: tier.valueCode }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "w-36 shrink-0 text-right text-[11px] text-muted-foreground", children: SEV_LABEL[tier.severity] ?? tier.severity })
    ] }, tier.id)) }),
    customize && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { style: { minWidth: rowMinWidth }, children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 border-b border-border bg-muted/20 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "shrink-0", style: { width: W_RANGE }, children: "Range" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-1 min-w-0", children: "Label" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "shrink-0", style: { width: W_SEVERITY }, children: "Severity" }),
        showValueCode && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "shrink-0 text-center", style: { width: W_CODE }, children: "Code" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "shrink-0", style: { width: W_TAG }, children: "Tag" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "shrink-0", style: { width: W_DELETE }, "aria-hidden": "true" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "divide-y divide-border", children: tiers.map((tier) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2 px-3 py-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "shrink-0", style: { width: W_RANGE }, children: /* @__PURE__ */ jsxRuntime.jsx(
          shared.ScoreRangeInput,
          {
            minScore: tier.minScore,
            maxScore: tier.maxScore,
            disabled,
            onChange: (min, max) => update(tier.id, { minScore: min, maxScore: max })
          }
        ) }),
        /* @__PURE__ */ jsxRuntime.jsx(
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
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "shrink-0", style: { width: W_SEVERITY }, children: /* @__PURE__ */ jsxRuntime.jsx(
          shared.SeveritySelect,
          {
            value: tier.severity,
            disabled,
            onChange: (sev) => update(tier.id, { severity: sev })
          }
        ) }),
        showValueCode && /* @__PURE__ */ jsxRuntime.jsx(
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
        /* @__PURE__ */ jsxRuntime.jsx(
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
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            disabled: disabled || tiers.length <= 1,
            onClick: () => tiers.length > 1 && onChange(tiers.filter((t) => t.id !== tier.id)),
            className: "shrink-0 flex h-7 items-center justify-center rounded text-muted-foreground hover:text-destructive disabled:opacity-30",
            style: { width: W_DELETE },
            title: "Remove level",
            children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { className: "h-3.5 w-3.5" })
          }
        )
      ] }, tier.id)) })
    ] }) }),
    customize && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-3 py-2 border-t border-border", children: /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        type: "button",
        disabled,
        onClick: addLevel,
        className: "text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 disabled:opacity-50",
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { className: "h-3 w-3" }),
          "Add level"
        ]
      }
    ) })
  ] });
};

// src/studio/match/index.ts
var match_exports = {};
__export(match_exports, {
  MatchManager: () => MatchManager
});
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
  const customFilterContent = /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-3.5", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between border-b border-border pb-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs font-bold text-foreground uppercase tracking-wider", children: "Multi-Tenant Filters" }),
      activeFilterCount > 0 && /* @__PURE__ */ jsxRuntime.jsx(
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
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Building, { className: "h-3 w-3 text-beak" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Brand Scope" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs(
        "select",
        {
          value: selectedBrand,
          onChange: (e) => setSelectedBrand(e.target.value),
          className: "w-full bg-secondary/50 border border-border rounded-lg p-2 text-xs font-bold text-beak focus:border-ring outline-none cursor-pointer",
          children: [
            /* @__PURE__ */ jsxRuntime.jsx("option", { value: "*", className: "bg-popover text-popover-foreground", children: "All Brands (*)" }),
            /* @__PURE__ */ jsxRuntime.jsx("option", { value: "wardah", className: "bg-popover text-popover-foreground", children: "Wardah Beauty" }),
            /* @__PURE__ */ jsxRuntime.jsx("option", { value: "kahf", className: "bg-popover text-popover-foreground", children: "Kahf Men Care" }),
            /* @__PURE__ */ jsxRuntime.jsx("option", { value: "labore", className: "bg-popover text-popover-foreground", children: "Labor\xE9 Sensitive Skin" }),
            /* @__PURE__ */ jsxRuntime.jsx("option", { value: "emina", className: "bg-popover text-popover-foreground", children: "Emina Teen & Young" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Smartphone, { className: "h-3 w-3 text-sky-400" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Channel / Application" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs(
        "select",
        {
          value: selectedApp,
          onChange: (e) => setSelectedApp(e.target.value),
          className: "w-full bg-secondary/50 border border-border rounded-lg p-2 text-xs font-bold text-sky-400 focus:border-ring outline-none cursor-pointer",
          children: [
            /* @__PURE__ */ jsxRuntime.jsx("option", { value: "*", className: "bg-popover text-popover-foreground", children: "Omnichannel (*)" }),
            /* @__PURE__ */ jsxRuntime.jsx("option", { value: "ecommerce_mobile", className: "bg-popover text-popover-foreground", children: "Mobile App" }),
            /* @__PURE__ */ jsxRuntime.jsx("option", { value: "store_kiosk", className: "bg-popover text-popover-foreground", children: "Skin Kiosk" }),
            /* @__PURE__ */ jsxRuntime.jsx("option", { value: "web_consult", className: "bg-popover text-popover-foreground", children: "Online Portal" })
          ]
        }
      )
    ] })
  ] });
  const columns = [
    {
      key: "ingredientA",
      header: "Ingredient A",
      render: (c) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "font-semibold text-rose-400 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ShieldAlert, { className: "h-3.5 w-3.5" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { children: c.ingredientA })
      ] })
    },
    {
      key: "ingredientB",
      header: "Ingredient B",
      render: (c) => /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-semibold text-rose-300 font-mono", children: c.ingredientB })
    },
    {
      key: "conflictType",
      header: "Conflict Type",
      render: (c) => /* @__PURE__ */ jsxRuntime.jsx("span", { className: "bg-rose-500/15 text-rose-400 font-mono px-2 py-0.5 rounded text-[10px] uppercase border border-rose-500/30 font-bold", children: c.conflictType })
    },
    {
      key: "resolutionAction",
      header: "Routine Resolution",
      render: (c) => /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono font-bold text-amber-300 uppercase text-[11px]", children: c.resolutionAction })
    },
    {
      key: "warningMessage",
      header: "Clinical Warning Copy",
      render: (c) => /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-muted-foreground text-xs max-w-xs truncate block", title: c.warningMessage, children: c.warningMessage || "-" })
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (c) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          shared.Button,
          {
            variant: "ghost",
            size: "icon-xs",
            onClick: () => onOpenEditModal(c),
            title: "Edit Conflict",
            children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Pencil, { className: "h-3.5 w-3.5" })
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          shared.Button,
          {
            variant: "ghost",
            size: "icon-xs",
            onClick: () => onDeleteConflict(c.id),
            title: "Delete Conflict",
            className: "hover:text-destructive",
            children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { className: "h-3.5 w-3.5" })
          }
        )
      ] })
    }
  ];
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      shared.SearchFilterBar,
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
    /* @__PURE__ */ jsxRuntime.jsx(
      shared.DataTable,
      {
        columns,
        data: filtered,
        keyExtractor: (c) => c.id,
        emptyMessage: "No conflict matrix rules found for current filters."
      }
    )
  ] });
};
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
  const customFilterContent = /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-3.5", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between border-b border-border pb-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs font-bold text-foreground uppercase tracking-wider", children: "Multi-Tenant Filters" }),
      activeFilterCount > 0 && /* @__PURE__ */ jsxRuntime.jsx(
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
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Building, { className: "h-3 w-3 text-primary" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Brand Scope" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs(
        "select",
        {
          value: selectedBrand,
          onChange: (e) => setSelectedBrand(e.target.value),
          className: "w-full bg-secondary/50 border border-border rounded-lg p-2 text-xs font-bold text-primary focus:border-ring outline-none cursor-pointer",
          children: [
            /* @__PURE__ */ jsxRuntime.jsx("option", { value: "*", className: "bg-popover text-popover-foreground", children: "All Brands (*)" }),
            /* @__PURE__ */ jsxRuntime.jsx("option", { value: "wardah", className: "bg-popover text-popover-foreground", children: "Wardah Beauty" }),
            /* @__PURE__ */ jsxRuntime.jsx("option", { value: "kahf", className: "bg-popover text-popover-foreground", children: "Kahf Men Care" }),
            /* @__PURE__ */ jsxRuntime.jsx("option", { value: "labore", className: "bg-popover text-popover-foreground", children: "Labor\xE9 Sensitive Skin" }),
            /* @__PURE__ */ jsxRuntime.jsx("option", { value: "emina", className: "bg-popover text-popover-foreground", children: "Emina Teen & Young" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Smartphone, { className: "h-3 w-3 text-sky-400" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Channel / Application" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs(
        "select",
        {
          value: selectedApp,
          onChange: (e) => setSelectedApp(e.target.value),
          className: "w-full bg-secondary/50 border border-border rounded-lg p-2 text-xs font-bold text-sky-400 focus:border-ring outline-none cursor-pointer",
          children: [
            /* @__PURE__ */ jsxRuntime.jsx("option", { value: "*", className: "bg-popover text-popover-foreground", children: "Omnichannel (*)" }),
            /* @__PURE__ */ jsxRuntime.jsx("option", { value: "ecommerce_mobile", className: "bg-popover text-popover-foreground", children: "Mobile App" }),
            /* @__PURE__ */ jsxRuntime.jsx("option", { value: "store_kiosk", className: "bg-popover text-popover-foreground", children: "Skin Kiosk" }),
            /* @__PURE__ */ jsxRuntime.jsx("option", { value: "web_consult", className: "bg-popover text-popover-foreground", children: "Online Portal" })
          ]
        }
      )
    ] })
  ] });
  const columns = [
    {
      key: "name",
      header: "Campaign Group",
      render: (g) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-0.5", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "font-semibold text-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Boxes, { className: "h-3.5 w-3.5 text-primary" }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { children: g.name })
        ] }),
        g.code && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[10px] font-mono text-muted-foreground", children: g.code })
      ] })
    },
    {
      key: "brandId",
      header: "Brand",
      render: (g) => /* @__PURE__ */ jsxRuntime.jsx("span", { className: "bg-primary/10 text-primary font-mono px-2 py-0.5 rounded text-[10px] uppercase border border-primary/30 font-bold", children: g.brandId || "*" })
    },
    {
      key: "products",
      header: "Products",
      render: (g) => /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "font-mono text-xs text-muted-foreground", children: [
        g.productIds?.length || 0,
        " product(s)"
      ] })
    },
    {
      key: "categories",
      header: "Categories",
      render: (g) => {
        if (!g.categories || g.categories.length === 0) {
          return /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-muted-foreground text-xs", children: "\u2014" });
        }
        return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap items-center gap-1 max-w-xs", children: g.categories.map((c) => /* @__PURE__ */ jsxRuntime.jsx(
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
      render: (g) => g.isActive ? /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "flex items-center gap-1 text-emerald-400 text-[11px] font-semibold", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CheckCircle2, { className: "h-3.5 w-3.5" }),
        " Active"
      ] }) : /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "flex items-center gap-1 text-muted-foreground text-[11px] font-semibold", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.XCircle, { className: "h-3.5 w-3.5" }),
        " Inactive"
      ] })
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (g) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          shared.Button,
          {
            variant: "ghost",
            size: "icon-xs",
            onClick: () => onOpenEditModal(g),
            title: "Edit Product Group",
            children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Pencil, { className: "h-3.5 w-3.5" })
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          shared.Button,
          {
            variant: "ghost",
            size: "icon-xs",
            onClick: () => onDeleteGroup(g.id),
            title: "Delete Product Group",
            className: "hover:text-destructive",
            children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { className: "h-3.5 w-3.5" })
          }
        )
      ] })
    }
  ];
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      shared.SearchFilterBar,
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
    /* @__PURE__ */ jsxRuntime.jsx(
      shared.DataTable,
      {
        columns,
        data: filtered,
        keyExtractor: (g) => g.id,
        emptyMessage: "No product groups found for current filters. Create one to curate a campaign catalog for a brand."
      }
    )
  ] });
};
var STATUS_ICON = {
  pending: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Clock, { className: "h-3.5 w-3.5 text-muted-foreground" }),
  processing: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "h-3.5 w-3.5 text-amber-400 animate-spin" }),
  ready: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CheckCircle2, { className: "h-3.5 w-3.5 text-emerald-400" }),
  failed: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.XCircle, { className: "h-3.5 w-3.5 text-rose-400" })
};
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
      render: (s) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "h-4 w-4 rounded-full border border-white/10 shrink-0", style: { backgroundColor: s.hexColor } }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-semibold text-foreground", children: s.name }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[10px] font-mono text-muted-foreground", children: s.hexColor })
        ] })
      ] })
    },
    {
      key: "region",
      header: "Applies To",
      render: (s) => /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono text-[10px] uppercase text-muted-foreground", children: s.region })
    },
    {
      key: "extractionStatus",
      header: "Try-On Status",
      render: (s) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
        STATUS_ICON[s.extractionStatus],
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[11px] capitalize", children: s.extractionStatus }),
        s.extractionStatus === "failed" && s.failureReason && /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-[10px] text-rose-400 truncate max-w-[160px]", title: s.failureReason, children: [
          "\u2014 ",
          s.failureReason
        ] })
      ] })
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (s) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx(shared.Button, { variant: "ghost", size: "icon-xs", onClick: () => onOpenEditModal(s), title: "Edit Shade", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Pencil, { className: "h-3.5 w-3.5" }) }),
        /* @__PURE__ */ jsxRuntime.jsx(shared.Button, { variant: "ghost", size: "icon-xs", onClick: () => onDeleteShade(s.id), title: "Delete Shade", className: "hover:text-destructive", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { className: "h-3.5 w-3.5" }) })
      ] })
    }
  ];
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      shared.SearchFilterBar,
      {
        searchQuery,
        onSearchChange,
        searchPlaceholder: "Search shades by name or hex color...",
        actionLabel: "New Shade",
        onAction: onOpenAddModal
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(shared.DataTable, { columns, data: filtered, keyExtractor: (s) => s.id, emptyMessage: "No shades defined for this product yet." })
  ] });
};
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
      return /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Sun, { className: "h-4 w-4 text-amber-400" });
    }
    if (lower.includes("night") || lower.includes("pm") || lower.includes("evening") || lower.includes("restoration")) {
      return /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Moon, { className: "h-4 w-4 text-sky-400" });
    }
    if (lower.includes("prep") || lower.includes("base") || lower.includes("complexion") || lower.includes("makeup")) {
      return /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Sparkles, { className: "h-4 w-4 text-purple-400" });
    }
    if (lower.includes("shave") || lower.includes("grooming")) {
      return /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Layers, { className: "h-4 w-4 text-teal-400" });
    }
    return /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Zap, { className: "h-4 w-4 text-emerald-400" });
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
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "lg:col-span-4 space-y-4", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-card border border-border rounded-lg p-5 space-y-4", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between border-b border-border pb-3", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "font-bold text-foreground text-sm", children: "Consumer Clinical Profile" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded font-mono font-bold", children: "2-Tier Engine" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-3 text-xs", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-muted-foreground", children: "Brand Scoping & Routine Paradigm:" }),
          /* @__PURE__ */ jsxRuntime.jsxs(
            "select",
            {
              value: simBrand,
              onChange: (e) => setSimBrand(e.target.value),
              className: "w-full bg-muted/40 border border-border rounded px-3 py-2 text-foreground",
              children: [
                /* @__PURE__ */ jsxRuntime.jsx("option", { value: "*", children: "All Brands (*)" }),
                /* @__PURE__ */ jsxRuntime.jsx("option", { value: "wardah", children: "Wardah Beauty (Clinical AM/PM)" }),
                /* @__PURE__ */ jsxRuntime.jsx("option", { value: "makeover", children: "Make Over (Skin Prep & Complexion)" }),
                /* @__PURE__ */ jsxRuntime.jsx("option", { value: "kahf", children: "Kahf Men Care (Daily & Post-Shave)" }),
                /* @__PURE__ */ jsxRuntime.jsx("option", { value: "biodef", children: "Biodef (Hygiene & Barrier)" }),
                /* @__PURE__ */ jsxRuntime.jsx("option", { value: "labore", children: "Labor\xE9 Sensitive Skin" }),
                /* @__PURE__ */ jsxRuntime.jsx("option", { value: "emina", children: "Emina Teen & Young" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-muted-foreground", children: "Skin Profile (Phenotype):" }),
          /* @__PURE__ */ jsxRuntime.jsxs(
            "select",
            {
              value: simSkinType,
              onChange: (e) => setSimSkinType(e.target.value),
              className: "w-full bg-muted/40 border border-border rounded px-3 py-2 text-foreground font-mono",
              children: [
                /* @__PURE__ */ jsxRuntime.jsx("option", { value: "OSPT", children: "OSPT (Oily, Sensitive, Pigmented, Tight)" }),
                /* @__PURE__ */ jsxRuntime.jsx("option", { value: "OSPW", children: "OSPW (Oily, Sensitive, Pigmented, Wrinkled)" }),
                /* @__PURE__ */ jsxRuntime.jsx("option", { value: "DRNT", children: "DRNT (Dry, Resistant, Non-Pigmented, Tight)" }),
                /* @__PURE__ */ jsxRuntime.jsx("option", { value: "DSPT", children: "DSPT (Dry, Sensitive, Pigmented, Tight)" }),
                /* @__PURE__ */ jsxRuntime.jsx("option", { value: "ORNT", children: "ORNT (Oily, Resistant, Non-Pigmented, Tight)" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Sebum Dimension:" }),
            /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "font-mono text-foreground font-bold", children: [
              simSebum,
              " pts"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(
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
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Hydration Level:" }),
            /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "font-mono text-foreground font-bold", children: [
              simHydration,
              " pts"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(
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
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Sensitivity Level:" }),
            /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "font-mono text-foreground font-bold", children: [
              simSensitivity,
              " pts"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(
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
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "pt-2 border-t border-border space-y-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-muted-foreground font-bold block", children: "Safety Gatekeeper Flags:" }),
          /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-center gap-2 p-2 bg-muted/40 border border-border rounded cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                type: "checkbox",
                checked: simPregnant,
                onChange: (e) => setSimPregnant(e.target.checked),
                className: "accent-rose-400 rounded"
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-foreground", children: "Is Pregnant / Nursing Consumer (Zero Retinoids)" })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-center gap-2 p-2 bg-muted/40 border border-border rounded cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                type: "checkbox",
                checked: simRetinol,
                onChange: (e) => setSimRetinol(e.target.checked),
                className: "accent-amber-400 rounded"
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-foreground", children: "Active Retinol / Direct Acid User" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            onClick: onRunSimulator,
            disabled: isSimulating,
            className: "w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 mt-4 cursor-pointer disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Play, { className: "h-4 w-4 fill-black" }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { children: isSimulating ? "Evaluating 2-Tier Rules..." : "Run Regimen Matching" })
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "lg:col-span-8 space-y-6", children: simResult ? /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-card border border-border rounded-lg p-5 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-xs font-mono font-bold px-2 py-0.5 rounded", children: simResult.profileSummary.skinType }),
            /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "font-bold text-foreground text-base", children: "Personalized Prescription" })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: simResult.profileSummary.primaryConcerns.map((c, i) => /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[10px] bg-muted text-foreground px-2 py-0.5 rounded border border-border", children: c }, i)) })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[10px] text-muted-foreground font-bold uppercase tracking-wider block", children: "Clinical Match" }),
          /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-3xl font-black text-emerald-400 font-mono", children: [
            simResult.profileSummary.overallSuitabilityScore,
            "%"
          ] })
        ] })
      ] }),
      simResult.clinicalConflictMatrix.layeringRulesApplied.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-amber-950/20 border border-amber-800/40 rounded-lg p-4 space-y-2", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2 text-amber-400 font-bold text-xs", children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.AlertTriangle, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
            "Clinical Conflict Matrix Directives (",
            simResult.clinicalConflictMatrix.conflictsDetected,
            " detected)"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("ul", { className: "space-y-1 text-xs text-amber-200/90 pl-6 list-disc", children: simResult.clinicalConflictMatrix.layeringRulesApplied.map((rule, idx) => /* @__PURE__ */ jsxRuntime.jsx("li", { children: rule }, idx)) })
      ] }),
      routinePhases.map((phase) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("h4", { className: "font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-2", children: [
          getPhaseIcon(phase.key),
          /* @__PURE__ */ jsxRuntime.jsx("span", { children: phase.title })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "space-y-2", children: phase.steps.map((step) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-card border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1.5 flex-1", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "w-5 h-5 rounded-full bg-muted text-amber-300 text-[10px] font-bold flex items-center justify-center font-mono shrink-0", children: step.stepNumber }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-bold text-foreground text-sm", children: step.primaryProduct.name }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "bg-muted text-amber-400 text-[10px] px-1.5 py-0.5 rounded font-medium border border-border", children: step.primaryProduct.brand })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-3 pl-7", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
                "Category: ",
                /* @__PURE__ */ jsxRuntime.jsx("strong", { className: "text-foreground", children: step.category })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
                "Texture: ",
                /* @__PURE__ */ jsxRuntime.jsx("strong", { className: "text-foreground", children: step.recommendedTexture || step.primaryProduct.texture })
              ] })
            ] }),
            step.primaryProduct.whySelected && step.primaryProduct.whySelected.length > 0 && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "pl-7 flex flex-wrap gap-1.5 pt-1", children: step.primaryProduct.whySelected.map((reason, rIdx) => /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-[10px] bg-emerald-950/40 text-emerald-300 border border-emerald-800/30 px-2 py-0.5 rounded flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Tag, { className: "h-2.5 w-2.5" }),
              reason
            ] }, rIdx)) })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-right shrink-0 sm:pl-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-border", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "font-mono text-emerald-400 font-bold text-sm", children: [
              step.primaryProduct.matchScore,
              " pts"
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-[10px] text-emerald-400 flex items-center justify-end gap-1", children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ShieldCheck, { className: "h-3 w-3" }),
              " Zero Contraindications"
            ] })
          ] })
        ] }, step.stepNumber)) })
      ] }, phase.key))
    ] }) : /* @__PURE__ */ jsxRuntime.jsx(
      shared.EmptyState,
      {
        icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Sparkles, { className: "h-6 w-6 text-emerald-400" }),
        title: "Regimen Matching Standby",
        description: "Adjust clinical scores & safety flags on the left, then click 'Run Regimen Matching' to simulate prescription routine.",
        className: "py-16"
      }
    ) })
  ] });
};
var ConflictRuleModal = ({
  isOpen,
  onClose,
  onSave,
  editingConflict
}) => {
  const [confA, setConfA] = React9.useState("");
  const [confB, setConfB] = React9.useState("");
  const [confType, setConfType] = React9.useState("over_exfoliation");
  const [confAction, setConfAction] = React9.useState("split_am_pm");
  const [confWarning, setConfWarning] = React9.useState("");
  const [isSubmitting, setIsSubmitting] = React9.useState(false);
  const [ingredients, setIngredients] = React9.useState([]);
  React9.useEffect(() => {
    fetch("/api/reference/ingredients").then((res) => res.json()).then((data) => {
      const raw = Array.isArray(data.ingredients) ? data.ingredients : Array.isArray(data) ? data : [];
      if (raw.length > 0) setIngredients(raw.map((i) => ({ code: i.code || i.name, name: i.name })));
    }).catch(() => {
    });
  }, [isOpen]);
  React9.useEffect(() => {
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
  return /* @__PURE__ */ jsxRuntime.jsx(
    shared.Modal,
    {
      isOpen,
      onClose,
      size: "md",
      icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ShieldAlert, { className: "h-4 w-4 text-rose-400" }),
      title: editingConflict ? "Edit Conflict Rule" : "New Ingredient Conflict",
      isLoading: isSubmitting,
      loadingText: isSubmitting ? editingConflict ? "Updating Conflict Rule..." : "Saving Conflict Rule..." : void 0,
      children: /* @__PURE__ */ jsxRuntime.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 text-xs", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-muted-foreground", children: "Primary Ingredient (A):" }),
            /* @__PURE__ */ jsxRuntime.jsx(
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
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-muted-foreground", children: "Conflicting Ingredient (B):" }),
            /* @__PURE__ */ jsxRuntime.jsx(
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
          /* @__PURE__ */ jsxRuntime.jsx("datalist", { id: "conflict-ing-list", children: ingredients.map((ing) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: ing.name }, ing.code)) })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-muted-foreground", children: "Conflict Type:" }),
            /* @__PURE__ */ jsxRuntime.jsxs(
              "select",
              {
                value: confType,
                onChange: (e) => setConfType(e.target.value),
                className: "w-full bg-muted/40 border border-border rounded px-3 py-2 text-foreground font-mono",
                children: [
                  /* @__PURE__ */ jsxRuntime.jsx("option", { value: "incompatible", children: "Strictly Incompatible" }),
                  /* @__PURE__ */ jsxRuntime.jsx("option", { value: "over_exfoliation", children: "Over-exfoliation Risk" }),
                  /* @__PURE__ */ jsxRuntime.jsx("option", { value: "pH_clash", children: "pH Neutralization Clash" }),
                  /* @__PURE__ */ jsxRuntime.jsx("option", { value: "barrier_irritation", children: "Barrier Irritation Risk" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-muted-foreground", children: "Resolution Protocol:" }),
            /* @__PURE__ */ jsxRuntime.jsxs(
              "select",
              {
                value: confAction,
                onChange: (e) => setConfAction(e.target.value),
                className: "w-full bg-muted/40 border border-border rounded px-3 py-2 text-foreground font-mono",
                children: [
                  /* @__PURE__ */ jsxRuntime.jsx("option", { value: "split_am_pm", children: "Split Routine (AM vs PM)" }),
                  /* @__PURE__ */ jsxRuntime.jsx("option", { value: "alternate_days", children: "Alternate Use Days" }),
                  /* @__PURE__ */ jsxRuntime.jsx("option", { value: "strict_block", children: "Strict Product Exclusion" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-muted-foreground", children: "Clinical Warning Message:" }),
          /* @__PURE__ */ jsxRuntime.jsx(
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
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex justify-end pt-2", children: /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "submit",
            disabled: isSubmitting,
            className: "px-4 py-2 bg-rose-600 hover:bg-rose-500 text-foreground font-bold rounded disabled:opacity-50 cursor-pointer flex items-center gap-1.5",
            children: [
              isSubmitting ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : null,
              /* @__PURE__ */ jsxRuntime.jsx("span", { children: isSubmitting ? editingConflict ? "Updating..." : "Saving..." : editingConflict ? "Update Rule" : "Save Rule" })
            ]
          }
        ) })
      ] })
    }
  );
};

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
    "reference-service": "/core/reference-service"
  };
  return map[key];
}
function resolveDynamicEndpoint(key, routePattern, collections) {
  const prefix = getCollectionPrefix(key);
  const cleanPattern = routePattern.startsWith("/") ? routePattern : `/${routePattern}`;
  return `${prefix}${cleanPattern}`;
}
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
  const [brandId, setBrandId] = React9.useState(defaultBrand && defaultBrand !== "*" ? defaultBrand : "wardah");
  const [applicationId, setApplicationId] = React9.useState("*");
  const [name, setName] = React9.useState("");
  const [code, setCode] = React9.useState("");
  const [description, setDescription] = React9.useState("");
  const [productIds, setProductIds] = React9.useState([]);
  const [categories, setCategories] = React9.useState([]);
  const [categoryDraft, setCategoryDraft] = React9.useState("");
  const [isActive, setIsActive] = React9.useState(true);
  const [isSubmitting, setIsSubmitting] = React9.useState(false);
  const [products, setProducts] = React9.useState([]);
  React9.useEffect(() => {
    if (!isOpen) return;
    const endpoint = resolveDynamicEndpoint("match", `/api/matching/products?brand_id=${encodeURIComponent(brandId || "*")}`);
    fetch(endpoint).then((res) => res.json()).then((data) => {
      if (Array.isArray(data.products)) setProducts(data.products);
    }).catch(() => {
    });
  }, [isOpen, brandId]);
  React9.useEffect(() => {
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
  const productOptions = React9.useMemo(
    () => products.map((p) => ({ value: p.id, label: p.name, description: p.category })),
    [products]
  );
  const availableCategories = React9.useMemo(
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
  return /* @__PURE__ */ jsxRuntime.jsx(
    shared.Modal,
    {
      isOpen,
      onClose,
      size: "lg",
      icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Boxes, { className: "h-4 w-4 text-primary" }),
      title: editingGroup ? "Edit Product Group" : "New Product Group",
      isLoading: isSubmitting,
      loadingText: isSubmitting ? editingGroup ? "Updating Product Group..." : "Saving Product Group..." : void 0,
      children: /* @__PURE__ */ jsxRuntime.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 text-xs", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-[#888888]", children: "Brand:" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "select",
              {
                value: brandId,
                onChange: (e) => setBrandId(e.target.value),
                disabled: !!editingGroup,
                className: "w-full bg-[#161616] border border-[#333333] rounded px-3 py-2 text-white font-mono disabled:opacity-60",
                children: BRAND_OPTIONS.map((b) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: b.value, children: b.label }, b.value))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-[#888888]", children: "Group Name:" }),
            /* @__PURE__ */ jsxRuntime.jsx(
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
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-[#888888]", children: "Group Code:" }),
            /* @__PURE__ */ jsxRuntime.jsx(
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
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-[#888888] flex items-center justify-between", children: /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Status:" }) }),
            /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-center gap-2 bg-[#161616] border border-[#333333] rounded px-3 py-2 cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntime.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: isActive,
                  onChange: (e) => setIsActive(e.target.checked),
                  className: "accent-primary"
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-white", children: "Active in matching engine" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-[#888888]", children: "Campaign Description:" }),
          /* @__PURE__ */ jsxRuntime.jsx(
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
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-[#888888]", children: "Products in Group:" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            shared.SearchableSelect,
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
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-[#888888]", children: "Categories in Group:" }),
            /* @__PURE__ */ jsxRuntime.jsx(shared.InfoTooltip, { content: "Every product in each listed category is included in the group.", label: "About Categories in Group" })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap items-center gap-1.5 mb-1.5", children: categories.map((c) => /* @__PURE__ */ jsxRuntime.jsxs(
            "span",
            {
              className: "flex items-center gap-1 bg-amber-500/15 text-amber-400 font-mono px-2 py-0.5 rounded text-[10px] uppercase border border-amber-500/30 font-bold",
              children: [
                c,
                /* @__PURE__ */ jsxRuntime.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setCategories((prev) => prev.filter((x) => x !== c)),
                    className: "hover:text-white cursor-pointer",
                    children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { className: "h-3 w-3" })
                  }
                )
              ]
            },
            c
          )) }),
          /* @__PURE__ */ jsxRuntime.jsx(
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
          /* @__PURE__ */ jsxRuntime.jsx("datalist", { id: "product-group-category-list", children: availableCategories.map((c) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: c }, c)) })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex justify-end pt-2", children: /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "submit",
            disabled: isSubmitting,
            className: "px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground font-bold rounded disabled:opacity-50 cursor-pointer flex items-center gap-1.5",
            children: [
              isSubmitting ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : null,
              /* @__PURE__ */ jsxRuntime.jsx("span", { children: isSubmitting ? editingGroup ? "Updating..." : "Saving..." : editingGroup ? "Update Group" : "Save Group" })
            ]
          }
        ) })
      ] })
    }
  );
};
var ShadeModal = ({ isOpen, onClose, onSave, editingShade, productId }) => {
  const [name, setName] = React9.useState("");
  const [hexColor, setHexColor] = React9.useState("#C41E3A");
  const [region, setRegion] = React9.useState("lip");
  const [referencePhotoUrl, setReferencePhotoUrl] = React9.useState("");
  const [isSubmitting, setIsSubmitting] = React9.useState(false);
  React9.useEffect(() => {
    if (editingShade) {
      setName(editingShade.name);
      setHexColor(editingShade.hexColor);
      setRegion(editingShade.region);
      setReferencePhotoUrl(editingShade.referencePhotoUrl || "");
    } else {
      setName("");
      setHexColor("#C41E3A");
      setRegion("lip");
      setReferencePhotoUrl("");
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
        region,
        referencePhotoUrl: referencePhotoUrl.trim()
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsx(
    shared.Modal,
    {
      isOpen,
      onClose,
      size: "md",
      icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Palette, { className: "h-4 w-4 text-primary" }),
      title: editingShade ? "Edit Shade" : "New Shade",
      isLoading: isSubmitting,
      loadingText: isSubmitting ? editingShade ? "Updating Shade..." : "Saving Shade..." : void 0,
      children: /* @__PURE__ */ jsxRuntime.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 text-xs", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-[#888888]", children: "Shade Name:" }),
            /* @__PURE__ */ jsxRuntime.jsx(
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
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-[#888888]", children: "Exact Color:" }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntime.jsx(
                "input",
                {
                  type: "color",
                  value: hexColor,
                  onChange: (e) => setHexColor(e.target.value),
                  className: "h-9 w-9 rounded border border-[#333333] bg-transparent cursor-pointer"
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsx(
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
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-[#888888]", children: "Applies To:" }),
          /* @__PURE__ */ jsxRuntime.jsxs(
            "select",
            {
              value: region,
              onChange: (e) => setRegion(e.target.value),
              className: "w-full bg-[#161616] border border-[#333333] rounded px-3 py-2 text-white font-mono",
              children: [
                /* @__PURE__ */ jsxRuntime.jsx("option", { value: "lip", children: "Lips" }),
                /* @__PURE__ */ jsxRuntime.jsx("option", { value: "eye", children: "Eyes" }),
                /* @__PURE__ */ jsxRuntime.jsx("option", { value: "cheek", children: "Cheeks" }),
                /* @__PURE__ */ jsxRuntime.jsx("option", { value: "skin", children: "Skin / Foundation" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-[#888888]", children: "Reference Photo URL:" }),
            /* @__PURE__ */ jsxRuntime.jsx(shared.InfoTooltip, { content: "A face photo used to generate the realistic shade texture.", label: "About Reference Photo URL" })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              type: "url",
              required: true,
              placeholder: "https://...",
              value: referencePhotoUrl,
              onChange: (e) => setReferencePhotoUrl(e.target.value),
              className: "w-full bg-[#161616] border border-[#333333] rounded px-3 py-2 text-white"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex justify-end pt-2", children: /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "submit",
            disabled: isSubmitting,
            className: "px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground font-bold rounded disabled:opacity-50 cursor-pointer flex items-center gap-1.5",
            children: [
              isSubmitting ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : null,
              /* @__PURE__ */ jsxRuntime.jsx("span", { children: isSubmitting ? editingShade ? "Updating..." : "Saving..." : editingShade ? "Update Shade" : "Save Shade & Start Extraction" })
            ]
          }
        ) })
      ] })
    }
  );
};
var MatchManager = () => {
  const [activeTab, setActiveTab] = React9.useState("conflicts");
  const [searchQuery, setSearchQuery] = React9.useState("");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = React9.useState(false);
  const [activeFilters, setActiveFilters] = React9.useState({});
  const [deleteConfirm, setDeleteConfirm] = React9.useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {
    }
  });
  const [selectedBrand, setSelectedBrand] = React9.useState("*");
  const [selectedApp, setSelectedApp] = React9.useState("*");
  const [conflicts, setConflicts] = React9.useState([]);
  const [productGroups, setProductGroups] = React9.useState([]);
  const [products, setProducts] = React9.useState([]);
  const [shades, setShades] = React9.useState([]);
  const [shadeProductId, setShadeProductId] = React9.useState("");
  const [isConflictModalOpen, setIsConflictModalOpen] = React9.useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = React9.useState(false);
  const [isShadeModalOpen, setIsShadeModalOpen] = React9.useState(false);
  const [editingConflict, setEditingConflict] = React9.useState(null);
  const [editingGroup, setEditingGroup] = React9.useState(null);
  const [editingShade, setEditingShade] = React9.useState(null);
  const [simBrand, setSimBrand] = React9.useState("*");
  const [simSkinType, setSimSkinType] = React9.useState("OSPT");
  const [simSebum, setSimSebum] = React9.useState(75);
  const [simHydration, setSimHydration] = React9.useState(40);
  const [simSensitivity, setSimSensitivity] = React9.useState(65);
  const [simPregnant, setSimPregnant] = React9.useState(false);
  const [simRetinol, setSimRetinol] = React9.useState(true);
  const [isSimulating, setIsSimulating] = React9.useState(false);
  const [simResult, setSimResult] = React9.useState(null);
  const loadData = () => {
    fetch(resolveDynamicEndpoint("match", "/api/matching/conflicts")).then((res) => res.json()).then((data) => {
      if (Array.isArray(data.conflicts)) setConflicts(data.conflicts);
    }).catch(() => {
    });
    fetch(resolveDynamicEndpoint("match", "/api/matching/product-groups")).then((res) => res.json()).then((data) => {
      if (Array.isArray(data.groups)) setProductGroups(data.groups);
    }).catch(() => {
    });
    fetch(resolveDynamicEndpoint("match", "/api/matching/products")).then((res) => res.json()).then((data) => {
      if (Array.isArray(data.products)) {
        setProducts(data.products);
        setShadeProductId((prev) => prev || data.products[0]?.id || "");
      }
    }).catch(() => {
    });
  };
  const loadShades = (productId) => {
    if (!productId) {
      setShades([]);
      return;
    }
    fetch(resolveDynamicEndpoint("match", `/api/matching/shades?product_id=${encodeURIComponent(productId)}`)).then((res) => res.json()).then((data) => {
      if (Array.isArray(data.shades)) setShades(data.shades);
    }).catch(() => {
    });
  };
  React9.useEffect(() => {
    loadData();
  }, []);
  React9.useEffect(() => {
    loadShades(shadeProductId);
  }, [shadeProductId]);
  const matchTabs = [
    { id: "conflicts", label: "Contraindication Matrix", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ShieldAlert, { className: "h-4 w-4 text-rose-400" }), badge: conflicts.length },
    { id: "groups", label: "Product Groups", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Boxes, { className: "h-4 w-4 text-amber-400" }), badge: productGroups.length },
    { id: "shades", label: "Shades", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Palette, { className: "h-4 w-4 text-rose-400" }), badge: shades.length },
    { id: "simulator", label: "Match Simulator", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Play, { className: "h-4 w-4 text-emerald-400" }) }
  ];
  const handleSaveConflict = async (data) => {
    const endpoint = resolveDynamicEndpoint("match", "/api/matching/conflicts");
    if (editingConflict) {
      const updated = { ...editingConflict, ...data };
      setConflicts((prev) => prev.map((x) => x.id === editingConflict.id ? updated : x));
      try {
        await fetch(endpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated)
        });
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
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newConf)
        });
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
          const endpoint = resolveDynamicEndpoint("match", `/api/matching/conflicts?id=${id}`);
          await fetch(endpoint, { method: "DELETE" });
        } catch {
        }
        setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };
  const handleSaveGroup = async (data) => {
    const endpoint = resolveDynamicEndpoint("match", "/api/matching/product-groups");
    if (editingGroup) {
      const updated = { ...editingGroup, ...data };
      setProductGroups((prev) => prev.map((x) => x.id === editingGroup.id ? updated : x));
      try {
        await fetch(endpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated)
        });
      } catch {
      }
    } else {
      const newGroup = {
        id: `pgrp-${Date.now()}`,
        ...data
      };
      setProductGroups((prev) => [newGroup, ...prev]);
      try {
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newGroup)
        });
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
          const endpoint = resolveDynamicEndpoint("match", `/api/matching/product-groups?id=${id}`);
          await fetch(endpoint, { method: "DELETE" });
        } catch {
        }
        setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };
  const handleSaveShade = async (data) => {
    const endpoint = resolveDynamicEndpoint("match", "/api/matching/shades");
    if (editingShade) {
      const updated = { ...editingShade, ...data };
      setShades((prev) => prev.map((x) => x.id === editingShade.id ? updated : x));
      try {
        await fetch(endpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated)
        });
      } catch {
      }
    } else {
      const newShade = {
        id: `shade-${Date.now()}`,
        extractionStatus: "pending",
        ...data
      };
      setShades((prev) => [newShade, ...prev]);
      try {
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newShade)
        });
        setTimeout(() => loadShades(shadeProductId), 1e3);
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
          const endpoint = resolveDynamicEndpoint("match", `/api/matching/shades?id=${id}`);
          await fetch(endpoint, { method: "DELETE" });
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
      const endpoint = resolveDynamicEndpoint("match", "/api/matching/match");
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setSimResult(data);
      }
    } catch {
    } finally {
      setIsSimulating(false);
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex-1 min-w-0 h-full overflow-y-auto bg-background text-foreground font-sans flex flex-col select-none", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      shared.PageHeader,
      {
        icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Sparkles, { className: "h-5 w-5 text-beak" }),
        breadcrumbs: [
          { label: "Workbench", href: "/" },
          { label: "Core Engines" },
          { label: "Match Engine" }
        ],
        title: "Clinical Product Matcher & Routine Generator",
        children: /* @__PURE__ */ jsxRuntime.jsx(
          shared.TabNav,
          {
            tabs: matchTabs,
            activeTab,
            onTabChange: (id) => setActiveTab(id)
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs("main", { className: "flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto", children: [
      activeTab === "conflicts" && /* @__PURE__ */ jsxRuntime.jsx(
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
      activeTab === "groups" && /* @__PURE__ */ jsxRuntime.jsx(
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
      activeTab === "shades" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2 bg-secondary/40 border border-border rounded-lg px-3 py-2 w-fit", children: [
          /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Product:" }),
          /* @__PURE__ */ jsxRuntime.jsxs(
            "select",
            {
              value: shadeProductId,
              onChange: (e) => setShadeProductId(e.target.value),
              className: "bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer",
              children: [
                products.length === 0 && /* @__PURE__ */ jsxRuntime.jsx("option", { value: "", children: "No products found" }),
                products.map((p) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: p.id, children: p.name }, p.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(
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
      activeTab === "simulator" && /* @__PURE__ */ jsxRuntime.jsx(
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
    /* @__PURE__ */ jsxRuntime.jsx(
      ConflictRuleModal,
      {
        isOpen: isConflictModalOpen,
        onClose: () => setIsConflictModalOpen(false),
        onSave: handleSaveConflict,
        editingConflict
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      ProductGroupModal,
      {
        isOpen: isGroupModalOpen,
        onClose: () => setIsGroupModalOpen(false),
        onSave: handleSaveGroup,
        editingGroup,
        defaultBrand: selectedBrand
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      ShadeModal,
      {
        isOpen: isShadeModalOpen,
        onClose: () => setIsShadeModalOpen(false),
        onSave: handleSaveShade,
        editingShade,
        productId: shadeProductId
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      shared.ConfirmDialog,
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

exports.FormManager = FormManager;
exports.FormStudio = form_exports;
exports.MatchManager = MatchManager;
exports.MatchStudio = match_exports;
exports.ReferenceManager = ReferenceManager;
exports.ReferenceStudio = reference_exports;
exports.ScoreManager = ScoreManager;
exports.ScoreStudio = score_exports;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map