const homeRouter=require('./home.route')
const userRouter=require('./user.route')
const cartRouter=require('./cart.route')
const detailRouter=require('./detail.route')
const authRouter=require('./auth.route')
const productRouter=require('./product.route')
const searchRouter=require('./search.route')
const callbackRouter=require('./callback.route')
const articleRouter=require('./article.route')
const voucherRouter=require('./voucher.route')
const cartMiddleware=require('../../middleware/client/cart.middleware')
const settingMiddleware=require('../../middleware/client/setting.middleware')
const userMiddleware=require('../../middleware/client/user.middleware')
const authMiddleware=require('../../middleware/client/auth.middleware')
module.exports=(app)=>{
    app.use(cartMiddleware.cartId)
    app.use(userMiddleware.infoUser)
    app.use(settingMiddleware.SettingGeneral)
    app.use('/',homeRouter)
    app.use('/callback',callbackRouter)
    app.use('/detail',detailRouter)
    app.use('/user',userRouter)
    app.use('/order',cartRouter)
    app.use('/products',productRouter)
    app.use('/search',searchRouter)
    app.use('/articles',articleRouter)
    app.use('/auth',authRouter)
    app.use('/vouchers',authMiddleware.requireAuth,voucherRouter)
}