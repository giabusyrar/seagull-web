'use strict';

var react = require('react');
var lucideReact = require('lucide-react');
var shared = require('@gateway-experience/shared');
var jsxRuntime = require('react/jsx-runtime');

// src/reference/config/reference-entity-configs.ts
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
    apiEndpoint: "/api/reference/categories",
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
    apiEndpoint: "/api/reference/textures",
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
  const [formData, setFormData] = react.useState({});
  const [relationOptions, setRelationOptions] = react.useState({});
  const [isSubmitting, setIsSubmitting] = react.useState(false);
  const [error, setError] = react.useState(null);
  react.useEffect(() => {
    if (isOpen) {
      const initial = { ...initialData || {} };
      config.fields.forEach((f) => {
        if ((f.type === "text" || f.type === "textarea") && Array.isArray(initial[f.key])) {
          initial[f.key] = initial[f.key].join(", ");
        }
      });
      setFormData(initial);
      setError(null);
      config.fields.forEach(async (field) => {
        if ((field.type === "relation" || field.type === "multi-relation") && field.relationEntity) {
          try {
            const res = await fetch(`/api/reference/${field.relationEntity}`);
            const data = await res.json();
            const list = data.data || data[field.relationEntity] || data.dimensions || data.items || data.brands || data.products || data.ingredients || [];
            if (data.success && Array.isArray(list)) {
              setRelationOptions((prev) => ({ ...prev, [field.relationEntity]: list }));
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
        config.fields.map((field, idx) => {
          const zIndexVal = (config.fields.length - idx) * 10;
          return /* @__PURE__ */ jsxRuntime.jsxs("div", { style: { zIndex: zIndexVal }, className: "space-y-1.5 relative", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "block text-muted-foreground font-medium", children: [
              field.label,
              " ",
              field.required && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-amber-500", children: "*" })
            ] }),
            field.type === "number" && /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                type: "number",
                required: field.required,
                value: formData[field.key] ?? "",
                onChange: (e) => {
                  const val = e.target.value === "" ? "" : Number(e.target.value);
                  setFormData({ ...formData, [field.key]: val });
                },
                className: "w-full h-9 bg-background border border-border rounded-lg px-3 text-foreground outline-none focus:border-ring transition font-mono"
              }
            ),
            field.type === "text" && /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                type: "text",
                required: field.required,
                value: formData[field.key] ?? "",
                onChange: (e) => setFormData({ ...formData, [field.key]: e.target.value }),
                className: "w-full h-9 bg-background border border-border rounded-lg px-3 text-foreground outline-none focus:border-ring transition"
              }
            ),
            field.type === "textarea" && /* @__PURE__ */ jsxRuntime.jsx(
              "textarea",
              {
                rows: 3,
                value: formData[field.key] || "",
                onChange: (e) => setFormData({ ...formData, [field.key]: e.target.value }),
                className: "w-full bg-background border border-border rounded-lg p-2.5 text-foreground outline-none focus:border-ring transition"
              }
            ),
            field.type === "select" && /* @__PURE__ */ jsxRuntime.jsx(
              "select",
              {
                value: formData[field.key] || field.options?.[0]?.value || "",
                onChange: (e) => setFormData({ ...formData, [field.key]: e.target.value }),
                className: "w-full h-9 bg-background border border-border rounded-lg px-3 text-foreground outline-none focus:border-ring transition cursor-pointer",
                children: field.options?.map((opt) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: opt.value, children: opt.label }, opt.value))
              }
            ),
            field.type === "relation" && field.relationEntity && (() => {
              const opts = relationOptions[field.relationEntity] || [];
              const isCodeBased = field.relationEntity === "dimensions";
              field.relationEntity === "dimensions";
              const currentVal = (() => {
                const direct = formData[field.key];
                if (direct) {
                  const found = opts.find((o) => (isCodeBased ? o.code === direct : o.id === direct) || o.id === direct || o.name === direct);
                  if (found) return isCodeBased && found.code ? found.code : found.id;
                }
                if (field.key === "brandId") {
                  const found = opts.find((o) => o.id === formData.brandId || o.name === formData.brandName);
                  if (found) return found.id;
                }
                return direct || "";
              })();
              return /* @__PURE__ */ jsxRuntime.jsx(
                shared.SearchableSelect,
                {
                  options: opts.map((opt) => ({
                    value: isCodeBased && opt.code ? opt.code : opt.id,
                    label: isCodeBased && opt.code ? `${opt.name} (${opt.code})` : opt.name
                  })),
                  value: currentVal,
                  onChange: (val) => setFormData({ ...formData, [field.key]: val }),
                  placeholder: `-- Select ${field.label} --`,
                  searchPlaceholder: `Search ${field.label.toLowerCase()}...`
                }
              );
            })(),
            field.type === "multi-relation" && field.relationEntity && (() => {
              const opts = relationOptions[field.relationEntity] || [];
              const isCodeBased = field.relationEntity === "dimensions";
              const rawVal = formData[field.key] ?? (formData["ingredientIds"] || []);
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
                  options: opts.map((opt) => ({
                    value: isCodeBased && opt.code ? opt.code : opt.id,
                    label: isCodeBased && opt.code ? `${opt.name} (${opt.code})` : opt.name
                  })),
                  value: selectedValues,
                  onChange: (vals) => {
                    const updated = { ...formData, [field.key]: vals };
                    if (field.key === "ingredientIds") updated.ingredientIds = vals;
                    setFormData(updated);
                  },
                  placeholder: `-- Select ${field.label} --`,
                  searchPlaceholder: `Search ${field.label.toLowerCase()}...`
                }
              );
            })()
          ] }, field.key);
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
  const [code, setCode] = react.useState("");
  const [name, setName] = react.useState("");
  const [description, setDescription] = react.useState("");
  const [items, setItems] = react.useState([]);
  const [isSubmitting, setIsSubmitting] = react.useState(false);
  const [error, setError] = react.useState(null);
  react.useEffect(() => {
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
  const handleUpdateItem = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === "name" && !initialData && (!next[index].code || next[index].code.startsWith("TIER_"))) {
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
  const [activeSlug, setActiveSlug] = react.useState(slug);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = react.useState(false);
  const [activeFilters, setActiveFilters] = react.useState({});
  react.useEffect(() => {
    setActiveSlug(slug);
  }, [slug]);
  const config = REFERENCE_ENTITY_CONFIGS[activeSlug] || REFERENCE_ENTITY_CONFIGS["brands"];
  const [items, setItems] = react.useState([]);
  const [loading, setLoading] = react.useState(true);
  const [searchQuery, setSearchQuery] = react.useState("");
  const [searchColumn, setSearchColumn] = react.useState("all");
  const [filterOption, setFilterOption] = react.useState("all");
  const [currentPage, setCurrentPage] = react.useState(1);
  const [pageSize, setPageSize] = react.useState(10);
  const [isModalOpen, setIsModalOpen] = react.useState(false);
  const [editingItem, setEditingItem] = react.useState(null);
  const [deleteConfig, setDeleteConfig] = react.useState({
    isOpen: false,
    item: null,
    isDeleting: false
  });
  react.useEffect(() => {
    setSearchColumn("all");
    setFilterOption("all");
    setActiveFilters({});
    setCurrentPage(1);
  }, [activeSlug]);
  react.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, searchColumn, filterOption]);
  const columnOptions = react.useMemo(() => {
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
  const brandOptions = react.useMemo(() => {
    const brands = Array.from(
      new Set(
        (items || []).map((i) => i.brandName || i.brandId).filter((b) => typeof b === "string" && b.trim().length > 0)
      )
    );
    return brands.map((b) => ({ value: b, label: b }));
  }, [items]);
  const fetchItems = react.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(config.apiEndpoint, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch reference items");
      const data = await res.json();
      const rawList = data.data || (config.dataKey ? data[config.dataKey] : null) || (config.slug ? data[config.slug] : null) || // reference-service wraps every collection as { data: [...], success: true }
      (Array.isArray(data?.data) ? data.data : null) || data.items || data.brands || data.products || data.ingredients || data.eventTypes || data.reference || [];
      setItems(Array.isArray(rawList) ? rawList : []);
    } catch (err) {
      console.error("Fetch items error:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [config.apiEndpoint, config.slug]);
  react.useEffect(() => {
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
  const filterItemList = react.useCallback(
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
  const filteredItems = react.useMemo(
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

Object.defineProperty(exports, "SearchFilterBar", {
  enumerable: true,
  get: function () { return shared.SearchFilterBar; }
});
exports.REFERENCE_ENTITY_CONFIGS = REFERENCE_ENTITY_CONFIGS;
exports.ReferenceEntityDashboard = ReferenceEntityDashboard;
exports.ReferenceFormModal = ReferenceFormModal;
exports.ReferenceManager = ReferenceManager;
exports.ReferenceTable = ReferenceTable;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map