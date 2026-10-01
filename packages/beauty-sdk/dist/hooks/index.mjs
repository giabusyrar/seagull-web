import { useState, useCallback } from 'react';

// src/hooks/useSkinAssessment.ts

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

// src/hooks/useSkinAssessment.ts
function useSkinAssessment(config) {
  const [client] = useState(() => new BeautyClient(config));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const evaluate = useCallback(
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
  const reset = useCallback(() => {
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
  const [selectedProducts, setSelectedProducts] = useState([]);
  const toggleProduct = useCallback((sku) => {
    setSelectedProducts(
      (prev) => prev.includes(sku) ? prev.filter((s) => s !== sku) : [...prev, sku]
    );
  }, []);
  const clearSelection = useCallback(() => {
    setSelectedProducts([]);
  }, []);
  return {
    selectedProducts,
    toggleProduct,
    clearSelection
  };
}

export { useRegimenMatch, useSkinAssessment };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map