// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // Multi-word rule fights idiomatic page/layout component names in Nuxt.
    'vue/multi-word-component-names': 'off'
  }
}).append({
  ignores: ['.output/**', '.nuxt/**', 'node_modules/**']
})
