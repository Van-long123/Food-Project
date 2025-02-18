fetch('https://provinces.open-api.vn/api/?depth=3')
    .then(response => {
        return response.json()
    })
    .then(data => {
        let provinces = data
        for (const province of provinces) {
            if (province.code == 48) {
                document.getElementById('provinces').innerHTML += `<option value="${province.code}">${province.name}</option>`
            }
            // ko += là nó thằng sau sẽ ghi đè thằng trước còn có là nó ko ghi đề mà sẽ thêm vào
            // document.getElementById('provinces').innerHTML=`<option value="${province.name}">${province.name}</option>`
        }
    })
    .catch(error => {
        console.error('Lỗi khi gọi API', error)
    })


const provinces = document.getElementById('provinces')
if (provinces) {
    provinces.addEventListener('change', e => {
        const codeProvince = e.target.value
        fetch('https://provinces.open-api.vn/api/?depth=3')
            .then(response => {
                return response.json()
            })
            .then(data => {
                let provinces = data
                const filteredData = provinces.filter(item => item.code == codeProvince);
                // console.log(filteredData[0].districts)
                document.getElementById('districts').innerHTML = '<option value="">-- Quận huyện --</option>';
                for (const district of filteredData[0].districts) {
                    document.getElementById('districts').innerHTML += `<option value="${district.code}">${district.name}</option>`
                    // ko += là nó thằng sau sẽ ghi đè thằng trước còn có là nó ko ghi đề mà sẽ thêm vào
                    // document.getElementById('provinces').innerHTML=`<option value="${province.name}">${province.name}</option>`
                }
            })
            .catch(error => {
                console.error('Lỗi khi gọi API', error)
            })
            ;
    })
}

const districts = document.getElementById('districts')
if (districts) {
    districts.addEventListener('change', e => {
        const codedistrict = e.target.value
        // này là nó lấy đc cái district ko lấy đc province
        // cần code của district sẽ lấy đc nó
        fetch(`https://provinces.open-api.vn/api/d/${codedistrict}?depth=2`)
            .then(response => {
                return response.json()
            })
            .then(data => {
                document.getElementById('wards').innerHTML = '<option value="">-- Phường xã --</option>';
                let wards = data.wards
                for (const ward of wards) {
                    document.getElementById('wards').innerHTML += `<option value="${ward.code}">${ward.name}</option>`
                }
            })
            .catch(error => {
                console.error('Lỗi khi gọi API', error)
            })
            ;
    })
}

const fullname = document.querySelector('input[name="full_name"]')
fullname.addEventListener('change', e => {
    if (!fullname.value) {
        document.querySelector('#full_name-error').style.display = 'block'
    }
    else {
        document.querySelector('#full_name-error').style.display = 'none'

    }
})
const phone = document.querySelector('input[name="phone"]')
phone.addEventListener('change', e => {
    if (!phone.value) {
        document.querySelector('#phone-error').style.display = 'block'
    }
    else {
        document.querySelector('#phone-error').style.display = 'none'

    }

})
const address = document.querySelector('input[name="address"]')
address.addEventListener('change', e => {
    if (!address.value) {
        document.querySelector('#address-error').style.display = 'block'
    }
    else {
        document.querySelector('#address-error').style.display = 'none'

    }
})
const province = document.querySelector('#provinces')
province.addEventListener('change', e => {
    const provinceSelected = province.value
    if (!provinceSelected) {
        document.querySelector('#provinces-error').style.display = 'block'
    }
    else {
        document.querySelector('#provinces-error').style.display = 'none'

    }
})

const district = document.querySelector('#districts')
district.addEventListener('change', e => {
    const districtSelected = district.value
    if (!districtSelected) {
        document.querySelector('#districts-error').style.display = 'block'
    }
    else {
        document.querySelector('#districts-error').style.display = 'none'
    }
})
const wards = document.querySelector('#wards')
wards.addEventListener('change', e => {
    const wardSelected = wards.value
    if (!wardSelected) {
        document.querySelector('#wards-error').style.display = 'block'
    }
    else {
        document.querySelector('#wards-error').style.display = 'none'
    }

})






