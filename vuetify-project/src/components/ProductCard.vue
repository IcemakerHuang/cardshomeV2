<template lang="pug">
//- 商品列表
//- VCard 的 .product-card 是 css 標籤
VCard.product-card
  VImg(:src="image" cover height="200")
  VCardTitle
    //- 連結到詳細商品頁
    RouterLink.text-primary.text-decoration-none(:to="'/products/' + _id") {{ name }}
  VCardSubtitle ${{ price }}
  VCardText(style="white-space: pre;") {{ description }}
  VCardActions
    VBtn(color="primary" prepend-icon="mdi-cart" @click="addCart") 我想申辦
</template>

<script setup>
import { useApi } from '@/composables/axios'
import { useUserStore } from '@/store/user'
import { useSnackbar } from 'vuetify-use-dialog'
import { useRouter } from 'vue-router'

const { apiAuth } = useApi()
const user = useUserStore()
const createSnackbar = useSnackbar()
const router = useRouter()

const props = defineProps(['_id', 'category', 'description', 'image', 'name', 'price', 'sell'])

const addCart = async () => {
  if (!user.isLogin) {
    router.push('/login')
    return
  }
  try {
    const { data } = await apiAuth.patch('/users/cart', {
      product: props._id,
      quantity: 1
    })
    user.cart = data.result
    createSnackbar({
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
