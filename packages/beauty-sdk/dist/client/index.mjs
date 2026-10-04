// src/client/errors.ts
var BeautyApiError = class extends Error {
  constructor(init) {
    super(init.message || init.code || `HTTP ${init.status}`);
    this.name = "BeautyApiError";
    this.status = init.status;
    this.code = init.code;
    this.details = init.details;
  }
};
var isEntry = (v) => !!v && typeof v === "object" && !Array.isArray(v);
var str = (v) => typeof v === "string" ? v : "";
async function parseApiError(res) {
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return new BeautyApiError({ status: res.status, code: "", message: text, details: [] });
  }
  const b = isEntry(body) ? body : {};
  const detail = b.detail;
  const details = Array.isArray(detail) ? detail.filter(isEntry) : isEntry(detail) ? [detail] : [];
  const first = details[0] ?? {};
  if (!details.length && Array.isArray(b.errors)) {
    for (const m of b.errors) if (typeof m === "string") details.push({ message: m });
  }
  return new BeautyApiError({
    status: res.status,
    code: str(first.code) || str(b.code) || str(b.error_code),
    message: str(first.reason) || str(first.message) || str(b.error) || str(b.message) || str(detail),
    details
  });
}

// src/client/operations.ts
var OPERATIONS = [
  { id: "colour.analyze", method: "POST", sdkPath: "/colour/analyze", gatewayPath: "/core/colour-engine/analyze", scope: "none", customer: false, query: [] },
  { id: "colour.tryOn", method: "POST", sdkPath: "/colour/tryon", gatewayPath: "/core/colour-engine/tryon", scope: "none", customer: false, query: [] },
  { id: "colour.catalog", method: "GET", sdkPath: "/colour/catalog", gatewayPath: "/core/colour-engine/catalog", scope: "none", customer: false, query: [] },
  { id: "face.analyze", method: "POST", sdkPath: "/face/analyze", gatewayPath: "/core/face-architecture/{brandId}/{applicationId}", scope: "path", customer: false, query: [] },
  { id: "face.head", method: "POST", sdkPath: "/face/head", gatewayPath: "/core/face-architecture/{brandId}/{applicationId}/head", scope: "path", customer: false, query: [] },
  { id: "skin.analyze", method: "POST", sdkPath: "/skin/analyze", gatewayPath: "/core/vision-engine/analyze-image", scope: "multipart", customer: false, query: [] },
  { id: "reference.brands", method: "GET", sdkPath: "/reference/brands", gatewayPath: "/reference/brands", scope: "none", customer: false, query: [] },
  { id: "reference.products", method: "GET", sdkPath: "/reference/products", gatewayPath: "/reference/products", scope: "none", customer: false, query: ["brandId"] }
  // forms.evaluate and assessments.history are not here on purpose. Both are
  // broken against core today (evaluate needs the customer id written into the
  // body, history needs brand/application written into the query), and the
  // SDK has neither placement yet. They return in phase 5, once
  // customer-in-body and scope-in-query placement exist.
];
function isSafePathParam(value) {
  if (value === "." || value === "..") return false;
  if (value.includes("/") || value.includes("\\")) return false;
  return true;
}
function isSafeScopeValue(value) {
  if (value === "." || value === "..") return false;
  return true;
}
var fillParams = (path, params) => path.replace(/:([A-Za-z]+)/g, (_, k) => {
  if (!(k in params)) throw new Error(`Missing path parameter "${k}"`);
  const value = params[k];
  if (!isSafePathParam(value)) throw new Error(`Unsafe path parameter: "${k}"`);
  return encodeURIComponent(value);
});
function sdkUrl(op, params) {
  return fillParams(op.sdkPath, params);
}
function gatewayUrl(op, params, scope) {
  const withScope = op.gatewayPath.replace(/\{(brandId|applicationId|customerId)\}/g, (_, k) => {
    const v = scope[k];
    if (!v) throw new Error(`Missing scope "${k}" for ${op.id}`);
    if (!isSafeScopeValue(v)) throw new Error(`Unsafe scope "${k}": "${v}"`);
    return encodeURIComponent(v);
  });
  return fillParams(withScope, params);
}
var SCOPE_KEYS = /* @__PURE__ */ new Set(["brandid", "applicationid"]);
function injectScope(op, body, scope) {
  if (op.scope === "json") {
    if (body instanceof FormData) {
      throw new Error(`${op.id} requires JSON body, got FormData`);
    }
    const out = {};
    for (const [k, v] of Object.entries(body ?? {})) {
      if (!SCOPE_KEYS.has(k.toLowerCase().replace(/[_-]/g, ""))) out[k] = v;
    }
    out.brand_id = scope.brandId;
    out.application_id = scope.applicationId;
    return out;
  }
  if (op.scope === "multipart") {
    if (!(body instanceof FormData)) {
      throw new Error(`${op.id} requires FormData body`);
    }
    const newFormData = new FormData();
    for (const [key, value] of body) {
      newFormData.append(key, value);
    }
    newFormData.delete("brandId");
    newFormData.delete("applicationId");
    newFormData.set("brandId", scope.brandId);
    newFormData.set("applicationId", scope.applicationId);
    return newFormData;
  }
  return body;
}

