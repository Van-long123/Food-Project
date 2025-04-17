//delete-item
const buttonDelete = document.querySelectorAll('[button-delete]')
if (buttonDelete.length > 0) {
    const formDeleteItem = document.querySelector('#form-delete-item')
    const path = formDeleteItem.getAttribute('data-path')
    buttonDelete.forEach(btn => {
        btn.addEventListener('click', e => {
            const isConfirm = confirm('Bạn có chắc muốn xóa sản phẩm này')
            if (isConfirm) {
                const id = btn.getAttribute('data-id')
                const action = path + `/${id}?_method=DELETE`
                formDeleteItem.action = action
                formDeleteItem.submit()
            }

        })
    })
}
//delete-item

// permission 
const select_all = document.querySelector('[data-name="select_all"]')

if (select_all) {
    const inputs = select_all.querySelectorAll('input')
    const tablePermissions = document.querySelector('[table-permissions]')
    inputs.forEach((input, index) => {

        input.addEventListener('change', e => {
            const isChecked = e.target.checked;
            console.log(isChecked)
            const rows = tablePermissions.querySelectorAll('[data-name]')
            rows.forEach(row => {
                const name = row.getAttribute('data-name')
                const inputs = row.querySelectorAll('input')
                if (name != 'id' && name != 'select_all') {
                    inputs[index].checked = isChecked
                    console.log(index)
                }
            })
        })
    })
}
// tạo 1 form để submit gửi dữ liệu sang backend 
const tablePermissions = document.querySelector('[table-permissions]');
if (tablePermissions) {
    const buttonSubmit = document.querySelector('[button-submit]');
    buttonSubmit.addEventListener('click', e => {
        let permissions = [];
        const rows = document.querySelectorAll('[data-name]')
        rows.forEach(row => {
            const name = row.getAttribute('data-name')
            const inputs = row.querySelectorAll('input')
            if (name == 'id') {
                inputs.forEach(input => {
                    const id = input.value;
                    permissions.push({
                        id: id,
                        permissions: []
                    })
                })
            } else {
                inputs.forEach((input, index) => {
                    const checked = input.checked
                    if (checked) {
                        permissions[index].permissions.push(name)
                    }
                })
            }
        })
        if (permissions.length > 0) {
            const formChangePermissions = document.querySelector('#form-change-permissions')
            if (formChangePermissions) {
                const inputPermission = formChangePermissions.querySelector('input[name="permissions"')
                inputPermission.value = JSON.stringify(permissions)
                formChangePermissions.submit()
            }
        }
    })
}
//end permission 


// permission default 
const dataRecords = document.querySelector('[data-records]')
if (dataRecords) {
    const records = JSON.parse(dataRecords.getAttribute('data-records'))
    const tablePermissions = document.querySelector('[table-permissions]')
    records.forEach((record, index) => {
        const permissions = record.permissions
        permissions.forEach((item) => {
            const row = tablePermissions.querySelector(`[data-name="${item}"]`)
            const input = row.querySelectorAll('input')
            input[index].checked = true
        })
    })
}

//end permission default 