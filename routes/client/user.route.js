const express = require('express')
const router=express.Router();
const multer=require("multer");
const upload=multer();
const uploadCloud=require('../../middleware/admin/uploadCloud.middleware')
const controller=require("../../controllers/client/user.controller")
const middleware=require("../../middleware/client/auth.middleware")
const validate=require("../../validates/client/user.validate")
router.get('/login',controller.login)
router.post('/login',validate.loginPost,controller.loginPost)
router.get('/register',controller.register)
router.post('/register',validate.registerPost,controller.registerPost)
router.get('/logout',controller.logout)
router.get('/password/forgot',controller.forgotPassword)
router.post('/password/forgot',validate.forgotPassword,controller.forgotPasswordPost)
router.get('/password/otp',controller.otpPassword)
router.post('/password/otp',controller.otpPasswordPost)
router.get('/password/reset',controller.resetPassword)
router.post('/password/reset',validate.resetPasswordPost,controller.resetPasswordPost)
router.get('/order',controller.order)
router.delete('/order/delete/:id',controller.orderDelete)


router.get('/detail',controller.detail)
router.patch('/update-profile',upload.single('avatar'),validate.infoUser,uploadCloud.upload,controller.updateProfile)
// router.patch('/update-profile',validate.infoUser,controller.updateProfile)

module.exports = router