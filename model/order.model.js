//ngoài ra ta có thể thêm trạng thái của đơn hàng 
// status:"initit" là đang khởi tạo
// status:"cancel" là hủy đơn hàng
// status:"confirm" là  đơn hàng đc admin xác nhânk thì ko đc hủy đơn hàng
const mongoose = require('mongoose');
// khi đặt hàng thành công sẽ đưa mảng products ở bên bảng cart thành rỗng 

const orderSchema=new mongoose.Schema({
    // lưu hai thằng này để biết lấy ra đc các đơnh hàng có cartId hoặc user_id
    user_id:String,//họ đăng nhập rồi thì lưu thêm trường này
    cartId:String,//trường hợp chưa đăng nhập lưu thêm cartId
    orderInfoId:String,
    status:String,
    //người ta chưa đăng nhập nhưng mua hàng thì thêm userinfo
    // khi đăng nhập rồi cũng cần này vì user_id có address,phone khác với userInfo
    userInfo:{
        fullName:String,
        phone:String,
        address:String,
    },
    products:[
        {
            // lý do tại sao lại thêm price,discountPercentage thì khi ta mua sản phẩm khi nó giảm giá 10% sau này nó
            // giảm giá 20% thì ko lưu 2 thằng đó thì sao biết đc giá giá nó ntn 
            // nếu ko lưu thì khi đó giảm 10% mà ta dựa vào product_id thì nó sẽ trả về giá giảm đi 20% vì thế sái
            
            //tại sao ko lưu giá giảm luôn mà lưu 2 cái price,discountPercentage vì để biết sản phẩm đó giảm giá bao nhiêu thống kê đồ
            
            product_id:String,
            price:Number,
            quantity:Number,
            discountPercentage:Number,
        }
    ],
    hasCommented:{
        type:Boolean,
        default:false
    },
    hasReviewed:{
        type:Boolean,
        default:false
    },
    deleted:{
        type:Boolean,
        default:false
    },
    createdBy:{
        account_id:String,
        createdAt:{
            type:Date,
            default:Date.now,
        }
    },
    deleteBy:{
        account_id:String,
        deletedAt:Date
    },
    updatedBy:[
        {
            account_id:String,
            updatedAt:Date
        }
    ]
},
{
    timestamps:true
});
const Order=mongoose.model('Order',orderSchema,'orders');
module.exports = Order;