module.exports=(query)=>{
    let fillterStatus=[
        {
            name:"Tất cả",
            status:"",
            class:""
        },
        {
            name:"Chờ xác nhận",
            status:"Initit",
            class:""
        },
        {
            name:"Đã xác nhận",
            status:"Confirm",
            class:""
        },
        {
            name:"Đang giao hàng",
            status:"Shipped",
            class:""
        },
        {
            name:"Đơn hàng thành công",
            status:"Delivered",
            class:""
        }
        ,
        {
            name:"Hủy đơn hàng",
            status:"Deleted",
            class:""
        }
    ]
    
    if(query.status){
        const element=fillterStatus.find(item=>{
            return item.status==query.status
        })
        element.class='active'
    }
    else{
        const element=fillterStatus.find(item=>{
            return item.status==""
        })
        element.class='active'
    }
    return fillterStatus
}