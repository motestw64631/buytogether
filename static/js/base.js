//model

function getUser() {
    return fetch('/api/user')
        .then((response) => response.json())
}

function getBooking() {
    return fetch('/api/booking')
        .then((response) => response.json())
}

function deleteBooking(productId,specId){
    return fetch(`/api/booking?productId=${productId}&specId=${specId}`,{
        method:"DELETE"
    }).then((response)=>response.json())
}


//view




function loginView() {
    document.getElementById('right-header').style.width = '280px'
    let beforeLogin = Array.from(document.getElementsByClassName('before-login'));
    beforeLogin.forEach((node) => { node.style.display = 'none' });
    let afterLogin = Array.from(document.getElementsByClassName('after-login'));
    afterLogin.forEach((node) => { node.style.display = 'inline' });
}

function sidebarCartView(datas) {
    const modalBody = document.querySelector('.modal-body');
    modalBody.innerHTML='';
    for (const [productId, bookDetails] of Object.entries(datas['cart'])) {
        let priceCount = 0;
        const booking = document.createElement('div');
        booking.className = 'booking';
        const productHeader = document.createElement('div');
        productHeader.className = 'product-header';
        const productImage = document.createElement('div');
        productImage.className = 'header-img';
        productImage.style.backgroundImage = `url('${bookDetails['image']}')`
        const productName = document.createElement('div');
        productName.textContent = bookDetails['name'];
        productName.className = 'header-name';
        bookingHeader = document.createElement('div');
        bookingHeader.className = 'booking-header';
        const headerSpec = document.createElement('div');
        headerSpec.textContent = '品項';
        const headerNumber = document.createElement('div');
        headerNumber.textContent = '數量';
        const headerPrice = document.createElement('div');
        headerPrice.textContent = '價格';
        const headerManip = document.createElement('div');
        headerManip.textContent = '操作'
        booking.appendChild(productHeader);
        productHeader.appendChild(productImage);
        productHeader.appendChild(productName);
        bookingHeader.appendChild(headerSpec);
        bookingHeader.appendChild(headerNumber);
        bookingHeader.appendChild(headerPrice);
        bookingHeader.appendChild(headerManip);
        booking.appendChild(document.createElement('hr'));
        booking.appendChild(bookingHeader);
        bookDetails['datas'].forEach(function (detail) {
            const bookingDetail = document.createElement('div');
            const bookingSpec = document.createElement('div');
            const bookingNumber = document.createElement('div');
            const bookingPrice = document.createElement('div');
            const bookingDelete = document.createElement('div');
            bookingDetail.className = 'booking-detail'
            bookingSpec.className = 'spec';
            bookingNumber.className = 'number';
            bookingPrice.className = 'price';
            bookingDelete.className = 'delete';
            bookingSpec.textContent = detail['specName'];
            bookingNumber.textContent = detail['number'];
            bookingPrice.textContent = detail['specTotalPrice'];
            priceCount+=detail['specTotalPrice'];
            bookingDelete.textContent = '刪除';
            //delete
            bookingDelete.addEventListener('click',function(){
                deleteBooking(productId,detail['specId']).then((myJson)=>{
                    if(myJson['ok']){
                        getBooking().then((myJson) => {
                            sidebarCartView(myJson);
                        });
                    }
                });
            })
            //
            bookingDetail.appendChild(bookingSpec);
            bookingDetail.appendChild(bookingNumber);
            bookingDetail.appendChild(bookingPrice);
            bookingDetail.appendChild(bookingDelete);
            booking.appendChild(bookingDetail);
        })
        const bookingFooter = document.createElement('div');
        const priceSum = document.createElement('div');
        const goBuy = document.createElement('div');
        const dollarSign = document.createElement('a');
        const totalPrice = document.createElement('a');
        bookingFooter.className = 'booking-footer';
        priceSum.className = 'price-sum';
        goBuy.className = 'buy';
        totalPrice.className='sum-a';
        priceSum.textContent = '總金額：';
        dollarSign.textContent = '$';
        totalPrice.textContent=priceCount;
        goBuy.textContent = '去買單';
        bookingFooter.appendChild(priceSum);
        bookingFooter.appendChild(goBuy);
        priceSum.appendChild(dollarSign);
        priceSum.appendChild(totalPrice);
        booking.appendChild(bookingFooter);
        modalBody.append(booking);
    }

}

//controller
function init() {
    getUser().then((myJson) => {
        if (myJson['data']) {
            loginView()
        }
        document.getElementById('loader').style.display = 'none';
    })
}

function events() {

    document.getElementById('header-toggle-control').addEventListener('click', () => {
        let menu = document.getElementById('menu');
        if (menu.style.display == 'none' || menu.style.display == "") {
            menu.style.display = 'flex';
        } else {
            menu.style.display = 'none';
        }
    })
    document.getElementById('header-cart').addEventListener('click', function () {
        getBooking().then((myJson) => {
            sidebarCartView(myJson);
        });
    })
}


init()
events()