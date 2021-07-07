
let shippingCode = {
    'seven': '7-11店到店',
    'family': '全家店到店',
    'hilife': '萊爾富店到店',
    'ok': 'OK店到店',
    'home': '宅配',
    'face': '面交'
}

//model

function getBookingById() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const productId = urlParams.get('productId')
    return fetch(`/api/cart?productId=${productId}`)
        .then((response) => response.json())
}


function onClickPrime(pd) {
    TPDirect.card.getPrime(function (result) {
        if (result.status !== 0) {
            console.log('getPrime error')
            return
        }
        const prime = result.card.prime
        console.log('getPrime success: ' + prime)
        const name = document.getElementById('send-name').value;
        const phone = document.getElementById('send-tel').value;
        const mail = document.getElementById('send-mail').value;
        const sendWay = document.getElementById('send-way').value;
        const sendLocation = document.getElementById('send-location').value;
        const message = document.getElementById('message-owner').value;
        const priceSum = document.querySelector('.sum-a').textContent;
        postOrder(prime,cUser['id'],name,phone,mail,pd['data']['productId'],pd['data']['datas'],priceSum,sendWay,sendLocation,message).then((myJson)=>{
            if(myJson['ok']){
                deleteBooking(pd['data']['productId']);
                location.href=`/details?number=${myJson['serial_number']}`
            }
        });
    })
}

function postOrder(prime,buyer, name, phone, mail, product,item,sum, ship, ship_value, message) {
    const data = {
        "prime":prime,
        "buyerId": buyer,
        "name": name,
        "phone": phone,
        "mail": mail,
        "productId": product,
        "productItem":item,
        "productTotalPrice":sum,
        "shipWay": ship,
        "shipValue": ship_value,
        "message": message
    }
    console.log(data);
    return fetch('/api/order', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body:JSON.stringify(data)
    }).then((response)=>response.json())
}

function deleteBooking(productId){
    return fetch(`/api/cart?productId=${productId}`,{
        method:'DELETE'
    }).then((response)=>response.json())
}



//view
function tappayView() {
    // Display ccv field
    let fields = {
        number: {
            // css selector
            element: '#card-number',
            placeholder: '**** **** **** ****'
        },
        expirationDate: {
            // DOM object
            element: document.getElementById('card-expiration-date'),
            placeholder: 'MM / YY'
        },
        ccv: {
            element: '#card-ccv',
            placeholder: 'ccv'
        }
    }
    TPDirect.card.setup({
        fields: fields,
        styles: {
            // Style all elements
            'input': {
                'color': 'blue',
            },
            // style valid state
            '.valid': {
                'color': 'green'
            },
            // style invalid state
            '.invalid': {
                'color': 'red'
            },
            // Media queries
            // Note that these apply to the iframe, not the root window.
            '@media screen and (max-width: 400px)': {
                'input': {
                    'color': 'orange'
                }
            }
        }
    })
}

function shippingWaysView(datas) {
    const shipView = document.getElementById('send-way');
    datas['data']['shipping'].forEach((shippingWay) => {
        const option = document.createElement('option');
        option.value = shippingWay;
        option.textContent = shippingCode[shippingWay];
        shipView.appendChild(option);
    })
}


function sidebarCartViewOrder(datas) {
    const modalBody = document.querySelector('#order-product');
    for (const [productId, bookDetails] of Object.entries(datas)) {
        let priceCount = 0;
        const booking = document.createElement('div');
        booking.className = 'order-booking';
        const productHeader = document.createElement('div');
        productHeader.className = 'product-header';
        const productImage = document.createElement('div');
        productImage.className = 'header-img';
        productImage.style.backgroundImage = `url('${bookDetails['image']}')`
        const productName = document.createElement('div');
        productName.textContent = bookDetails['name'];
        productName.addEventListener('click', () => {
            location.href = `/product/${bookDetails['productId']}`;
        })
        productName.className = 'header-name';
        bookingHeader = document.createElement('div');
        bookingHeader.className = 'booking-header';
        const headerSpec = document.createElement('div');
        headerSpec.textContent = '品項';
        const headerNumber = document.createElement('div');
        headerNumber.textContent = '數量';
        const headerSinglePrice = document.createElement('div');
        headerSinglePrice.textContent = '單價';
        const headerPrice = document.createElement('div');
        headerPrice.textContent = '總價';
        booking.appendChild(productHeader);
        productHeader.appendChild(productImage);
        productHeader.appendChild(productName);
        bookingHeader.appendChild(headerSpec);
        bookingHeader.appendChild(headerNumber);
        bookingHeader.appendChild(headerSinglePrice);
        bookingHeader.appendChild(headerPrice);
        booking.appendChild(bookingHeader);
        bookDetails['datas'].forEach(function (detail) {
            const bookingDetail = document.createElement('div');
            const bookingSpec = document.createElement('div');
            const bookingNumber = document.createElement('div');
            const bookingSinglePrice = document.createElement('div');
            const bookingPrice = document.createElement('div');
            bookingDetail.className = 'booking-detail'
            bookingSpec.className = 'spec';
            bookingNumber.className = 'number';
            bookingPrice.className = 'price';
            bookingSpec.textContent = detail['specName'];
            bookingNumber.textContent = detail['number'];
            bookingSinglePrice.textContent = detail['specPrice'];
            bookingPrice.textContent = detail['specTotalPrice'];
            priceCount += detail['specTotalPrice'];
            //
            bookingDetail.appendChild(bookingSpec);
            bookingDetail.appendChild(bookingNumber);
            bookingDetail.appendChild(bookingSinglePrice);
            bookingDetail.appendChild(bookingPrice);
            booking.appendChild(bookingDetail);
        })
        const bookingFooter = document.createElement('div');
        const priceSum = document.createElement('div');
        const dollarSign = document.createElement('a');
        const totalPrice = document.createElement('a');
        bookingFooter.className = 'booking-footer';
        priceSum.className = 'price-sum';
        totalPrice.className = 'sum-a';
        priceSum.textContent = '總金額：';
        dollarSign.textContent = '$';
        totalPrice.textContent = priceCount;
        bookingFooter.appendChild(priceSum);
        priceSum.appendChild(dollarSign);
        priceSum.appendChild(totalPrice);
        booking.appendChild(bookingFooter);
        modalBody.append(booking);
    }

}

//control
function sumbitBtn(pd) {
    document.getElementById('submit-btn').addEventListener('click', () => {
        onClickPrime(pd);
    })
}




TPDirect.setupSDK(20422, 'app_7Fi2UXMJtILHGttCgepAdkVADp0PhDv2c4XzeQvl9xFQyZlP7f0ajPyjqpUg', 'sandbox')
tappayView();


getBookingById().then((pd) => {
    console.log(pd);
    shippingWaysView(pd);
    sidebarCartViewOrder(pd);
    sumbitBtn(pd);
})