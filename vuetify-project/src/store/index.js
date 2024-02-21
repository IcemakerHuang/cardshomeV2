// Utilities
import { createPinia } from 'pinia'
import persistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(persistedstate)

export default pinia

// 這段程式碼是設定 Pinia 的部分，Pinia 是一個用於 Vue.js 的狀態管理庫。這段程式碼做了以下幾件事：

// 1.從 pinia 匯入 createPinia 函數。createPinia 是用來創建一個新的 Pinia 實例。

// 2.從 pinia-plugin-persistedstate 匯入 persistedstate。這是一個 Pinia 的插件，
// 用於將 Pinia 的狀態持久化，也就是說，即使在頁面刷新後，Pinia 的狀態也會被保存。

// 3.創建一個新的 Pinia 實例並將其賦值給 pinia 變數。

// 4.使用 pinia.use(persistedstate) 來將 persistedstate 插件添加到 Pinia 實例中。
// 這樣，Pinia 的狀態就會被持久化。

// 5.最後，將 Pinia 實例匯出，以便在其他地方使用。

// 總的來說，這段程式碼的目的是創建一個配置了狀態持久化插件的 Pinia 實例。
