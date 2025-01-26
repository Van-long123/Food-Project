const systemConfig=require("../../config/system");
const paginationHelper=require('../../helpers/pagination')
const searchHelper=require('../../helpers/search')
const fillterStatusHelper=require('../../helpers/fillterStatusHelper');
const Voucher = require("../../model/voucher.model");
module.exports.index=async (req,res)=>{
    let find={
        deleted:false
    }
    let fillterStatus=fillterStatusHelper(req.query)
    if(req.query.status){
        find.status=req.query.status
    }
    let objectSearch=searchHelper(req.query)
    if(req.query.keyword){
        find.name=objectSearch.regex
    }
    const countVoucher=await Voucher.countDocuments(find)
    const objectPagination=paginationHelper(req.query,countVoucher,{
        currentPage:1,
        limitItems:7
    })

    let sort={}
    if(req.query.sortKey&&req.query.sortValue){
        sort[req.query.sortKey]=req.query.sortValue
    }
    else{
        sort.position='desc'
    }
    const records=await Voucher.find(find)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip)
    .sort(sort)
    res.render('admin/pages/vouchers/index',{
        title:'Danh sách khuyến mãi',
        records:records,
        fillterStatus:fillterStatus,
        keyword:objectSearch.keyword,
        pagination:objectPagination
    })
}

module.exports.detail=async(req, res) => {
   
    try {
        const voucher=await Voucher.findOne({_id:req.params.id,deleted:false})
        res.render(`admin/pages/vouchers/detail`,{
            title:voucher.name,
            voucher:voucher
        })
    } catch (error) {
        req.flash('error','Khuyến mãi ko tồn tại')
        res.redirect('back')
    }
    
}

module.exports.changeStatus=async(req, res) => {
    const status=req.params.status
    const id=req.params.id
    await Voucher.updateOne({
        _id:id
    },{
        status:status
    })
    req.flash('success', 'Cập nhật trạng thái khuyến mãi thành công');
    res.redirect('back');
}
module.exports.deleteItem=async(req, res) => {
    const id=req.params.id
    await Voucher.updateOne({
        _id:id
    },{
        deleted:true
    })
    req.flash('success', 'Đã xóa khuyến mãi thành công');

    res.redirect('back');
}
module.exports.changeMulti=async(req, res) => {
    const type=req.body.type
    const ids=req.body.ids.split(', ')
    switch(type){
        case 'active':
            await Voucher.updateMany({_id:{$in:ids}},{status:"active"})
            req.flash('success', `Cập nhật trạng thái thành công ${ids.length} khuyến mãi`);
            break;
        case 'inactive':
            await Voucher.updateMany({_id:{$in:ids}},{status:"inactive"})
            req.flash('success', `Cập nhật trạng thái thành công ${ids.length} khuyến mãi`);
            break;
        case 'delete-all':
            await Voucher.updateMany({_id:{$in:ids}},{deleted:true})
            req.flash('success', `Xóa thành công ${ids.length} khuyến mãi`);
            break;
    }
    res.redirect('back');
}