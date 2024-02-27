// Utilities
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import UserRole from '@/enums/UserRole'
import { useApi } from '@/composables/axios'

export const useUserStore = defineStore('user', () => {
  const { apiAuth } = useApi()

  const token = ref('')
  const account = ref('')
  const email = ref('')
  const cart = ref(0)
  const phone = ref('')
  const role = ref(UserRole.USER)
  const _id = ref('')
  const avatar = ref('')

  const login = (data) => {
    if (data.token) {
      token.value = data.token
    }
    account.value = data.account
    email.value = data.email
    phone.value = data.phone
    cart.value = data.cart
    role.value = data.role
    _id.value = data._id
    avatar.value = data.avatar
  }

  const isLogin = computed(() => {
    return token.value.length > 0
  })

  const isAdmin = computed(() => {
    return role.value === UserRole.ADMIN
  })

  const getProfile = async () => { // 跟攔截器有關
    if (token.value.length === 0) return

    try {
      const { data } = await apiAuth.get('/users/me')
      login(data.result)
    } catch (error) {
      logout()
    }
  }

  const logout = () => {
    token.value = ''
    account.value = ''
    email.value = ''
    phone.value = ''
    cart.value = 0
    _id.value = ''
    role.value = UserRole.USER
    avatar.value = ''
  }

  return {
    avatar,
    token,
    _id,
    account,
    email,
    phone,
    cart,
    role,
    login,
    logout,
    isLogin,
    isAdmin,
    getProfile
  }
}, {
  persist: {
    key: '20240103',
    paths: ['token']
  }
})
