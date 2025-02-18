const User=require('../../model/user.model')
const Cart=require('../../model/cart.model')
const Order=require('../../model/order.model')
const ForgotPassword=require('../../model/forgot-password.model')
const md5=require('md5')
const generateHelper=require('../../helpers/generate')
const sendMailHelper=require('../../helpers/sendMail')
const productsHelper=require('../../helpers/product')
const Product = require('../../model/product.model')
const OrderInfo = require('../../model/order-info.model')
const Voucher = require('../../model/voucher.model')
module.exports.login=(req,res)=>{
    res.render('client/pages/user/login',{title:"Đăng nhập tài khoản"})
}
module.exports.loginPost=async(req,res)=>{
    const {email,password}=req.body
    const user=await User.findOne({email: email,deleted:false,typeLogin:'normal'})
    console.log(user)
    if(!user){
        req.flash('emailError','Email không tồn tại')
        req.flash('emailValue',email)
        res.redirect('back')
        return;
    }
    if(user.password!=md5(password)){
        req.flash('passwordError','Sai mật khẩu')
        res.redirect('back')
        return;
    }
    if(user.status!='active'){
        req.flash('error','Tài khoản đã bị khóa')
        res.redirect('back')
        return;
    }
    const cart=await Cart.findOne({user_id:user.id})
    if(cart){
        res.cookie('cartId',cart.id)
    }
    else{
        await Cart.updateOne({_id:req.cookies.cartId},{user_id:user.id})
    }
    res.cookie("tokenUser",user.tokenUser)
    res.redirect('/')
}

module.exports.register=(req,res)=>{
    res.render('client/pages/user/register',{title:"Đăng ký tài khoản"})
}
module.exports.registerPost=async(req,res)=>{
    const existEmail=await User.findOne({email:req.body.email,deleted:false,
        status:'active',typeLogin:'normal'})
    if(existEmail){
        const {email,fullname,address,phone}=req.body
        // const {email,password}=req.body
        req.flash('emailError',"Email đã tồn tại")
        req.flash('emailValue',email)
        req.flash('addressValue',address)
        req.flash('nameValue',fullname)
        req.flash('phoneValue',phone)
        res.redirect('back')
        return 
    }
    req.body.password=md5(req.body.password)
    const user=new User(req.body);
    await user.save()
    await Cart.updateOne({_id:req.cookies.cartId},{user_id:user.id})
    res.cookie("tokenUser",user.tokenUser)
    res.redirect('/')
}

