module.exports.createPost=(req,res,next)=>{
    if(!req.body.name){
        req.flash('error', `Vui lòng nhập tiêu đề`);
        res.redirect(`back`);
        return;//phải thêm return để code ở dưới ko chạy vì js bất động bộ
    }
    if(!req.body.description){
        req.flash('error', `Vui lòng nhập mô tả`);
        res.redirect(`back`);
        return;//phải thêm return để code ở dưới ko chạy vì js bất động bộ
    }
    next()
}
module.exports.editPatch=(req,res,next)=>{
    if(!req.body.name){
        req.flash('error', `Vui lòng nhập tiêu đề`);
        res.redirect(`back`);
        return;//phải thêm return để code ở dưới ko chạy vì js bất động bộ
    }
    if(!req.body.description){
        req.flash('error', `Vui lòng nhập mô tả`);
        res.redirect(`back`);
        return;//phải thêm return để code ở dưới ko chạy vì js bất động bộ
    }
    next()

}