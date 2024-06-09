module.exports = {
  root: true,
  files: ["**/*.js", "**/*.vue"],
  env: {
    node: true
  },
  extends: ["plugin:vue/vue3-recommended", "eslint:recommended", "prettier"],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "vue/multi-word-component-names": "off"
  }
}
