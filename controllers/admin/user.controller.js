const User=require("../../model/user.model")
const Role=require("../../model/role.model")
const systemConfig=require("../../config/system");
const md5 = require('md5');
const paginationHelper=require('../../helpers/pagination')
const searchHelper=require('../../helpers/search')
const fillterStatusHelper=require('../../helpers/fillterStatusHelper')

module.exports.index=async (req,res)=>{
    let find={
        deleted:false
    }
    let fillterStatus=fillterStatusHelper(req.query);
    if(req.query.status){
        find.status=req.query.status    
    }
    //search
    const objectSearch=searchHelper(req.query)
    let keyword=objectSearch.keyword
    if(objectSearch.regex){
        find.fullname=objectSearch.regex
    }
    //search
    let sort={}
    if(req.query.sortKey&&req.query.sortValue){
        sort[req.query.sortKey]=req.query.sortValue
    }
    else{
        sort.position='desc'
    }
    //  Pagination 
    const countAccounts=await User.countDocuments(find)
    const objectPagination=paginationHelper(req.query,countAccounts,{
        currentPage:1,
        limitItems:4
    })
    // end Pagination 

    const records=await User.find(find).select('-password -token').sort(sort)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip)
    console.log(records)
    res.render("admin/pages/users/index",
        {
            title:'Danh sách tài khoản',
            records:records,
            fillterStatus:fillterStatus,
            keyword:keyword,
            pagination:objectPagination
        }
    )
}

module.exports.changeStatus=async(req,res)=>{
    const permissions=res.locals.role.permissions
    if(!permissions.includes("users_edit")){
        return;
    }
    const status=req.params.status
    const id=req.params.id
    // sau làm acccount xong là lưu thêm người cập nhật 
    await User.updateOne({_id:id},{status:status})
    req.flash('success', 'Cập nhật trạng thái tài khoản thành công');
    res.redirect('back');
}
module.exports.deleteItem=async(req,res)=>{
    const permissions=res.locals.role.permissions
    if(!permissions.includes("users_delete")){
        req.flash('error', 'Bạn ko có quyền xóa tài khoản');
        res.redirect('back');
        return;
    }
    const id=req.params.id
    await User.updateOne({_id:id},{deleted:true})
    req.flash('success', 'Đã xóa sản phẩm thành công');
    res.redirect('back');
}
module.exports.changeMulti=async(req,res)=>{
    const permissions=res.locals.role.permissions
    if(!permissions.includes("users_edit")){
        return;
    }
    const type=req.body.type
    const ids=req.body.ids.split(', ')
    switch(type){
        case 'active':
            await User.updateMany({_id:{$in:ids}},{status:"active"})
            req.flash('success', `Cập nhật trạng thái thành công ${ids.length} sản phẩm`);
            break;
        case 'inactive':
            await User.updateMany({_id:{$in:ids}},{status:"inactive"})
            req.flash('success', `Cập nhật trạng thái thành công ${ids.length} sản phẩm`);
            break;
        case 'delete-all':
            await User.updateMany({_id:{$in:ids}},{deleted:true})
            req.flash('success', `Xóa thành công ${ids.length} sản phẩm`);
            break;
    }
    res.redirect('back');
}


module.exports.detail=async(req, res) => {
   
    try {
        const account=await User.findOne({_id:req.params.id,deleted:false})
        res.render(`admin/pages/users/detail`,{
            title:account.fullname,
            account:account
        })
    } catch (error) {
        req.flash('error','Tài khoản ko tồn tại')
        res.redirect('back')
    }
    
}
module.exports.create=async(req, res) => {
    res.render('admin/pages/users/create',{title:'Thêm mới sản phẩm'})
}
module.exports.createPost=async(req, res) => {
    const permissions=res.locals.role.permissions
    if(!permissions.includes("accounts_create")){
        return;
    }
    const emailExist=await User.findOne({email:req.body.email,deleted:false})
    if(emailExist){
        req.flash('error', `Email đã tồn tại`);
        res.redirect(`back`);
        return;
    }
    req.body.password=md5(req.body.password)
    const account=new User(req.body)
    await account.save()
    req.flash('success', `Đã thêm thành công tài khoản`);
    res.redirect(`${systemConfig.prefixAdmin}/users`);
}

module.exports.edit=async(req,res)=>{
    try {
        const data=await User.findOne({
            _id:req.params.id,deleted:false
        })
        res.render('admin/pages/users/edit',{
            title:'Cập nhật tài khoản',
            data:data,
        })
    } catch (error) {
        req.flash('error','Sản phẩm ko tồn tại')
        res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
}

module.exports.editPatch=async(req,res)=>{
    const permissions=res.locals.role.permissions
    if(!permissions.includes("users_edit")){
        return;
    }
    const emailExists=await User.findOne({_id:{$ne:req.params.id},typeLogin: 'normal',email:req.body.email,deleted:false})
    if(emailExists){
        req.flash('error', `Email ${req.body.email} đã tồn tại`);
        res.redirect(`back`)
        return;
    }
    else{
        if(req.body.password){
            req.body.password=md5(req.body.password)
        }
        else{
            delete req.body.password
        }
        await User.updateOne({_id:req.params.id},req.body)
        req.flash('success', `Cập nhật thành công tài khoản`);

        res.redirect('back') 
    }
}

