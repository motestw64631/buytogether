let product;
let shipCode = {
    "seven": "7-11",
    "family": "全家",
    "hilife": "萊爾富",
    "ok": "ok便利商店",
    "face": "面交",
    "home": "宅配"
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

function postBooking(){
    productId = product['data']['productId'];
    spec = document.querySelector('input[name=sp]:checked').value;
    buyNumber = document.querySelector('.nice-number input').value;
    let data = new FormData();
    data.append('productId',product_id);
    data.append('specId',spec);
    data.append('bookingNumber',buyNumber);
    data.append('normalize',true);
    return fetch('/api/booking',{
        method:'POST',
        body:data
    }).then(response=>response.json())
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
        specEdit.id='spec-edit';
        const tr=document.createElement('tr');
        const specTh=document.createElement('th');
        specTh.textContent='選項';
        const numberTh=document.createElement('th');
        numberTh.textContent='數量';
        const priceTh=document.createElement('th');
        priceTh.textContent='總價格';
        const tbd = document.createElement('tbody');
        specEdit.appendChild(tr);
        tr.appendChild(specTh);
        tr.appendChild(numberTh);
        tr.appendChild(priceTh);
        specEdit.appendChild(tbd);
        document.getElementById('product-detail').insertBefore(specEdit,document.getElementById('cart'));
        //
        addSpecBtn.addEventListener('click', function () {
            let tb = document.querySelector('#spec-edit > tbody');
            let tr = document.createElement('tr');
            let name = document.createElement('td');
            name.contentEditable = true;
            let price = document.createElement('td');
            price.contentEditable = true;
            let number = document.createElement('td');
            number.contentEditable = true;
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
        //post when not spec
    } else {
        product['data']['productSpec'].forEach(function (spec) {
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.id = `radio-${spec['spec_name']}`;
            radio.name = 'sp';
            radio.value=spec['specId'];
            const lb = document.createElement('label');
            lb.textContent = spec['spec_name'];
            lb.setAttribute("for", `radio-${spec['spec_name']}`);
            specDiv.appendChild(radio);
            specDiv.appendChild(lb);
        })
    }
    let ct = product['data']['productDescribe'].replace(/\n/g, "\r\n");
    document.getElementById('desc-content').textContent = ct;
    document.getElementById('cart').addEventListener('click',function(){
        postBooking().then((myJson)=>{
            if(myJson['ok']){
                swal({
                    title:'成功加入購物車',
                    icon:'success',
                    buttons:false,
                    className: "swal"
                });
            };
        });
    })
}

//controller

initData().then(function () {
    initView();
    getUser().then((myJson) => {
        if (myJson['data']) {
            loginView();
        }
    })
    popupView();
    sliderView();
});

$(function () {

    $('input[type="number"]').niceNumber({
        autoSize: false,
    });

});