const btn1a = document.querySelector('.btn-1a')
if (btn1a) {
    btn1a.addEventListener('click', async e => {
        let checkInfo = true;
        const fullname = document.querySelector('input[name="full_name"]').value
        const phone = document.querySelector('input[name="phone"]').value
        const address = document.querySelector('input[name="address"]').value

        const provinces = document.querySelector('#provinces')
        const provinceSelected = provinces.value
        const provinceValue = provinces.querySelector(`option[value="${provinceSelected}"]`).textContent;

        const districts = document.querySelector('#districts')
        const districtSelected = districts.value
        const districtValue = districts.querySelector(`option[value="${districtSelected}"]`).textContent;

        const wards = document.querySelector('#wards')
        const wardSelected = wards.value
        const wardValue = wards.querySelector(`option[value="${wardSelected}"]`).textContent;

        const phoneRegex = /^[0-9]{10,11}$/;

        if (!fullname) {
            checkInfo = false
            document.querySelector('#full_name-error').style.display = 'block'
        }
        // else{
        //     document.querySelector('#full_name-error').style.display='none'

        // }
        if (!phone) {
            checkInfo = false
            document.querySelector('#phone-error').style.display = 'block'
        }
        if (!phoneRegex.test(phone)) {
            checkInfo = false
            document.querySelector('#phone-error-format').style.display = 'block'
        }

        // else{
        //     document.querySelector('#phone-error').style.display='none'

        // }
        if (!address) {
            checkInfo = false
            document.querySelector('#address-error').style.display = 'block'
        }
        // else{
        //     document.querySelector('#address-error').style.display='none'

        // }
        if (!provinceSelected) {
            checkInfo = false
            document.querySelector('#provinces-error').style.display = 'block'
        }
        // else{
        //     document.querySelector('#provinces-error').style.display='none'

        // }
        if (!districtSelected) {
            checkInfo = false
            document.querySelector('#districts-error').style.display = 'block'
        }
        // else{
        //     document.querySelector('#districts-error').style.display='none'
        // }
        if (!wardSelected) {
            checkInfo = false
            document.querySelector('#wards-error').style.display = 'block'
        }
        // else{
        //     document.querySelector('#wards-error').style.display='none'
        // }


        const productsElement = document.querySelectorAll('.product-element-top')
        let ids = []
        productsElement.forEach(item => {
            const position = item.querySelector('.quantity strong').textContent;
            const id = item.getAttribute('data_id')
            ids.push(`${id}-${position}`)
        })
        const productsId = ids.join(', ');
        const deliveryFee=parseInt(document.querySelector('input[name="delivery-method"]:checked').value)*1000
        if(!deliveryFee){
            deliveryFee=20000
        }
        let data = {
            deliveryFee:deliveryFee,
            fullname: fullname, phone: phone,
            address: address,
            province: provinceValue,
            district: districtValue,
            ward: wardValue,
            products: productsId
        }

        const code=document.querySelector('.code')
        if(code){
            const codeText=code.textContent
            const res=await fetch(`/vouchers/get-voucher-by-id/${codeText}`);
            const resData=await res.json();
            if(resData.voucher){
                data.voucherId=resData.voucher._id
            }
            else{
                checkInfo = false
            }
            // fetch(`/vouchers/get-voucher-by-id/${codeText}`)
            //     .then(res=>res.json())
            //     .then(data=>{
            //         if(data.voucher){
            //             console.log('ok')
            //         }
            //         else{
            //             checkInfo = false
            //         }
            //     })
        }

        const url = new URL(window.location.href);
        const pathParts = url.pathname.split("/");
        if (pathParts.length>3 && pathParts[3]) {
            data.payInHome = true
        }
        if (checkInfo) {
            $.ajax({
                type: 'post',
                url: '/order/create/checkout',
                data: data,
                dataType: 'json',
                success: function (response) {
                    if (response.code) {
                        window.location.href = '/order/checkout?code=' + response.code
                    }
                },
                error: function (error) {
                    alert('error')
                }
            })

        }
        else{
            notification('Đã có lỗi xảy ra, vui lòng thử thanh toán lại sau!','#FF4C4C')

        }
    })
}

const inputCheckedAll=document.querySelectorAll('input[name="delivery-method"]')
if(inputCheckedAll){
    const shippingFee=document.querySelector('.shipping-fee-container').querySelector('.price-amount1')
    const totalPrice=document.querySelector('.total-price').querySelector('.price-amount1')
    const unitPrice=document.querySelector('.unit-price').querySelector('.price-amount1')
    const discountVoucher=document.querySelector('.discount-voucher')
    
    inputCheckedAll.forEach(input=>{
        if(input.checked){
            shippingFee.innerHTML=`
                ${input.value}<span class="currency-symbol">đ</span>
            `
            const priceTotal=(parseFloat(unitPrice.textContent.slice(0,-1))+parseInt(input.value)).toFixed(3)
            totalPrice.innerHTML=`
            ${priceTotal}<span class="currency-symbol">đ</span>
            `
        }
        input.addEventListener('click',e=>{
            shippingFee.innerHTML=`
                ${input.value}<span class="currency-symbol">đ</span>
            `
            let priceTotal=(parseFloat(unitPrice.textContent.slice(0,-1))+parseInt(input.value))
            if(discountVoucher.querySelector('.price-amount1')){
                const discountVoucherValue=parseFloat(discountVoucher.querySelector('.price-amount1').textContent.slice(0,-1))
                if(discountVoucherValue){
                    priceTotal = priceTotal-discountVoucherValue
                }
            }
            console.log(priceTotal)
            totalPrice.innerHTML=`
            ${priceTotal.toFixed(3)}<span class="currency-symbol">đ</span>
            `
        })
    })
}

