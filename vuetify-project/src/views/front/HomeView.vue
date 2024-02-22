<template>
<v-container>
  <!-- 首頁輪播 -->
  <v-row>
    <v-carousel
      cycle
      height="400"
      hide-delimiter-background
      show-arrows="hover"
    >
      <v-carousel-item
        v-for="(item, i) in items"
        :key="i"
        :src="item.src"
        cover
      >
        <div class="d-flex fill-height justify-center align-center">
          <div class="text-h2">
            {{ slides[i] }} Slide
          </div>
        </div>
      </v-carousel-item>
    </v-carousel>
  </v-row>
  <!-- 認同卡列表 -->
  <v-row>
    <v-col cols="12">
      <h1>最新認同卡</h1>
    </v-col>
    <v-divider></v-divider>
    <v-col cols="12" md="6" lg="3" v-for="product in products" :key="product._id">
      <product-card v-bind="product" />
    </v-col>
  </v-row>
  <!-- 認同卡文章列表 -->
  <v-row>
    <v-col cols="12">
      <h1>最新文章</h1>
    </v-col>
    <v-divider></v-divider>
    <v-col cols="12" md="6" lg="3" v-for="product in products" :key="product._id">
      <product-card v-bind="product" />
    </v-col>
  </v-row>
</v-container>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog' // 提供錯誤訊息
import ProductCard from '@/components/ProductCard.vue' // .vue都會經歷生命週期
// 生命週期是指元件（.vue）會經歷創建、掛載、更新和銷毀等過程。

import gsap from 'gsap'

const { api } = useApi()
const createSnackbar = useSnackbar()

const products = ref([])

onMounted(async () => {
  try {
    const { data } = await api.get('/products', {
      params: {
        itemsPerPage: -1 // 設 -1 讓 back/controllers/products.js 回傳所有商品
      }
    })
    products.value.push(...data.result.data)
    await nextTick()
    gsap // 商品卡做動畫效果
      .to('.product-card', { opacity: 1, duration: 0.5 })
  } catch (error) {
    console.log(error)
    const text = error?.response?.data?.message || '發生錯誤，請稍後再試'
    createSnackbar({
      text,
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'red',
        location: 'bottom'
      }
    })
  }
})

// 首頁輪播
// 使用 ref 創建響應式變量
const items = ref([
  {
    src: 'https://cdn.vuetifyjs.com/images/carousel/squirrel.jpg'
  },
  {
    src: 'https://cdn.vuetifyjs.com/images/carousel/sky.jpg'
  },
  {
    src: 'https://cdn.vuetifyjs.com/images/carousel/bird.jpg'
  },
  {
    src: 'https://cdn.vuetifyjs.com/images/carousel/planet.jpg'
  }
])
const slides = ref([
  'First',
  'Second',
  'Third',
  'Fourth',
  'Fifth'
])
</script>

<style scoped lang="sass">
.product-card
  opacity: 0
</style>
