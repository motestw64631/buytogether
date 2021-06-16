//view
function loginView(){
    document.getElementById('right-header').style.width='200px'
    let beforeLogin = Array.from(document.getElementsByClassName('before-login'));
    beforeLogin.forEach((node)=>{node.style.display='none'});
    let afterLogin = Array.from(document.getElementsByClassName('after-login'));
    afterLogin.forEach((node)=>{node.style.display='inline'});
}

function clearFileInput(num){
    let preview = document.querySelectorAll('img')[num];
    let file    = document.querySelectorAll('input[type=file]')[num];
    file.value = ''
    preview.src='/static/img/upload.png'
    document.querySelectorAll('.close')[num].style.display='none';
}


//model
function getUser(){
    return fetch('/api/user')
    .then((response)=>response.json())
}

function postPurchase(){
    let origin = document.getElementById('origin').value;
    let name = document.getElementById('name').value;
    let describe = document.getElementById('describe').value;
    let cls = document.getElementById("cls").value;
    let specs = document.querySelectorAll('.spc');
    let shippingList = []
    let checkedValue = document.querySelectorAll('.shipping:checked');
    checkedValue.forEach(function(n){
        shippingList.push(n.value);
    })
    let condition = document.querySelector('input[name="condition"]:checked').value;
    let conditionValue
    if (condition=='time'){
        conditionValue = document.getElementById('conditionTime').value;
    }else if(condition=='number'){
        conditionValue = document.getElementById('conditionNum').value;
    }else if(condition=='price'){
        conditionValue = document.getElementById('conditionPrice').value;
    }
    let specJson = {};
    for(let i=0;i<specs.length;i++){
        let key=i.toString();
        specJson[key]=specs[i].value;
    }
    let images = document.querySelectorAll('input[type=file]')[0].files[0];
    let images1 = document.querySelectorAll('input[type=file]')[1].files[0];
    let images2 = document.querySelectorAll('input[type=file]')[2].files[0];
    let data = new FormData()
    data.append('file',images);
    data.append('file',images1);
    data.append('file',images2);
    data.append('origin',origin)
    data.append('name',name);
    data.append('describe',describe);
    data.append('cls',cls);
    data.append('spec',JSON.stringify(specJson));
    data.append('shipping',shippingList);
    data.append('condition',condition);
    data.append('conditionValue',conditionValue);
    return fetch('/api/purchaseorder',{
        method:'POST',
        body:data
    }).then((response)=>response.json())
}


//controller
function init(){
    getUser().then((myJson)=>{
        if(myJson['data']){
            loginView()
        }else{
            location.href='/'
        }
    })
}



function previewFile(num) {
    var preview = document.querySelectorAll('img')[num];
    var file    = document.querySelectorAll('input[type=file]')[num].files[0];
    var reader  = new FileReader();
  
    reader.addEventListener("load", function () {
      preview.src = reader.result;
    }, false);
  
    if (file) {
      reader.readAsDataURL(file);
      document.querySelectorAll('.close')[num].style.display='inline';
      document.querySelectorAll('.close')[num].addEventListener('click',function(e){
          clearFileInput(num);
          e.preventDefault()
      })
    }
  }


init()


document.getElementById('img_post').addEventListener('change',function(){
    previewFile(0);
})
document.getElementById('img_post_1').addEventListener('change',function(){
    previewFile(1);
})
document.getElementById('img_post_2').addEventListener('change',function(){
    previewFile(2);
})

document.getElementById('add-spec').addEventListener('click',function(e){
    e.preventDefault();
    e.stopPropagation();
    let shell=document.createElement('div');
    let spec=document.createElement('input');
    spec.className='spc';
    let btn = document.createElement('span');
    spec.placeholder='例如:顏色/白色,口味/辣味';
    btn.className='remove';
    btn.textContent='✕';
    shell.appendChild(spec);
    shell.appendChild(btn);
    document.getElementById('tag').appendChild(shell);
    btn.addEventListener('click',function(){
        document.getElementById('tag').removeChild(shell);
    })
})
document.getElementById('condition-number').addEventListener('click',()=>{
    let cdt = document.getElementById('set-condition');
    if(cdt.hasChildNodes){
        cdt.removeChild(cdt.firstChild)
        cdt.textContent=''
    }
    let text = document.createTextNode('跟團者購買物品總數到達指定數量後通知開團主');
    let number = document.createElement('input');
    number.id = 'conditionNum';
    number.placeholder='數量,例如:20';
    number.type='text';
    cdt.appendChild(number);
    cdt.appendChild(text);
})

document.getElementById('condition-time').addEventListener('click',()=>{
    let cdt = document.getElementById('set-condition');
    if(cdt.hasChildNodes){
        cdt.removeChild(cdt.firstChild);
        cdt.textContent=''
    }
    let text = document.createTextNode('時間到達指定時間後通知團主');
    let date = document.createElement('input');
    date.id = 'conditionTime'
    date.type='datetime-local';
    cdt.appendChild(date);
    cdt.appendChild(text);
})

document.getElementById('condition-price').addEventListener('click',()=>{
    let cdt = document.getElementById('set-condition');
    if(cdt.hasChildNodes){
        cdt.removeChild(cdt.firstChild);
        cdt.textContent=''
    }
    let text = document.createTextNode('價格到達指定價格後通知團主');
    let pc = document.createElement('input');
    pc.placeholder='價格,例如:5000';
    pc.id = 'conditionPrice'
    pc.type='text';
    cdt.appendChild(pc);
    cdt.appendChild(text);
})

document.getElementById('toggle-control').addEventListener('click',()=>{
    let menu = document.getElementById('menu');
    if(menu.style.display=='none' || menu.style.display==""){
        menu.style.display='flex';
        menu.style.bottom='-150px';
    }else{
        menu.style.display='none';
    }
})


document.getElementById('form-submit').addEventListener('click',()=>{
    postPurchase().then((myJson)=>{
        if(myJson['ok']){
            document.getElementsByClassName('lds-dual-ring')[0].style.display='none';
            clearFileInput(0)
            clearFileInput(1)
            clearFileInput(2)
            document.getElementById("base-info").reset();
            document.getElementById('message').textContent='開團成功';
        }else{
            document.getElementById('message').textContent='開團失敗';
        }
    });
    document.getElementsByClassName('lds-dual-ring')[0].style.display='inline-block';
})