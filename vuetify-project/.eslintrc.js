module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'plugin:vue-pug/vue3-recommended',
    'eslint:recommended',
    '@vue/standard'
  ],
  rules: {
    'vue/max-attributes-per-line': 'off',
    'vue/no-v-model-argument': 'off' // 關閉 no-v-model-argument 規則，允許你在 v-model 中使用參數 by copilot
  }
}
