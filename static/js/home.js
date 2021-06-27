//model

function getUser(){
    return fetch('/api/user')
    .then((response)=>response.json())
}

function getProduct(cls,keyword,page){
    return fetch(`/api/products?class=${cls}&page=${page}`)
        .then(response=>response.json())
}

//view
function getMainPic(name){
    let img = document.getElementById('pic');
    img.style.display='inline';
    img.src = `static/img/${name}.jpg`;
}

function changeColor(node){
    let nodes = document.querySelectorAll('#class td');
    nodes.forEach((node)=>node.style.background='white');
    node.style.background='rgba(197, 206, 238, 0.274)';
}

function loginView(){
    document.getElementById('right-header').style.width='280px'
    let beforeLogin = Array.from(document.getElementsByClassName('before-login'));
    beforeLogin.forEach((node)=>{node.style.display='none'});
    let afterLogin = Array.from(document.getElementsByClassName('after-login'));
    afterLogin.forEach((node)=>{node.style.display='inline'});
}

function productView(myJson){
    myJson['data'].forEach(function(data){
        const product = document.createElement('div');
        const productImg = document.createElement('div');
        const productName = document.createElement('div');
        const productCondition = document.createElement('div');
        product.className='product';
        productImg.className='product-img';
        productName.className='product-name';
        productCondition.className='product-condition';
        productName.textContent=data['productName'];
        productImg.style.backgroundImage=`url('${data['productImage']}')`;
        product.appendChild(productImg);
        product.appendChild(productName);
        product.appendChild(productCondition);
        product.addEventListener('click',()=>location.href=`/product/${data['productId']}`);
        document.getElementById('content').appendChild(product);
    })
}

//controller
function init(){
    getUser().then((myJson)=>{
        if(myJson['data']){
            loginView()
        }
        document.getElementById('loader').style.display='none';
    })
}

function events(){
    document.querySelectorAll('#class td').forEach(function(element){
        element.addEventListener('click',()=>{
            document.getElementById('content').innerHTML='';
            getMainPic(element.id);
            changeColor(element);
            getProduct(cls=element.id,keyword=null,page=0).then(function(myJson){
                productView(myJson);
            })
        })
    })
}


init()
events()
document.getElementById('outfit').click();