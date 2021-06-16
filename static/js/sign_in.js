function getUser(){
    return fetch('/api/user')
    .then((response)=>response.json())
    .then((myJson)=>{
        if(myJson['data']){
            location.href = '/'
        }
    })
}

//model

function loginUser(email,password){
    return fetch('/api/user',{
        method:'PATCH',
        body:JSON.stringify({
            "email":email,
            "password":password
        }),
        headers:{
            "content-type":"application/json"
        }
    })
    .then((response)=>response.json())
}



//controller

getUser()

document.getElementById('sign-up-form').addEventListener('submit',(e)=>{
    e.preventDefault();
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    loginUser(email,password).then((myJson)=>{
        if(myJson['ok']){
            location.href = '/';
        }else{
            document.getElementById('message').textContent='帳號或密碼錯誤';
        }
    })
})
