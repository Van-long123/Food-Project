const Product=require("../../model/product.model");
const OrderInfo=require("../../model/order-info.model");
const Cart=require("../../model/cart.model");
const Order=require("../../model/order.model");
const Generate=require("../../helpers/generate");
const productsHelper=require("../../helpers/product");
const axios = require('axios').default; // npm install axios
const CryptoJS = require('crypto-js'); // npm install crypto-js
const moment = require('moment'); // npm install moment
const Voucher = require("../../model/voucher.model");

// này là môi trường Sandbox có sẵn rồi 
// sau tích hợp với ứng dụng thật thì thay đổi các giá trị đó  Real	https://openapi.zalopay.vn/v2/create
const config = {
    app_id:process.env.APP_ID,
    key1: process.env.KEY1,
    key2: process.env.KEY2,
    endpoint:process.env.ENDPOINT
};

module.exports.index=async(req,res)=>{
    const productsRandom = await Product.aggregate([
        { $match: { deleted: false, status: 'active' } },  // Lọc các bản ghi phù hợp
        { $sample: { size: 7 } }  // Lấy ngẫu nhiên 6 bản ghi
    ]);
    const cartId=req.cookies.cartId;
    const cart=await Cart.findOne({_id: cartId})
    if(cart.products.length>0){
        for (const item of cart.products) {
            const productId=item.product_id;
            const productInfo = await Product.findOne({_id: productId}).select('title thumbnail price slug discountPercentage')
            productInfo.priceNew=productsHelper.priceNew(productInfo)
            productInfo.totalPrice=productInfo.priceNew*item.quantity
            item.productInfo=productInfo
        }
        cart.totalPrice=cart.products.reduce((sum,item)=>{
            return sum+item.productInfo.totalPrice
        },0)
    }
    console.log(cart.totalPrice)
    res.render("client/pages/cart/index",{
        title:"Giỏ hàng",productsRandom:productsRandom
        ,cartDetail:cart
    })

}
module.exports.checkPay=async (req,res)=>{
    let response={
        success:'success',
    }
    const slug=req.body.slug;
    
    const cartId=req.cookies.cartId
    const cart=await Cart.findOne({_id:cartId})

    const product= await Product.findOne({
        slug:slug
    }).select('stock')

    const existsProductInCart=cart.products.find(item=>{
        return item.product_id==product.id
    })


    let quantity=1
    if(req.body.quantity){
        quantity=parseInt(req.body.quantity)
    }
    
    if(product.stock==0){
         res.json({
            error:'error',
        })
        return;
    }

    if(product.stock<quantity){
        res.json({
            error:'Số lượng bạn chọn quá hàng trong kho',
        })
        return;
    }
    if(existsProductInCart){
        
        if(product.stock<existsProductInCart.quantity+1){
            res.json({
                error:'error',
            })
            return;
        }
        if(product.stock<existsProductInCart.quantity+quantity){
            res.json({
                error:'Số lượng bạn chọn quá hàng trong kho',
            })
            return;
        }
    }
    return res.json(response)
}
module.exports.add=async(req,res)=>{
    let response={
        success:'success',
    }
    const product_id=req.body.productId;
    const cartId=req.cookies.cartId
    const cart=await Cart.findOne({_id:cartId})
    const existsProductInCart=cart.products.find(item=>{
        return item.product_id==product_id
    })
    
    const product= await Product.findOne({
        _id:product_id
    }).select('stock')
    
    
    let quantity=1
    if(req.body.quantity){
        quantity=parseInt(req.body.quantity)
    }

    if(product.stock==0){
        res.json({
            error:'error',
        })
        return;
    }
    //7 8 
    if(product.stock<quantity){
        res.json({
            error:'Số lượng bạn chọn quá hàng trong kho',
        })
        return;
    }
    if(existsProductInCart){
        
        if(product.stock<existsProductInCart.quantity+1){
            res.json({
                error:'error',
            })
            return;
        }
        if(product.stock<existsProductInCart.quantity+quantity){
            res.json({
                error:'Số lượng bạn chọn quá hàng trong kho',
            })
            return;
        }
    }
    

    const objectCart={
        product_id:product_id,
        quantity:quantity
    }
    
    if(!existsProductInCart){
        response.countProduct='increase'
        await Cart.updateOne({_id:cartId},{$push:{products:objectCart}})
    }
    else{
        const quantityNew=existsProductInCart.quantity+quantity
        await Cart.updateOne({
            _id:cartId,
            'products.product_id':product_id
        },
        {
            $set:{
                'products.$.quantity':quantityNew
            }
        }
        )
    }
    // res.send('ok')
    res.json(response)
}
module.exports.delete=async(req,res)=>{
    let response={
        success:'success',
    }
    const product_id=req.body.product_id;
    const cartId=req.cookies.cartId;
    if(req.body.quantity){
        console.log(product_id)
        console.log(req.body.quantity)
        await Cart.updateOne({
            _id:cartId,
            'products.product_id':product_id
        },
        {
            $set:{
                'products.$.quantity':req.body.quantity
            }
        }
        )
    }
    else{
        if(product_id!=0){
            // console.log(product_id)
            await Cart.updateOne({_id:cartId},{$pull:{products:{product_id:product_id}}})
            const cart=await Cart.findOne({_id:cartId})
            const count=cart.products.length;
            response.countProduct=count
        }
        else{
            // console.log(product_id)
            await Cart.updateOne({_id:cartId},{products:[]})
            response.deleteAll='Delete All'
        }
    }
    
    
    res.json(response)
}

