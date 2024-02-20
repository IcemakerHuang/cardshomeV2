<template lang="pug">
VContainer
  VRow
    VCol(cols="12")
      h1 {{ product.name }}
    VCol(cols="12" md="6")
      VImg(:src="product.image")
    VCol(cols="12" md="6")
      p ${{ product.price }}
      p(style="white-space: pre;") {{ product.description }}
      //- 購物車數量
      //- isSubmitting 送出的時候，讓按鈕變成 loading 載入狀態 -> 表單會被禁用，防止重複提交。
      VForm(:disabled="isSubmitting" @submit.prevent="submit")
        VTextField(type="number" min="0" v-model.number="quantity.value.value" :error-messages="quantity.errorMessage.value")
        VBtn(type="submit" prepend-icon="mdi-cart" :loading="isSubmitting") 加入購物車
//- 商品已下架的呈現
VOverlay.align-center.justify-center.text-center(:model-value="!product.sell" persistent)
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
const product = ref({
  _id: '',
  name: '',
  price: 0,
  description: '',
  image: '',
  sell: true,
  category: ''
})

// 驗證使用者輸入 VForm 的值是否正確
const schema = yup.object({
  quantity: yup.number().typeError('缺少數量').required('缺少數量').min(1, '數量最小為 1')
})
const { isSubmitting, handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: {
    quantity: 1
  }
})
const quantity = useField('quantity') // 驗證完後，將數量的值送進 quantity.value.value

// 送出購物車資訊後(透過 VForm) ，將數量的值送進後端資料庫並更新 pinia 管理的 user.cart 狀態 (影響購物車提示數量)
const submit = handleSubmit(async (values) => {
  if (!user.isLogin) {
    router.push('/login')
    return
  }
  try {
    const { data } = await apiAuth.patch('/users/cart', {
      product: product.value._id,
      quantity: values.quantity
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
})

//  Vue 生命週期 onMounted 正在將後端資料，用 api.get 渲染到前台頁面(product 物件)
onMounted(async () => {
  try {
    // api.get 來自 Axios，為了處理 get 請求，將瀏覽器要求的後端資料往前端頁面渲染
    const { data } = await api.get('/products/' + route.params.id)
    product.value._id = data.result._id
    product.value.name = data.result.name
    product.value.price = data.result.price
    product.value.description = data.result.description
    product.value.image = data.result.image
    product.value.sell = data.result.sell
    product.value.category = data.result.category

    document.title = `卡底家 | ${product.value.name}` // 商品頁的商品名稱
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