// display voucher 
// const btnVoucher=document.querySelector('.btn-voucher')
// if(btnVoucher){
//     btnVoucher.addEventListener('click',e=>{
//         const totalPrice=document.querySelector('.total-price').querySelector('.price-amount1')
//         const shippingFee=document.querySelector('.shipping-fee-container').querySelector('.price-amount1')

//         const priceTotal=(parseFloat(totalPrice.textContent.slice(0,-1))-parseFloat(shippingFee.textContent.slice(0,-1))).toFixed(3)
//         fetch(`/vouchers/get-my-voucher/${priceTotal}`)
//             .then(res=>res.json())
//             .then(data=>{
//                 if(data.code==200){
//                     const vouchers=data.vouchers
//                     let htmls;
//                     if(vouchers.length>0){
//                         htmls=vouchers.map(item=>{
//                             return `
//                             <div class="voucher-card mb-3" data-id="${item.code}">
//                                 <div class="voucher-left"><img src="https://down-vn.img.susercontent.com/file/vn-11134004-7ras8-m4re2imocx9s72" alt="Voucher" /><span>Toàn Ngành Hàng</span></div>
//                                 <div class="voucher-right">
//                                     <span class="use-now">Dùng ngay &gt;</span>
//                                     <div class="voucher-title">Giảm ${item.discountValue.toLocaleString('vi-VN') }${item.discountType=='percent' ? '%' : 'đ'}  </div>
//                                     <div class="voucher-details">Giảm tối đa ${item.maxDiscountAmount.toLocaleString('vi-VN')}đ</div>
//                                     <div class="progress-bar"><div class="progress-fill" style="width: ${item.progress}%;"></div></div>
//                                     <div class="voucher-usage">Đã dùng ${item.progress}%  </div>
//                                 </div>
//                             </div>
//                             `
//                         })
//                     }
//                     else{
//                         htmls=[`
//                         <div class="no-voucher-container">
//                             <p class="no-voucher-text">Bạn chưa có voucher nào. Hãy tìm kiếm và nhận ngay!</p>
//                         </div>                     
//                         `]
//                     }
                    
//                     const modalBody=document.querySelector('.modal-body')
//                     modalBody.innerHTML=htmls.join(' ')
//                     useVoucher()
//                 }
//                 else{
//                     alert(data.message)
//                 }
//             })
//     })
// }
// display voucher 

// add voucher 
// khi add voucher phải kiểm là đơn hàng đó có thõa mãn đơn hàng tối thiểu ko chỉ ở checkout
const voucherErrorContainer=document.querySelector('.voucher-error-container')
if(voucherErrorContainer){
    const voucherErrorClose=voucherErrorContainer.querySelector('.voucher-error-close')
    voucherErrorClose.addEventListener('click',e=>{
        voucherErrorContainer.classList.add('hidden')
    })
}
const saveBtn=document.querySelector('#save-btn')
if(saveBtn){
    const input = document.getElementById('voucher-input');
    saveBtn.addEventListener('click',e=>{
        const voucherCode=input.value.trim();
        if(!voucherCode){
            voucherErrorContainer.classList.remove('hidden')
            return
        }
        const totalPrice=document.querySelector('.total-price').querySelector('.price-amount1')
        const shippingFee=document.querySelector('.shipping-fee-container').querySelector('.price-amount1')

        const priceTotal=(parseFloat(totalPrice.textContent.slice(0,-1))-parseFloat(shippingFee.textContent.slice(0,-1))).toFixed(3)
        fetch(`/vouchers/check-voucher/${voucherCode}/${priceTotal}`,{
            method:"GET"
        })
        .then(res => {
            return res.json()
        })
        .then(data => {
            if(data.exists){
                if(!data.alreadyOwned){
                    const noVoucherContainer =document.querySelector('.no-voucher-container')
                    if(noVoucherContainer){
                        noVoucherContainer.classList.add('hidden')
                    }
                    const item=data.voucher
                    const modalBody=document.querySelector('.modal-body')
                    const progress=(item.usedCount/item.quantity*100).toFixed(1)
                    const newDiv= document.createElement('div')
                    newDiv.classList.add('mb-3')
                    newDiv.innerHTML=`
                        <div class="voucher-card" data-id="${item.code}">
                            <div class="voucher-left">
                                <img src="https://down-vn.img.susercontent.com/file/vn-11134004-7ras8-m4re2imocx9s72" alt="Voucher">
                                <span>Toàn Ngành Hàng</span>
                            </div>
                            <div class="voucher-right">
                                <span class="use-now">Dùng ngay &gt;</span>
                                <div class="voucher-title">
                                    Giảm ${item.discountValue.toLocaleString('vi-VN') }${item.discountType=='percent' ? '%' : 'đ'}
                                </div>
                                <div class="voucher-details">
                                    Giảm tối đa ${item.maxDiscountAmount.toLocaleString('vi-VN')}đ 
                                </div>
                                <div class="voucher-usage">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${progress}%;"></div>
                                    </div>
                                    <span>Đã dùng ${progress}%</span>
                                </div>
                            </div>
                        </div>
                    `
                    modalBody.prepend(newDiv);
                    // vouchers.innerHTML=newDiv;
                    useVoucher()
                    notification('Bạn đã thêm voucher thành công!')
                }
                else{
                    voucherErrorContainer.querySelector('.voucher-error-message').textContent = data.message
                    voucherErrorContainer.classList.remove('hidden');
                }
                
            }
            else{
                voucherErrorContainer.classList.remove('hidden')
            }
        })
    })
}

