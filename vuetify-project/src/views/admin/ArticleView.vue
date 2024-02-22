<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-center">文章管理</h1>
      </v-col>
      <v-divider></v-divider>
      <v-col cols="12">
        <v-btn color="green" @click="openArticleDialog()">新增文章</v-btn>
      </v-col>
      <v-col cols="12">
        <v-data-table-server
          v-model="tableItemsPerPage"
          v-model:sort-by="tableSortBy"
          v-model:page="tablePage"
          :items="tableProducts"
          :headers="tableHeaders"
          :loading="tableLoading"
          :items-length="tableItemsLength"
          :search="tableSearch"
          @update:items-per-page="tableLoadItems"
          @update:sort-by="tableLoadItems"
          @update:page="tableLoadItems"
          hover
        >
          <template v-slot:top>
            <v-text-field
              label="搜尋"
              append-icon="mdi-magnify"
              v-model="tableSearch"
              @click:append="tableApplySearch"
              @keydown.enter="tableApplySearch"
            ></v-text-field>
          </template>
          <template v-slot:item.image="{ item }">
            <v-img :src="item.image[0]" height="50px"></v-img>
          </template>
          <template v-slot:item.sell="{ item }">
            <v-icon icon="mdi-check" v-if="item.sell"></v-icon>
          </template>
          <template v-slot:item.edit="{ item }">
            <v-btn icon="mdi-pencil" variant="text" color="blue" @click="openArticleDialog(item)"></v-btn>
          </template>
        </v-data-table-server>
      </v-col>
    </v-row>
    <!-- 編輯文章_對話框 -->
    <v-dialog v-model="dialog" persistent width="1000px">
      <!-- :disabled="isSubmitting"表單還正在送出的話，就停用 -->
      <v-form :disabled="isSubmitting" @submit.prevent="submit">
        <v-card>
          <v-card-title>{{ dialogId === '' ? '新增文章' : '編輯文章' }}</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  label="文章標題"
                  v-model="title.value.value"
                  :error-messages="title.errorMessage.value"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field label="作者"
                v-model="author.value.value"
                :error-messages="author.errorMessage.value"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6" class="d-flex justify-space-between">
                <!-- 文章日期 -->
                <v-menu v-model="menu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                    v-model="date.value.value"
                    label="選擇日期" prepend-icon="mdi-calendar" readonly v-bind="attrs"
                    v-on="{ ...on, click: () => menu = true }">
                  </v-text-field>
                  </template>
                  <v-date-picker v-model="date.value.value" @input="menu = false"></v-date-picker>
                </v-menu>
                <!-- 文章啟用 -->
                <v-checkbox
                  class="d-flex align-self-start"
                  label="是否啟用文章"
                  v-model="sell.value.value"
                  :error-messages="sell.errorMessage.value"
                ></v-checkbox>
              </v-col>
              <v-col cols="6">
                <v-select
                  label="文章分類"
                  :items="categories"
                  v-model="category.value.value"
                  :error-messages="category.errorMessage.value"
                ></v-select>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-textarea
                  label="文章內容"
                  v-model="description.value.value"
                  :error-messages="description.errorMessage.value"
                ></v-textarea>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <vue-file-agent
                  v-model="fileRecords"
                  v-model:raw-model-value="rawFileRecords"
                  multiple
                  accept="image/jpeg,image/png"
                  deletable
                  :error-text="{type: '檔案格式不支援', size: '檔案超過 1MB 大小限制'}"
                  help-text="選擇檔案或拖曳到這裡"
                  :max-files="3"
                  max-size="1MB"
                  ref="fileAgent"
                ></vue-file-agent>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red" :disabled="isSubmitting" @click="closeDialog">取消</v-btn>
            <v-btn color="green" type="submit" :loading="isSubmitting">送出</v-btn>
            <pre>{{ errors }}</pre>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-container>
</template>

