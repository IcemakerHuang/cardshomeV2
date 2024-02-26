<template>
<v-container class="custom-font html-body">
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
    <v-col cols="12" md="6" lg="3" v-for="article in articles" :key="article._id">
      <article-card v-bind="article" />
    </v-col>
  </v-row>
</v-container>
<!-- 頁尾 -->
<v-footer class="d-flex flex-column ma-0 pa-0">
  <div class="bg-teal d-flex w-100 align-center px-4">
    <strong>Get connected with us on social networks!</strong>
      <v-spacer></v-spacer>
    <v-btn
      v-for="icon in icons"
      :key="icon"
      class="mx-4"
      :icon="icon"
      variant="plain"
      size="small"
    ></v-btn>
  </div>
  <div class="px-4 py-2 text-center w-100 F15946 font-white">
    {{ new Date().getFullYear() }} — <strong>Copyright ©  IcemakerDesign. All rights reserved.</strong>
  </div>
</v-footer>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog' // 提供錯誤訊息
import ProductCard from '@/components/ProductCard.vue'
import ArticleCard from '@/components/ArticleCard.vue' // .vue都會經歷生命週期
// 生命週期是指元件（.vue）會經歷創建、掛載、更新和銷毀等過程。

import gsap from 'gsap'

const { api } = useApi()
const createSnackbar = useSnackbar()

const products = ref([])
const articles = ref([])
// footer
const icons = ref([
  'mdi-facebook',
  'mdi-twitter',
  'mdi-linkedin',
  'mdi-instagram'
])

onMounted(async () => {
  try {
    // 最新認同卡列表
    const { data } = await api.get('/products', {
      params: {
        itemsPerPage: -1 // 設 -1 讓 back/controllers/products.js 回傳所有商品
      }
    })
    products.value.push(...data.result.data)
    await nextTick()
    // 文章列表
    const { data: articlesData } = await api.get('/articles', {
      params: {
        itemsPerPage: -1 // 設 -1 讓 back/controllers/products.js 回傳所有商品
      }
    })
    articles.value.push(...articlesData.result.data)

    await nextTick()
    gsap // 商品卡做動畫效果
      .to('.product-card', { opacity: 1, duration: 0.5 })
      .to('.article-card', { opacity: 1, duration: 0.5 })
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
    src: 'https://raw.githubusercontent.com/IcemakerHuang/cardshome_data/main/Carousel/NPOCreditCard.jpg'
  },
  {
    src: 'https://raw.githubusercontent.com/IcemakerHuang/cardshome_data/main/Carousel/CTBCNPO2.jpg'
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
.product-card
  opacity: 0

@font-face
  font-family: 'Openhuninn'
  src: url('@/assets/jf-openhuninn-2.0.ttf') format('truetype')

.custom-font
  font-family: 'Openhuninn', sans-serif

.F15946
  background-color:#F15946
.font-white
  color: white
</style>
