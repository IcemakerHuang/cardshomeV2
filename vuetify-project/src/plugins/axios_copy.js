// D:\012黃鋕斌\Git\cardshomeV2\vuetify-project\src\plugins\axios.js -> composable 組合式語法處理

import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API
})
