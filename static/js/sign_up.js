function getUser(){
    return fetch('/api/user')
    .then((response)=>response.json())
    .then((myJson)=>{
        if(myJson['data']){
            location.href = '/'
        }
    })
}

function postUser(name, email, password) {
    return fetch('/api/user', {
        method: 'POST',
        body: JSON.stringify({
            "name": name,
            "email": email,
            "password": password
        }),
        headers: {
            'user-agent': 'Mozilla/4.0 MDN Example',
            'content-type': 'application/json'
        }
    }).then((response)=>response.json())
}


getUser()


document.getElementById('sign-up-form').addEventListener('submit', function (e) {
    e.preventDefault()
    let userName = document.getElementById('user-name').value;
    let userEmail = document.getElementById('user-email').value;
    let userPassword = document.getElementById('user-password').value;
    postUser(userName,userEmail,userPassword).then((myJson)=>{
        console.log(myJson)
        if(myJson['ok']){
            document.getElementById('sign-up-form').reset();
            document.getElementById('message').textContent='註冊成功，請登入';
        }else{
            document.getElementById('message').textContent='重複的電子信箱';
        }
    })
});