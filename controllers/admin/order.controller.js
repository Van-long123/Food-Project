const Product=require('../../model/product.model')
const Order=require('../../model/order.model')
const Account=require('../../model/account.model')
const ProductCategory=require('../../model/products-category.model')
const createTreeHelper=require('../../helpers/createTree')
const fillterStatusHelper=require('../../helpers/fillterStatusOrderHelper')
const searchHelper=require('../../helpers/search')
const paginationHelper=require('../../helpers/pagination')
const systemConfig=require('../../config/system')


module.exports.index=async(req,res)=>{
    let find={
        deleted:false
    }
    let fillterStatus=fillterStatusHelper(req.query);
    if(req.query.status&&req.query.status!="Deleted"){
        find.status=req.query.status
    }
    else if(req.query.status&&req.query.status=="Deleted"){
        find.deleted=true
    }

    //search
    const objectSearch=searchHelper(req.query)
    let keyword=objectSearch.keyword
    if(objectSearch.regex){
        find['userInfo.fullName']=objectSearch.regex
    }
    //search
    

    let sort={}
    if(req.query.sortKey&&req.query.sortValue){
        sort[req.query.sortKey]=req.query.sortValue
    }
    else{
        sort.createdAt='desc'
    }
//  Pagination 
    const countOrders=await Order.countDocuments(find)
    const objectPagination=paginationHelper(req.query,countOrders,{
        currentPage:1,
        limitItems:4
    })
// end Pagination 

    const orders=await Order.find(find)
    .sort(sort)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip)
    for (const order of orders) {
        const updateBy=order.updatedBy[order.updatedBy.length-1]
        if(updateBy){
            const userUpdate=await Account.findOne({_id:updateBy.account_id})
            if(userUpdate){
                updateBy.accountFullName=userUpdate.fullname
            }
        }
        order.nameProduct=''
        for (const product of order.products) {
            const productInfo=await Product.findOne({_id:product.product_id}).select('title')
            order.nameProduct+=', '+productInfo.title
        }
        order.nameProduct=order.nameProduct.substring(2)
    }
    
    // console.log(orders.products)
    // console.log(orders)
    res.render('admin/pages/order/index',
        {
            title:'Danh sách đơn hàng',
            orders:orders,
            fillterStatus:fillterStatus,
            keyword:keyword,
            pagination:objectPagination
        })
}
module.exports.changeStatus=async(req,res)=>{
    const permissions=res.locals.role.permissions
    if(!permissions.includes("orders_edit")){
        return;
    }
    const status=req.params.status
    const id=req.params.id
    const updatedBy={
        account_id:res.locals.user.id,
        updatedAt:new Date()
    }
    // sau làm acccount xong là lưu thêm người cập nhật 
    await Order.updateOne({_id:id},{status:status,
        $push :{updatedBy:updatedBy}
    })
    req.flash('success', 'Cập nhật trạng thái đơn hàng thành công');
    res.redirect('back');
}
module.exports.deleteItem=async(req,res)=>{
    const permissions=res.locals.role.permissions
    if(!permissions.includes("orders_delete")){
        req.flash('error', 'Bạn ko có quyền xóa đơn hàng');
        res.redirect('back');
        return;
    }
    const id=req.params.id
    // sau làm acccount xong là lưu thêm người xóa
    const deletedBy={
        account_id:res.locals.user.id,
        deletedAt:new Date()
    };
    await Order.updateOne({_id:id},{deleted:true,deletedBy:deletedBy})
    req.flash('success', 'Đã xóa đơn hàng thành công');
    res.redirect('back');
}
module.exports.changeMulti=async(req,res)=>{
    const permissions=res.locals.role.permissions
    if(!permissions.includes("orders_edit")){
        return;
    }
    const type=req.body.type
    const ids=req.body.ids.split(', ')
    const updatedBy={
        account_id:res.locals.user.id,
        updatedAt:new Date()
    }
    switch(type){
        case 'Initit':
            await Order.updateMany({_id:{$in:ids}},{status:"Initit",$push:{updatedBy:updatedBy}})
            req.flash('success', `Cập nhật trạng thái thành công ${ids.length} đơn hàng`);
            break;
        case 'Confirm':
            await Order.updateMany({_id:{$in:ids}},{status:"Confirm",$push:{updatedBy:updatedBy}})
            req.flash('success', `Cập nhật trạng thái thành công ${ids.length} đơn hàng`);
            break;
        case 'Shipped':
            await Order.updateMany({_id:{$in:ids}},{status:"Shipped",$push:{updatedBy:updatedBy}})
            req.flash('success', `Cập nhật trạng thái thành công ${ids.length} đơn hàng`);
            break;
        case 'Delivered':
            await Order.updateMany({_id:{$in:ids}},{status:"Delivered",$push:{updatedBy:updatedBy}})
            req.flash('success', `Cập nhật trạng thái thành công ${ids.length} đơn hàng`);
            break;

        case 'delete-all':
            const deletedBy={
                account_id:res.locals.user.id,
                deletedAt:new Date()
            }
            await Order.updateMany({_id:{$in:ids}},{deleted:true,deletedBy:deletedBy})
            req.flash('success', `Xóa thành công ${ids.length} sản phẩm`);
            break;
    }
    res.redirect('back');
}
module.exports.detail=async(req, res) => {
    try {
        const order=await Order.findOne({_id:req.params.id,deleted:false})
        console.log(order)
            
        order.nameProduct=''
        for (const product of order.products) {
            const productInfo=await Product.findOne({_id:product.product_id}).select('title')
            order.nameProduct+=', '+productInfo.title
        }
        order.nameProduct=order.nameProduct.substring(2)
        
        res.render('admin/pages/order/detail',{
            title:order.userInfo.fullName,
            order:order
        })
    } catch (error) {
        req.flash('error','Sản phẩm ko tồn tại')
        res.redirect('back')
    }
}

