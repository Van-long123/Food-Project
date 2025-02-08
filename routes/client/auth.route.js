const express = require('express')
const router=express.Router();
const passport=require('passport');
const User = require('../../model/user.model');
const Cart = require('../../model/cart.model');
router.get('/google',passport.authenticate('google', { scope: ['profile','email'] }));
router.get('/google/callback', (req, res,next) =>{
        // Successful authentication, redirect home.
    passport.authenticate('google',(err,profile)=>{
        req.user=profile
        next()
    })(req, res, next);
},async (req, res)=>{
    //check trong này hoặc là tạo 1 router loginSuccess đẻ check
    // nếu tạo 1 router loginSuccess thì cần phải check vì router đó sẽ có params :id 
    // trong router đó lấy id đó và thực hiện đăng nhập chính vì vâyj user chỉ cần nhập router với :id đó thì sẽ 
    // đăng nhập được ko cần thông qua gg (với điều kiện là đã đăng nhập lần đầu tiên để lưu vào db)
    //nên làm theo kiểu đó thì bên passport.js khi lần đầu đăng nhập thì lưu vào db lần thứ 2 có trong db rồi ta cập nhật 
    // lại tokenLogin bằng cách cài thư viện uuid or helperGenerate để tạo ra 1 id sau đó gọi về trong này gọi tới router loginSucces kèm theo :id và :token để kiểm tra trong db xem có id và token giống như bên passport truyền qua ko
    //res.redirect('/login-success/id/tokenLogin') router.get('/login-success/:id/:tokenLogin') vì tụi nó cố tình truy cập như thế ta redirect('/user/login) luôn và kèm theo flash yêu cầu đăng nhập
    // (cách làm trên để tránh các lần đăng nhập tiếp theo họ dựa vào id)
    // vào trong /login-success/id/tokenLogin nó sẽ xử lý nên trên url sẽ có đoạn mã id/tokenLogin 1 xíu rồi redirect vì thế họ sẽ lấy được để đăng nhập nên 
    // ở trong /login-success/id/tokenLogin ta sẽ cập nhật lại tokenLogin 1 lần nữa bắt người ta phải login bằng google
    //nên tạo thêm 1 cột tokenLogin để check và tokenLogin này trong db trong hiển thị trên cookie 
    // token mới hiển thị trên Cookie (nên dùng JWT để mã hóa giá trị)
    if(!req.user){
        res.redirect('/user/login')
        return 
    }
    const user=await User.findOne({
        googleId:req.user.id,
    })
    const cart=await Cart.findOne({user_id:user.id})
    if(cart){
        res.cookie('cartId',cart.id)
    }
    else{
        await Cart.updateOne({_id:req.cookies.cartId},{user_id:user.id})
    }
    res.cookie("tokenUser",user.tokenUser)
    res.redirect('/')
});




module.exports = router