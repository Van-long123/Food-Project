const express = require('express')
const router=express.Router();
const controller=require("../../controllers/client/cart.controller");
const validate=require('../../validates/client/cart.validate')
router.get('/cart-info', controller.index)
router.get('/info/:slug?',controller.info)
router.get('/checkout', controller.checkout)
router.post('/checkout', controller.checkoutPost)
router.post('/create/checkout', controller.creatCheckout)

router.post('/checkPay', controller.checkPay)

router.post('/add', controller.add)
router.post('/delete', controller.delete)

router.post('/buy-back', controller.buyBack)

module.exports=router