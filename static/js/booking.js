let statusCode = {
    0:'開團中',
    1:'已成團',
    2:'主購已下單',
    3:'店家已出貨',
    4:'主購已取貨',
    5:'商品已寄出',
    6:'團購結束'
}

const progressBar = {
    Bar: $('#progress-bar'),
    Reset: function () {
        if (this.Bar) {
            this.Bar.find('li').removeClass('active');
        }
    },
    Next: function () {
        $('#progress-bar li:not(.active):first').addClass('active');
    },
    Back: function () {
        $('#progress-bar li.active:last').removeClass('active');
    },
    Active: function (num) {
        for (i = 1; i <= num; i++) {
            $(`#progress-bar li:nth-child(${i})`).addClass('active');
        }
    }
}


//model
function getOrders() {
    return fetch(`/api/orders`)
        .then(response => response.json())
}

function getOrder(id) {
    return fetch(`/api/order/${id}`)
        .then(response => response.json())
}

function deleteOrder(orderId){
    return fetch('/api/order',{
        method:'DELETE',
        headers:{
            'content-type': 'application/json'
        },
        body:JSON.stringify({
            'orderId':orderId
        })
    }).then((response)=>response.json())
}



//view
function renderOrderView(data) {
    const follow = document.getElementById('group-follow');
    data['data'].forEach(order => {
        const orderFollow = document.createElement('div');
        orderFollow.className = 'order-follow';
        const orderHeader = document.createElement('div');
        orderHeader.className = 'order-header';
        const productImage = document.createElement('div');
        productImage.className = 'order-image';
        const productName = document.createElement('div');
        productName.className = 'order-name';
        const prodcutStatus = document.createElement('div');
        prodcutStatus.className = 'product-status';
        productName.textContent = order['productName'];
        productImage.style.backgroundImage = `url('${order['productImage']}')`;
        prodcutStatus.textContent = statusCode[order['productStatus']];
        orderHeader.appendChild(productImage);
        orderHeader.appendChild(productName);
        orderHeader.appendChild(prodcutStatus);
        orderFollow.appendChild(orderHeader);
        order['item'].forEach((item) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item-div';
            const itemLeft = document.createElement('div');
            itemLeft.className = 'item-left';
            const itemRight = document.createElement('div');
            itemRight.className = 'item-right';
            const itemName = document.createElement('div');
            itemName.className = 'item-name';
            const itemNumber = document.createElement('div');
            itemNumber.className = 'item-number';
            itemName.textContent = item['itemName'];
            itemNumber.textContent = `x${item['itemNumber']}`;
            itemRight.textContent = `$${item['itemTotalPrice']}`;
            itemDiv.appendChild(itemLeft);
            itemDiv.appendChild(itemRight);
            itemLeft.appendChild(itemName);
            itemLeft.appendChild(itemNumber);
            orderFollow.appendChild(itemDiv);
        });
        const orderFooter = document.createElement('div');
        const orderPrice = document.createElement('a')
        orderFooter.className = 'order-footer';
        orderFooter.textContent = `訂單金額：`
        orderPrice.textContent = `$${order['orderPrice']}`
        orderFooter.appendChild(orderPrice);
        orderFollow.appendChild(orderFooter);
        follow.appendChild(orderFollow);
        orderFollow.addEventListener('click', function (e) {
            $('#follow-content').modal('toggle');
            $('#product-detail').empty();
            progressBar.Reset();
            progressBar.Active(order['orderStatus']+1);
            document.querySelector('#order-number a').textContent = order['serialNumber'];
            document.querySelector('#order-date a').textContent = new Date(order['orderDate']).toISOString().slice(0, 10);
            document.querySelector('#order-buyer-name a').textContent = order['buyerName'];
            document.querySelector('#order-buyer-phone a').textContent = order['buyerPhone'];
            document.querySelector('#order-buyer-mail a').textContent = order['buyerMail'];
            document.querySelector('#order-buyer-ship a').textContent = order['ship'];
            document.querySelector('#order-buyer-locaiton a').textContent = order['shipTo'];
            document.querySelector('#order-buyer-message a').textContent = order['message'];
            //duplicate to be modified
            const pdDetail = document.getElementById('product-detail');
            const innerDetail = orderFollow.cloneNode(true);
            innerDetail.addEventListener('click',function(){
                location.href=`/product/${order['productId']}`;
            })
            pdDetail.appendChild(innerDetail);
            //
        })
        document.getElementById('quit').addEventListener('click',()=>{
            swal({
                title: "確定退出團購嗎?",
                icon: "warning",
                buttons: true,
                dangerMode: true
              }).then(response=>{
                  if(response){
                    deleteOrder(order['orderId']).then(myJson=>{
                          if(myJson['ok']){
                              location.reload();
                          }
                      });
                  }
              })
        })
    });

}


getOrders().then((myJson) => {
    renderOrderView(myJson);
})
