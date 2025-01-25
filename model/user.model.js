const mongoose=require('mongoose');
const generate=require('../helpers/generate')
const userSchema=new mongoose.Schema({
    _id: { type: String,default: () => new mongoose.Types.ObjectId().toHexString(), },
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