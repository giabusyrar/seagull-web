// src/client/operations.ts
var OPERATIONS = [
  { id: "colour.analyze", method: "POST", sdkPath: "/colour/analyze", gatewayPath: "/core/colour-engine/analyze", scope: "none", customer: false, query: [] },
  { id: "colour.tryOn", method: "POST", sdkPath: "/colour/tryon", gatewayPath: "/core/colour-engine/tryon", scope: "none", customer: false, query: [] },
  { id: "colour.catalog", method: "GET", sdkPath: "/colour/catalog", gatewayPath: "/core/colour-engine/catalog", scope: "none", customer: false, query: [] },
  { id: "face.analyze", method: "POST", sdkPath: "/face/analyze", gatewayPath: "/core/vision-engine/face-architecture/{brandId}/{applicationId}", scope: "path", customer: false, query: [] },
  { id: "face.head", method: "POST", sdkPath: "/face/head", gatewayPath: "/core/vision-engine/face-architecture/{brandId}/{applicationId}/head", scope: "path", customer: false, query: [] },
  { id: "skin.analyze", method: "POST", sdkPath: "/skin/analyze", gatewayPath: "/core/vision-engine/analyze-image", scope: "multipart", customer: false, query: [] },
  { id: "reference.brands", method: "GET", sdkPath: "/reference/brands", gatewayPath: "/reference/brands", scope: "none", customer: false, query: [] },
  { id: "reference.products", method: "GET", sdkPath: "/reference/products", gatewayPath: "/reference/products", scope: "none", customer: false, query: ["brandId"] }
  // forms.evaluate and assessments.history are not here on purpose. Both are
  // broken against core today (evaluate needs the customer id written into the
  // body, history needs brand/application written into the query), and the
  // SDK has neither placement yet. They return in phase 5, once
  // customer-in-body and scope-in-query placement exist.
];
var split = (p) => p.split("/").filter(Boolean);
function isSafePathParam(value) {
  if (value === "." || value === "..") return false;
  if (value.includes("/") || value.includes("\\")) return false;
  return true;
}
function isSafeScopeValue(value) {
  if (value === "." || value === "..") return false;
  return true;
}
function matchOperation(method, path) {
  const segs = split(path);
  for (const op of OPERATIONS) {
    if (op.method !== method.toUpperCase()) continue;
    const pat = split(op.sdkPath);
    if (pat.length !== segs.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < pat.length && ok; i++) {
      if (pat[i].startsWith(":")) {
        try {
          const decoded = decodeURIComponent(segs[i]);
          if (!isSafePathParam(decoded)) {
            ok = false;
          } else {
            params[pat[i].slice(1)] = decoded;
          }
        } catch {
          return null;
        }
      } else {
        ok = pat[i] === segs[i];
      }
    }
    if (ok) return { op, params };
  }
  return null;
}
var fillParams = (path, params) => path.replace(/:([A-Za-z]+)/g, (_, k) => {
  if (!(k in params)) throw new Error(`Missing path parameter "${k}"`);
  const value = params[k];
  if (!isSafePathParam(value)) throw new Error(`Unsafe path parameter: "${k}"`);
  return encodeURIComponent(value);
});
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

// src/server/timeouts.ts
var MARGIN_MS = 5e3;
var CORE_FACE_MEASURE_MS = 2e4;
var CORE_FACE_HEAD_MS = 3e4;
var CORE_COLOUR_WORKER_MS = 6e4;
var CORE_VISION_DAG_MS = 3e4;
var DEFAULT_PROXY_TIMEOUT_MS = 15e3;
var OPERATION_TIMEOUT_MS = {
  "colour.analyze": CORE_COLOUR_WORKER_MS + MARGIN_MS,
  "colour.tryOn": CORE_COLOUR_WORKER_MS + MARGIN_MS,
  "colour.catalog": CORE_COLOUR_WORKER_MS + MARGIN_MS,
  "face.analyze": CORE_FACE_MEASURE_MS + MARGIN_MS,
  "face.head": CORE_FACE_HEAD_MS + MARGIN_MS,
  "skin.analyze": CORE_VISION_DAG_MS + MARGIN_MS,
  "reference.brands": DEFAULT_PROXY_TIMEOUT_MS,
  "reference.products": DEFAULT_PROXY_TIMEOUT_MS
};

// src/server/proxy.ts
var problem = (status, code) => new Response(JSON.stringify({ detail: { code } }), { status, headers: { "content-type": "application/json" } });
var PASS_HEADERS = ["content-type", "content-disposition", "cache-control"];
function createBeautyProxy(opts) {
  for (const field of ["gatewayUrl", "apiKey", "brandId", "applicationId"]) {
    const v = opts[field];
    if (typeof v !== "string" || !v.trim()) {
      throw new Error(`createBeautyProxy: "${field}" is required and must not be empty (is its environment variable set?)`);
    }
  }
  const base = opts.gatewayUrl.replace(/\/+$/, "");
  const doFetch = opts.fetch ?? fetch;
  const handle = async (req, ctx) => {
    const segments = (await ctx.params).path ?? [];
    const match = matchOperation(req.method, `/${segments.join("/")}`);
    if (!match) return problem(404, "not_found");
    const { op, params } = match;
    let customerId;
    if (opts.authorize) {
      let auth;
      try {
        auth = await opts.authorize(req);
      } catch {
        return problem(401, "authorize_failed");
      }
      if (auth instanceof Response) return auth;
      customerId = auth.customerId;
    }
    if (op.customer && !customerId) return problem(401, "customer_required");
    const scope = { brandId: opts.brandId, applicationId: opts.applicationId, customerId };
    const query = new URLSearchParams();
    for (const [k, v] of new URL(req.url).searchParams) if (op.query.includes(k)) query.append(k, v);
    const search = query.size ? `?${query}` : "";
    let path;
    try {
      path = gatewayUrl(op, params, scope);
    } catch {
      return problem(400, "invalid_params");
    }
    const url = `${base}${path}${search}`;
    const headers = new Headers({ "x-api-key": opts.apiKey });
    const accept = req.headers.get("accept");
    if (accept) headers.set("accept", accept);
    let body;
    if (op.method === "POST") {
      try {
        if (op.scope === "json") {
          headers.set("content-type", "application/json");
          body = JSON.stringify(injectScope(op, await req.json(), scope));
        } else if (op.scope === "multipart") {
          body = injectScope(op, await req.formData(), scope);
        } else {
          const type = req.headers.get("content-type");
          if (type) headers.set("content-type", type);
          body = req.body ?? void 0;
        }
      } catch {
        return problem(400, "invalid_body");
      }
    }
    const timeout = opts.timeouts?.[op.id] ?? OPERATION_TIMEOUT_MS[op.id];
    const signal = AbortSignal.any([req.signal, AbortSignal.timeout(timeout)]);
    let upstream;
    try {
      upstream = await doFetch(url, { method: op.method, headers, body, signal, duplex: "half" });
    } catch (e) {
      if (e instanceof DOMException && (e.name === "TimeoutError" || e.name === "AbortError") && !req.signal.aborted) return problem(504, "timeout");
      return problem(502, "gateway_unreachable");
    }
    const out = new Headers();
    for (const h of PASS_HEADERS) {
      const v = upstream.headers.get(h);
      if (v) out.set(h, v);
    }
    return new Response(upstream.body, { status: upstream.status, headers: out });
  };
  return { GET: handle, POST: handle };
}

export { DEFAULT_PROXY_TIMEOUT_MS, OPERATION_TIMEOUT_MS, createBeautyProxy };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map