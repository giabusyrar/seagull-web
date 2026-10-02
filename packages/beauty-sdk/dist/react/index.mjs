"use client";
"use client";

// src/react/BeautyProvider.tsx
import { createContext, useContext, useMemo } from "react";

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
  return new BeautyApiError({
    status: res.status,
    code: str(first.code) || str(b.code),
    message: str(first.reason) || str(first.message) || str(b.error) || str(b.message),
    details
  });
}

// src/client/operations.ts
var OPERATIONS = [
  { id: "colour.analyze", method: "POST", sdkPath: "/colour/analyze", gatewayPath: "/core/colour-engine/analyze", scope: "none", customer: false, query: [] },
  { id: "colour.tryOn", method: "POST", sdkPath: "/colour/tryon", gatewayPath: "/core/colour-engine/tryon", scope: "none", customer: false, query: [] },
  { id: "colour.catalog", method: "GET", sdkPath: "/colour/catalog", gatewayPath: "/core/colour-engine/catalog", scope: "none", customer: false, query: [] },
  { id: "face.analyze", method: "POST", sdkPath: "/face/analyze", gatewayPath: "/core/vision-engine/face-architecture/{brandId}/{applicationId}", scope: "path", customer: false, query: [] },
  { id: "face.head", method: "POST", sdkPath: "/face/head", gatewayPath: "/core/vision-engine/face-architecture/{brandId}/{applicationId}/head", scope: "path", customer: false, query: [] },
  { id: "skin.analyze", method: "POST", sdkPath: "/skin/analyze", gatewayPath: "/core/vision-engine/analyze-image", scope: "multipart", customer: false, query: [] },
  { id: "reference.brands", method: "GET", sdkPath: "/reference/brands", gatewayPath: "/reference/brands", scope: "none", customer: false, query: [] },
  { id: "reference.products", method: "GET", sdkPath: "/reference/products", gatewayPath: "/reference/products", scope: "none", customer: false, query: ["brandId"] },
  { id: "forms.evaluate", method: "POST", sdkPath: "/forms/:code/evaluate", gatewayPath: "/core/form-engine/survey/:code/evaluate", scope: "json", customer: false, query: [] },
  { id: "assessments.history", method: "GET", sdkPath: "/assessments/history", gatewayPath: "/core/assessments/customers/{customerId}", scope: "none", customer: true, query: [] }
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
function injectScope(op, body, scope) {
  if (op.scope === "json") {
    if (body instanceof FormData) {
      throw new Error(`${op.id} requires JSON body, got FormData`);
    }
    return { ...body, brand_id: scope.brandId, application_id: scope.applicationId };
  }
  if (op.scope === "multipart") {
    if (!(body instanceof FormData)) {
      throw new Error(`${op.id} requires FormData body`);
    }
    const newFormData = new FormData();
    for (const [key, value] of body) {
      newFormData.set(key, value);
    }
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
      if (!("data" in res) || res.data === void 0) {
        throw new Error("reference.brands: response has no data list");
      }
      return res.data;
    },
    products: async (signal) => {
      const res = await client.json("reference.products", { signal });
      if (!("data" in res) || res.data === void 0) {
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

// src/react/messages.ts
var defaultMessages = {
  id: {
    "photo.front": "Depan",
    "photo.left": "Kiri \xBE",
    "photo.right": "Kanan \xBE",
    "photo.left.hint": "Menoleh ke kirimu",
    "photo.right.hint": "Menoleh ke kananmu",
    "photo.add": "Tambah foto {view}",
    "photo.change": "Ganti foto {view}",
    "photo.remove": "Hapus foto {view}",
    "photo.optional": "opsional",
    "photo.sides.title": "Foto samping (opsional)",
    "photo.sides.why": "untuk kepala 3D yang lebih akurat",
    "photo.sides.guide": "Wajah menoleh sebagian (tiga perempat), bukan profil penuh; cahaya dan jarak sama dengan foto depan."
  },
  en: {
    "photo.front": "Front",
    "photo.left": "Left \xBE",
    "photo.right": "Right \xBE",
    "photo.left.hint": "Turn to your left",
    "photo.right.hint": "Turn to your right",
    "photo.add": "Add {view} photo",
    "photo.change": "Replace {view} photo",
    "photo.remove": "Remove {view} photo",
    "photo.optional": "optional",
    "photo.sides.title": "Side photos (optional)",
    "photo.sides.why": "for a more accurate 3D head",
    "photo.sides.guide": "Face turned part-way (three-quarter), not full profile; same light and distance as the front photo."
  }
};
function format(template, vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (all, k) => k in vars ? String(vars[k]) : all);
}

// src/react/BeautyProvider.tsx
import { jsx } from "react/jsx-runtime";
var Ctx = createContext(null);
function BeautyProvider({ baseUrl = "/api/beauty", client, locale = "id", messages, children }) {
  const resolvedClient = useMemo(() => client ?? createBeautyClient({ baseUrl }), [client, baseUrl]);
  const t = useMemo(() => {
    const dict = { ...defaultMessages[locale], ...messages };
    return (key, vars) => format(dict[key] ?? key, vars);
  }, [locale, messages]);
  const value = useMemo(() => ({ client: resolvedClient, locale, t }), [resolvedClient, locale, t]);
  return /* @__PURE__ */ jsx(Ctx.Provider, { value, children });
}
function useBeauty() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBeauty must be used inside <BeautyProvider>.");
  return ctx;
}

// src/react/useOperation.ts
import { useCallback, useEffect, useRef, useState } from "react";
var IDLE = { key: null, status: "idle", data: null, error: null };
function useOperation(fn, inputKey) {
  const [state, setState] = useState(IDLE);
  const inflight = useRef(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => () => inflight.current?.abort(), []);
  const run = useCallback(async () => {
    inflight.current?.abort();
    const ctrl = new AbortController();
    inflight.current = ctrl;
    setState({ key: inputKey, status: "loading", data: null, error: null });
    try {
      const data = await fnRef.current(ctrl.signal);
      if (ctrl.signal.aborted) return;
      setState({ key: inputKey, status: "success", data, error: null });
    } catch (error) {
      if (ctrl.signal.aborted) return;
      setState({ key: inputKey, status: "error", data: null, error });
    } finally {
      if (inflight.current === ctrl) inflight.current = null;
    }
  }, [inputKey]);
  const reset = useCallback(() => {
    inflight.current?.abort();
    setState(IDLE);
  }, []);
  const current = state.key === inputKey ? state : IDLE;
  return { status: current.status, data: current.data, error: current.error, run, reset };
}

// src/react/usePhotoSet.ts
import { useCallback as useCallback2, useMemo as useMemo2, useState as useState2 } from "react";
var VIEWS = ["front", "left", "right"];
function photosKey(photos) {
  return VIEWS.map((v) => {
    const f = photos[v];
    return f ? `${v}:${f.name}:${f.size}:${f.lastModified}` : `${v}:-`;
  }).join("|");
}
function usePhotoSet(initial = {}) {
  const [photos, setPhotos] = useState2(initial);
  const set = useCallback2((view, file) => {
    setPhotos((p) => {
      const next = { ...p };
      if (file) next[view] = file;
      else delete next[view];
      return next;
    });
  }, []);
  const clear = useCallback2(() => setPhotos({}), []);
  const key = useMemo2(() => photosKey(photos), [photos]);
  return { photos, set, clear, key };
}
export {
  BeautyProvider,
  defaultMessages,
  format,
  photosKey,
  useBeauty,
  useOperation,
  usePhotoSet
};
//# sourceMappingURL=index.mjs.map