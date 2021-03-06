let cUser;

function loginCheck(){
    if(cUser==undefined){
        location.href='/sign_in';
        return
    }
}


//model

function getUser() {
    return fetch('/api/user')
        .then((response) => response.json())
}

function getBooking() {
    return fetch('/api/cart')
        .then((response) => response.json())
}

function deleteBooking(productId,specName){
    return fetch(`/api/cart?productId=${productId}&specName=${specName}`,{
        method:"DELETE"
    }).then((response)=>response.json())
}

function getNotify(){
    return fetch('/api/notify')
        .then(response=>response.json())
}

function notifyInterval(){
    getNotify().then((myJson)=>{
        notifyView(myJson);
        if(myJson['newMessage']){
            document.getElementById('bell').addEventListener('click',function(){
                this.src='/static/img/bell.png';
                readNotify();
            })
        }else{
            document.getElementById('bell').removeEventListener('click',function(){
                this.src='/static/img/bell.png';
                readNotify();
            })
        }
        
    })
}

function readNotify(){
    return fetch('/user/new_message')
        .then(response=>response.json())
}

//view




function loginView() {
    document.getElementById('right-header').style.width = '280px';
    //document.getElementById('my-avatar').src=cUser['image'];
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
        productName.addEventListener('click',()=>{
            location.href=`/product/${bookDetails['productId']}`;
        })
        productName.className = 'header-name';
        bookingHeader = document.createElement('div');
        bookingHeader.className = 'booking-header';
        const headerSpec = document.createElement('div');
        headerSpec.textContent = '??????';
        const headerNumber = document.createElement('div');
        headerNumber.textContent = '??????';
        const headerPrice = document.createElement('div');
        headerPrice.textContent = '??????';
        const headerSinglePrice = document.createElement('div');
        headerSinglePrice.textContent = '??????';
        const headerManip = document.createElement('div');
        headerManip.textContent = '??????'
        booking.appendChild(productHeader);
        productHeader.appendChild(productImage);
        productHeader.appendChild(productName);
        bookingHeader.appendChild(headerSpec);
        bookingHeader.appendChild(headerNumber);
        bookingHeader.appendChild(headerSinglePrice);
        bookingHeader.appendChild(headerPrice);
        bookingHeader.appendChild(headerManip);
        booking.appendChild(document.createElement('hr'));
        booking.appendChild(bookingHeader);
        bookDetails['datas'].forEach(function (detail) {
            const bookingDetail = document.createElement('div');
            const bookingSpec = document.createElement('div');
            const bookingNumber = document.createElement('div');
            const bookingSinglePrice = document.createElement('div');
            const bookingPrice = document.createElement('div');
            const bookingDelete = document.createElement('div');
            bookingDetail.className = 'booking-detail'
            bookingSpec.className = 'spec';
            bookingNumber.className = 'number';
            bookingPrice.className = 'price';
            bookingDelete.className = 'delete';
            bookingSpec.textContent = detail['specName'];
            bookingNumber.textContent = detail['number'];
            bookingSinglePrice.textContent =detail['specPrice'];
            bookingPrice.textContent = detail['specTotalPrice'];
            priceCount+=detail['specTotalPrice'];
            bookingDelete.textContent = '??????';
            //delete
            bookingDelete.addEventListener('click',function(){
                deleteBooking(productId,detail['specName']).then((myJson)=>{
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
            bookingDetail.appendChild(bookingSinglePrice);
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
        priceSum.textContent = '????????????';
        dollarSign.textContent = '$';
        totalPrice.textContent=priceCount;
        goBuy.textContent = '?????????';
        //to order
        goBuy.addEventListener('click',function(){
            location.href = (`/checkout?productId=${bookDetails['productId']}`);
        })
        //
        bookingFooter.appendChild(priceSum);
        bookingFooter.appendChild(goBuy);
        priceSum.appendChild(dollarSign);
        priceSum.appendChild(totalPrice);
        booking.appendChild(bookingFooter);
        modalBody.append(booking);
    }

}
function notifyView(data){
    $('.dropdown-menu').empty();
    const notifyMenu = document.querySelector('.dropdown-menu');
    if(data['newMessage']){
        document.getElementById('bell').src='/static/img/bell_ring.png'
    }
    if(data['data'].length==0){
        const row = document.createElement('li');
        row.setAttribute('role','presentation');
        const anchor = document.createElement('a');
        anchor.setAttribute('role','menuitem');
        anchor.setAttribute('tabindex','-1');
        anchor.setAttribute('href','#');
        anchor.textContent = '?????????????????????';
        row.append(anchor);
        notifyMenu.append(row);
        return
    }
    data['data'].forEach(notify=>{
        const row = document.createElement('li');
        row.setAttribute('role','presentation');
        const anchor = document.createElement('a');
        anchor.setAttribute('role','menuitem');
        anchor.setAttribute('tabindex','-1');
        anchor.setAttribute('href','#');
        anchor.textContent = notify['content'];
        row.append(anchor);
        notifyMenu.append(row);
    })
}


//controller
function init() {
    getUser().then((myJson) => {
        if (myJson['data']) {
            cUser=myJson['data'];
            loginView();
            document.getElementById('loader').style.display = 'none';
            notifyInterval();
            setInterval(notifyInterval, 30000);
            if(cUser['admin']){
                document.querySelectorAll('.admin').forEach(element=>{
                    element.style.display='flex';
                    document.getElementById('right-header').style.width = '340px';
                })
            }
        }
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
    document.getElementById('search-item').addEventListener('keypress',function(e){
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('search-icon').click();
        }
    })

    document.getElementById('search-icon').addEventListener('click',function(){
        const key = document.getElementById('search-item').value;
        location.href=`/?keyword=${key}`;
    })
    document.getElementById('post-product').addEventListener('click',(e)=>{
        if(!cUser['confirm']){
            e.preventDefault();
            b = swal({
                title: "??????????????????",
                icon: "warning",
                dangerMode: true
            })
        }
    })

}




init()
events()



