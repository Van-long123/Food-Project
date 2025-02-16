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
        fetch(`/vouchers/check-voucher/${voucherCode}`,{
            method:"GET"
        })
        .then(res => {
            return res.json()
        })
        .then(data => {
            console.log(data)
            if(data.exists){
                if(!data.alreadyOwned){
                    const noVoucherContainer =document.querySelector('.no-voucher-container')
                    if(noVoucherContainer){
                        noVoucherContainer.classList.add('hidden')
                    }
                    const item=data.voucher
                    const vouchers=document.querySelector('.vouchers')
                    const progress=(item.usedCount/item.quantity*100).toFixed(1)
                    const newDiv= document.createElement('div')
                    newDiv.classList.add('col-md-6', 'mb-3')
                    newDiv.innerHTML=`
                        <div class="voucher-card">
                            <div class="voucher-left">
                                <img src="https://down-vn.img.susercontent.com/file/vn-11134004-7ras8-m4re2imocx9s72" alt="Voucher">
                                <span>Toàn Ngành Hàng</span>
                            </div>
                            <div class="voucher-right">
                                <a href="/products">
                                    <span class="use-now">Dùng ngay &gt;</span>
                                </a>
                                <div class="voucher-title">
                                    Giảm ${item.discountValue.toLocaleString('vi-VN') }${item.discountType=='percent' ? '%' : 'đ'}
                                </div>
                                <div class="voucher-details">
                                    Giảm tối đa ${item.maxDiscountAmount.toLocaleString('vi-VN')}đ Đơn Tối Thiểu ${item.minOrderValue.toLocaleString('vi-VN')}đ
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
                    vouchers.prepend(newDiv);
                    // vouchers.innerHTML=newDiv;
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

