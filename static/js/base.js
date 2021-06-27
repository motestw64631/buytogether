//model

function getUser(){
    return fetch('/api/user')
    .then((response)=>response.json())
}



//view




function loginView(){
    document.getElementById('right-header').style.width='280px'
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
        document.getElementById('loader').style.display='none';
    })
}

function events(){
    
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