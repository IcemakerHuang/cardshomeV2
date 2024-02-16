<template>
<!-- 首頁輪播 -->
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

<h1>Home</h1>
</template>

<script setup>
import { ref } from 'vue'

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
