"use client";
"use strict";
"use client";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/photo/index.ts
var photo_exports = {};
__export(photo_exports, {
  PhotoSet: () => PhotoSet,
  cn: () => cn
});
module.exports = __toCommonJS(photo_exports);

// src/photo/PhotoSet.tsx
var import_react = __toESM(require("react"));
var import_react2 = require("@gateway-experience/beauty-sdk/react");

// src/photo/cn.ts
var import_clsx = require("clsx");
var import_tailwind_merge = require("tailwind-merge");
var twMerge = (0, import_tailwind_merge.extendTailwindMerge)({ prefix: "bsdk" });
function cn(...inputs) {
  return twMerge((0, import_clsx.clsx)(inputs));
}

// src/photo/PhotoSet.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var LABEL_KEY = { front: "photo.front", left: "photo.left", right: "photo.right" };
function PhotoSet({ photos, onChange, views = ["left", "right"], disabled, className, classNames = {}, renderSlot }) {
  const { t } = (0, import_react2.useBeauty)();
  const sides = views.some((v) => v !== "front");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { "data-bsdk-part": "root", className: cn("bsdk:space-y-1.5 bsdk:font-bsdk", className, classNames.root), children: [
    sides && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { "data-bsdk-part": "header", className: cn("bsdk:flex bsdk:items-baseline bsdk:justify-between bsdk:gap-2", classNames.header), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "data-bsdk-part": "title", className: cn("bsdk:text-[10px] bsdk:font-bold bsdk:uppercase bsdk:tracking-wider bsdk:text-muted-foreground", classNames.title), children: t("photo.sides.title") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "data-bsdk-part": "why", className: cn("bsdk:text-[11px] bsdk:text-muted-foreground", classNames.why), children: t("photo.sides.why") })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { "data-bsdk-part": "grid", className: cn("bsdk:grid bsdk:grid-cols-2 bsdk:gap-2", classNames.grid), children: views.map((view) => {
      const slot = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slot, { view, file: photos[view], onChange: (f) => onChange(view, f), disabled, classNames }, view);
      return renderSlot ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.default.Fragment, { children: renderSlot({ view, file: photos[view] }, slot) }, view) : slot;
    }) }),
    sides && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { "data-bsdk-part": "hint", className: cn("bsdk:text-[11px] bsdk:text-muted-foreground", classNames.hint), children: t("photo.sides.guide") })
  ] });
}
function Slot({
  view,
  file,
  onChange,
  disabled,
  classNames
}) {
  const { t } = (0, import_react2.useBeauty)();
  const input = (0, import_react.useRef)(null);
  const [url, setUrl] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const created = URL.createObjectURL(file);
    setUrl(created);
    return () => URL.revokeObjectURL(created);
  }, [file]);
  const label = t(LABEL_KEY[view]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { "data-bsdk-part": "item", className: cn("bsdk:relative", classNames.item), children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "input",
      {
        ref: input,
        type: "file",
        accept: "image/jpeg,image/png",
        className: "bsdk:hidden",
        onChange: (e) => {
          onChange(e.target.files?.[0] ?? null);
          e.target.value = "";
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        "data-bsdk-part": "slot",
        disabled,
        onClick: () => input.current?.click(),
        "aria-label": t(file ? "photo.change" : "photo.add", { view: label }),
        className: cn(
          "bsdk:flex bsdk:aspect-[3/4] bsdk:w-full bsdk:flex-col bsdk:items-center bsdk:justify-center bsdk:gap-1 bsdk:overflow-hidden bsdk:rounded-bsdk bsdk:border bsdk:border-border bsdk:bg-card bsdk:text-center",
          !file && "bsdk:border-dashed bsdk:bg-muted",
          disabled && "bsdk:opacity-50",
          classNames.slot
        ),
        children: url ? (
          // eslint-disable-next-line @next/next/no-img-element
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { "data-bsdk-part": "image", src: url, alt: label, className: cn("bsdk:h-full bsdk:w-full bsdk:object-cover", classNames.image) })
        ) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "data-bsdk-part": "label", className: cn("bsdk:text-xs bsdk:font-semibold bsdk:text-foreground", classNames.label), children: label }),
          view !== "front" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "data-bsdk-part": "hint", className: cn("bsdk:text-[11px] bsdk:text-muted-foreground", classNames.hint), children: t(`photo.${view}.hint`) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "data-bsdk-part": "hint", className: cn("bsdk:text-[11px] bsdk:text-muted-foreground", classNames.hint), children: t("photo.optional") })
        ] })
      }
    ),
    file && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "data-bsdk-part": "badge", className: cn("bsdk:pointer-events-none bsdk:absolute bsdk:left-1.5 bsdk:top-1.5 bsdk:rounded-full bsdk:bg-primary bsdk:text-primary-foreground bsdk:px-2 bsdk:py-0.5 bsdk:text-[10px] bsdk:font-bold", classNames.badge), children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          "data-bsdk-part": "remove",
          disabled,
          onClick: () => onChange(null),
          "aria-label": t("photo.remove", { view: label }),
          className: cn("bsdk:absolute bsdk:right-1.5 bsdk:top-1.5 bsdk:rounded-full bsdk:bg-card bsdk:px-2 bsdk:text-xs bsdk:text-foreground", disabled && "bsdk:opacity-50", classNames.remove),
          children: "\xD7"
        }
      )
    ] })
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PhotoSet,
  cn
});
//# sourceMappingURL=index.js.map