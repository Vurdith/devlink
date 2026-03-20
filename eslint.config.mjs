import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "fix-imports.js",
      "fix-imports2.js",
      "loadtests/**",
      "scripts/load-tests/**",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: { "react-hooks/set-state-in-effect": "off" },
  },
];

export default eslintConfig;