// src/client/reference.ts
function referenceMethods(client) {
  return {
    brands: async (signal) => {
      const res = await client.json("reference.brands", { signal });
      if (!Array.isArray(res.data)) {
        throw new Error("reference.brands: response has no data list");
      }
      return res.data;
    },
    products: async (signal) => {
      const res = await client.json("reference.products", { signal });
      if (!Array.isArray(res.data)) {
        throw new Error("reference.products: response has no data list");
      }
      return res.data;
    }
  };
}

// src/client/transport.ts
function createBeautyClient(opts) {
  const direct = opts.apiKey !== void 0;
  if (direct && typeof window !== "undefined") {
    throw new Error("createBeautyClient: an apiKey may only be used on the server. In the browser, pass the proxy route as baseUrl.");
  }
  if (direct && (!opts.apiKey || !opts.apiKey.trim())) {
    throw new Error("createBeautyClient: apiKey is empty. Set it from server env, or omit it to use the proxy.");
  }
  if (direct && (!opts.brandId || !opts.brandId.trim() || !opts.applicationId || !opts.applicationId.trim())) {
    throw new Error("createBeautyClient: brandId and applicationId are required with an apiKey.");
  }
  const base = opts.baseUrl.replace(/\/+$/, "");
  const doFetch = opts.fetch ?? fetch;
  const scope = { brandId: opts.brandId ?? "", applicationId: opts.applicationId ?? "", customerId: opts.customerId };
  const call = async (id, init = {}) => {
    const op = OPERATIONS.find((o) => o.id === id);
    if (!op) throw new Error(`Unknown operation ${id}`);
    const params = init.params ?? {};
    const path = direct ? gatewayUrl(op, params, scope) : sdkUrl(op, params);
    const query = direct ? Object.fromEntries(Object.entries(init.query ?? {}).filter(([k]) => op.query.includes(k))) : init.query ?? {};
    const qs = Object.keys(query).length ? `?${new URLSearchParams(query)}` : "";
    const body = direct ? injectScope(op, init.body, scope) : init.body;
    const headers = new Headers();
    if (direct) headers.set("x-api-key", opts.apiKey);
    let payload;
    if (body instanceof FormData) payload = body;
    else if (body !== void 0) {
      headers.set("content-type", "application/json");
      payload = JSON.stringify(body);
    }
    return doFetch(`${base}${path}${qs}`, { method: op.method, headers, body: payload, signal: init.signal });
  };
  const checked = async (id, init) => {
    const res = await call(id, init);
    if (!res.ok) throw await parseApiError(res);
    return res;
  };
  const client = {
    call,
    json: async (id, init) => await (await checked(id, init)).json(),
    binary: async (id, init) => (await checked(id, init)).arrayBuffer(),
    reference: void 0
  };
  client.reference = referenceMethods(client);
  return client;
}

export { BeautyApiError, OPERATIONS, createBeautyClient, parseApiError };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map