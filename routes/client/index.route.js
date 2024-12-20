const homeRouter=require('./home.route')
const userRouter=require('./user.route')
const cartRouter=require('./cart.route')
const detailRouter=require('./detail.route')
const productRouter=require('./product.route')
const searchRouter=require('./search.route')
const cartMiddleware=require('../../middleware/client/cart.middleware')
const settingMiddleware=require('../../middleware/client/setting.middleware')
const userMiddleware=require('../../middleware/client/user.middleware')
module.exports=(app)=>{
    app.use(cartMiddleware.cartId)
    app.use(userMiddleware.infoUser)
    app.use(settingMiddleware.SettingGeneral)
    app.use('/',homeRouter)
    app.use('/detail',detailRouter)
    app.use('/user',userRouter)
    app.use('/order',cartRouter)
    app.use('/products',productRouter)
    app.use('/search',searchRouter)
}