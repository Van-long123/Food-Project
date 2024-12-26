const express = require('express')
const Routes = express.Router()
const CryptoJS = require('crypto-js'); // npm install crypto-js
const Order = require('../../model/order.model');
const Cart = require('../../model/cart.model');
const config = {
  key2: process.env.KEY2
};
Routes.post('/', async(req, res) => {
    let result = {};

    try {
        let dataStr = req.body.data;
        let reqMac = req.body.mac;
        let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

       
        // kiểm tra callback hợp lệ (đến từ ZaloPay server)
        if (reqMac !== mac) {
            // callback không hợp lệ
            result.return_code = -1;
            result.return_message = "mac not equal";
            console.log('mac not equal')
        }
        else {
            // thanh toán thành công
            // merchant cập nhật trạng thái cho đơn hàng
            
            try {
                let dataJson = JSON.parse(dataStr);
                let data = JSON.parse(dataJson.item);
                let order_info = data[0];
                console.log(order_info)
                if(order_info.existCart){
                    await Cart.updateOne({_id:order_info.cartId},{products:[]})
                    delete order_info.existCart
                }
                // console.log(order_info)
                const order=new Order(order_info)
                await order.save()
            } catch (error) {
                console.error('JSON Parse Error:', jsonError.message);
                result.return_code = 0;
                result.return_message = "Invalid JSON data";
                return res.json(result)
            }
            result.return_code = 1;
            result.return_message = "success";
        }
    } catch (ex) {
        result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
        result.return_message = ex.message;
    }

    // thông báo kết quả cho ZaloPay server
    res.json(result);
})
module.exports = Routes