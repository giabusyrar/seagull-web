'use strict';

var react = require('react');
var jsxRuntime = require('react/jsx-runtime');

var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/core/index.ts
var core_exports = {};
__export(core_exports, {
  AssessmentsSubClient: () => AssessmentsSubClient,
  BeautyClient: () => BeautyClient,
  FormSubClient: () => FormSubClient,
  MatchSubClient: () => MatchSubClient,
  ReferenceSubClient: () => ReferenceSubClient,
  VisionSubClient: () => VisionSubClient
});

// src/core/client.ts
var FormSubClient = class {
  constructor(client) {
    this.client = client;
  }
  async evaluate(code, payload) {
    return this.client.request(`/core/form-engine/survey/${code}/evaluate`, {
      method: "POST",
      body: JSON.stringify({
        brand_id: payload.brand_id || this.client.config.brandId,
        application_id: payload.application_id || this.client.config.applicationId,
        ...payload
      })
    });
  }
  async getQuestionnaire(code) {
    return this.client.request(`/core/form-engine/survey/${code}`, {
      method: "GET"
    });
  }
};
var VisionSubClient = class {
  constructor(client) {
    this.client = client;
  }
  async analyzeImages(images, options) {
    return this.client.analyzeImages(images, options);
  }
  async analyzeImage(imageBlob, options) {
    return this.client.analyzeImages(imageBlob, options);
  }
};
var MatchSubClient = class {
  constructor(client) {
    this.client = client;
  }
  async evaluate(payload) {
    return this.client.request(`/core/match-engine/evaluate`, {
      method: "POST",
      body: JSON.stringify({
        brand_id: payload.brand_id || this.client.config.brandId,
        application_id: payload.application_id || this.client.config.applicationId,
        ...payload
      })
    });
  }
};
var ReferenceSubClient = class {
  constructor(client) {
    this.client = client;
  }
  async getSkinDimensions() {
    return this.client.request(`/core/reference-service/api/dimensions`, {
      method: "GET"
    });
  }
};
var AssessmentsSubClient = class {
  constructor(client) {
    this.client = client;
  }
  async evaluate(surveyCode, request) {
    return this.client.evaluateAssessment(surveyCode, request);
  }
};
var BeautyClient = class {
  constructor(config) {
    this.config = {
      ...config,
      gatewayUrl: config.gatewayUrl.replace(/\/$/, "")
    };
    this.form = new FormSubClient(this);
    this.vision = new VisionSubClient(this);
    this.match = new MatchSubClient(this);
    this.reference = new ReferenceSubClient(this);
    this.assessments = new AssessmentsSubClient(this);
  }
  /**
   * Internal generic request helper with auth headers
   */
  async request(path, options = {}) {
    const url = `${this.config.gatewayUrl}${path.startsWith("/") ? path : "/" + path}`;
    const headers = {
      "Content-Type": "application/json",
      ...options.headers || {}
    };
    if (this.config.apiKey) {
      headers["X-API-Key"] = this.config.apiKey;
    }
    if (this.config.token) {
      headers["Authorization"] = `Bearer ${this.config.token}`;
    }
    const response = await fetch(url, {
      ...options,
      headers
    });
    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gateway request to ${path} failed (${response.status}): ${errBody}`);
    }
    return response.json();
  }
  /**
   * Evaluate one survey and store the result as a customer assessment.
   *
   * core-engine takes the survey code from the path: its handler reads :code
   * and looks the survey up with it, so a call without one finds nothing. The
   * gateway's own /api/v1/assessments/evaluate is being retired.
   */
  async evaluateAssessment(surveyCode, request) {
    if (!surveyCode) {
      throw new Error("evaluateAssessment needs a survey code: core-engine looks the survey up by it.");
    }
    const payload = {
      ...request,
      brand_id: request.brand_id || this.config.brandId,
      application_id: request.application_id || this.config.applicationId
    };
    const headers = {
      "Content-Type": "application/json"
    };
    if (this.config.apiKey) {
      headers["X-API-Key"] = this.config.apiKey;
    }
    if (this.config.token) {
      headers["Authorization"] = `Bearer ${this.config.token}`;
    }
    const url = `${this.config.gatewayUrl}/core/form-engine/survey/${encodeURIComponent(surveyCode)}/evaluate`;
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Assessment evaluation failed (${response.status}): ${errBody}`);
    }
    return response.json();
  }
  /**
   * Submits unlabelled face captures to Vision Engine in a single call.
   * Head pose and 8-zone arbitration are executed autonomously on the backend.
   */
  async analyzeImages(images, options) {
    const formData = new FormData();
    const imageList = Array.isArray(images) ? images : [images];
    imageList.forEach((blob, idx) => {
      formData.append("images", blob, `capture_${idx + 1}.jpg`);
    });
    if (imageList.length > 0) {
      formData.append("image", imageList[0], "capture_1.jpg");
    }
    formData.append("brandId", this.config.brandId);
    formData.append("applicationId", this.config.applicationId);
    if (options?.dimensions && options.dimensions.length > 0) {
      formData.append("dimensions", options.dimensions.join(","));
    }
    if (options?.skinConcerns && options.skinConcerns.length > 0) {
      formData.append("skinConcerns", options.skinConcerns.join(","));
    }
    if (options?.chronologicalAge !== void 0) {
      formData.append("chronologicalAge", options.chronologicalAge.toString());
    } else if (options?.currentAge !== void 0) {
      formData.append("currentAge", options.currentAge.toString());
    }
    if (options?.uvIndex !== void 0) {
      formData.append("uvIndex", options.uvIndex.toString());
    }
    if (options?.baselineScore !== void 0) {
      formData.append("baselineScore", options.baselineScore.toString());
    }
    if (options?.regimenEfficacyFactor !== void 0) {
      formData.append("regimenEfficacyFactor", options.regimenEfficacyFactor.toString());
    }
    const headers = {};
    if (this.config.apiKey) {
      headers["X-API-Key"] = this.config.apiKey;
    }
    if (this.config.token) {
      headers["Authorization"] = `Bearer ${this.config.token}`;
    }
    const url = `${this.config.gatewayUrl}/api/vision/analyze`;
    let response = await fetch(url, {
      method: "POST",
      headers,
      body: formData
    });
    if (!response.ok && response.status === 404) {
      const fallbackUrl = `${this.config.gatewayUrl}/core/vision-engine/analyze-image`;
      response = await fetch(fallbackUrl, {
        method: "POST",
        headers,
        body: formData
      });
    }
    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Vision analysis failed (${response.status}): ${errBody}`);
    }
    return response.json();
  }
  /**
   * Submits a single captured face image to Vision Engine.
   */
  async analyzeImage(imageBlob, options) {
    return this.analyzeImages(imageBlob, options);
  }
};

// src/hooks/index.ts
var hooks_exports = {};
__export(hooks_exports, {
  useRegimenMatch: () => useRegimenMatch,
  useSkinAssessment: () => useSkinAssessment
});
function useSkinAssessment(config) {
  const [client] = react.useState(() => new BeautyClient(config));
  const [isLoading, setIsLoading] = react.useState(false);
  const [error, setError] = react.useState(null);
  const [result, setResult] = react.useState(null);
  const evaluate = react.useCallback(
    async (surveyCode, request) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await client.evaluateAssessment(surveyCode, request);
        setResult(data);
        return data;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );
  const reset = react.useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);
  return {
    evaluate,
    reset,
    isLoading,
    error,
    result
  };
}
function useRegimenMatch() {
  const [selectedProducts, setSelectedProducts] = react.useState([]);
  const toggleProduct = react.useCallback((sku) => {
    setSelectedProducts(
      (prev) => prev.includes(sku) ? prev.filter((s) => s !== sku) : [...prev, sku]
    );
  }, []);
  const clearSelection = react.useCallback(() => {
    setSelectedProducts([]);
  }, []);
  return {
    selectedProducts,
    toggleProduct,
    clearSelection
  };
}

// src/ui/index.ts
var ui_exports = {};
__export(ui_exports, {
  AgingProgressionSlider: () => AgingProgressionSlider,
  BeautyExperienceWidget: () => BeautyExperienceWidget,
  DimensionScoreCard: () => DimensionScoreCard,
  DimensionSelector: () => DimensionSelector,
  PolygonHeatmap: () => PolygonHeatmap,
  ProductRecommendationCard: () => ProductRecommendationCard
});
var DimensionSelector = ({
  dimension,
  label,
  options,
  value,
  mode = "single",
  onChange,
  className = ""
}) => {
  const normalizedOptions = options.map(
    (opt) => typeof opt === "string" ? { value: opt, label: opt } : opt
  );
  const selectedValues = Array.isArray(value) ? value : typeof value === "string" && value ? [value] : [];
  const handleSelect = (optVal) => {
    if (!onChange) return;
    if (mode === "single") {
      onChange(optVal);
    } else {
      if (selectedValues.includes(optVal)) {
        onChange(selectedValues.filter((v) => v !== optVal));
      } else {
        onChange([...selectedValues, optVal]);
      }
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `dimension-selector space-y-3 ${className}`, "data-dimension": dimension, children: [
    label && /* @__PURE__ */ jsxRuntime.jsx("label", { className: "block text-sm font-semibold text-gray-800", children: label }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5", children: normalizedOptions.map((opt) => {
      const isSelected = selectedValues.includes(opt.value);
      return /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          type: "button",
          onClick: () => handleSelect(opt.value),
          className: `p-3 text-left rounded-xl border transition-all flex flex-col justify-center ${isSelected ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 font-medium" : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"}`,
          children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-sm", children: opt.label }),
            opt.description && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs text-gray-500 mt-0.5", children: opt.description })
          ]
        },
        opt.value
      );
    }) })
  ] });
};
var DimensionScoreCard = ({
  dimension,
  title,
  score,
  gradeName,
  severity = "moderate",
  variant = "spectrum-bar",
  className = ""
}) => {
  const displayTitle = title || dimension.replace(/_/g, " ");
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));
  const getSeverityBadge = () => {
    switch (severity.toLowerCase()) {
      case "mild":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "severe":
      case "critical":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: `dimension-score-card p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-3 ${className}`,
      "data-dimension": dimension,
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntime.jsx("h4", { className: "font-semibold text-gray-800 text-sm", children: displayTitle }),
          gradeName && /* @__PURE__ */ jsxRuntime.jsx("span", { className: `text-xs px-2.5 py-0.5 rounded-full border font-medium ${getSeverityBadge()}`, children: gradeName })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-baseline justify-between", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-3xl font-bold tracking-tight text-gray-900", children: normalizedScore }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs text-gray-400 font-medium", children: "/ 100 Index" })
        ] }),
        variant === "spectrum-bar" && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full bg-gray-100 h-2 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            className: `h-full transition-all duration-500 rounded-full ${normalizedScore > 70 ? "bg-rose-500" : normalizedScore >= 35 ? "bg-amber-500" : "bg-emerald-500"}`,
            style: { width: `${normalizedScore}%` }
          }
        ) })
      ]
    }
  );
};
var ProductRecommendationCard = ({
  sku,
  name,
  brand,
  category,
  matchReason,
  scoreConfidence,
  imageURL,
  activeIngredients,
  onAddToCart,
  className = ""
}) => {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: `product-card p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${className}`,
      "data-sku": sku,
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-3", children: [
          imageURL && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full h-40 rounded-xl bg-gray-50 overflow-hidden flex items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsx("img", { src: imageURL, alt: name, className: "h-full object-contain p-2" }) }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500 font-medium mb-1", children: [
              brand && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "uppercase tracking-wider text-emerald-700 font-semibold", children: brand }),
              category && /* @__PURE__ */ jsxRuntime.jsx("span", { children: category })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx("h4", { className: "font-semibold text-gray-900 text-sm leading-snug line-clamp-2", children: name })
          ] }),
          matchReason && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900 leading-relaxed", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-semibold", children: "Kenapa cocok: " }),
            matchReason
          ] }),
          activeIngredients && activeIngredients.length > 0 && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap gap-1.5 pt-1", children: activeIngredients.map((active) => /* @__PURE__ */ jsxRuntime.jsx(
            "span",
            {
              className: "text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-700",
              children: active
            },
            active
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "pt-2 border-t border-gray-50 flex items-center justify-between", children: [
          scoreConfidence !== void 0 && /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-xs font-semibold text-emerald-600", children: [
            Math.round(scoreConfidence * 100),
            "% Match"
          ] }),
          onAddToCart && /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              type: "button",
              onClick: () => onAddToCart(sku),
              className: "ml-auto text-xs font-medium px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors",
              children: "Pilih Produk"
            }
          )
        ] })
      ]
    }
  );
};
var PolygonHeatmap = ({
  imageSrc,
  zones,
  zoneMetrics = {},
  selectedZoneCode,
  onSelectZone,
  className = ""
}) => {
  const [hoveredZone, setHoveredZone] = react.useState(null);
  const getZoneColor = (zoneCode) => {
    const metric = zoneMetrics[zoneCode];
    if (!metric) return { stroke: "#3b82f6", fill: "rgba(59, 130, 246, 0.25)" };
    if (metric.status === "uncovered") {
      return { stroke: "#ef4444", fill: "rgba(239, 68, 68, 0.4)" };
    }
    if (metric.status === "moderate_issue") {
      return { stroke: "#f59e0b", fill: "rgba(245, 158, 11, 0.35)" };
    }
    return { stroke: "#10b981", fill: "rgba(16, 185, 129, 0.25)" };
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-2xl ${className}`, children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "img",
      {
        src: imageSrc,
        alt: "Facial Diagnostic Overlay",
        className: "w-full h-full object-cover block select-none pointer-events-none"
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      "svg",
      {
        viewBox: "0 0 100 100",
        preserveAspectRatio: "none",
        className: "absolute inset-0 w-full h-full cursor-pointer pointer-events-auto",
        children: zones.map((zone) => {
          const isSelected = selectedZoneCode === zone.zoneCode;
          const isHovered = hoveredZone === zone.zoneCode;
          const colors = getZoneColor(zone.zoneCode);
          const pointsStr = zone.polygon.map((p) => `${(p.x * 100).toFixed(2)},${(p.y * 100).toFixed(2)}`).join(" ");
          return /* @__PURE__ */ jsxRuntime.jsx(
            "polygon",
            {
              points: pointsStr,
              fill: isSelected || isHovered ? colors.fill.replace("0.25", "0.55").replace("0.35", "0.65").replace("0.4", "0.7") : colors.fill,
              stroke: isSelected ? "#ffffff" : colors.stroke,
              strokeWidth: isSelected ? "0.8" : isHovered ? "0.6" : "0.4",
              className: "transition-all duration-200",
              onMouseEnter: () => setHoveredZone(zone.zoneCode),
              onMouseLeave: () => setHoveredZone(null),
              onClick: () => onSelectZone && onSelectZone(zone.zoneCode),
              children: /* @__PURE__ */ jsxRuntime.jsx("title", { children: `${zone.zoneName} (${zoneMetrics[zone.zoneCode]?.coverageScore || 0}% Coverage)` })
            },
            zone.zoneCode
          );
        })
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl bg-black/70 backdrop-blur-md px-3 py-1.5 border border-white/10 text-[11px] text-white", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Optimal" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Uneven" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Missed" })
      ] }),
      selectedZoneCode && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-bold text-blue-400 pl-2 border-l border-white/20", children: zones.find((z) => z.zoneCode === selectedZoneCode)?.zoneName || selectedZoneCode })
    ] })
  ] });
};
var AgingProgressionSlider = ({
  agingData,
  className = ""
}) => {
  if (!agingData) return null;
  const timelinePoints = agingData.timeline && agingData.timeline.length > 0 ? agingData.timeline : [
    { targetAge: agingData.currentAge, yearsAhead: 0, withRegimen: agingData.scoreNow, withoutRegimen: agingData.scoreNow },
    { targetAge: agingData.currentAge + 10, yearsAhead: 10, withRegimen: agingData.scorePlus10WithRegimen, withoutRegimen: agingData.scorePlus10WithoutRegimen },
    { targetAge: agingData.currentAge + 20, yearsAhead: 20, withRegimen: agingData.scorePlus20WithRegimen, withoutRegimen: agingData.scorePlus20WithoutRegimen }
  ];
  const [selectedYearsAhead, setSelectedYearsAhead] = react.useState(10);
  const activePoint = timelinePoints.find((p) => p.yearsAhead === selectedYearsAhead) || timelinePoints[1] || timelinePoints[0];
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `rounded-2xl border border-white/10 bg-neutral-950/80 p-6 backdrop-blur-xl shadow-xl ${className}`, children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-lg font-bold text-white tracking-wide", children: "Skin Longevity & Aging Simulation" }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-neutral-400 mt-0.5", children: "Time-lapse progression projection with vs without clinical skincare regimen" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300", children: [
        "Bio-Age Offset: ",
        agingData.biologicalAgeOffset > 0 ? `+${agingData.biologicalAgeOffset}` : agingData.biologicalAgeOffset,
        " yrs"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-5 flex flex-wrap gap-1.5 rounded-xl bg-white/5 p-1.5 border border-white/5", children: timelinePoints.map((point) => {
      const isSelected = activePoint.yearsAhead === point.yearsAhead;
      const label = point.yearsAhead === 0 ? `Now (${point.targetAge}y)` : `+${point.yearsAhead}y (${point.targetAge}y)`;
      return /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          onClick: () => setSelectedYearsAhead(point.yearsAhead),
          className: `flex-1 min-w-[70px] rounded-lg py-2 px-1 text-center text-xs font-bold transition-all ${isSelected ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" : "text-neutral-400 hover:text-white"}`,
          children: label
        },
        point.yearsAhead
      );
    }) }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs font-bold uppercase tracking-wider text-emerald-400", children: "With Targeted Regimen" }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs text-emerald-300 font-medium", children: "Optimal Defense" })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-3 flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-3xl font-extrabold text-emerald-400", children: activePoint.withRegimen.toFixed(1) }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs text-neutral-400", children: "/ 100 Longevity Score" })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-2 text-xs text-neutral-300", children: "Preserves collagen integrity and slows cellular UV photo-damage." })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-xl border border-rose-500/30 bg-rose-950/20 p-4", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs font-bold uppercase tracking-wider text-rose-400", children: "Without Protection" }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs text-rose-300 font-medium", children: "Accelerated Aging" })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-3 flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-3xl font-extrabold text-rose-400", children: activePoint.withoutRegimen.toFixed(1) }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs text-neutral-400", children: "/ 100 Longevity Score" })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-2 text-xs text-neutral-300", children: "Susceptible to solar elastosis, deep wrinkles, and moisture barrier erosion." })
      ] })
    ] })
  ] });
};
var BeautyExperienceWidget = ({
  gatewayUrl,
  apiKey,
  token,
  brandId,
  applicationId,
  onComplete,
  onAddToCart,
  initialAge = 28,
  initialUvIndex = 8.5,
  className = ""
}) => {
  const [client] = react.useState(() => new BeautyClient({ gatewayUrl, apiKey, token, brandId, applicationId }));
  const [currentAge, setCurrentAge] = react.useState(initialAge);
  const [uvIndex, setUvIndex] = react.useState(initialUvIndex);
  const [imagePreview, setImagePreview] = react.useState(null);
  const [currentFile, setCurrentFile] = react.useState(null);
  const [isAnalyzing, setIsAnalyzing] = react.useState(false);
  const [analysisResult, setAnalysisResult] = react.useState(null);
  const [selectedZone, setSelectedZone] = react.useState(null);
  const fileInputRef = react.useRef(null);
  const runAnalysis = async (file, ageToAnalyze, uviToAnalyze) => {
    setIsAnalyzing(true);
    try {
      const result = await client.analyzeImage(file, {
        dimensions: ["acne", "wrinkles", "pigment", "uv_defense", "aging"],
        chronologicalAge: ageToAnalyze,
        uvIndex: uviToAnalyze
      });
      setAnalysisResult(result);
      if (onComplete) onComplete(result);
    } catch (err) {
      alert(`Analisis gagal: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCurrentFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setAnalysisResult(null);
    await runAnalysis(file, currentAge, uvIndex);
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `rounded-3xl border border-white/10 bg-neutral-950 p-6 md:p-8 text-white shadow-2xl ${className}`, children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[11px] font-bold uppercase tracking-wider text-blue-400", children: "Clinical Face Diagnostics" }),
        /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "text-xl md:text-2xl font-black text-white", children: "AI Vision UV & Aging Longevity Analyzer" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            ref: fileInputRef,
            type: "file",
            accept: "image/*",
            className: "hidden",
            onChange: handleFileUpload
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            onClick: () => fileInputRef.current?.click(),
            className: "rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-blue-500 transition-all flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsxRuntime.jsxs("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [
                /* @__PURE__ */ jsxRuntime.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" }),
                /* @__PURE__ */ jsxRuntime.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 13a3 3 0 11-6 0 3 3 0 016 0z" })
              ] }),
              imagePreview ? "Ambil Ulang" : "Upload / Capture Wajah"
            ]
          }
        )
      ] })
    ] }),
    !imagePreview ? /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        onClick: () => fileInputRef.current?.click(),
        className: "mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5 py-16 px-4 text-center cursor-pointer hover:border-blue-500/50 hover:bg-white/[0.07] transition-all",
        children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "rounded-full bg-blue-500/10 p-4 text-blue-400", children: /* @__PURE__ */ jsxRuntime.jsx("svg", { className: "w-8 h-8", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntime.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }) }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-3 text-sm font-semibold text-white", children: "Unggah Foto Wajah atau Tangkapan Kamera UV" }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-1 text-xs text-neutral-400 max-w-sm", children: "Engine akan melakukan segmentasi 8 zona poligon, menganalisis daya serap sunscreen (UV), dan mensimulasikan proyeksi penuaan." })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "lg:col-span-6 flex flex-col items-center", children: isAnalyzing ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "h-96 w-full flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 animate-pulse", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-4 text-xs font-semibold text-neutral-300", children: "Memproses 8 Zona Poligon & Spektrum UV..." })
      ] }) : analysisResult ? /* @__PURE__ */ jsxRuntime.jsx(
        PolygonHeatmap,
        {
          imageSrc: imagePreview,
          zones: analysisResult.zones,
          zoneMetrics: analysisResult.zoneMetrics,
          selectedZoneCode: selectedZone,
          onSelectZone: (code) => setSelectedZone(code),
          className: "w-full aspect-square"
        }
      ) : null }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "lg:col-span-6 flex flex-col gap-6", children: analysisResult && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-xl border border-blue-500/30 bg-blue-950/20 p-4", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[11px] font-bold uppercase tracking-wider text-blue-400", children: "UV Protection Defense" }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-1 flex items-baseline gap-2", children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-3xl font-black text-white", children: analysisResult.overallCoverageScore }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs text-neutral-400", children: "/ 100" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[11px] font-bold uppercase tracking-wider text-indigo-400", children: "Skin Longevity Index" }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-1 flex items-baseline gap-2", children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-3xl font-black text-white", children: analysisResult.skinLongevityScore }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs text-neutral-400", children: "/ 100" })
            ] })
          ] })
        ] }),
        analysisResult.agingSimulation && /* @__PURE__ */ jsxRuntime.jsx(AgingProgressionSlider, { agingData: analysisResult.agingSimulation })
      ] }) })
    ] })
  ] });
};

exports.AgingProgressionSlider = AgingProgressionSlider;
exports.AssessmentsSubClient = AssessmentsSubClient;
exports.BeautyClient = BeautyClient;
exports.BeautyExperienceWidget = BeautyExperienceWidget;
exports.Core = core_exports;
exports.DimensionScoreCard = DimensionScoreCard;
exports.DimensionSelector = DimensionSelector;
exports.FormSubClient = FormSubClient;
exports.Hooks = hooks_exports;
exports.MatchSubClient = MatchSubClient;
exports.PolygonHeatmap = PolygonHeatmap;
exports.ProductRecommendationCard = ProductRecommendationCard;
exports.ReferenceSubClient = ReferenceSubClient;
exports.UI = ui_exports;
exports.Vision = ui_exports;
exports.VisionSubClient = VisionSubClient;
exports.useRegimenMatch = useRegimenMatch;
exports.useSkinAssessment = useSkinAssessment;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map