<script setup>
// VDataTableServer 的案例，我可以理解  v-model 是將會變動的參數與前端的按鈕(或是任何形式的物件)，彼此連結起來，一旦後端提供出來參數有變動，這個變動值就會同步更新的前端物件裡，被暫時存放著，對嗎？
// 是的，你的理解是正確的。在 Vue.js 中，v-model 是一種雙向數據綁定的語法糖，它可以讓你在元件和父組件之間同步數據。也就是說，當這些參數的值變化時，對應的 VDataTableServer 元件的屬性也會跟著變化，反之亦然。
// @update 表示當 items-per-page、sort-by 和 page 的值更新時，會執行 tableLoadItems 函數。重新從伺服器獲取數據，並更新 tableProducts 和 tableItemsLength，用來更新表格。

// template(#top) 是 Vue 的插槽（slot）的語法。插槽是 Vue 組件中的一種功能，它允許你在不同的組件之間重用和組合代碼。
// 在這個例子中，template(#top) 創建了一個名為 "top" 的具名插槽。這個插槽可以被父組件(應該是 VDataTableServer)填充，也就是說，父組件可以在這個插槽中插入自己的模板或組件。
// 插槽的概念可以比喻為一個背包。你可以將背包（插槽）給別人（其他組件），然後他們可以在背包裡放任何他們想放的東西（模板或組件）。這樣，背包的主人（插槽的創建者）就可以在需要的地方使用這個背包，而不需要關心背包裡具體有什麼，這就實現了代碼的重用和組合。
// 上方為<template> 註解，請用搜尋找

// 下方為 <script setup> 裡的程式碼
import { ref } from 'vue'
import * as yup from 'yup' // 引入 yup 進行商品登錄表單驗證
import { useForm, useField } from 'vee-validate' // 表單驗證套件，它可以幫助你輕鬆地驗證表單的輸入值，並管理錯誤訊息和表單狀態。
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

const fileAgent = ref(null)

// 日期選擇器的開啟狀態
const menu = ref(false)

// 表單對話框的開啟狀態
const dialog = ref(false)

// 表單對話框正在編輯的商品 ID，空的話代表是新增商品
const dialogId = ref('')

// 打開文章編輯對話框
const openArticleDialog = (item) => {
  console.log('打開文章編輯對話框')
  if (item) {
    dialogId.value = item._id
    title.value.value = item.title
    author.value.value = item.author
    image.value.value = item.image
    date.value.value = item.date
    description.value.value = item.description
    category.value.value = item.category
    sell.value.value = item.sell
    console.log('打開文章編輯對話框/xxx.value.value = item.xxx')
  } else {
    dialogId.value = ''
  }
  dialog.value = true
}
// 關閉對話框
const closeDialog = () => {
  dialog.value = false
  resetForm()
  while (fileRecords.value.length > 0) { // 關閉對話框時，刪除上傳的檔案 by ww
    fileAgent.value.deleteFileRecord(fileRecords.value[0])
  }
}

// 分類 //用 :items="categories" 綁定
const categories = ['地區回饋', '愛心公益', '學校認同', '市民卡', '公會組織'] // 串 models/products.js 的 category
// 表單驗證
const schema = yup.object({
  title: yup.string().required('缺少標題名稱'),
  author: yup.string().required('缺少作者名稱'),
  date: yup.date().required('缺少文章日期'),
  description: yup.string().required('缺少文章內容'),
  category: yup.string()
    .required('缺少文章分類')
    .oneOf(['地區回饋', '愛心公益', '學校認同', '市民卡', '公會組織'], '文章分類錯誤'), // .oneOf() 方法來確保其值必須是指定的幾個選項之一 by copilot
  sell: yup.boolean().required('缺少文章上架狀態')
})

// 以下處理 回應user使用表單元件的動作
// 這段程式碼是使用 Vee-Validate 的 useForm 函數來創建和管理表單的狀態。

// handleSubmit處理使用者送出表單時
// isSubmitting判斷是否送出中
// resetForm把對話框關閉時要重置
const { handleSubmit, isSubmitting, resetForm, errors } = useForm({
  validationSchema: schema,
  initialValues: {
    title: '',
    author: '',
    image: '',
    date: new Date(),
    description: '',
    category: '',
    sell: false
  }
})

// 設定各個欄位的狀態，用來連接 <template> 裡面各個表單欄位VTextField 的 v-model
const title = useField('title')
const author = useField('author')
const image = useField('image')
const date = useField('date')
const description = useField('description')
const category = useField('category')
const sell = useField('sell')

