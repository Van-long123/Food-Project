const express=require('express')
const Routes=express.Router();
const controller=require('../../controllers/admin/order.controller')
Routes.get('/',controller.index)
Routes.patch('/change-status/:status/:id',controller.changeStatus)
Routes.delete('/delete/:id',controller.deleteItem)
Routes.patch('/change-multi/',controller.changeMulti)
Routes.get('/detail/:id',controller.detail)



module.exports=Routes;