document.addEventListener('DOMContentLoaded', e => {
    const menuItems = document.querySelectorAll('.sidebar-item')
    const sections = document.querySelectorAll('.content-section')
    menuItems.forEach(item => {
        item.addEventListener('click', e => {
            if(item.getAttribute('data-target')!=='exist'){
                e.preventDefault()
            }
            menuItems.forEach(item => item.classList.remove('active'))
            item.classList.add('active')
            sections.forEach(item => item.style.display = 'none')
            const targetId = item.getAttribute('data-target')
            document.getElementById(targetId).style.display = 'block'
        })
    })
})


// updateinfo
const signupForm = document.querySelector('#signupForm')
if (signupForm) {
    signupForm.addEventListener('submit', e => {
        e.preventDefault();
        const password = e.target.elements.password.value
        const confirmPassword = e.target.elements.confirmPassword.value
        const data = {
            password: password,
            confirmPassword: confirmPassword
        }
        fetch('/user/password/reset', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(data => {
                console.log(data)

                if (data.code == 400) {
                    notification(data.message, '#FF4C4C')
                } else if (data.code == 200) {
                    notification(data.message)
                }
            })
    })
}
// change pass 
// updateinfo
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
const  uploadImageInput=document.querySelector('[upload-image-input]')
const uploadImagePreview=document.querySelector('[upload-image-preview]')
uploadImageInput.addEventListener('change',e=>{
    const file=e.target.files[0];
    if(file){
        uploadImagePreview.src=URL.createObjectURL(file)
        document.querySelector('#file-name').textContent=file.name
    }
})
const profileForm = document.querySelector('.profileForm')
if (profileForm) {
    profileForm.addEventListener('submit', e => {
        let checkInfo=true;
        e.preventDefault();
        const fullname = e.target.elements.fullname.value;
        const phone = e.target.elements.phone.value;
        const email = e.target.elements.email.value;
        const address = e.target.elements.address.value;
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
        if(!email){
            checkInfo=false
            document.querySelector('#email-error').style.display='block'
        }
        if(checkInfo){
            profileForm.submit()
        }
        // const formData = new FormData();
        // const fileInput = e.target.avatar.files[0]; 
        // if (fileInput) {
        //     formData.append("avatar", fileInput); // Đảm bảo "avatar" trùng với field name trên backend
        // }
        // console.log(e.target.avatar.files[0])
        // const data={
        //     fullname:e.target.elements.fullname.value,
        //     file:e.target.avatar.files[0],
        //     phone:e.target.elements.phone.value,
        //     email:e.target.elements.email.value,
        //     address:e.target.elements.address.value,
        // }
        // formData.append("fullname", e.target.elements.fullname.value);
        // formData.append("email", e.target.elements.email.value);
        // formData.append("phone", e.target.elements.phone.value);
        // formData.append("address", e.target.elements.address.value);
        // fetch('/user/update-profile',{
        //     method:"PATCH",
        //     // headers:{
        //     //     'Content-Type':'application/json',
        //     // },
        //     body:formData
        // })
        //     .then(res=>res.json())
        //     .then(data=>{
        //         console.log(data)

        //     })
    })
}
// change pass
function notification(msg, background) {
    console.log(background)
    console.log(msg)

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