const fileRecords = ref([]) // vue file agent 功能，用來存放上傳的檔案
const rawFileRecords = ref([]) // vue file agent 功能，用來存放上傳的檔案

// const submit = handleSubmit(async (values) 用途是：點擊送出按鈕會觸發 handleSubmit ，並且傳入一個回調函數，這個回調函數會在表單驗證成功後執行。
const submit = handleSubmit(async (values) => {
  console.log('點擊送出按鈕會觸發 handleSubmit')
  if (fileRecords.value[0]?.error) return // 防止在有錯誤的情況下提交表單(擋住不給使用者送出)。
  if (dialogId.value === '' && fileRecords.value.length === 0) return // 如果都是空的，代表我現在在新增->判斷現在是新增還是編輯
  try {
    // 建立 FormData 物件 // 用途：將表單資料轉換成 FormData 物件，這樣才能使用 POST 或 PUT 方法上傳檔案
    // 使用 fd.append(欄位, 值) 將資料放進去
    const fd = new FormData()
    for (const key in values) { // 用 for...in 迴圈將 values 物件內所有key值放進 FormData 物件裡
      fd.append(key, values[key]) // 一個一個加進去
    }

    if (fileRecords.value.length > 0) {
      // fd.append('image', fileRecords.value[0].file) //! 原本的
      for (const file of fileRecords.value) {
        fd.append('image', file.file)
      }
    }

    // 判斷你是新增還是編輯，決定你向哪個路徑發請求
    if (dialogId.value === '') { // 是空的，送去新增路徑
      await apiAuth.post('/articles', fd)
    } else {
      await apiAuth.patch('/articles/' + dialogId.value, fd) // 不是空的，送去編輯路徑
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

// 以下處理 查詢請求經過後端處理完，並透過 VDataTableServer 元件將查詢結果顯示在前端
// VDataTableServer 要先設定好(const)以下的變數，才去前端綁定

// 表格每頁幾個
const tableItemsPerPage = ref(10)
// 表格排序
const tableSortBy = ref([
  { key: 'createdAt', order: 'desc' }
])
// 表格頁碼
const tablePage = ref(1)
// 表格商品資料陣列
const tableProducts = ref([])
// 表格欄位設定
const tableHeaders = [
  { title: '文章首圖', align: 'center', sortable: false, key: 'image' },
  { title: '文章標題', align: 'center', sortable: true, key: 'title' },
  { title: '文章作者', align: 'center', sortable: true, key: 'author' },
  // { title: '文章內容', align: 'center', sortable: true, key: 'description' },
  { title: '文章分類', align: 'center', sortable: true, key: 'category' },
  { title: '發布內容', align: 'center', sortable: true, key: 'date' },
  { title: '是否上架', align: 'center', sortable: true, key: 'sell' },
  { title: '編輯', align: 'center', sortable: false, key: 'edit' }
]
// 表格載入狀態
const tableLoading = ref(true)
// 表格全部資料數
const tableItemsLength = ref(0)
// 表格搜尋文字
const tableSearch = ref('')

// 表格載入資料
// 寫 VDataTableServer 元件與已綁定動作的fn
const tableLoadItems = async () => { // 當表格載入新資料時，執行以下程式碼
  tableLoading.value = true // 表格開始要載入了(載入中)
  try {
    const { data } = await apiAuth.get('/articles/all', { // 發請求要資料
      params: {
        page: tablePage.value,
        itemsPerPage: tableItemsPerPage.value,
        sortBy: tableSortBy.value[0]?.key || 'createdAt',
        sortOrder: tableSortBy.value[0]?.order === 'asc' ? 1 : -1,
        search: tableSearch.value
      }
    })
    tableProducts.value.splice(0, tableProducts.value.length, ...data.result.data)
    tableItemsLength.value = data.result.total
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
  tableLoading.value = false // 表格最後載入完畢了
}
tableLoadItems()

// 表格套用搜尋
const tableApplySearch = () => {
  tablePage.value = 1
  tableLoadItems()
}

</script>
