"use client";
"use strict";
"use client";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/react/index.ts
var react_exports = {};
__export(react_exports, {
  BeautyProvider: () => BeautyProvider,
  defaultMessages: () => defaultMessages,
  format: () => format,
  photosKey: () => photosKey,
  useBeauty: () => useBeauty,
  useOperation: () => useOperation,
  usePhotoSet: () => usePhotoSet
});
module.exports = __toCommonJS(react_exports);

// src/react/BeautyProvider.tsx
var import_react = require("react");
var import_client = require("@gateway-experience/beauty-sdk/client");

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
  return template.replace(/\{(\w+)\}/g, (all, k) => Object.hasOwn(vars, k) ? String(vars[k]) : all);
}

// src/react/BeautyProvider.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var Ctx = (0, import_react.createContext)(null);
function BeautyProvider({ baseUrl = "/api/beauty", client, locale = "id", messages, children }) {
  const resolvedClient = (0, import_react.useMemo)(() => client ?? (0, import_client.createBeautyClient)({ baseUrl }), [client, baseUrl]);
  const t = (0, import_react.useMemo)(() => {
    const dict = { ...defaultMessages[locale], ...messages };
    return (key, vars) => format(Object.hasOwn(dict, key) ? dict[key] : key, vars);
  }, [locale, messages]);
  const value = (0, import_react.useMemo)(() => ({ client: resolvedClient, locale, t }), [resolvedClient, locale, t]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ctx.Provider, { value, children });
}
function useBeauty() {
  const ctx = (0, import_react.useContext)(Ctx);
  if (!ctx) throw new Error("useBeauty must be used inside <BeautyProvider>.");
  return ctx;
}

// src/react/useOperation.ts
var import_react2 = require("react");
var IDLE = { key: null, status: "idle", data: null, error: null };
function useOperation(fn, inputKey) {
  const [state, setState] = (0, import_react2.useState)(IDLE);
  const inflight = (0, import_react2.useRef)(null);
  const fnRef = (0, import_react2.useRef)(fn);
  fnRef.current = fn;
  (0, import_react2.useEffect)(() => () => inflight.current?.abort(), []);
  const run = (0, import_react2.useCallback)(async () => {
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
  const reset = (0, import_react2.useCallback)(() => {
    inflight.current?.abort();
    setState(IDLE);
  }, []);
  const current = state.key === inputKey ? state : IDLE;
  return { status: current.status, data: current.data, error: current.error, run, reset };
}

// src/react/usePhotoSet.ts
var import_react3 = require("react");
var VIEWS = ["front", "left", "right"];
function photosKey(photos) {
  return VIEWS.map((v) => {
    const f = photos[v];
    return f ? `${v}:${f.name}:${f.size}:${f.lastModified}` : `${v}:-`;
  }).join("|");
}
function usePhotoSet(initial = {}) {
  const [photos, setPhotos] = (0, import_react3.useState)(initial);
  const set = (0, import_react3.useCallback)((view, file) => {
    setPhotos((p) => {
      const next = { ...p };
      if (file) next[view] = file;
      else delete next[view];
      return next;
    });
  }, []);
  const clear = (0, import_react3.useCallback)(() => setPhotos({}), []);
  const key = (0, import_react3.useMemo)(() => photosKey(photos), [photos]);
  return { photos, set, clear, key };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BeautyProvider,
  defaultMessages,
  format,
  photosKey,
  useBeauty,
  useOperation,
  usePhotoSet
});
//# sourceMappingURL=index.js.map