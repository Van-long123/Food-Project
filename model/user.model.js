const mongoose=require('mongoose');
const generate=require('../helpers/generate')
const userSchema=new mongoose.Schema({
    // MongoDB mặc định sử dụng ObjectId nếu chuyển qua string như ở dưới thì truy vấn lấy user ko đc
    // _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    // _id: { type: String,default: () => new mongoose.Types.ObjectId(), },
    googleId:String,
    fullname:String,
    email:String,
    vouchers:[
        {
            voucherId:String,
            usedAt: Date, 
            status: {
                type: String,
                default:'unused'
            }
        }
    ],
    password:String,
    address:String,
    typeLogin:{
        type:String,
        default:'normal'
    },
    tokenUser:{
        type:String,
        default:generate.generateRandomString(30)
    },
    phone:String,
    avatar:String,
    status:{
        type:String,
        default:'active'
    },
    deleted:{
        type:Boolean,
        default:false
    },
    deleteAt:Date,
},
{
    timestamps:true
})
const User=mongoose.model('User',userSchema,'users');
module.exports = User;