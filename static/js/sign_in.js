//model

function getUser(){
    return fetch('/api/user')
    .then((response)=>response.json())
    .then((myJson)=>{
        if(myJson['data']){
            location.href = '/'
        }
    })
}


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

function googleLogin(token){
    return fetch('/api/google_user',{
        method:'POST',
        headers:{
            'content-type':'application/json'
        },
        body:JSON.stringify({
            'token':token
        })
    })
    .then(response=>response.json())
}

function gp_signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
}

function onSuccess(googleUser) {
    console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
    id_token = googleUser.getAuthResponse().id_token;
    googleLogin(id_token).then((myJson)=>{
        if(myJson['ok']){
            gp_signOut();
            location.href='/';
        }
    })
  }
  function onFailure(error) {
    console.log(error);
  }

//view
  function renderButton() {
    gapi.signin2.render('my-signin2', {
      'scope': 'profile email',
      'width': 240,
      'height': 50,
      'longtitle': true,
      'theme': 'dark',
      'onsuccess': onSuccess,
      'onfailure': onFailure
    });
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

renderButton();
