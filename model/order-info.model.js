const mongoose = require('mongoose');
const orderInfoSchema=new mongoose.Schema({
    cartId:String,
    code:String,
    voucherId:String,
    deliveryFee:Number,
    userInfo:{
        fullname:String,
        phone:String,
        address:String,
        province:String,
        district:String,
        ward:String,
    },
    products:[
        {
            product_id:String,
            quantity:Number,
        }
    ],
},
{
    timestamps:true
});
const OrderInfo=mongoose.model('OrderInfo',orderInfoSchema,'order-info');
module.exports = OrderInfo;