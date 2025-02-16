const ProductCategory=require("../../model/products-category.model");
const Product=require("../../model/product.model");
const User=require("../../model/user.model");
const Comment=require("../../model/comment.model");
const searchHelper=require("../../helpers/search")
const convertToSlugHelper=require("../../helpers/convertToSlug")
const productsHelper=require("../../helpers/product");
const paginationHelper=require("../../helpers/pagination");
const Order = require("../../model/order.model");
module.exports.index=async(req,res)=>{
    let find={
        deleted:false,
        status:'active'
    }
    if(req.query.price_from&&req.query.price_to){
        find.price={
            $gte:req.query.price_from,
            $lte:req.query.price_to
        }
    }
    //Search
    let search=""
    if(req.query.search){
        search=(req.query.search).trim();
        const stringSLug=convertToSlugHelper.convertToSlug(search)
        const SlugRegex=new RegExp(stringSLug,'i')
        const keywordRegex=new RegExp(search,'i')
        find['$or']=[
            {title:keywordRegex},
            {slug:SlugRegex}
        ]
    }
    //end search
    //  Pagination 
    const countProducts=await Product.countDocuments(find)
    const objectPagination=paginationHelper(req.query,countProducts,{
        currentPage:1,
        limitItems:12
    })
    // end Pagination 
    
    const products=await Product.find(find).sort({position:'desc'}).limit(objectPagination.limitItems).skip(objectPagination.skip)
    const newProducts=productsHelper.priceNewproduct(products);
    
    const productsCategory=await ProductCategory.find({
        deleted:false,
        status:"active",
        
    })
    res.render('client/pages/products/index',{
        title:"Danh sách sản phẩm",
        products:newProducts,
        productsCategory:productsCategory,
        pagination:objectPagination,
        search:search
    })
}
module.exports.featured=async(req,res)=>{
    let find={
        deleted:false,
        status:'active',
        featured:'1'
    }
    if(req.query.price_from&&req.query.price_to){
        find.price={
            $gte:req.query.price_from,
            $lte:req.query.price_to
        }
    }
    //  Pagination 
    const countProducts=await Product.countDocuments(find)
    const objectPagination=paginationHelper(req.query,countProducts,{
        currentPage:1,
        limitItems:12
    })
    // end Pagination 

    const products=await Product.find(find).limit(objectPagination.limitItems).skip(objectPagination.skip)
    const newProducts=productsHelper.priceNewproduct(products);
    
    const productsCategory=await ProductCategory.find({
        deleted:false,
        status:"active",
        
    })
    res.render('client/pages/products/index',{
        title:"Danh sách sản phẩm nổi bật",
        products:newProducts,
        productsCategory:productsCategory,
        pagination:objectPagination
    })
}
module.exports.category=async(req,res)=>{
    try {
        let find={
            deleted:false,
            status:'active',
        }
        if(req.query.price_from&&req.query.price_to){
            find.price={
                $gte:req.query.price_from,
                $lte:req.query.price_to
            }
        }
        const category=await ProductCategory.findOne({slug:req.params.slugCategory,status:"active",deleted:false})
        const productsCategory=await ProductCategory.find({
            deleted:false,
            status:"active",
            
        })
        if(category){
            find.product_category_id=category.id
        }
        
        const countProducts=await Product.countDocuments(find)
        const objectPagination=paginationHelper(req.query,countProducts,{
            currentPage:1,
            limitItems:12
        })
        const products=await Product.find(find).limit(objectPagination.limitItems).skip(objectPagination.skip)
        const newProducts=productsHelper.priceNewproduct(products);
        res.render('client/pages/products/index',{
            title:"Danh sách sản phẩm",
            products:newProducts,
            productsCategory:productsCategory,
            pagination:objectPagination
        })
    } catch (error) {
        res.redirect('/')
    }
    
}

module.exports.comment=async(req,res)=>{
    try {
        const product_id=req.body.productId;
        const content=req.body.content;
        if(!product_id || !content){
            return res.json({
                code:400,
                message:'Thiếu thông tin đánh giá!',
            })
        }

        const cartId=req.cookies.cartId;
        if(cartId){
            const order=await Order.findOne({
                cartId:cartId,
                'products.product_id':product_id
            }).sort({'createdBy.createdAt':'desc'})
            if(!order){
                return res.json({
                    code:400,
                    message:'Đơn hàng không tồn tại!',
                })
            }
            if(order.hasCommented){
                return res.json({
                    code:400,
                    message:'Bạn đã nhận xét đơn hàng này!',
                })
            }
            if(order.status !== 'Delivered'){
                return res.json({
                    code:400,
                    message:'Bạn chỉ có thể nhận xét đơn hàng khi đã nhận hàng!',
                })
            }
            order.hasCommented=false;
            // order.hasCommented=true;
            await order.save()
        }
        else{
            return res.json({
                code:400,
                message:'Giỏ hàng không tồn tại!',
            })
        }

        let fullName;
        // const user_id=
        const objectComment={
            product_id:product_id,
            content:content,
        }
        const tokenUser=req.cookies.tokenUser;
        const user=await User.findOne({
            tokenUser:tokenUser
        })
        if(user){
            objectComment['user_id']=user.id
            fullName=user.fullname
        }
        else{
            fullName="No Name"
        }
        const comment=new Comment(objectComment)
        await comment.save()
        if(comment){
            res.json({
                code:200,
                message:'success',
                userName:fullName,
            })
        }
    } catch (error) {
        res.json({
            code:500,
            message: 'Lỗi server!'
        })
    }
    
}
module.exports.rate=async(req,res)=>{
    try {
        const {id,rating}=req.body;
        if (!id || !rating) {
            // dùng fetch thì khi .status(400) thì mới hiểu là code 400 còn ajax thì ko
            return res.status(400).json({ message: 'Thiếu thông tin đánh giá!' });
        }
        const product=await Product.findOne({
            _id:id
        })
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại!' });
        }

        const cartId=req.cookies.cartId;
        if(cartId){
            const order=await Order.findOne({
                cartId:cartId,
                'products.product_id':id
            }).sort({'createdBy.createdAt':'desc'})
            if(!order){
                return res.status(404).json({ message: 'Đơn hàng không tồn tại!' });
            }
            if(order.hasReviewed){
                return res.status(400).json({ message: 'Bạn đã đánh giá đơn hàng này!' });
            }
            if(order.status !== 'Delivered'){
                return res.status(400).json({ message: 'Bạn chỉ có thể đánh giá đơn hàng khi đã nhận hàng!' });
            }
            order.hasReviewed=true;
            await order.save()
        }
        else{
            return res.status(404).json({ message: 'Giỏ hàng không tồn tại!' });
        }

        if(!product.ratings){
            product.ratings={
                totalRating:0,
                numberOfRatings:0
            }
        }
        product.ratings.totalRating+=rating
        product.ratings.numberOfRatings+=1
        await product.save();
        res.json({
            code:200,
            message: 'Đánh giá thành công!',
            averageRating: product.ratings.totalRating / product.ratings.numberOfRatings,
        })
    } catch (error) {
        res.json({
            code:500,
            message: 'Lỗi server!'
        })
    }
}