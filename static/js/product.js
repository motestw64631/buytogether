let product;
let currentUser;
let shipCode = {
    "seven": "7-11",
    "family": "全家",
    "hilife": "萊爾富",
    "ok": "ok便利商店",
    "face": "面交",
    "home": "宅配"
}
//utils
function notNumberCheck(div){
    div.addEventListener('keypress',function(e){
        if (isNaN(String.fromCharCode(e.which))) e.preventDefault()
    })
}



//model
function getUser() {
    return fetch('/api/user')
        .then((response) => response.json())
}

function initData() {
    product_id = window.location.pathname.split('/')[2]
    return fetch('/api/product/' + product_id)
        .then(response => response.json())
        .then(myJson => {
            product = myJson
        })
}

function postBooking(norm) {
    if (norm==true) {
        productId = product['data']['productId'];
        if(document.querySelector('input[name=sp]:checked')==null){
            swal({
                title: '請至少選取一樣選項',
                icon: 'warning',
                buttons: false,
                className: "swal"
            });
            return
        }
        spec = document.querySelector('input[name=sp]:checked').value;
        buyNumber = document.querySelector('.nice-number input').value;
        let data = new FormData();
        data.append('productId', product_id);
        data.append('specId', spec);
        data.append('bookingNumber', buyNumber);
        data.append('normalize', 1);
        return fetch('/api/cart', {
            method: 'POST',
            body: data
        }).then(response => response.json())
    } else {
        productId = product['data']['productId'];
        let specList = [];
        document.querySelectorAll('#spec-edit tbody>tr').forEach(function (node) {
            let tds = node.childNodes;
            let spec = {};
            tds.forEach(function (td) {
                if (td.className == 'notNormSpec') {
                    spec['spec'] = td.textContent;
                } else if (td.className == 'notNormPrice') {
                    spec['price'] = td.textContent;
                } else if (td.className == 'notNormNumber') {
                    spec['number'] = td.textContent;
                }
            })
            specList.push(spec);
        })
        let data = new FormData();
        data.append('productId', product_id);
        data.append('data',JSON.stringify(specList));
        data.append('normalize', 0);
        return fetch('/api/cart', {
            method: 'POST',
            body:data
        }).then(response => response.json())
    }
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


//view

function popupView() {
    $('#primary-slider img').each(function () {
        var currentImage = $(this);
        currentImage.wrap("<a class='image-link' href='" + currentImage.attr("src") + "'</a>");
    });
    $('.image-link').magnificPopup({ type: 'image' });
};

function loginView() {
    document.getElementById('right-header').style.width = '280px'
    let beforeLogin = Array.from(document.getElementsByClassName('before-login'));
    beforeLogin.forEach((node) => { node.style.display = 'none' });
    let afterLogin = Array.from(document.getElementsByClassName('after-login'));
    afterLogin.forEach((node) => { node.style.display = 'inline' });
}

function sliderView() {
    var secondarySlider = new Splide('#secondary-slider', {
        fixedWidth: 100,
        height: 60,
        gap: 10,
        rewind: true,
        cover: true,
        pagination: false,
        isNavigation: true,
        focus: 'center',
        breakpoints: {
            '600': {
                fixedWidth: 66,
                height: 40,
            }
        }
    }).mount();

    var primarySlider = new Splide('#primary-slider', {
        type: 'fade',
        heightRatio: 0.5,
        pagination: false,
        arrows: false,
        height: '20rem',
    }); // do not call mount() here.

    primarySlider.sync(secondarySlider).mount();
};

function initView() {
    console.log(product);
    const primayImg = document.querySelector('#primary-slider .splide__track .splide__list');
    const secondaryImg = document.querySelector('#secondary-slider .splide__track .splide__list');
    product['data']['productImage'].forEach(function (img) {
        const imgLi = document.createElement('li');
        imgLi.classList = 'splide__slide';
        const imgP = document.createElement('img');
        imgP.src = img;
        imgLi.appendChild(imgP);
        primayImg.appendChild(imgLi);
        secondaryImg.appendChild(imgLi.cloneNode(true));
    })
    document.getElementById('product-title').textContent = product['data']['productName'];
    const a = document.querySelector('#product-src a');
    console.log(product['data']['productSource']);
    a.setAttribute('href', product['data']['productSource']);
    document.getElementById('owner-image').src = product['owner']['productOwnerImage'];
    document.getElementById('to-message-menu').addEventListener('click',function(){
        loginCheck();
        console.log(currentUser.id);
        console.log(product.owner.productOwnerID);
        postChatRoom(currentUser.id,product.owner.productOwnerID);
        location.href='/message';
    })
    document.getElementById('owner-name').textContent = product['owner']['productOwnerName'];
    document.getElementById('date').textContent = new Date(product['data']['productPostDate']).toISOString().slice(0, 10);
    const conditionView = document.querySelector('#condition a');
    if (product['data']['productCondition']['condition'] == 'number') {
        conditionView.textContent = '當購買總數量到達' + product['data']['productCondition']['conditionNumber'];
    } else if (product['data']['productCondition']['condition'] == 'price') {
        conditionView.textContent = '當購買總價格到達' + product['data']['productCondition']['conditionPrice'];
    } else if (product['data']['productCondition']['condition'] == 'time') {
        conditionView.textContent = '當日期到達' + new Date(product['data']['productCondition']['conditionDate']).toISOString().slice(0, 10);
    }
    let shipList = product['data']['productShip'].map(function (sp) {
        return shipCode[sp];
    });
    document.querySelector('#shipping a').textContent = shipList.join(',');
    //document.querySelector('#condition a').textContent
    const specDiv = document.getElementById('spec');
    console.log(product['data']['productSpec'].length);
    if (product['data']['productSpec'].length == 0) {
        document.querySelector('.quantity').style.display = 'none';
        addSpecBtn = document.createElement('div');
        addSpecBtn.classList = 'addBtn';
        addSpecBtn.textContent = '增加選項';
        //add spec edit div
        const specEdit = document.createElement('table');
        specEdit.id = 'spec-edit';
        const tr = document.createElement('tr');
        const specTh = document.createElement('th');
        specTh.textContent = '選項';
        const priceTh = document.createElement('th');
        priceTh.textContent = '單價';
        const numberTh = document.createElement('th');
        numberTh.textContent = '數量';
        const tbd = document.createElement('tbody');
        specEdit.appendChild(tr);
        tr.appendChild(specTh);
        tr.appendChild(priceTh);
        tr.appendChild(numberTh);
        specEdit.appendChild(tbd);
        document.getElementById('product-detail').insertBefore(specEdit, document.getElementById('cart'));
        //
        addSpecBtn.addEventListener('click', function () {
            let tb = document.querySelector('#spec-edit > tbody');
            let tr = document.createElement('tr');
            let name = document.createElement('td');
            name.contentEditable = true;
            name.className = 'notNormSpec';
            let price = document.createElement('td');
            price.contentEditable = true;
            price.className = 'notNormPrice';
            notNumberCheck(price);
            let number = document.createElement('td');
            number.contentEditable = true;
            number.className = 'notNormNumber';
            notNumberCheck(number);
            let btn = document.createElement('span');
            btn.className = 'remove';
            btn.textContent = '✕';
            btn.addEventListener('click', function () {
                tb.removeChild(tr);
            })
            tr.appendChild(name);
            tr.appendChild(price);
            tr.appendChild(number);
            tr.appendChild(btn);
            tb.appendChild(tr);
        })
        specDiv.appendChild(addSpecBtn);
        document.getElementById('cart').addEventListener('click', function () {
            loginCheck();
            postBooking(false).then((myJson) => {
                if (myJson['ok']) {
                    swal({
                        title: '成功加入購物車',
                        icon: 'success',
                        buttons: false,
                        className: "swal"
                    });
                };
            });
        })
    } else {
        product['data']['productSpec'].forEach(function (spec) {
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.id = `radio-${spec['spec_name']}`;
            radio.name = 'sp';
            radio.value = spec['specId'];
            radio.addEventListener('click',function(){
                document.querySelector('#show-price').style.setProperty("display", "flex", "important")
                document.querySelector('#show-price a').textContent=spec['specPrice'];
            })
            const lb = document.createElement('label');
            lb.textContent = spec['spec_name'];
            lb.setAttribute("for", `radio-${spec['spec_name']}`);
            specDiv.appendChild(radio);
            specDiv.appendChild(lb);
        })
        //post when spec
        document.getElementById('cart').addEventListener('click', function () {
            loginCheck();
            postBooking(true).then((myJson) => {
                if (myJson['ok']) {
                    swal({
                        title: '成功加入購物車',
                        icon: 'success',
                        buttons: false,
                        className: "swal"
                    });
                };
            });
        })
    }
    let ct = product['data']['productDescribe'].replace(/\n/g, "\r\n");
    document.getElementById('desc-content').textContent = ct;
}

//controller

initData().then(function () {
    initView();
    getUser().then((myJson) => {
        if (myJson['data']) {
            currentUser=myJson['data'];
            loginView();
            if(cUser['admin']){
                document.querySelectorAll('.admin').forEach(element=>{
                    element.style.display='flex';
                    document.getElementById('right-header').style.width = '340px';
                })
            }
        }
        document.getElementById('loader').style.display = 'none';
    })
    popupView();
    sliderView();
});

$(function () {

    $('input[type="number"]').niceNumber({
        autoSize: false,
    });

});