module.exports.checkout=async (req,res)=>{
    const orderInfo=await OrderInfo.findOne({code:req.query.code})
    // console.log(orderInfo)
    // res.send('ok')
    for (const item of orderInfo.products) {
        const productId=item.product_id;
        const productInfo = await Product.findOne({_id: productId}).select('title thumbnail price slug discountPercentage')
        productInfo.priceNew=productsHelper.priceNew(productInfo)
        productInfo.totalPrice=productInfo.priceNew*item.quantity
        item.productInfo=productInfo
    }
    orderInfo.totalPrice=orderInfo.products.reduce((sum,item)=>{
        return sum+item.productInfo.totalPrice
    },0)
    res.render('client/pages/checkout/index',{title:"Thanh toán đơn hàng",orderInfo:orderInfo})
}
module.exports.checkoutPost=async (req,res)=>{
    
    const infoOrder=await OrderInfo.findOne({code:req.query.code})
    
    const user_info={
        fullName:infoOrder.userInfo.fullname,
        phone:infoOrder.userInfo.phone,
        address:infoOrder.userInfo.address+', '+infoOrder.userInfo.province+', '+infoOrder.userInfo.district+', '+infoOrder.userInfo.ward,
    }
    const cartId=req.cookies.cartId;
    const products=[]
    for (const product of infoOrder.products) {
        let productId=product.product_id;
        let quantity=product.quantity || 1;
        await Product.findOneAndUpdate({_id:productId},{$inc:{stock:- quantity}})
    
        const objectProduct={
            product_id:product.product_id,
            price:0,
            quantity:product.quantity,
            discountPercentage:0,
        }
        const productInfo=await Product.findOne({_id:product.product_id}).select("discountPercentage price")
        objectProduct.price=productInfo.price
        objectProduct.discountPercentage=productInfo.discountPercentage
        products.push(objectProduct)
    }
    
    let priceTotal=parseFloat(products.reduce((total,item)=>{
        return total+=item.price*(1-(item.discountPercentage/100))*item.quantity
    },0).toFixed(3))+infoOrder.deliveryFee
    console.log('priceTotal'+priceTotal)
    if(infoOrder.voucherId){
        const voucher=await Voucher.findOne({
            _id:infoOrder.voucherId
        })
        console.log(voucher)
        if(voucher.discountType=="amount"){
            priceTotal-=voucher.discountValue
        }else{
            const priceDiscount=(priceTotal*voucher.discountValue/100)
            if(priceTotal>voucher.maxDiscountAmount){
                priceTotal -= voucher.maxDiscountAmount
            }
            else{
                priceTotal -= priceDiscount
            }
        }
    }

    const order_info={
        orderInfoId:infoOrder.id,
        cartId:cartId,
        userInfo:user_info,
        products:products,
        status:'Initit'
    }
    // console.log(order_info)
    if(res.locals.user){
        order_info.user_id=res.locals.user.id
    }
    if(!req.query.code.includes('ORDO')){
        order_info.existCart=true
    }
    if(req.body.payment_method==0){
        if(order_info.existCart){
            await Cart.updateOne({_id:cartId},{products:[]})
            delete order_info.existCart
        }
        const order=new Order(order_info)
        await order.save()
        
        
        res.redirect('/user/order')
    }
    else if(req.body.payment_method==2){
        if(order_info.existCart){
            await Cart.updateOne({_id:cartId},{products:[]})
            delete order_info.existCart
        }
        // redirecturl Redirect về url này sau khi thanh toán trên cổng ZaloPay
        const embed_data = {
            redirecturl:"https://fusion-food.vercel.app/user/order"
        };

        // const items = [{}];
        const items = [order_info];

        const transID = Math.floor(Math.random() * 1000000);
        const order = {
            app_id: config.app_id,
            app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
            app_user: "FustionFood",
            app_time: Date.now(), // miliseconds
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount: priceTotal,
            description: `Lazada - Payment for the order #${transID}`,
            bank_code: "",
            // zalo nó ko thể gọi tới http://localhost:3000/ này đc ta phải cài 
// ngrok tạo đường hầm giữ local và internet giúp người khác có thể truy cập local của ta 
// gõ lệnh để pulic ra cho zalopay có thể gọi đến lệnh: ngrok http 3000
// Forwarding  https://1f83-14-185-184-127.ngrok-free.app -> http://localhost:3000   
            callback_url:"https://fusion-food.vercel.app/callback"
        };

        // appid|app_trans_id|appuser|amount|apptime|embeddata|item
        const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
        order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

        try {
            const result=await axios.post(config.endpoint, null, { params: order })
            // console.log(result.data);
            res.redirect(result.data.order_url)
        } catch (error) {
            console.log(error.message);
            res.redirect('/')
        }
        // axios.post(config.endpoint, null, { params: order })
        // .then(res => {
        //     console.log(res.data);
        // })
        // .catch(err => console.log(err));
        // }
    
    }
}
//khi mà thanh toán thành công sẽ gọi tới api nfay

