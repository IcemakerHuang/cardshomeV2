<template>
<!-- 導覽列 -->
<VAppBar color="primary">
  <VContainer class="d-flex align-center">
    <VBtn to="/" :active="false">
      <VAppBarTitle>卡底家</VAppBarTitle>
    </VBtn>
  </VContainer>
  <VContainer class="d-flex flex-row-reverse">
    <VBtn to="/" :active="false">
      <VAppBarTitle>論壇</VAppBarTitle>
    </VBtn>
    <VBtn to="/" :active="false">
      <VAppBarTitle>認同卡</VAppBarTitle>
    </VBtn>
    <VBtn to="/" :active="false">
      <VAppBarTitle>討論區</VAppBarTitle>
    </VBtn>
  </VContainer>
  <VSpacer></VSpacer>
  <!-- 電腦版導覽列 -->
  <!-- 根據用戶登入狀態動態顯示導航項目 -->
  <template v-for="item in navItems" >
    <VBtn :to="item.to" :prepend-icon="item.icon" v-if="item.show" :key="item.to">{{ item.text }}
      <!-- 購物車數量標籤 -->
      <v-badge color="error" :content="user.cart" v-if="item.to === '/cart'" floating></v-badge>
    </VBtn>
  </template>
  <VBtn v-if="!user.isLogin" to="/login" prepend-icon="mdi-login">登入
    <!-- v-if="!user.isLogin" @click="logout" -->
    <v-dialog
      v-model="dialog"
      activator="parent"
      width="auto"
    >
      <v-card min-width="600">
        <v-tabs
          v-model="tab"
          bg-color="primary"
        >
          <v-tab value="one">登入</v-tab>
          <v-tab value="two">註冊</v-tab>
        </v-tabs>

        <VCardText>
          <VWindow v-model="tab">
        <Register></Register>
        <Login></Login>
          </VWindow>
        </VCardText>
        <v-card-actions>
          <!-- 關閉視窗按鈕 -->
          <VBtn color="red" text @click="dialog = false">關閉</VBtn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </VBtn>
  <VBtn prepend-icon="mdi-logout" v-if="user.isLogin" @click="logout">登出</VBtn>
</VAppBar>
<!-- 頁面內容 -->
<VMain>
  <div>
    <RouterView :key="$route.path"></RouterView>
  </div>
</VMain>
</template>

<script setup>
// import { useDisplay } from 'vuetify' // 手機版
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { useApi } from '@/composables/axios'
import Register from '@/components/UserRegister.vue'
import Login from '@/components/UserLogin.vue'
import { useSnackbar } from 'vuetify-use-dialog'
import { useRouter } from 'vue-router' // 設路由，讓登出回到首頁

const tab = ref('one')
const dialog = ref(false) // 手動關閉 dialog 提示窗

const { apiAuth } = useApi()
const router = useRouter()
const createSnackbar = useSnackbar()
const user = useUserStore()

// 導覽列項目
// 利用 computed 來動態生成 navItems
const navItems = computed(() => [
  // 登入和註冊按鈕只在用戶未登入時顯示
  // { to: '/login', text: '登入', icon: 'mdi-login', show: !user.isLogin },
  // { to: '/register', text: '註冊', icon: 'mdi-account-plus', show: !user.isLogin },
  // 購物車、訂單和管理按鈕只在用戶已登入時顯示
  { to: '/cart', text: '購物車', icon: 'mdi-cart', show: user.isLogin },
  { to: '/orders', text: '訂單', icon: 'mdi-list-box', show: user.isLogin },
  { to: '/admin', text: '管理', icon: 'mdi-cog', show: user.isLogin && user.isAdmin }
])

const logout = async () => {
  try {
    await apiAuth.delete('/users/logout')
    user.logout()
    dialog.value = false // 關閉登出提示窗
    createSnackbar({
      text: '登出成功',
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'green',
        location: 'bottom'
      }
    })
    router.push('/') // 設路由，讓登出回到首頁
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