function notification(msg,background){
    const notification = document.getElementById('notification');
    if(background){
        notification.style.backgroundColor = background;
    }
    const timeout=notification.getAttribute('data-time')
    notification.classList.remove('hidden')
    notification.classList.add('show')

    notification.textContent=msg
    setTimeout(() => {
        notification.classList.remove('show')
        notification.classList.add('hidden')
    },timeout );
}

// add voucher 
function useVoucher(){
    const useNow=document.querySelectorAll('.use-now')
    useNow.forEach(item=>{
        item.addEventListener('click',e=>{
            const voucherCard=e.target.closest('.voucher-card')
            const code=voucherCard.getAttribute('data-id')
            fetch(`/vouchers/get-voucher-by-id/${code}`)
                .then(res=>res.json()
                .then(data=>{
                    if(data.code==200){
                        const shippingFee=document.querySelector('.shipping-fee-container').querySelector('.price-amount1')
                        const totalPrice=document.querySelector('.total-price').querySelector('.price-amount1')
                        const unitPrice=document.querySelector('.unit-price').querySelector('.price-amount1')
                        // lấy instance  của modal đã được Bootstrap khởi tạo trước đó.
                        // Instance: Là đối tượng JavaScript được Bootstrap tạo ra khi modal được khởi tạo. 
                        // Nó cho phép bạn tương tác với modal thông qua mã JavaScript, ví dụ như đóng hoặc mở modal, 
                        // thay đổi nội dung của nó, v.v.
                        // bootstrap.Modal.getInstance(): Phương thức này trả về instance của modal đã được Bootstrap
                        //  khởi tạo cho phần tử có id là "voucherModal"
                        let modal = bootstrap.Modal.getInstance(document.getElementById("voucherModal"));
                        if (modal) {
                            modal.hide()
                        };
                        const voucher=data.voucher;
                        const codeVoucher=document.querySelector('.code-voucher')
                        const discountVoucher=document.querySelector('.discount-voucher')
                        let discountValue
                        if(voucher.discountType=="amount"){
                            discountValue= voucher.discountValue
                        }
                        else{
                            
                            const priceTotal=parseFloat((parseFloat(unitPrice.textContent.slice(0,-1))+parseInt(shippingFee.textContent.slice(0,-1))).toFixed(3))
                            const priceDiscount=(priceTotal*voucher.discountValue/100)*1000
                            if(priceDiscount>voucher.maxDiscountAmount){
                                discountValue = voucher.maxDiscountAmount
                            }
                            else{
                                discountValue = priceDiscount
                            }
                            
                        }
                        const priceTotal=((parseFloat(unitPrice.textContent.slice(0,-1))+parseInt(shippingFee.textContent.slice(0,-1)))*1000-discountValue).toLocaleString('vi-VN')
                        codeVoucher.innerHTML=`Mã voucher: <span class="code">${voucher.code}</span>` 
                        discountVoucher.innerHTML=`
                        <span>Voucher giảm giá</span><span class="text-right price-amount1 mb-1">${discountValue.toLocaleString('vi-VN')}<span class="currency-symbol">đ</span></span>
                        `
                        totalPrice.innerHTML=`
                        ${priceTotal}<span class="currency-symbol">đ</span>
                        `
                    }
                    else{
                        alert(data.message)
                    }
                })
            )
        })
    })
}
useVoucher()