module.exports.logout=(req,res)=>{
    res.clearCookie("tokenUser")
    res.cookie('cartId', '', { maxAge: 0, httpOnly: true });
    res.redirect('/')
}
module.exports.forgotPassword=(req,res)=>{
    res.render('client/pages/user/forgot-password',{
        title:"Lấy lại mật khẩu"
    })
}
module.exports.forgotPasswordPost=async(req,res)=>{
    //ngoaì ra nên kiểm tra trong forgotpassword đã có bản ghi về email đó chưa nếu rồi
    // thì hiênj thông báo lên sau3 phút mới có để tránh spam
    const email = req.body.email
    const user=await User.findOne({email:email,deleted:false,
        status:'active'})
    if(!user){
        req.flash('emailError', `Email không tồn tại`);
        req.flash('emailValue', email);
        res.redirect('back')
        return;
    }
    const otp=generateHelper.generateRandomNumber(6)
    const objectForgotPassword={
        email:email,
        otp:otp,
        expireAt: Date.now(),
    }
    const forgotPassword=new ForgotPassword(objectForgotPassword)
    await forgotPassword.save()
    const subject="Mã OTP xác minh lấy lại mật khẩu"
    const html=`Mã OTP để lấy lại mật khẩu là <b>${otp}</b> .Thời gian sử dụng là 3 phút`
    sendMailHelper.sendMail(email,subject, html)
    res.redirect(`/user/password/otp?email=${email}`)
    // const 
}
module.exports.otpPassword=(req,res)=>{
    const email=req.query.email
    res.render('client/pages/user/otp-password',{
        title:"Nhập mã OTP",
        email:email
    })
}
module.exports.otpPasswordPost=async(req,res)=>{
    const {email,otp}=req.body
    const result=await ForgotPassword.findOne({email:email})
    if(!result){
        req.flash('error', `Email không tồn tại`);
        res.redirect('back')
        return;
    }
    if(result.otp!=otp){
        req.flash('error', `OTP không hợp lệ`);
        res.redirect('back')
        return;
    }
    const user=await User.findOne({email:email,deleted:false,status:'active'})
    const cartId=req.cookies.cartId
    await Cart.updateOne({_id:cartId},{user_id:user.id})
    res.cookie("tokenUser",user.tokenUser)
    res.redirect("/user/password/reset")
}
module.exports.resetPassword=(req,res)=>{
    res.render('client/pages/user/reset-password',{
        title:"Đổi mật khẩu",
    })
}
module.exports.resetPasswordPost=async(req,res)=>{
    const password=req.body.password
    const tokenUser=req.cookies.tokenUser;
    const user=await User.findOne({
        tokenUser:tokenUser,
    })
    if(!user){
        res.json({
            code:400,
            message:"Người dùng ko tồn tại!"
        })
        return;
    }
    await User.updateOne({tokenUser:tokenUser},{password:md5(password)})
    return res.json({
        code:200,
        message:"Đổi mật khẩu thành công!"
    })
}
module.exports.order=async (req,res)=>{
    // status text 
    const statusMap = {
        "Initit": "Đang xử lý",
        "Confirm": "Đã xác nhận",
        "Shipped": "Đang vận chuyển",
        "Delivered": "Đã giao",
    };
// status text
    // làm thanh toán xong làm lại order 
    try {
        const cartId=req.cookies.cartId;
        const orders=await Order.find({cartId:cartId,deleted:false}).sort({'createdAt':'desc'})
        for (const order of orders) {
            order.products=productsHelper.priceNewproduct(order.products)
            let orderString = "";
            for (const product of order.products) {
                const productInfo=await Product.findOne({_id:product.product_id}).select('title')
                product.productInfo=productInfo
                orderString += `${product.productInfo.title} (${product.priceNew} * ${product.quantity}), `;
            }
            order.orderString=orderString.slice(0, -2)
            // order.orderString=orderString.substring(0, orderString.length - 2);
            
            order.totalPrice=order.products.reduce((sum,item)=>{
                return sum+parseInt(item.priceNew*item.quantity)
            },0)
            
            order.statusText= statusMap[order.status]
            const orderInfo=await OrderInfo.findOne({
                _id:order.orderInfoId
            })
            if(orderInfo.voucherId){
                const voucher=await Voucher.findOne({
                    _id:orderInfo.voucherId
                })
                if(voucher.discountType=="amount"){
                    order.totalPrice-=voucher.discountValue
                    order.discountVoucher=voucher.discountValue
                }
                else{
                    const priceDiscount=(order.totalPrice*voucher.discountValue/100)
                    if(priceDiscount>voucher.maxDiscountAmount){
                        order.totalPrice -= voucher.maxDiscountAmount
                        order.discountVoucher=voucher.maxDiscountAmount
                    }
                    else{
                        order.totalPrice -= priceDiscount
                        order.discountVoucher=priceDiscount
                    }
                }
            }
            order.deliveryFee=orderInfo.deliveryFee
            order.totalPrice+=orderInfo.deliveryFee
        }
        res.render('client/pages/user/order',{
            title:'Thông tin đơn hàng',
            orders:orders
        })
    } catch (error) {
        req.flash('error','Không có đơn hàng')
        res.redirect('/')
    }
}

module.exports.orderDelete=async (req, res) => {
    const id=req.params.id
    await Order.updateOne({_id:id},{deleted:true})
    req.flash('success', 'Đã hủy đơn hàng thành công');
    res.redirect('back');
}
module.exports.detail=async (req, res) => {
    if(!res.locals.user){
        res.redirect('/user/login')
    }
    const userVouchers=res.locals.user?.vouchers;
    const voucherIds = userVouchers.map(item=>{
        if(item.status=='unused'){
            return item.voucherId
        }
    })
    const now=new Date()
    const vouchers=await Voucher.find({
        _id:{$in:voucherIds},
        deleted:false,
        status:'active',
        endDate:{$gt:now},
        $expr: { $lt: ["$usedCount", "$quantity"] } 
    })
    for (const voucher of vouchers) {
        voucher.progress=(voucher.usedCount/voucher.quantity*100).toFixed(1)
    }
    res.render('client/pages/user/detail',{
        title:'Thông tin cá nhân',
        vouchers
    })
}
module.exports.updateProfile=async (req, res) => {
    if(!res.locals.user){
        res.redirect('/user/login')
    }
    const emailExists=await User.findOne({_id:{$ne:res.locals.user.id},email:req.body.email,typeLogin:res.locals.user.typeLogin,deleted:false})
    if(emailExists){
        req.flash('error', `Email ${req.body.email} đã tồn tại`);
        res.redirect(`back`)
        return;
    }
    else{
        await User.updateOne({_id:res.locals.user.id},req.body)
        req.flash('success', `Cập nhật thành công`);
    }
    res.redirect('/user/detail') 
}