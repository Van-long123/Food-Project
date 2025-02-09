const { now } = require("mongoose");
const Voucher = require("../../model/voucher.model");
const User = require("../../model/user.model");

module.exports.index=async(req,res)=>{
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
        endDate:{$gt:now}
    })
    for (const voucher of vouchers) {
        voucher.progress=(voucher.usedCount/voucher.quantity*100).toFixed(1)
    }
    res.render('client/pages/vouchers/index',{
        title:"Vouchers của tôi",
        vouchers
    })
}
module.exports.checkVoucher=async(req,res)=>{
    try {
        let dataJson={ code:200 }
        const code=req.params.code;
        const now=new Date()
        let find={
            code:code,
            deleted:false,
            status:'active',
            endDate:{$gt:now}
        }
        if(req.params.price){
            const price = parseInt(req.params.price)*1000;
            find.minOrderValue={$lt:price}
        }
        const existVoucher=await Voucher.findOne(find)
        if(existVoucher){
            const isVoucherOwnedByUser  =await User.findOne({
                _id:res.locals.user.id,
                'vouchers.voucherId':existVoucher.id
            })
            dataJson.exists=true
            if(!isVoucherOwnedByUser){
                dataJson.voucher=existVoucher
                await User.updateOne({
                    _id:res.locals.user.id
                },{
                    $push:{
                        vouchers:{
                            voucherId:existVoucher.id,
                        }
                    }
                })
            }
            else{
                dataJson.alreadyOwned=true
                dataJson.message='Bạn đã sở hữu mã voucher này rồi!'
            }
            
        }
        res.json(dataJson);
        
    } catch (error) {
        res.json({ code:500,error: "Lỗi server." });
    }
}
module.exports.GetMyVoucher=async(req,res)=>{
    try {
        const price = parseInt(req.params.price)*1000;

        const userVouchers=res.locals.user?.vouchers;
        const voucherIds = userVouchers.map(item=>{
            if(item.status=='unused'){
                return item.voucherId
            }
        })
        const now=new Date()
        // Mongoose trả về các document dưới dạng đối tượng Mongoose, không phải object thuần của JavaScript.
        // Dùng .lean() giúp Mongoose trả về object thuần JavaScript thay vì Mongoose documents:
        console.log(price)
        const vouchers=await Voucher.find({
            _id:{$in:voucherIds},
            deleted:false,
            status:'active',
            endDate:{$gt:now},
            // 35,100                 120,25  ,75 
            minOrderValue:{$lt:price},
        }).lean()
        // khi trả dữ liêu về dạng json thì voucher.progress sẽ ko được thêm vào voucher vì 
        // vouchers là đối tượng Mongoose chỉ tồn tại trong bộ nhớ nhưng không thực sự được thêm vào dữ liệu trả về.

        for (const voucher of vouchers) {
            voucher.progress=(voucher.usedCount/voucher.quantity*100).toFixed(1)
        }
        // console.log(vouchers)
        res.json({
            code:200,
            message: 'Success!',
            vouchers:vouchers
        })
    } catch (error) {
        res.json({
            code:500,
            message: 'Lỗi server!'
        })
    }
}
module.exports.getVoucherById=async(req,res)=>{
    try {
        const code = req.params.id;

        
        const now=new Date()
        // Mongoose trả về các document dưới dạng đối tượng Mongoose, không phải object thuần của JavaScript.
        // Dùng .lean() giúp Mongoose trả về object thuần JavaScript thay vì Mongoose documents:
        const voucher=await Voucher.findOne({
            code:code,
            deleted:false,
            status:'active',
            endDate:{$gt:now},
        }).lean()
        // khi trả dữ liêu về dạng json thì voucher.progress sẽ ko được thêm vào voucher vì 
        // vouchers là đối tượng Mongoose chỉ tồn tại trong bộ nhớ nhưng không thực sự được thêm vào dữ liệu trả về.
        voucher.progress=(voucher.usedCount/voucher.quantity*100).toFixed(1)
        // console.log(vouchers)
        res.json({
            code:200,
            message: 'Success!',
            voucher:voucher
        })
    } catch (error) {
        res.json({
            code:500,
            message: 'Lỗi server!'
        })
    }
}