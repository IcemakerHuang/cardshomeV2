<template>
  <!-- 商品列表 -->
  <!-- VCard 的 .product-card 是 css 標籤 -->
  <v-card class="product-card">
    <v-img :src="image" cover height="200"></v-img>
    <v-card-title>
      <!-- 連結到詳細商品頁 -->
      <router-link class="text-primary text-decoration-none" :to="'/products/' + _id">
        {{ name }}
      </router-link>
    </v-card-title>
    <v-card-subtitle>
      ${{ price }}
    </v-card-subtitle>
    <v-card-text style="white-space: pre;">
      {{ description }}
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" prepend-icon="mdi-cart" @click="addCart">
        我想申辦
      </v-btn>
      <v-btn value="favorites">
        <v-icon>mdi-heart</v-icon>
        <span>Favorites</span>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { useApi } from '@/composables/axios'
import { useUserStore } from '@/store/user' // 取使用者資料 pinia
import { useSnackbar } from 'vuetify-use-dialog'
import { useRouter } from 'vue-router' // 取路由給按鈕判斷是否登入

const { apiAuth } = useApi()
const user = useUserStore() // 取使用者資料 pinia
const createSnackbar = useSnackbar()
const router = useRouter()

const props = defineProps(['_id', 'category', 'description', 'image', 'name', 'price', 'sell'])

const addCart = async () => {
  if (!user.isLogin) { // 如果沒有登入
    router.push('/login') // 就改變當下的按鈕，導向登入頁
    return
  }
  try {
    const { data } = await apiAuth.patch('/users/cart', {
      product: props._id,
      quantity: 1
    })
    user.cart = data.result // 將後端的 data.result 送進 pinia 管理的 user.cart 狀態
    createSnackbar({ // 顯示加入購物車成功
      text: '新增成功',
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'green',
        location: 'bottom'
      }
    })
  } catch (error) {
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
}
</script>
