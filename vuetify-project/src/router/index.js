// Composables
import { createRouter, createWebHashHistory, START_LOCATION } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/', // 用 layouts/FrontLayout.vue 當首頁
    component: () => import('@/layouts/FrontLayout.vue'),
    children: [ // 用 front 當 iframe
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/front/HomeView.vue'),
        meta: {
          title: '卡底家',
          login: false,
          admin: false
        }
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/front/RegisterView.vue'),
        meta: {
          title: '卡底家 | 註冊',
          login: false,
          admin: false
        }
      },
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/front/LoginView.vue'),
        meta: {
          title: '卡底家 | 登入',
          login: false,
          admin: false
        }
      },
      {
        path: 'products/:id',
        name: 'Product',
        component: () => import('@/views/front/ProductView.vue'),
        meta: {
          title: '卡底家 | 商品',
          login: false,
          admin: false
        }
      },
      {
        path: 'allproductView',
        name: 'AllproductView',
        component: () => import('@/views/front/AllproductView.vue'),
        meta: {
          title: '卡底家 | 所有認同卡',
          login: false,
          admin: false
        }
      },
      {
        path: 'articles/:id',
        name: 'Article',
        component: () => import('@/views/front/ArticleView.vue'),
        meta: {
          title: '卡底家 | 文章',
          login: false,
          admin: false
        }
      },
      {
        path: 'cart',
        name: 'Cart',
        component: () => import('@/views/front/CartView.vue'),
        meta: {
          title: '購物網 | 購物車',
          login: true,
          admin: false
        }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/front/OrdersView.vue'),
        meta: {
          title: '購物網 | 訂單',
          login: true,
          admin: false
        }
      }
    ]
  },
  { // 管理員後台頁
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    children: [
      {
        path: '',
        name: 'AdminHome',
        component: () => import('@/views/admin/HomeView.vue'),
        meta: {
          title: '卡底家 | 管理',
          // 進入條件:
          login: true, // 1.要登入
          admin: true // 2.要是管理員
        }
      },
      {
        path: 'products',
        name: 'AdminProducts',
        component: () => import('@/views/admin/ProductsView.vue'),
        meta: {
          title: '卡底家 | 認同卡管理',
          login: true,
          admin: true
        }
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('@/views/admin/OrdersView.vue'),
        meta: {
          title: '卡底家 | 訂單管理',
          login: true,
          admin: true
        }
      },
      {
        path: 'article',
        name: 'AdminArticle',
        component: () => import('@/views/admin/ArticleView.vue'),
        meta: {
          title: '卡底家 | 文章管理',
          login: true,
          admin: true
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes
})

router.afterEach((to, from) => {
  document.title = to.meta.title
})

router.beforeEach(async (to, from, next) => {
  const user = useUserStore()

  if (from === START_LOCATION) { // START_LOCATION 用來處理第一次進頁面時，要導向去哪裡
    await user.getProfile()
  }

  if (user.isLogin && ['/register', '/login'].includes(to.path)) {
    // 如果有登入，要去註冊或登入頁，重新導向回首頁
    next('/')
  } else if (to.meta.login && !user.isLogin) {
    // 如果要去的頁面要登入，但是沒登入，重新導向回登入頁
    next('/login')
  } else if (to.meta.admin && !user.isAdmin) {
    // 如果要去的頁面要管理員，但是不是管理員，重新導向回首頁
    next('/')
  } else {
    // 不重新導向
    next()
  }
})

export default router
