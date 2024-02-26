<template>
  <VContainer>
    <VRow style="display: flex; justify-content: center;">
      <VCol cols="12">
        <h1 class="text-center">個人資料</h1>
      </VCol>
      <VCard width="800px" style="padding-left: 30px; padding-top: 15px; ">
        <VRow>
          <VCol cols="4">
            <VImg class="avatar" :src="user.avatar" style="height: 150px; width: 150px;"></VImg>
          </VCol>
          <VCol cols="8" style="display: flex; justify-content: end;">
            <VIcon color="primary" size="40px" style="margin-right: 20px;" @click="openEditDialog">mdi-pencil</VIcon>
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="4">
            <VCardText v-for="item in title" :key="item.text">
              <VIcon>{{ item.icon }}</VIcon>
              {{ item.text }}
            </VCardText>
          </VCol>
          <VCol cols="6">
          <span v-for="item in info" :key="item.value">
            <VCardText>
              {{ item.value }}
            </VCardText>
          </span>
          </VCol>
        </VRow>
      </VCard>
    </VRow>
  </VContainer>
  <VDialog v-model="editdialog">
    <VForm :disabled="isSubmitting" @submit.prevent="submit">
      <VCard>
        <VCardTitle>{{ '編輯個人資料' }}</VCardTitle>
        <VCardText>
          <VTextField
          label="帳號"
          v-model="account.value.value"
          :error-messages="account.errorMessage.value"
          ></VTextField>
          <VTextField
          label="信箱"
          v-model="email.value.value"
          :error-messages="email.errorMessage.value"
          ></VTextField>
          <VTextField
          label="手機"
          v-model="phone.value.value"
          :error-messages="phone.errorMessage.value"
          ></VTextField>
        </VCardText>
        <VueFileAgent
          v-model="fileRecords"
          v-model:raw-model-value="rawFileRecords"
          accept="image/jpg,image/png"
          deletable
          :error-text="{type: '檔案格式不支援', size: '檔案超過 1MB 大小限制'}"
          help-text="選擇檔案或拖曳到這裡"
          :max-files="1"
          max-size="1MB"
          ref="fileAgent"
          ></VueFileAgent>
        <VCardActions>
          <VSpacer></VSpacer>
          <VBtn color="secondary" rounded :disabled="isSubmitting" @click="closeEditDialog">取消</VBtn>
          <VBtn color="primary" rounded type="submit" :loading="isSubmitting">送出</VBtn>
        </VCardActions>
      </VCard>
    </VForm>
  </VDialog>
</template>
<script setup>
import { ref, computed } from 'vue'
import * as yup from 'yup'
import { useUserStore } from '@/store/user'
import { useForm, useField } from 'vee-validate'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'

const user = useUserStore()
const editdialog = ref(false)

const title = [
  { icon: 'mdi-account', text: '帳號' },
  { icon: 'mdi-email', text: '信箱' },
  { icon: 'mdi-cellphone', text: '手機' }
]

const info = computed(() => [
  { value: user.account },
  { value: user.email },
  { value: user.phone }
])

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

const fileAgent = ref(null)

const openEditDialog = () => {
  account.value.value = user.account
  email.value.value = user.email
  phone.value.value = user.phone
  editdialog.value = true
}

const closeEditDialog = () => {
  editdialog.value = false
  resetForm()
  fileAgent.value.deleteFileRecord() // 重設上傳的檔案
}

const schema = yup.object({
  account: yup
    .string()
    .required('帳號為必填'),
  email: yup
    .string()
    .email('信箱格式不正確').required('信箱為必填'),
  phone: yup
    .string()
    .required('手機為必填')
})
const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: schema
})

const account = useField('account')
const email = useField('email')
const phone = useField('phone')

const fileRecords = ref([])
const rawFileRecords = ref([])

const submit = handleSubmit(async (values) => {
  try {
    // 建立 FormData 物件
    // 使用 fd.append(欄位, 值) 將資料放進去
    const fd = new FormData()
    for (const key in values) {
      fd.append(key, values[key])
    }

    if (fileRecords.value.length > 0) {
      fd.append('image', fileRecords.value[0].file)
    }
    console.log(fd)
    await apiAuth.patch('/users/' + user._id, fd)

    createSnackbar({
      text: '編輯成功',
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'green',
        location: 'bottom'
      }
    })
    user.getProfile()
    closeEditDialog()
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

<style scoped>
.avatar:hover {
  cursor: pointer;
}
</style>
