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
  async evaluate(request) {
    return this.client.evaluateAssessment(request);
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
   * Unified single-hit multi-modal assessment evaluation (<50ms).
   */
  async evaluateAssessment(request) {
    const payload = {
      brand_id: request.brand_id || this.config.brandId,
      application_id: request.application_id || this.config.applicationId,
      ...request
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
    const url = `${this.config.gatewayUrl}/api/v1/assessments/evaluate`;
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

// src/core/collection-resolver.ts
var cachedCollections = null;
var lastFetchedAt = 0;
var CACHE_TTL_MS = 3e4;
async function getActiveCoreCollections(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedCollections && now - lastFetchedAt < CACHE_TTL_MS) {
    return cachedCollections;
  }
  try {
    const res = await fetch("/api/collections?type=core", { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch core collections: HTTP ${res.status}`);
    const data = await res.json();
    const cols = Array.isArray(data.collections) ? data.collections : [];
    cachedCollections = cols;
    lastFetchedAt = now;
    return cols;
  } catch (err) {
    console.warn("Dynamic collection discovery notice (using standard routing fallback):", err);
    return cachedCollections || [];
  }
}
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

export { AssessmentsSubClient, BeautyClient, FormSubClient, MatchSubClient, ReferenceSubClient, VisionSubClient, getActiveCoreCollections, getCollectionPrefix, resolveDynamicEndpoint };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map