const Article = require("../../model/article.model");
const fillterStatusHelper=require('../../helpers/fillterStatusHelper')
const searchHelper=require('../../helpers/search')
const pagination=require('../../helpers/pagination');
const systemConfig=require('../../config/system')
const Account = require("../../model/account.model");
const ArticleCategory = require("../../model/articles-category");
module.exports.index= async (req,res)=>{
    const permissions=res.locals.role.permissions
    if(!permissions.includes("articles_view")){
        return;
    }
    let find={
        deleted:false
    }
    const fillterStatus=fillterStatusHelper(req.query)
    if(req.query.status){
        find.status=req.query.status
    }
    const objectSearch=searchHelper(req.query)
    if(req.query.keyword){
        find['$or']=[
            {title:objectSearch.regex},
            {slug:objectSearch.slugRegex}
        ]
    }
    const sort={}
    if(req.query.sortKey&& req.query.sortValue){
        sort[req.query.sortKey]=req.query.sortValue
    }
    else{
        sort.position='desc'
    }
    const countArticles=await Article.countDocuments(find)
    const objectPagination=pagination(req.query,countArticles,{
        currentPage:1,
        limitItems:7
    })
    const records=await Article.find(find).sort(sort)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip).select('-content');
    
    for (const record of records) {
        const user=await Account.findOne({
            _id:record.createdBy.account_id
        })
        if(user){
            record.fullname=user.fullname
        }
        const updateBy=record.updatedBy[record.updatedBy.length-1]
        if(updateBy){
            const userUpdate=await Account.findOne({
                _id:updateBy.account_id
            })
            if(userUpdate){
                updateBy.accountFullName=userUpdate.fullname
            }
        }
    }

    res.render('admin/pages/articles/index',{
        title:"Danh sách bài viết",
        records:records,
        fillterStatus:fillterStatus,
        keyword:objectSearch.keyword,
        pagination:objectPagination,
    })
}

module.exports.changeStatus=async (req,res)=>{
    const permissions=res.locals.role.permissions
    if(!permissions.includes("articles_edit")){
        return;
    }
    const id=req.params.id;
    const status=req.params.status;
    const updatedBy={
        account_id:res.locals.user.id,
        updatedAt:Date.now()
    }
    await Article.updateOne({
        _id:id,
    },{
        status:status,$push:{updatedBy:updatedBy}
    })
    req.flash('success', 'Cập nhật trạng thái bài viết thành công');
    res.redirect('back');
}
module.exports.deleteItem=async(req,res)=>{
    const permissions=res.locals.role.permissions
    if(!permissions.includes("articles_delete")){
        return;
    }
    const id=req.params.id;
    const deletedBy={
        account_id:res.locals.user.id,
        deletedAt:Date.now()
    }
    await Article.updateOne({
        _id:id,
    },{
        deleted:true,deletedBy:deletedBy
    })
    req.flash('success', 'Đã xóa thành công bài viết');
    res.redirect('back');
}
module.exports.detail=async (req,res)=>{
    const permissions=res.locals.role.permissions
    if(!permissions.includes("articles_view")){
        return;
    }
    try {
        const id=req.params.id;
        const article=await Article.findOne({
            _id:id
        })
        console.log(article)
        res.render('admin/pages/articles/detail',{
            title:article.title,
            article:article
        })
    } catch (error) {
        req.flash('error', 'Bài viết không tồn tại');
        res.redirect('back');
    }
}

module.exports.changeMulti=async (req,res)=>{
    const permissions=res.locals.role.permissions
    if(!permissions.includes("articles_edit")){
        return;
    }
    const type=req.body.type;
    const ids=req.body.ids.split(', ');
    const updatedBy={
        account_id:res.locals.user.id,
        updatedAt:Date.now(),
    }
    switch (type) {
        case 'active':
            await Article.updateMany({
                _id:{$in:ids}
            },{
                status:'active',$push:{updatedBy:updatedBy}
            })
            req.flash('success', `Cập nhật trạng thái thành công ${ids.length} bài viết`);
            break;
        case 'inactive':
            await Article.updateMany({
                _id:{$in:ids}
            },{
                status:'inactive',$push:{updatedBy:updatedBy}
            })
            req.flash('success', `Cập nhật trạng thái thành công ${ids.length} bài viết`);
            break;
        case 'delete-all':
            deletedBy={
                account_id:res.locals.user.id,
                deletedAt:Date.now()
            }
            await Article.updateMany({
                _id:{$in:ids}
            },{
                deleted:true,deletedBy:deletedBy
            })
            req.flash('success', `Xóa thành công ${ids.length} bài viết`);

            break;
        case 'change-position':
            for (const item of ids) {
                const [id, position]=item.split('-')
                await Article.updateOne({
                    _id:id
                },{
                    position:position,$push:{updatedBy:updatedBy}
                })
            }
            req.flash('success', `Đã đổi vị trí thành công ${ids.length} danh mục`);
            break;
        default:
            req.flash('error', `Ko nằm trong danh sách hãy chọn lại`);
            break;
    }
    res.redirect('back')
}

module.exports.create=async (req,res)=>{
    const records=await ArticleCategory.find({
        deleted:false
    })
    res.render('admin/pages/articles/create',{
        title:'Tạo bài viết',
        records:records
    })
}

module.exports.createPost=async (req,res)=>{
    const permissions=res.locals.role.permissions
    if(!permissions.includes("articles_create")){
        return;
    }
    if(req.body.position==''){
        const count=await Article.countDocuments({})
        req.body.position=count+1
    }
    else{
        req.body.position=parseInt(req.body.position)
    }
    const createdBy={
        account_id:res.locals.user.id,
        createdAt:Date.now()
    }
    req.body.createdBy=createdBy
    const articles=new Article(req.body)
    await articles.save()
    req.flash('success', `Đã thêm thành công bài viết`);
    res.redirect(`${systemConfig.prefixAdmin}/articles`)
}

module.exports.edit=async (req,res)=>{
    try {
        const id=req.params.id;
        const article= await Article.findOne({
            _id:id,
            deleted:false
        })
        const categories=await ArticleCategory.find({
            deleted:false
        })
        res.render('admin/pages/articles/edit',{
            title:'Sửa bài viết',
            record:article,
            categories:categories
        })
    } catch (error) {
        
    }
}
module.exports.editPatch=async (req,res)=>{
    const permissions=res.locals.role.permissions
    if(!permissions.includes("articles_edit")){
        return;
    }
    try {
        if(req.body.position==''){
            const count=await Article.countDocuments({})
            req.body.position=count+1
        }
        else{
            req.body.position=parseInt(req.body.position)
        }
        
        const updatedBy={
            account_id:res.locals.user.id,
            updatedAt:Date.now()
        }
        await Article.updateOne({
            _id:req.params.id
        },{
            ...req.body,$push:{updatedBy:updatedBy}
        })
        req.flash('success', `Cập nhật thành công bài viết`);
        res.redirect(`back`)
    } catch (error) {
        
    }
}