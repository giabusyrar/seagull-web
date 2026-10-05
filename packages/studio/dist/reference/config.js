'use strict';

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
      { key: "website", label: "Website URL (e.g. brand.example.com)", type: "text" },
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

exports.REFERENCE_ENTITY_CONFIGS = REFERENCE_ENTITY_CONFIGS;
//# sourceMappingURL=config.js.map
//# sourceMappingURL=config.js.map