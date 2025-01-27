const systemConfig=require("../../config/system");
const paginationHelper=require('../../helpers/pagination')
const searchHelper=require('../../helpers/search')
const fillterStatusHelper=require('../../helpers/fillterStatusHelper');
const Voucher = require("../../model/voucher.model");
const User = require("../../model/user.model");
module.exports.index=async (req,res)=>{
    const permissions=res.locals.role.permissions
    if(!permissions.includes("vouchers_view")){
        return;
    }
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
    const permissions=res.locals.role.permissions
    if(!permissions.includes("vouchers_view")){
        return;
    }
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
    const permissions=res.locals.role.permissions
    if(!permissions.includes("vouchers_edit")){
        return;
    }
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
    const permissions=res.locals.role.permissions
    if(!permissions.includes("vouchers_delete")){
        return;
    }
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
    const permissions=res.locals.role.permissions
    if(!permissions.includes("vouchers_edit")){
        return;
    }
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
module.exports.create=async(req, res) => {
    res.render('admin/pages/vouchers/create',{title:'Thêm mới khuyến mãi'})
}
module.exports.createPost=async(req, res) => {
    const permissions=res.locals.role.permissions
    if(!permissions.includes("vouchers_create")){
        return;
    }
    const dataVoucher={
        name: req.body.name,
        code: req.body.code,
        description: req.body.description,
        discountType: req.body.discountType,
        discountValue: parseInt(req.body.discountValue),
        quantity: parseInt(req.body.quantity),
        minOrderValue: parseInt(req.body.minOrderValue),
        maxDiscountAmount: parseInt(req.body.maxDiscountAmount),
        usageLimitPerUser: parseInt(req.body.usageLimitPerUser),
        startDate: req.body.startDate,
        endDate:req.body.endDate ,
        status: req.body.status
    }

    const voucher=new Voucher(dataVoucher)
    await voucher.save()
    await User.updateMany({
    },{
        $push:{vouchers:{
            voucherId:voucher.id,
        }}
    })
    req.flash('success', `Đã thêm thành công khuyến mãi`);
        res.redirect(`${systemConfig.prefixAdmin}/vouchers`);
}


module.exports.edit=async(req, res) => {
    try {
        const voucher=await Voucher.findOne({
            _id: req.params.id,
            deleted:false,
        })
        if(!voucher){
            req.flash('error','khuyến mãi ko tồn tại')
            res.redirect(`back`)
        }
        // toISOString() là một phương thức trong JavaScript, được sử dụng để chuyển đổi một đối tượng Date thành một chuỗi biểu diễn thời gian theo chuẩn ISO 8601.
        voucher['startDateChange'] = new Date(voucher.startDate).toISOString().slice(0, 16);
        voucher['endDateChange'] = new Date(voucher.endDate).toISOString().slice(0, 16);

        res.render('admin/pages/vouchers/edit',{title:'Cập nhật khuyến mãi',voucher})
    } catch (error) {
        req.flash('error','khuyến mãi ko tồn tại')
        res.redirect(`back`)
    }
}
module.exports.editPatch=async(req, res) => {
    const permissions=res.locals.role.permissions
    if(!permissions.includes("vouchers_edit")){
        return;
    }
    try {
        const dataVoucher={
            name: req.body.name,
            code: req.body.code,
            description: req.body.description,
            discountType: req.body.discountType,
            discountValue: parseInt(req.body.discountValue),
            quantity: parseInt(req.body.quantity),
            minOrderValue: parseInt(req.body.minOrderValue),
            maxDiscountAmount: parseInt(req.body.maxDiscountAmount),
            usageLimitPerUser: parseInt(req.body.usageLimitPerUser),
            startDate: req.body.startDate,
            endDate:req.body.endDate ,
            status: req.body.status
        }
    
        await Voucher.updateOne({
            _id: req.params.id,
        },dataVoucher)
        req.flash('success', `Cập nhật thành công khuyến mãi`);
        res.redirect(`back`);
    } catch (error) {
        req.flash('error', `Cập nhật ko thành công`);
        res.redirect(`back`);
    }
}