'use strict';

var react = require('react');

// src/hooks/useSkinAssessment.ts

// src/core/evaluate-assessment.ts
async function evaluateAssessment(config, surveyCode, request, doFetch = fetch) {
  if (!surveyCode) {
    throw new Error("evaluateAssessment needs a survey code: core-engine looks the survey up by it.");
  }
  const payload = {
    ...request,
    brand_id: request.brand_id || config.brandId,
    application_id: request.application_id || config.applicationId
  };
  const headers = {
    "Content-Type": "application/json"
  };
  if (config.apiKey) {
    headers["X-API-Key"] = config.apiKey;
  }
  if (config.token) {
    headers["Authorization"] = `Bearer ${config.token}`;
  }
  const url = `${config.gatewayUrl}/core/form-engine/survey/${encodeURIComponent(surveyCode)}/evaluate`;
  const response = await doFetch(url, {
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
function gatewayAssessmentEvaluator(config) {
  const normalized = { ...config, gatewayUrl: config.gatewayUrl.replace(/\/$/, "") };
  return { evaluateAssessment: (surveyCode, request) => evaluateAssessment(normalized, surveyCode, request) };
}

// src/hooks/useSkinAssessment.ts
function useSkinAssessment(config) {
  const [evaluator] = react.useState(() => config.evaluator ?? gatewayAssessmentEvaluator(config));
  const [isLoading, setIsLoading] = react.useState(false);
  const [error, setError] = react.useState(null);
  const [result, setResult] = react.useState(null);
  const evaluate = react.useCallback(
    async (surveyCode, request) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await evaluator.evaluateAssessment(surveyCode, request);
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
    [evaluator]
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

exports.useRegimenMatch = useRegimenMatch;
exports.useSkinAssessment = useSkinAssessment;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map