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

function getOrderByProduct() {
    product_id = window.location.pathname.split('/')[3];
    return fetch(`/api/orders?productId=${product_id}`)
        .then(response => response.json())
}

function updateStatus(productId,status){
    return fetch('/api/product',{
        method:'PATCH',
        headers:{
            'content-type': 'application/json',
        },
        body:JSON.stringify({
            'productId':productId,
            'status':status
        })
    }).then(response=>response.json())
}

function postChatRoom(user_1,user_2){
    return fetch('/api/chatroom',{
        method:'POST',
        headers: {
            'user-agent': 'Mozilla/4.0 MDN Example',
            'content-type': 'application/json'
        },
        body:JSON.stringify({
            'user_1':user_1,
            'user_2':user_2
        })
    }).then((response)=>response.json())
}

function deleteProduct(productId){
    return fetch('/api/product',{
        method:'DELETE',
        headers:{
            'content-type': 'application/json'
        },
        body:JSON.stringify({
            'productId':productId
        })
    }).then((response)=>response.json())
}

function deleteMember(orderId){
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

function renderOrderView(products) {
    const main = document.getElementById('my-group');
    const product = products['data'];
    const productView = document.createElement('div');
    productView.className = 'product-view';
    const productHeader = document.createElement('div');
    productHeader.className = 'product-header';
    const productImage = document.createElement('div');
    productImage.className = 'product-image';
    const productName = document.createElement('div');
    const productStatus = document.createElement('div');
    productStatus.className = 'product-status';
    const productCotent = document.createElement('div');
    productCotent.className = 'product-content';
    const productDate = document.createElement('div');
    const dateA = document.createElement('a');
    const productCondition = document.createElement('div');
    const conditionA = document.createElement('a');
    const conditionNow = document.createElement('div');
    const conditionNowA = document.createElement('a');
    const gap = document.createElement('div');
    const gapA = document.createElement('a');
    const productFollower = document.createElement('div');
    const followA = document.createElement('a');
    productImage.style.backgroundImage = `url('${product['productImage']}')`;
    productName.textContent = product['productName'];
    productStatus.textContent = statusCode[product['productStatus']];
    productDate.textContent = '開團日期';
    gap.textContent = '距離成團';
    dateA.textContent = new Date(product['productDate']).toISOString().slice(0, 10);
    productCondition.textContent = '成團條件'
    if (product['productCondition'] == 'price') {
        conditionA.textContent = '當價格達到$' + product['productConditionValue'];
        conditionNow.textContent = '購買總價';
        conditionNowA.textContent = '$'+product['productConditionValueNow'];
        gapA.textContent = '$'+product['conditionGap'];
    } else if (product['productCondition'] == 'number') {
        conditionA.textContent = '當數量達到' + product['productConditionValue']+'個';
        conditionNow.textContent = '購買總數';
        conditionNowA.textContent = product['productConditionValueNow']+'個';
        gapA.textContent = product['conditionGap']+'個';
    } else if (product['productCondition'] == 'time') {
        conditionA.textContent = '當時間達到' + new Date(product['productConditionValue']).toISOString().slice(0, 10);
        conditionNow.textContent = '今日日期';
        conditionNowA.textContent = new Date(product['productConditionValueNow']).toISOString().slice(0, 10);
        gapA.textContent =  product['conditionGap']+'天';
    }
    productFollower.textContent = '跟團人數';
    followA.textContent = product['productBuyerNumber'] + '人';
    productView.addEventListener('click',()=>{
        location.href=`/product/${product['productId']}`
    })
    productHeader.appendChild(productImage);
    productHeader.appendChild(productName);
    productHeader.appendChild(productStatus);
    productCotent.appendChild(productDate);
    productCotent.appendChild(productCondition);
    productCotent.appendChild(conditionNow);
    productCotent.appendChild(gap);
    productCotent.appendChild(productFollower);
    productDate.appendChild(dateA);
    productCondition.appendChild(conditionA);
    productFollower.appendChild(followA);
    conditionNow.appendChild(conditionNowA);
    gap.appendChild(gapA);
    productView.appendChild(productHeader);
    productView.appendChild(productCotent);
    main.appendChild(productView);
}

function renderStepBar(products){
    progressBar.Active(products['data']['productStatus']+1);
    document.getElementById('Next').addEventListener('click',()=>{
        progressBar.Next();
    })
    document.getElementById('Back').addEventListener('click',()=>{
        progressBar.Back();
    })
    document.getElementById('Confirm').addEventListener('click',()=>{
        let statusNow = $('#progress-bar li.active:last').attr('value');
        updateStatus(products['data']['productId'],statusNow).then((myJson)=>{
            if(myJson['ok']){
                swal({
                    buttons: false,
                    text: '進度修改成功',
                    type: 'success',
                    timer: 800,
                  });
            }
        })
    })
    document.getElementById('Delete-group').addEventListener('click',()=>{
        swal({
            title: "確定要刪除此團購嗎?",
            icon: "warning",
            buttons: true,
            dangerMode: true
          }).then(response=>{
              if(response){
                  deleteProduct(products['data']['productId']).then(myJson=>{
                      location.href='/seller';
                  })
              }
          })
    })
}

function renderBuyerView(products){
    const orders = products['data']['orders'];
    const followersView = document.querySelector('.followers');
    orders.forEach(order => {
        console.log(order);
        const buyer = document.createElement('div');
        buyer.className = 'buyer';
        const buyerHeader = document.createElement('div');
        buyerHeader.className='buyer-header';
        const buyerName = document.createElement('div');
        buyerName.className='buyer-name'
        const buyerImg = document.createElement('img');
        buyerImg.className = 'buyer-image';
        const talk = document.createElement('div');
        talk.className = 'talk';
        talk.textContent = '💬聊聊';
        talk.addEventListener('click',()=>{
            const userId = order['userId'];
            postChatRoom(cUser['id'],userId);
            location.href='/message';
        })
        const kick = document.createElement('div');
        kick.className = 'kick';
        kick.textContent = '✕';
        kick.addEventListener('click',()=>{
            swal({
                title: "確定將此團員踢除嗎?",
                icon: "warning",
                buttons: true,
                dangerMode: true
              }).then(response=>{
                  if(response){
                      deleteMember(order['orderId']).then(myJson=>{
                          if(myJson['ok']){
                              location.reload();
                          }
                      });
                  }
              })
        })
        const roughlyContent = document.createElement('div');
        roughlyContent.className = 'roughly-content';
        const serialNumber = document.createElement('div');
        const serialNumberA = document.createElement('a');
        const roughlyDate = document.createElement('div');
        const roughlyDateA = document.createElement('a');
        const roughlyPrice = document.createElement('div');
        const roughlyPriceA = document.createElement('a');
        const buyerFooter = document.createElement('div');
        buyerFooter.className='buyer-footer';
        const detail = document.createElement('a');
        buyerImg.src=order['userImage'];
        buyerName.textContent = order['userName'];
        serialNumber.textContent = '訂單編號';
        serialNumberA.textContent = order['serialNumber'];
        roughlyDate.textContent = '訂購日期';
        roughlyDateA.textContent = new Date(order['orderDate']).toISOString().slice(0, 10);
        roughlyPrice.textContent = '訂單總額';
        roughlyPriceA.textContent = order['totalPrice'];
        detail.textContent = '詳細';
        buyerHeader.append(buyerImg,buyerName,talk,kick);
        roughlyContent.append(serialNumber,roughlyDate,roughlyPrice);
        serialNumber.append(serialNumberA);
        roughlyDate.appendChild(roughlyDateA);
        roughlyPrice.appendChild(roughlyPriceA);
        buyerFooter.appendChild(detail);
        buyer.append(buyerHeader,roughlyContent,buyerFooter)
        followersView.appendChild(buyer);

        detail.addEventListener('click',()=>{
            $('#follow-content').modal('toggle');
            $('#product-detail').empty();
            document.querySelector('#order-number a').textContent = order['serialNumber'];
            document.querySelector('#order-date a').textContent = new Date(order['orderDate']).toISOString().slice(0, 10);
            document.querySelector('#order-buyer-name a').textContent = order['buyerName'];
            document.querySelector('#order-buyer-phone a').textContent = order['buyerPhone'];
            document.querySelector('#order-buyer-mail a').textContent = order['buyerMail'];
            document.querySelector('#order-buyer-ship a').textContent = order['ship'];
            document.querySelector('#order-buyer-locaiton a').textContent = order['shipTo'];
            document.querySelector('#order-buyer-message a').textContent = order['message'];
            const productDetail = document.getElementById('product-detail');
            order['items'].forEach((item)=>{
                const itemDiv = document.createElement('div');
                itemDiv.className='items';
                const itemLeft = document.createElement('div');
                itemLeft.className = 'item-left';
                const itemRight = document.createElement('div');
                itemRight.className = 'item-right';
                const itemName = document.createElement('div');
                const itemNumber = document.createElement('div');                
                itemName.textContent=item['itemName'];
                itemNumber.textContent='x'+item['itemNumber'];
                itemRight.textContent='$'+item['itemTotalPrice'];
                itemLeft.append(itemName,itemNumber);
                itemDiv.append(itemLeft,itemRight);
                productDetail.append(itemDiv);
            })
            const itemFooter = document.createElement('div');
            itemFooter.className = 'item-footer';
            const itemFooterA = document.createElement('a');
            itemFooter.textContent = '訂單總金額：'
            itemFooterA.textContent = '$'+order['totalPrice'];
            itemFooter.append(itemFooterA);
            productDetail.append(itemFooter);
        })
    });
}

//controller

getOrderByProduct().then((myJson) => {
    renderOrderView(myJson);
    renderStepBar(myJson);
    renderBuyerView(myJson);
})