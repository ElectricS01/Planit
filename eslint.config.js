import js from "@eslint/js"
import pluginVue from "eslint-plugin-vue"
import prettier from "eslint-config-prettier"

export default [
  {
    ignores: ["node_modules/**"],
    files: ["**/*.{vue,js}"]
  },
  js.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  prettier,
  {
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/require-default-prop": "off",
      "vue/no-v-html": "off",
      "array-element-newline": "off",
      curly: "off",
      "dot-location": "off",
      "func-names": ["error", "as-needed"],
      "function-call-argument-newline": "off",
      "function-paren-newline": "off",
      "id-length": "off",
      indent: "off",
      "max-depth": "off",
      "max-len": "off",
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-params": "off",
      "max-statements": "off",
      "new-cap": "off",
      "no-console": "off",
      "no-extra-parens": "off",
      "no-magic-numbers": "off",
      "no-ternary": "off",
      "no-undefined": "off",
      "no-useless-return": "off",
      "nonblock-statement-body-position": "off",
      "object-curly-spacing": "off",
      "object-property-newline": "off",
      "one-var": "off",
      "padded-blocks": "off",
      "prefer-named-capture-group": "off",
      "quote-props": "off",
      "require-atomic-updates": "off",
      "require-unicode-regexp": "off",
      semi: "off",
      "sort-imports": "off",
      "space-before-function-paren": "off"
    }
  }
]
