module.exports = {
  root: true,
  env: {
    node: true,
  },
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "semi": "error",
    "object-curly-spacing": ["warn", "always"],
    "comma-dangle": ["warn", "always-multiline"],
  },
  //ignorePatterns: ["node_modules/**", "dist/**"], // ignoring here works
};