module.exports.creatCheckout=async (req,res)=>{
    const ids =req.body.products.split(', ')
    let products=[];
    for (const item of ids) {
        let [id,quantity]=item.split('-')
        const objectProduct={
            product_id:id,
            quantity:parseInt(quantity),
        }
        products.push(objectProduct)
    }
    const cartId=req.cookies.cartId
    const userInfo={
        fullname:req.body.fullname,
        phone:req.body.phone,
        address:req.body.address,
        province:req.body.province,
        district:req.body.district,
        ward:req.body.ward,
    }
    // console.log(req.body)
    let code;
    if(req.body.payInHome){
        code=Generate.generateRandomStringCodeOne(8)
    }
    else{
        code=Generate.generateRandomStringCode(9)
    }

    let data={
        cartId,code,userInfo,products
    }
    if(req.body.deliveryFee){
        data.deliveryFee=req.body.deliveryFee
    }
    if(req.body.voucherId){
        data.voucherId=req.body.voucherId
    }
    const orderInfo=new OrderInfo(data)
    orderInfo.save()
    return res.json({
        success:'success',
        code:orderInfo.code
    })
}
module.exports.info=async (req,res)=>{
    try {
        if(!req.params.slug){
            var cart=await Cart.findOne({_id:req.cookies.cartId})
            if(cart.products.length>0){
                for (const item of cart.products) {
                    const productId=item.product_id;
                    const productInfo = await Product.findOne({_id: productId}).select('title thumbnail price slug discountPercentage')
                    productInfo.priceNew=productsHelper.priceNew(productInfo)
                    productInfo.totalPrice=productInfo.priceNew*item.quantity
                    item.productInfo=productInfo
                }
                cart.totalPrice=cart.products.reduce((sum,item)=>{
                    return sum+item.productInfo.totalPrice
                },0)
            }
        }
        else{
            var product=await Product.findOne({slug:req.params.slug}).select('title price discountPercentage thumbnail slug stock')
            if(product.stock==0){
                req.flash('stockError','Sản phẩm đã bán hết')
                res.redirect('back')
                return 
            }
            product.priceNew=productsHelper.priceNew(product)
            
            //6 6 
            
            if(req.query.quantity){
                product.quantity=parseInt(req.query.quantity)
            }
            else{
                product.quantity=1
            }
            if(product.stock<product.quantity){
                req.flash('error','Số lượng bạn chọn quá hàng trong kho')
                res.redirect(`/detail/${req.params.slug}`)
                return;
            }
            
        }
    
        res.render('client/pages/checkout/info',{
            title:"Thông tin đơn hàng",
            cartDetail:cart,
            product:product
        })
    } catch (error) {
        res.redirect('/')
    }
}