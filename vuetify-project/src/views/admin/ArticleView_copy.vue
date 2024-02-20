<template>
<h1>發文</h1>
<v-form :disabled="isSubmitting" @submit.prevent="submit">
  <v-card>
    <v-card-title>
      {{ dialogId === '' ? '新增商品' : '編輯商品' }}
    </v-card-title>
    <v-card-text>
      <v-text-field
        label="名稱"
        v-model="name.value.value"
        :error-messages="name.errorMessage.value"
      ></v-text-field>
      <v-text-field
        label="價格"
        type="number"
        min="0"
        v-model="price.value.value"
        :error-messages="price.errorMessage.value"
      ></v-text-field>
      <v-select
        label="分類"
        :items="categories"
        v-model="category.value.value"
        :error-messages="category.errorMessage.value"
      ></v-select>
      <v-checkbox
        label="上架"
        v-model="sell.value.value"
        :error-messages="sell.errorMessage.value"
      ></v-checkbox>
      <v-textarea
        label="說明"
        v-model="description.value.value"
        :error-messages="description.errorMessage.value"
      ></v-textarea>
      <vue-file-agent
        v-model="fileRecords"
        v-model:rawModelValue="rawFileRecords"
        accept="image/jpeg,image/png"
        deletable
        :error-text="{type: '檔案格式不支援', size: '檔案超過 1MB 大小限制'}"
        help-text="選擇檔案或拖曳到這裡"
        :max-files="3"
        max-size="1MB"
        ref="fileAgent"
      ></vue-file-agent>
    </v-card-text>
  </v-card>
</v-form>
<!-- <div id="editor"></div> -->
</template>

<!-- <script setup>
import { ref, onMounted } from 'vue'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

const editor = ref(null) // 用于存储编辑器实例

onMounted(() => {
  ClassicEditor
    .create(document.querySelector('#editor'))
    .then(editorInstance => {
      editor.value = editorInstance
    })
    .catch(error => {
      console.error('Error occurred:', error)
    })
})
</script> -->
<script setup>
import { ref } from 'vue'
import * as yup from 'yup' // 引入 yup 進行商品登錄表單驗證
import { useForm, useField } from 'vee-validate' // 表單驗證套件，它可以幫助你輕鬆地驗證表單的輸入值，並管理錯誤訊息和表單狀態。
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

const fileAgent = ref(null)

// 表單對話框的開啟狀態
const dialog = ref(false)
// 表單對話框正在編輯的商品 ID，空的話代表是新增商品
const dialogId = ref('')
// 打開編輯對話框
const openDialog = (item) => {
  if (item) {
    dialogId.value = item._id
    name.value.value = item.name
    price.value.value = item.price
    description.value.value = item.description
    category.value.value = item.category
    sell.value.value = item.sell
  } else {
    dialogId.value = ''
  }
  dialog.value = true
}
// 關閉對話框
const closeDialog = () => {
  dialog.value = false
  resetForm()
  fileAgent.value.deleteFileRecord()
}

// 分類 //用 :items="categories" 綁定
const categories = ['地區回饋', '愛心公益', '學校認同', '市民卡', '公會組織'] // 串 models/products.js 的 category
// 表單驗證
const schema = yup.object({
  name: yup
    .string()
    .required('缺少商品名稱'),
  price: yup
    .number()
    .typeError('商品價格格式錯誤')
    .required('缺少商品價格')
    .min(0, '商品價格不能小於 0'),
  description: yup
    .string()
    .required('缺少商品說明'),
  category: yup
    .string()
    .required('缺少商品分類')
    .test('isCategory', '商品分類錯誤', value => categories.includes(value)),
  sell: yup
    .boolean()
})

// 以下處理 回應user使用表單元件的動作
// 這段程式碼是使用 Vee-Validate 的 useForm 函數來創建和管理表單的狀態。
const { handleSubmit, isSubmitting, resetForm } = useForm({ // handleSubmit處理使用者送出表單, isSubmitting判斷是否送出中 , resetForm把對話框關閉時要重置
  validationSchema: schema,
  initialValues: {
    name: '',
    price: 0,
    description: '',
    category: '',
    sell: false
  }
})

// 設定各個欄位的狀態，用來連接 <template> 裡面各個表單欄位VTextField 的 v-model
const name = useField('name')
const price = useField('price')
const description = useField('description')
const category = useField('category')
const sell = useField('sell')

const fileRecords = ref([]) // vue file agent 功能，用來存放上傳的檔案
const rawFileRecords = ref([]) // vue file agent 功能，用來存放上傳的檔案

// const submit = handleSubmit(async (values) 用途是：當使用者點擊送出按鈕時，會觸發 handleSubmit 函數，並且傳入一個回調函數，這個回調函數會在表單驗證成功後執行。
const submit = handleSubmit(async (values) => {
  if (fileRecords.value[0]?.error) return // 防止在有錯誤的情況下提交表單(擋住不給使用者送出)。
  if (dialogId.value === '' && fileRecords.value.length === 0) return // 如果都是空的，代表我現在在新增->判斷現在是新增還是編輯
  try {
    // 建立 FormData 物件 // 用途：將表單資料轉換成 FormData 物件，這樣才能使用 POST 或 PUT 方法上傳檔案
    // 使用 fd.append(欄位, 值) 將資料放進去
    const fd = new FormData()
    for (const key in values) {
      fd.append(key, values[key])
    }

    if (fileRecords.value.length > 0) {
      fd.append('image', fileRecords.value[0].file)
    }

    // 判斷你是新增還是編輯，決定你向哪個路徑發請求
    if (dialogId.value === '') { // 是空的，送去新增路徑
      await apiAuth.post('/products', fd)
    } else {
      await apiAuth.patch('/products/' + dialogId.value, fd) // 不是空的，送去編輯路徑
    }

    createSnackbar({
      text: dialogId.value === '' ? '新增成功' : '編輯成功',
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'green',
        location: 'bottom'
      }
    })
    closeDialog() // 送出表單後，關閉對話框
    tableApplySearch() // 編輯或新增完了 -> 跳到下方的 tableApplySearch()歸零，搜尋重啟
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

</script>
