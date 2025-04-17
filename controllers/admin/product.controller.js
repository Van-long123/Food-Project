const Product=require('../../model/product.model')
const Account=require('../../model/account.model')
const ProductCategory=require('../../model/products-category.model')
const createTreeHelper=require('../../helpers/createTree')
const fillterStatusHelper=require('../../helpers/fillterStatusHelper')
const searchHelper=require('../../helpers/search')
const paginationHelper=require('../../helpers/pagination')
const systemConfig=require('../../config/system')


module.exports.index=async(req,res)=>{
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
        limitItems:8
    })
// end Pagination 

    const products=await Product.find(find)
    .sort(sort)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip)
    for (const product of products) {
        const user=await Account.findOne({_id:product.createdBy.account_id})
        if(user){
            product.fullname=user.fullname
        }
        const updateBy=product.updatedBy[product.updatedBy.length-1]
        if(updateBy){
            const userUpdate=await Account.findOne({_id:updateBy.account_id})
            if(userUpdate){
                updateBy.accountFullName=userUpdate.fullname
            }
        }

    }
    res.render('admin/pages/products/index',
        {
            title:'Danh sách sản phẩm',
            products:products,
            fillterStatus:fillterStatus,
            keyword:keyword,
            pagination:objectPagination
        })
}
module.exports.changeStatus=async(req,res)=>{
    const permissions=res.locals.role.permissions
    if(!permissions.includes("products_edit")){
        return;
    }
    const status=req.params.status
    const id=req.params.id
    const updatedBy={
        account_id:res.locals.user.id,
        updatedAt:new Date()
    }
    // sau làm acccount xong là lưu thêm người cập nhật 
    await Product.updateOne({_id:id},{status:status,
        $push :{updatedBy:updatedBy}
    })
    req.flash('success', 'Cập nhật trạng thái sản phẩm thành công');
    res.redirect('back');
}
module.exports.deleteItem=async(req,res)=>{
    const permissions=res.locals.role.permissions
    if(!permissions.includes("products_delete")){
        req.flash('error', 'Bạn ko có quyền xóa sản phẩm');
        res.redirect('back');
        return;
    }
    const id=req.params.id
    // sau làm acccount xong là lưu thêm người xóa
    const deletedBy={
        account_id:res.locals.user.id,
        deletedAt:new Date()
    };
    await Product.updateOne({_id:id},{deleted:true,deletedBy:deletedBy})
    req.flash('success', 'Đã xóa sản phẩm thành công');
    res.redirect('back');
}
module.exports.changeMulti=async(req,res)=>{
    const permissions=res.locals.role.permissions
    if(!permissions.includes("products_edit")){
        return;
    }
    const type=req.body.type
    const ids=req.body.ids.split(', ')
    const updatedBy={
        account_id:res.locals.user.id,
        updatedAt:new Date()
    }
    switch(type){
        case 'active':
            await Product.updateMany({_id:{$in:ids}},{status:"active",$push:{updatedBy:updatedBy}})
            req.flash('success', `Cập nhật trạng thái thành công ${ids.length} sản phẩm`);
            break;
        case 'inactive':
            await Product.updateMany({_id:{$in:ids}},{status:"inactive",$push:{updatedBy:updatedBy}})
            req.flash('success', `Cập nhật trạng thái thành công ${ids.length} sản phẩm`);
            break;
        case 'delete-all':
            const deletedBy={
                account_id:res.locals.user.id,
                deletedAt:new Date()
            }
            await Product.updateMany({_id:{$in:ids}},{deleted:true,deletedBy:deletedBy})
            req.flash('success', `Xóa thành công ${ids.length} sản phẩm`);
            break;
        case 'change-position':
            for (const item of ids) {
                let [id, position]=item.split('-')
                position=parseInt(position)
                await Product.updateOne({_id:id},{position:position,$push:{updatedBy:updatedBy}})
            }
            req.flash('success', `Đổi vị trí thành công ${ids.length} sản phẩm`);
            break;
    }
    res.redirect('back');
}
module.exports.detail=async(req, res) => {
    try {
        const product=await Product.findOne({_id:req.params.id,deleted:false})
        console.log(product)
        res.render('admin/pages/products/detail',{
            title:product.title,
            product:product
        })
    } catch (error) {
        req.flash('error','Sản phẩm ko tồn tại')
        res.redirect('back')
    }
}
module.exports.create=async(req, res) => {
    const records=await ProductCategory.find({
        deleted:false
    })
    const newRecords=createTreeHelper.tree(records)
    res.render('admin/pages/products/create',{title:'Thêm mới sản phẩm',records:newRecords})
}
module.exports.createPost=async(req, res) => {
    const permissions=res.locals.role.permissions
    if(!permissions.includes("products_create")){
        return;
    }
    req.body.price=parseFloat(req.body.price)
    req.body.discountPercentage=parseInt(req.body.discountPercentage)
    req.body.stock=parseInt(req.body.stock)
    if(req.body.position){
        req.body.position=parseInt(req.body.position)
    }
    else{
        const productCount=await Product.countDocuments();
        req.body.position=productCount+1
    }
    // if(req.file){
    //     req.body.thumbnail=`/uploads/${req.file.filename}`
    // }
    const createdBy={
        account_id:res.locals.user.id,
    };
    req.body.createdBy=createdBy
    const product=new Product(req.body)
    await product.save()
    req.flash('success', `Đã thêm thành công sản phẩm`);
    res.redirect(`${systemConfig.prefixAdmin}/products`);
}

module.exports.edit=async(req,res)=>{
    try {
        const records=await ProductCategory.find({
            deleted:false
        })
        const newRecords=createTreeHelper.tree(records)
        const product=await Product.findOne({_id:req.params.id,deleted:false})
        res.render('admin/pages/products/edit',{
            title:'Cập nhật sản phẩm',
            product:product,
            records:newRecords
        })
    } catch (error) {
        req.flash('error','Sản phẩm ko tồn tại')
        res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
}

module.exports.editPatch=async(req,res)=>{
    const permissions=res.locals.role.permissions
    if(!permissions.includes("products_edit")){
        return;
    }
    req.body.price=parseFloat(req.body.price)
    req.body.discountPercentage=parseInt(req.body.discountPercentage)
    req.body.stock=parseInt(req.body.stock)
    if(req.body.position){
        req.body.position=parseInt(req.body.position)
    }
    else{
        const productCount=await Product.countDocuments();
        req.body.position=productCount+1
    }
    try {
        const updatedBy={
            account_id:res.locals.user.id,
            updatedAt:new Date()
        }
        await Product.updateOne({_id:req.params.id},{...req.body,$push:{updatedBy:updatedBy}})
        req.flash('success', `Cập nhật sản phẩm thành công`);
        res.redirect("back")
    } catch (error) {
        req.flash('error', `Cập nhật ko thành công`);
        res.redirect(`back`);
    }
}

