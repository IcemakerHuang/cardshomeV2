// auth.js 的主要用途：處理使用者的登入請求並進行身份驗證。
import passport from 'passport'
import { StatusCodes } from 'http-status-codes'

export const login = (req, res, next) => {
  // 3. 正常狀態下，使用來自 passport / passport.js 的 login 策略來驗證使用者的身份(user)。
  passport.authenticate('login', { session: false }, (error, user, info) => {
    if (!user || error) {
      if (info.message === 'Missing credentials') {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: '欄位錯誤'
        })
        return
      } else if (info.message === '未知錯誤') {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: '未知錯誤'
        })
        return
      } else {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: info.message
        })
        return
      }
    }
    // 4. 上述如正常，將 user 放進 req 裡面 -> 進 controllers/users.js 的 login
    // 意味著在後續的路由處理器中，我們可以透過 req.user 來訪問到這個使用者物件。
    req.user = user
    next()
  })(req, res, next)
}
