const Article = require("../../model/article.model")
const paginationHelper=require("../../helpers/pagination");
module.exports.index=async(req,res)=>{
    const articlesFeatured =await Article.find({
        deleted: false,
        featured:"1"
    }).select('title shortDescription thumbnail slug createdBy').limit(6).select('title shortDescription thumbnail slug createdBy')
    
    const countArtists=await Article.countDocuments({deleted: false,})
    const objectPagination=paginationHelper(req.query,countArtists,{
        currentPage:1,
        limitItems:4
    }) 
    const articles =await Article.find({
        deleted: false,
    }).sort({
       'createdBy.createdAt': 'desc'
    }).limit(objectPagination.limitItems).skip(objectPagination.skip).select('title shortDescription thumbnail slug createdBy')
    
    res.render('client/pages/articles/index',{
        title:'Tạp chí thức ăn',
        articlesFeatured:articlesFeatured,
        articles:articles,
        pagination:objectPagination,
    })
}
module.exports.detail=async(req,res)=>{
    try {
        const article=await Article.findOne({
            deleted:false,
            slug:req.params.slug
        })
        const articlesFeatured =await Article.find({
            deleted: false,
            featured:"1"
        }).select('title shortDescription thumbnail slug createdBy').limit(6).select('title shortDescription thumbnail slug createdBy')
        res.render('client/pages/articles/detail',{
            title:article.title,
            articles:articlesFeatured,
            article:article
        })
    } catch (error) {
        res.redirect('back')
    }
}