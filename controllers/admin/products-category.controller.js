const Product=require('../../model/product.model')
const Account=require('../../model/account.model')
const ProductCategory=require('../../model/products-category.model')
const createTreeHelper=require('../../helpers/createTree')
const fillterStatusHelper=require('../../helpers/fillterStatusHelper')
const searchHelper=require('../../helpers/search')
const systemConfig=require('../../config/system')
const paginationHelper=require('../../helpers/pagination')
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
        find['$or']=[
            {title:objectSearch.regex},
            {slug:objectSearch.slugRegex}
        ]
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
    const countProducts=await Product.countDocuments(find)
    const objectPagination=paginationHelper(req.query,countProducts,{
        currentPage:1,
        limitItems:4
    })
    // end Pagination 
    
    const records=await ProductCategory.find(find)
    .sort(sort)
    const newRecords=createTreeHelper.tree(records) 
    console.log(newRecords)

    for (const record of newRecords) {
        const user=await Account.findOne({_id:record.createdBy.account_id})
        if(user){
            record.fullname=user.fullname
        }
        const updateBy=record.updatedBy[record.updatedBy.length-1]
        if(updateBy){
            const userUpdate=await Account.findOne({_id:updateBy.account_id})
            if(userUpdate){
                updateBy.accountFullName=userUpdate.fullname
            }
        }

    }

    res.render('admin/pages/products-category/index',
        {
            title:'Danh sách sản phẩm',
            records:newRecords,
            fillterStatus:fillterStatus,
            keyword:keyword,
        })
}
module.exports.create=async(req,res)=>{
    let find={
        deleted:false
    }
    const records=await ProductCategory.find(find);
    const newRecords=createTreeHelper.tree(records)
    res.render('admin/pages/products-category/create',{
        title:'Tạo danh mục sản phẩm',
        records:newRecords
    })
}
module.exports.createPost=async(req,res)=>{
    const permissions=res.locals.role.permissions
    if(!permissions.includes("products_category_create")){
        return;
    }
    if(req.body.position==""){
        const count=await ProductCategory.countDocuments();
        req.body.position=count+1
    }
    else{
        req.body.position=parseInt(req.body.position)
    }
    const createdBy={
        account_id:res.locals.user.id,
    };
    req.body.createdBy=createdBy
    const productCategory=new ProductCategory(req.body)
    await productCategory.save();
    req.flash('success', `Đã thêm thành công sản phẩm`);
    res.redirect(`${systemConfig.prefixAdmin}/products-category`)
}
module.exports.edit=async(req,res)=>{
    let find={
        deleted:false
    }
    const records=await ProductCategory.find(find);
    const newRecords=createTreeHelper.tree(records)
    try {
        const id=req.params.id;
        const productCategory=await ProductCategory.findOne({_id:id,deleted:false})
        res.render('admin/pages/products-category/edit',{
            title:'Tạo danh mục sản phẩm',
            records:newRecords,
            productCategory:productCategory
        })
    } catch (error) {
        
    }
    
}
module.exports.editPost=async(req,res)=>{
    const permissions=res.locals.role.permissions
    if(!permissions.includes("products_category_edit")){
        return;
    }
    if(req.body.position==""){
        const count=ProductCategory.countDocuments();
        req.body.position=count+1
    }
    else{
        req.body.position=parseInt(req.body.position)
    }
    try {
        const updatedBy={
            account_id:res.locals.user.id,
            updatedAt:new Date()
        }
        await productCategory.updateOne({_id:req.params.id},{...req.body,$push:{updatedBy:updatedBy}})
        req.flash('success', `Cập nhật thành công danh mục`);
        res.redirect(`${systemConfig.prefixAdmin}/products-category`)
    } catch (error) {
        req.flash('error', `Cập nhật ko thành công`);
        res.redirect(`back`);
    }
    
}
module.exports.changeStatus=async(req,res)=>{
    const permissions=res.locals.role.permissions
    if(!permissions.includes("products_category_edit")){
        return;
    }
    const id=req.params.id
    const status=req.params.status
    const updatedBy={
        account_id:res.locals.user.id,
        updatedAt:new Date()
    }
    await Product.updateMany({product_category_id:id},{status:status,$push :{updatedBy:updatedBy}})
    await ProductCategory.updateOne({_id:id},{status:status,$push :{updatedBy:updatedBy}})
    req.flash('success', 'Cập nhật trạng thái sản phẩm thành công');
    res.redirect('back');
}
module.exports.deleteItem=async(req,res)=>{
    const permissions=res.locals.role.permissions
    if(!permissions.includes("products_category_delete")){
        req.flash('error', 'Bạn ko có quyền xóa danh mục');
        res.redirect('back');
        return;
    }
    const id=req.params.id
    const deletedBy={
        account_id:res.locals.user.id,
        deletedAt:new Date()
    };
    await Product.updateMany({product_category_id:id},{deleted:true,deletedBy:deletedBy})
    await ProductCategory.updateOne({_id:id},{deleted:true,deletedBy:deletedBy})
    req.flash('success', 'Đã xóa thành công sản phẩm');
    res.redirect('back');
}
module.exports.detail=async(req,res)=>{
    try {
        const productCategory=await ProductCategory.findOne({_id:req.params.id,deleted:false})
        res.render("admin/pages/products-category/detail",{
            title:productCategory.title,
            productCategory:productCategory
        });

    } catch (error) {
        req.flash('error', 'Danh mục không tồn tại');
        res.redirect('back');
    }
}
module.exports.changeMulti=async(req,res)=>{
    const permissions=res.locals.role.permissions
    if(!permissions.includes("products_category_edit")){
        return;
    }
    const type=req.body.type
    const ids=req.body.ids.split(', ')
    const updatedBy={
        account_id:res.locals.user.id,
        updatedAt:new Date()
    }
    switch(type) {
        case 'active':
            await Product.updateMany({product_category_id:{ $in : ids }},{status:'active',$push:{updatedBy:updatedBy}})
            await ProductCategory.updateMany({ _id: { $in : ids } }, { status:'active',$push:{updatedBy:updatedBy}})
            req.flash('success', `Cập nhật trạng thái thành công ${ids.length} danh mục`);
            break;
        case 'inactive':
            await Product.updateMany({product_category_id:{$in:ids}},{status:'inactive',$push:{updatedBy:updatedBy}})
            await ProductCategory.updateMany({_id:{$in:ids}},{status:'inactive',$push:{updatedBy:updatedBy}})
            req.flash('success', `Cập nhật trạng thái thành công ${ids.length} danh mục`);
            break;
        case 'delete-all':
            const deletedBy={
                account_id:res.locals.user.id,
                deletedAt:new Date()
            }
            await Product.updateMany({product_category_id:{$in:ids}},{deleted:true,deletedBy:deletedBy})
            await ProductCategory.updateMany({_id:{$in:ids}},{deleted:true,deletedBy:deletedBy})
            // await ProductCategory.updateMany({_id:{$in:ids}},{deleted:true,deleteAt:new Date()})
            req.flash('success', `Xóa thành công ${ids.length} danh mục`);
            break;
        case 'change-position':
            for (const item of ids) {
                let [id,position]=item.split('-')
                position=parseInt(position);
                await ProductCategory.updateOne({_id:id},{position:position,$push:{updatedBy:updatedBy}})
            }
            req.flash('success', `Đã đổi vị trí thành công ${ids.length} danh mục`);
            break;
    }
    res.redirect('back')
}