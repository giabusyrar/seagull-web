"use client";
"use client";

// src/photo/PhotoSet.tsx
import React, { useEffect, useRef, useState } from "react";
import { useBeauty } from "@gateway-experience/beauty-sdk/react";

// src/photo/cn.ts
import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
var twMerge = extendTailwindMerge({ prefix: "bsdk" });
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/photo/PhotoSet.tsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var LABEL_KEY = { front: "photo.front", left: "photo.left", right: "photo.right" };
function PhotoSet({ photos, onChange, views = ["left", "right"], disabled, className, classNames = {}, renderSlot }) {
  const { t } = useBeauty();
  const sides = views.some((v) => v !== "front");
  return /* @__PURE__ */ jsxs("div", { "data-bsdk-part": "root", className: cn("bsdk:space-y-1.5 bsdk:font-bsdk", className, classNames.root), children: [
    sides && /* @__PURE__ */ jsxs("div", { "data-bsdk-part": "header", className: cn("bsdk:flex bsdk:items-baseline bsdk:justify-between bsdk:gap-2", classNames.header), children: [
      /* @__PURE__ */ jsx("span", { "data-bsdk-part": "title", className: cn("bsdk:text-[10px] bsdk:font-bold bsdk:uppercase bsdk:tracking-wider bsdk:text-muted-foreground", classNames.title), children: t("photo.sides.title") }),
      /* @__PURE__ */ jsx("span", { "data-bsdk-part": "why", className: cn("bsdk:text-[11px] bsdk:text-muted-foreground", classNames.why), children: t("photo.sides.why") })
    ] }),
    /* @__PURE__ */ jsx("div", { "data-bsdk-part": "grid", className: cn("bsdk:grid bsdk:grid-cols-2 bsdk:gap-2", classNames.grid), children: views.map((view) => {
      const slot = /* @__PURE__ */ jsx(Slot, { view, file: photos[view], onChange: (f) => onChange(view, f), disabled, classNames }, view);
      return renderSlot ? /* @__PURE__ */ jsx(React.Fragment, { children: renderSlot({ view, file: photos[view] }, slot) }, view) : slot;
    }) }),
    sides && /* @__PURE__ */ jsx("p", { "data-bsdk-part": "hint", className: cn("bsdk:text-[11px] bsdk:text-muted-foreground", classNames.hint), children: t("photo.sides.guide") })
  ] });
}
function Slot({
  view,
  file,
  onChange,
  disabled,
  classNames
}) {
  const { t } = useBeauty();
  const input = useRef(null);
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const created = URL.createObjectURL(file);
    setUrl(created);
    return () => URL.revokeObjectURL(created);
  }, [file]);
  const label = t(LABEL_KEY[view]);
  return /* @__PURE__ */ jsxs("div", { "data-bsdk-part": "item", className: cn("bsdk:relative", classNames.item), children: [
    /* @__PURE__ */ jsx(
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
    /* @__PURE__ */ jsx(
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
          /* @__PURE__ */ jsx("img", { "data-bsdk-part": "image", src: url, alt: label, className: cn("bsdk:h-full bsdk:w-full bsdk:object-cover", classNames.image) })
        ) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { "data-bsdk-part": "label", className: cn("bsdk:text-xs bsdk:font-semibold bsdk:text-foreground", classNames.label), children: label }),
          view !== "front" && /* @__PURE__ */ jsx("span", { "data-bsdk-part": "hint", className: cn("bsdk:text-[11px] bsdk:text-muted-foreground", classNames.hint), children: t(`photo.${view}.hint`) }),
          /* @__PURE__ */ jsx("span", { "data-bsdk-part": "hint", className: cn("bsdk:text-[11px] bsdk:text-muted-foreground", classNames.hint), children: t("photo.optional") })
        ] })
      }
    ),
    file && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("span", { "data-bsdk-part": "badge", className: cn("bsdk:pointer-events-none bsdk:absolute bsdk:left-1.5 bsdk:top-1.5 bsdk:rounded-full bsdk:bg-primary bsdk:text-primary-foreground bsdk:px-2 bsdk:py-0.5 bsdk:text-[10px] bsdk:font-bold", classNames.badge), children: label }),
      /* @__PURE__ */ jsx(
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
export {
  PhotoSet,
  cn
};
//# sourceMappingURL=index.mjs.map