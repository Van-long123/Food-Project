module.exports.registerPost=(req,res,next)=>{
    if(!req.body.fullname){
        req.flash('nameError', `Vui lòng nhập họ tên`);
        res.redirect(`back`);
        return;
    }
    if(!req.body.phone){
        req.flash('phoneError', `Vui lòng nhập số điện thoại`);
        res.redirect(`back`);
        return;
    }
    if(!req.body.address){
        req.flash('addressError', `Vui lòng nhập địa chỉ`);
        res.redirect(`back`);
        return;
    }
    if(!req.body.email){
        req.flash('emailError', `Vui lòng nhập email`);
        res.redirect(`back`);
        return;//phải thêm return để code ở dưới ko chạy vì js bất động bộ
    }
    if(!req.body.password){
        req.flash('error', `Vui lòng nhập mật khẩu`);
        res.redirect(`back`);
        return;//phải thêm return để code ở dưới ko chạy vì js bất động bộ
    }
    if(!req.body.confirmPassword){
        req.flash('error', `Vui lòng nhập xác nhận mật khẩu`);
        res.redirect(`back`);
        return;//phải thêm return để code ở dưới ko chạy vì js bất động bộ
    }
    if(req.body.password!=req.body.confirmPassword){
        req.flash('error', `Mật khẩu không khớp`);
        res.redirect(`back`);
        return;//phải thêm return để code ở dưới ko chạy vì js bất động bộ
    }
    next()
}

module.exports.loginPost=(req,res,next)=>{
    if(!req.body.email){
        req.flash('error', `Vui lòng nhập email`);
        res.redirect(`back`);
        return;
    }
    if(!req.body.password){
        req.flash('error', `Vui lòng nhập mật khẩu`);
        res.redirect(`back`);
        return;//phải thêm return để code ở dưới ko chạy vì js bất động bộ
    }
    next()
}
module.exports.forgotPassword=(req,res,next)=>{
    if(!req.body.email){
        if(!req.body.email){
            req.flash('error', `Vui lòng nhập email`);
            res.redirect(`back`);
            return;//phải thêm return để code ở dưới ko chạy vì js bất động bộ
        }
    }
    next()

}
module.exports.resetPasswordPost=(req,res,next)=>{
    if(!req.body.password){
        res.json({
            code:400,
            message:"Vui lòng nhập mật khẩu"
        })
        return;//phải thêm return để code ở dưới ko chạy vì js bất động bộ
    }
    if(!req.body.confirmPassword){
        res.json({
            code:400,
            message:"Vui lòng nhập xác nhận mật khẩu"
        })
        return;//phải thêm return để code ở dưới ko chạy vì js bất động bộ
    }
    if(req.body.password!=req.body.confirmPassword){
        res.json({
            code:400,
            message:"Mật khẩu không khớp"
        })
        return;//phải thêm return để code ở dưới ko chạy vì js bất động bộ
    }
    next()
}

module.exports.infoUser=(req,res,next)=>{
    if(!req.body.fullname){
        req.flash('nameError', `Vui lòng nhập họ tên`);
        res.redirect(`back`);
        return;
    }
    if(!req.body.phone){
        req.flash('phoneError', `Vui lòng nhập số điện thoại`);
        res.redirect(`back`);
        return;
    }
    if(!req.body.address){
        req.flash('addressError', `Vui lòng nhập địa chỉ`);
        res.redirect(`back`);
        return;
    }
    if(!req.body.email){
        req.flash('emailError', `Vui lòng nhập email`);
        res.redirect(`back`);
        return;//phải thêm return để code ở dưới ko chạy vì js bất động bộ
    }
    next()
}