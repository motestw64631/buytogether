function alertForFill(message) {
        const fillAlert = document.getElementById('message');
        fillAlert.textContent = message;
}
//view
function loginView() {
    //document.getElementById('right-header').style.width = '280px'
    if(cUser['admin']){
        document.getElementById('right-header').style.width = '340px';
    }else{
        document.getElementById('right-header').style.width = '280px'
    }
    let beforeLogin = Array.from(document.getElementsByClassName('before-login'));
    beforeLogin.forEach((node) => { node.style.display = 'none' });
    let afterLogin = Array.from(document.getElementsByClassName('after-login'));
    afterLogin.forEach((node) => { node.style.display = 'inline' });
}

function clearFileInput(num) {
    let preview = document.querySelectorAll('#up-dv img')[num];
    let file = document.querySelectorAll('#up-dv input[type=file]')[num];
    file.value = ''
    preview.src = '/static/img/upload.png'
    document.querySelectorAll('#up-dv .close')[num].style.display = 'none';
}


//model
function getUser() {
    return fetch('/api/user')
        .then((response) => response.json())
}

function postPurchase() {
    let origin = document.getElementById('origin').value.trim();
    if(origin==''){
        alertForFill('請輸入來源網址');
        return
    }
    let name = document.getElementById('name').value.trim();
    if(name==''){
        alertForFill('請輸入團購商品名稱');
        return
    }
    let describe = document.getElementById('describe').value.trim();
    if(describe==''){
        alertForFill('請輸入敘述');
        return
    }
    let images = document.querySelectorAll('input[type=file]')[0];
    let images1 = document.querySelectorAll('input[type=file]')[1];
    let images2 = document.querySelectorAll('input[type=file]')[2];
    images = images.files[0];
    images1 = images1.files[0];
    images2 = images2.files[0];
    if(images==undefined &&images1==undefined &&images2==undefined){
        alertForFill('請至少上傳一張圖片');
        return
    }
    let cls = document.getElementById("cls").value;
    if(cls==''){
        alertForFill('請選擇類別');
        return
    }
    let specs = document.querySelectorAll('#spec-edit tr:not(:first-child)')
    let shippingList = []
    let checkedValue = document.querySelectorAll('.shipping:checked');
    if(checkedValue.length==0){
        alertForFill('請選擇運送方式');
        return
    }
    checkedValue.forEach(function (n) {
        shippingList.push(n.value);
    })
    let condition = document.querySelector('input[name="condition"]:checked');
    if(condition==null){
        alertForFill('請選擇成團條件');
        return
    }
    condition = condition.value;
    let conditionValue;
    if (condition == 'time') {
        conditionValue = document.getElementById('conditionTime').value;
    } else if (condition == 'number') {
        conditionValue = document.getElementById('conditionNum').value.trim();
    } else if (condition == 'price') {
        conditionValue = document.getElementById('conditionPrice').value.trim();
    }
    console.log(conditionValue);
    if(conditionValue==''){
        alertForFill('請輸入成團條件');
        return
    }
    let specJson = [];
    specs.forEach(function (node) {
        frag = {};
        frag['name'] = node.childNodes[0].textContent;
        frag['price'] = node.childNodes[1].textContent;
        frag['number'] = node.childNodes[2].textContent;
        specJson.push(frag);
    })
    
    let data = new FormData()
    data.append('file', images);
    data.append('file', images1);
    data.append('file', images2);
    data.append('origin', origin)
    data.append('name', name);
    data.append('describe', describe);
    data.append('cls', cls);
    data.append('spec', JSON.stringify(specJson));
    data.append('shipping', shippingList);
    data.append('condition', condition);
    data.append('conditionValue', conditionValue);
    for (var value of data.values()) {
        console.log(value);
    }
    return fetch('/api/product', {
        method: 'POST',
        body: data
    }).then((response) => response.json())
}


//controller
function init() {
    getUser().then((myJson) => {
        if (myJson['data']) {
            loginView()
        } else {
            location.href = '/'
        }
    })
}



function previewFile(num) {
    var preview = document.querySelectorAll('#up-dv img')[num];
    var file = document.querySelectorAll('#up-dv input[type=file]')[num].files[0];
    var reader = new FileReader();

    reader.addEventListener("load", function () {
        preview.src = reader.result;
    }, false);

    if (file) {
        reader.readAsDataURL(file);
        document.querySelectorAll('#up-dv .close')[num].style.display = 'inline';
        document.querySelectorAll('#up-dv .close')[num].addEventListener('click', function (e) {
            clearFileInput(num);
            e.preventDefault()
        })
    }
}


init()


document.getElementById('img_post').addEventListener('change', function () {
    previewFile(0);
})
document.getElementById('img_post_1').addEventListener('change', function () {
    previewFile(1);
})
document.getElementById('img_post_2').addEventListener('change', function () {
    previewFile(2);
})

document.getElementById('add-spec').addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    // let shell=document.createElement('div');
    // let spec=document.createElement('input');
    // spec.className='spc';
    // let btn = document.createElement('span');
    // spec.placeholder='例如:顏色/白色,口味/辣味';
    // btn.className='remove';
    // btn.textContent='✕';
    // shell.appendChild(spec);
    // shell.appendChild(btn);
    // document.getElementById('tag').appendChild(shell);
    // btn.addEventListener('click',function(){
    //     document.getElementById('tag').removeChild(shell);
    // })
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
document.getElementById('condition-number').addEventListener('click', () => {
    let cdt = document.getElementById('set-condition');
    if (cdt.hasChildNodes) {
        cdt.removeChild(cdt.firstChild)
        cdt.textContent = ''
    }
    let text = document.createTextNode('跟團者購買物品總數到達指定數量後通知開團主');
    let number = document.createElement('input');
    number.id = 'conditionNum';
    number.placeholder = '數量,例如:20';
    number.type = 'text';
    cdt.appendChild(number);
    cdt.appendChild(text);
})

document.getElementById('condition-time').addEventListener('click', () => {
    let cdt = document.getElementById('set-condition');
    if (cdt.hasChildNodes) {
        cdt.removeChild(cdt.firstChild);
        cdt.textContent = ''
    }
    let text = document.createTextNode('時間到達指定時間後通知團主');
    let date = document.createElement('input');
    date.id = 'conditionTime'
    date.type = 'date';
    cdt.appendChild(date);
    cdt.appendChild(text);
})

document.getElementById('condition-price').addEventListener('click', () => {
    let cdt = document.getElementById('set-condition');
    if (cdt.hasChildNodes) {
        cdt.removeChild(cdt.firstChild);
        cdt.textContent = ''
    }
    let text = document.createTextNode('價格到達指定價格後通知團主');
    let pc = document.createElement('input');
    pc.placeholder = '價格,例如:5000';
    pc.id = 'conditionPrice'
    pc.type = 'text';
    cdt.appendChild(pc);
    cdt.appendChild(text);
})


document.getElementById('form-submit').addEventListener('click', () => {
    postPurchase().then((myJson) => {
        if (myJson['ok']) {
            document.getElementsByClassName('lds-dual-ring')[0].style.display = 'none';
            clearFileInput(0)
            clearFileInput(1)
            clearFileInput(2)
            document.getElementById("base-info").reset();
            document.getElementById('message').textContent = '開團成功';
        } else {
            document.getElementById('message').textContent = '開團失敗';
        }
    });
    document.getElementsByClassName('lds-dual-ring')[0].style.display = 'inline-block';
})
