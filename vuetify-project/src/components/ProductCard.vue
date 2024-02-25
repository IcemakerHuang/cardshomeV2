<template>
  <!-- 商品列表 -->
  <!-- VCard 的 .product-card 是 css 標籤 -->
  <v-card class="product-card rounded-lg d-flex flex-column justify-center" hover>
    <div class="overflow-hidden">
      <v-img :src="image" cover height="200" class="img-enlarge"></v-img>
    </div>
    <v-card-title>
      <!-- 連結到詳細商品頁 -->
      <router-link class="text-primary text-decoration-none" :to="'/products/' + _id">
        {{ name }}
      </router-link>
    </v-card-title>
    <!-- <v-card-subtitle>
      ${{ price }}
    </v-card-subtitle> -->
    <v-card-text style="white-space: pre;" >
      <div class="text-overflow ma-1">{{ description }}</div>
    </v-card-text>
    <v-card-actions class="justify-space-between">
      <v-btn color="primary" prepend-icon="mdi-cards-playing-outline" @click="addCart">
        我想申辦
      </v-btn>
      <v-btn value="favorites" color="pink">
        <v-icon>mdi-heart</v-icon>
        <span></span>
        加入收藏
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

<style>
/* 換行 */
.text-overflow {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* 放大圖片 */
.overflow-hidden {
  overflow: hidden;
}
.img-enlarge{
  overflow:hidden;
  transform:scale(1,1);
  transition: all 2s ease-out;
}

.img-enlarge:hover {
  transform: scale(1.2, 1.2);
}
</style>
