import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// A package, not a Next app: there is no pages/ directory for this rule to check.
export default defineConfig([...nextVitals, ...nextTs, { rules: { "@next/next/no-html-link-for-pages": "off" } }]);
