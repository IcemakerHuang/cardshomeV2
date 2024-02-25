<template lang="pug">
VContainer
  VRow
    VCol(cols="12")
      h1 {{ article.title }}
    VCol(cols="12" md="6")
      VImg(:src="article.image")
    VCol(cols="12" md="6")
      p {{ article.author }}
      p(style="white-space: pre;") {{ article.description }}
      //- 購物車數量
      //- isSubmitting 送出的時候，讓按鈕變成 loading 載入狀態 -> 表單會被禁用，防止重複提交。
      VForm(:disabled="isSubmitting" @submit.prevent="submit")
        VTextField(type="number" min="0" v-model.number="quantity.value.value" :error-messages="quantity.errorMessage.value")
        VBtn(type="submit" prepend-icon="mdi-cart" :loading="isSubmitting") 加入購物車
//- 商品已下架的呈現
VOverlay.align-center.justify-center.text-center(:model-value="!article.sell" persistent)
  h1.text-red.text-h1 已下架
  VBtn(to="/" color="green") 回首頁
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { useForm, useField } from 'vee-validate' // 驗證VForm
import * as yup from 'yup' // 驗證VForm
import { useUserStore } from '@/store/user'// 取使用者資料 pinia (購物車用)

const route = useRoute()
const router = useRouter()
const { api, apiAuth } = useApi()
const createSnackbar = useSnackbar()
const user = useUserStore()

// 個別商品頁的預設值 -> kento 建議先寫好
const article = ref({
  _id: '',
  title: '',
  author: '',
  description: '',
  image: '',
  sell: true,
  category: ''
})

//  Vue 生命週期 onMounted 正在將後端資料，用 api.get 渲染到前台頁面(article 物件)
onMounted(async () => {
  try {
    // api.get 來自 Axios，為了處理 get 請求，將瀏覽器要求的後端資料往前端頁面渲染
    const { data } = await api.get('/articles/' + route.params.id)
    article.value._id = data.result._id
    article.value.title = data.result.title
    article.value.author = data.result.author
    article.value.description = data.result.description
    article.value.image = data.result.image
    article.value.sell = data.result.sell
    article.value.category = data.result.category

    document.title = `卡底家 | ${article.value.title}` // 商品頁的商品名稱
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
    router.push('/') // 當發生錯誤時，就導向首頁
  }
})
</script>
