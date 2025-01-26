const mongoose=require('mongoose');
const voucherSchema=new mongoose.Schema({
    code:{
        type: String, unique: true
    },
    name:String,
    description:String,
    // expireAt: {
    //     type: Date,
    //     expires:0
    // },
    discountType:String,
    discountValue: Number,
    minOrderValue: Number ,
    maxDiscountAmount: Number,
    startDate: Date,
    endDate: Date,
    status: String,
    quantity: { type: Number, default: 0 },
    usageLimitPerUser:Number,
    usedCount:{ type: Number, default: 0 },
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
},{
    timestamps:true
})
const Voucher=mongoose.model('Voucher',voucherSchema,'vouchers')
module.exports=Voucher