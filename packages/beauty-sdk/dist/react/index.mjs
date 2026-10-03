"use client";
"use client";

// src/react/BeautyProvider.tsx
import { createContext, useContext, useMemo } from "react";
import { createBeautyClient } from "@gateway-experience/beauty-sdk/client";

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
import { jsx } from "react/jsx-runtime";
var Ctx = createContext(null);
function BeautyProvider({ baseUrl = "/api/beauty", client, locale = "id", messages, children }) {
  const resolvedClient = useMemo(() => client ?? createBeautyClient({ baseUrl }), [client, baseUrl]);
  const t = useMemo(() => {
    const dict = { ...defaultMessages[locale], ...messages };
    return (key, vars) => format(Object.hasOwn(dict, key) ? dict[key] : key, vars);
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