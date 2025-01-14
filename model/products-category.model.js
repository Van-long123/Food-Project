const mongoose=require('mongoose')
const slug=require('mongoose-slug-updater')
mongoose.plugin(slug)
const productCategorySchema=new mongoose.Schema({
    title:String,
    description:String,
    thumbnail:String,
    parent_id:{
        type:String,
        default:""
    },
    status:String,
    position:Number,
    slug:{
        type:String,
        slug:'title',
        unique:true
    },
    deleted:{
        type:Boolean,
        default:false
    },
    createdBy:{
        account_id:String,
        createdAt:{
            type:Date,
            default:Date.now,
        }
    },
    deleteBy:{
        account_id:String,
        deletedAt:Date
    },
    updatedBy:[
        {
            account_id:String,
            updatedAt:Date
        }
    ]
})
const ProductCategory=mongoose.model('ProductCategory',productCategorySchema,'products-category')
module.exports=ProductCategory