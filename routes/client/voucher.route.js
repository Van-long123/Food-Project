const express=require('express')
const router=express.Router();
const controller=require('../../controllers/client/voucher.controller')
router.get('/',controller.index)
router.get('/check-voucher/:code/:price?',controller.checkVoucher)

// router.get('/get-my-voucher/:price',controller.GetMyVoucher)
router.get('/get-voucher-by-id/:id',controller.getVoucherById)

module.exports = router