

// Show alert 
const showAlert=document.querySelector('[show-alert1]');
if(showAlert){
    const time=parseInt(showAlert.getAttribute("data-time"))
    console.log(showAlert)
    
    setTimeout(() => {
        // showAlert.classList.add('alert-hidden');
        showAlert.classList.add('d-none');
    }, time);
    console.log(showAlert)
}
// end Show alert 

// Close alert 
const closeAlert=document.querySelector('[close-alert1]');
if(closeAlert){
    closeAlert.addEventListener('click',(e)=>{
        showAlert.classList.add('d-none');
    })
}
// Close alert 
// register 
const fullname=document.querySelector('input[name="fullname"]')
if(fullname){
    fullname.addEventListener('change',e=>{
        const nameValue=fullname.value
        if(!nameValue){
            document.querySelector('#name-error').style.display='block'
        }
        else{
            document.querySelector('#name-error').style.display='none'
        }
    })
}

const address=document.querySelector('input[name="address"]')
if(address){
    address.addEventListener('change',e=>{
        const addressValue=address.value
        if(!addressValue){
            document.querySelector('#address-error').style.display='block'
        }
        else{
            document.querySelector('#address-error').style.display='none'
        }
    })
}

const phone=document.querySelector('input[name="phone"]')
if(phone){
    phone.addEventListener('change',e=>{
        const phoneValue=phone.value
        if(!phoneValue){
            document.querySelector('#phone-error').style.display='block'
        }
        else{
            document.querySelector('#phone-error').style.display='none'
        }
    })
}

const confirmPassword=document.querySelector('input[name="confirmPassword"]')
if(confirmPassword){
    confirmPassword.addEventListener('change',e=>{
        const confirmPasswordValue=confirmPassword.value
        if(!confirmPasswordValue){
            document.querySelector('#confirmPassword-error').style.display='block'
        }
        else{
            document.querySelector('#confirmPassword-error').style.display='none'
        }
    })
}

const buttonRegister=document.querySelector('[button-register]');
if(buttonRegister){
    const formRegister=document.querySelector('#formsig')
    buttonRegister.addEventListener('click',e=>{
        let checkInfo=true;
        e.preventDefault();
        const email=formRegister.querySelector('input[name="email"]').value
        const password=formRegister.querySelector('input[name="password"]').value
        const fullname=document.querySelector('input[name="fullname"]').value
        const address=document.querySelector('input[name="address"]').value
        const phone=document.querySelector('input[name="phone"]').value
        const confirmPassword=document.querySelector('input[name="confirmPassword"]').value

        const phoneRegex = /^[0-9]{10,11}$/;

        if(!fullname){
            checkInfo=false
            document.querySelector('#name-error').style.display='block'
        }
        if(!address){
            checkInfo=false
            document.querySelector('#address-error').style.display='block'
        }
        if(!phone){
            checkInfo=false
            document.querySelector('#phone-error').style.display='block'
        }

// Phương thức .test() là một phương thức có sẵn của đối tượng RegExp
// Nó được sử dụng để kiểm tra xem một chuỗi có khớp với mẫu biểu thức chính quy (regular expression) hay không.
        if (!phoneRegex.test(phone)) {
            checkInfo=false
            document.querySelector('#phone-error-format').style.display='block'
        }

        if(!confirmPassword){
            checkInfo=false
            document.querySelector('#confirmPassword-error').style.display='block'
        }
        if(!email){
            checkInfo=false
            document.querySelector('#email-error').style.display='block'
        }
        if(!password){
            checkInfo=false
            document.querySelector('#password-error').style.display='block'
            
        }
        if(checkInfo){
            formRegister.submit()
        }

    })
}


// register 
//login 
const email=document.querySelector('input[name="email"]')
if(email){
    email.addEventListener('change',e=>{
        const emailValue=email.value
        if(!emailValue){
            document.querySelector('#email-error').style.display='block'
        }
        else{
            document.querySelector('#email-error').style.display='none'
        }
    })
}

const password=document.querySelector('input[name="password"]')
if(password){
    password.addEventListener('change',e=>{
        const passwordValue=password.value
        if(!passwordValue){
            document.querySelector('#password-error').style.display='block'
        }
        else{
            document.querySelector('#password-error').style.display='none'
        }
    })
}

const buttonLogin=document.querySelector('[button-login]');
if(buttonLogin){
    const formLogin=document.querySelector('#forml')
    buttonLogin.addEventListener('click',e=>{
        let checkInfo=true;
        e.preventDefault();
        const email=formLogin.querySelector('input[name="email"]').value
        const password=formLogin.querySelector('input[name="password"]').value
        if(!email){
            checkInfo=false
            document.querySelector('#email-error').style.display='block'
        }
        if(!password){
            checkInfo=false
            document.querySelector('#password-error').style.display='block'
            
        }
        console.log(checkInfo)
        if(checkInfo){
            formLogin.submit()
        }

    })
}
//login 

// forgot-password 
const buttonForgotPass=document.querySelector('[forgot-pass]');
if(buttonForgotPass){
    const formForgotPass=document.querySelector('#forgot-pass')
    buttonForgotPass.addEventListener('click',e=>{
        let checkInfo=true;
        e.preventDefault();
        const email=formForgotPass.querySelector('input[name="email"]').value
        if(!email){
            checkInfo=false
            document.querySelector('#email-error').style.display='block'
        }
        console.log(email)
        console.log(checkInfo)
        if(checkInfo){
            formForgotPass.submit()
        }

    })
}
// forgot-password 

// button-status
const buttonStatus=document.querySelectorAll('[button-status]')
if(buttonStatus.length>0){
    let url=new URL(window.location.href)
    buttonStatus.forEach(btn=>{
        btn.addEventListener('click',e=>{
            const status=btn.getAttribute('button-status')
            if(status){
                url.searchParams.set('status',status)
            }else{
                url.searchParams.delete('status')
            }
            window.location.href=url.href
        })
    })
}
// button-status

// delete-order
const buttonOrderDelete=document.querySelectorAll('[button-order-delete]')
if(buttonOrderDelete.length > 0){
    buttonOrderDelete.forEach(btn=>{
        btn.addEventListener('click',e=>{
            const isConfirm=confirm('Bạn có chắc muốn hủy đơn hàng')
            if(isConfirm){
                const id=btn.getAttribute('data-id')
                const action=`/user/order/delete/${id}`;
                fetch(action,{
                    method:"DELETE"
                })
                    .then(res=>res.json())
                    .then(data=>{
                        if(data.code==200){
                            notification(data.message)
                            const order=document.querySelector('.order')
                            const orderCard=document.querySelector(`[data-id="${id}"]`).closest('.order-card')
                            console.log(orderCard)
                            console.log(order)
                            order.removeChild(orderCard)
                        }
                        else{
                            notification(data.message, '#FF4C4C')
                        }
                    })
            }

        })
    })
}
// delete-order
function notification(msg, background) {
    const notification = document.getElementById('notification');
    if (background) {
        notification.style.backgroundColor = background;
    } else {
        notification.style.backgroundColor = '#229d45';
    }
    const timeout = notification.getAttribute('data-time')
    notification.classList.remove('hidden')
    notification.classList.add('show')

    notification.textContent = msg
    setTimeout(() => {
        notification.classList.remove('show')
        notification.classList.add('hidden')
    }, timeout);
}