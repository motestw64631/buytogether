//model

function getUser(){
    return fetch('/api/user')
    .then((response)=>response.json())
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
    document.getElementById('right-header').style.width='200px'
    let beforeLogin = Array.from(document.getElementsByClassName('before-login'));
    beforeLogin.forEach((node)=>{node.style.display='none'});
    let afterLogin = Array.from(document.getElementsByClassName('after-login'));
    afterLogin.forEach((node)=>{node.style.display='inline'});
}


//controller
function init(){
    getUser().then((myJson)=>{
        if(myJson['data']){
            loginView()
        }
    })
}

function events(){
    document.querySelectorAll('#class td').forEach(function(element){
        element.addEventListener('click',()=>{
            getMainPic(element.id);
            changeColor(element);
        })
    })

    document.getElementById('toggle-control').addEventListener('click',()=>{
        let menu = document.getElementById('menu');
        if(menu.style.display=='none' || menu.style.display==""){
            menu.style.display='flex';
        }else{
            menu.style.display='none';
        }
    })
}


init()
events()