//model
let user;

function getUser() {
    return fetch('/api/user')
        .then((response) => response.json())
}

function changeImage() {
    let image = document.getElementById('img').files[0];
    let data = new FormData()
    data.append('file', image)
    return fetch('/user/image', {
        method: 'PATCH',
        body: data
    }).then(response => response.json())
}

function changeName() {
    let name = document.getElementById('u-name').value;
    let data = new FormData();
    data.append('name', name)
    return fetch('/user/name', {
        method: 'PATCH',
        body: data
    }).then(response => response.json())
}

function changeBank() {
    let bank = document.getElementById('u-bank').value;
    let data = new FormData();
    data.append('bank', bank)
    return fetch('/user/bank', {
        method: 'PATCH',
        body: data
    }).then(response => response.json())
}

function withdraw(value){
    return fetch('/api/credit',{
        method:'POST',
        headers:{
            'content-type':'application/json'
        },
        body:JSON.stringify({
            'amount':value
        })
    }).then(response=>response.json())
}

function sendMail(){
    return fetch('/confirm/send')
        .then(response=>response.json())
}

//view
function loginView() {
    document.getElementById('right-header').style.width = '280px'
    let beforeLogin = Array.from(document.getElementsByClassName('before-login'));
    beforeLogin.forEach((node) => { node.style.display = 'none' });
    let afterLogin = Array.from(document.getElementsByClassName('after-login'));
    afterLogin.forEach((node) => { node.style.display = 'inline' });
}

function confirmView(){
    if(user['confirm']==false){
        confirmBtn = document.createElement('button');
        document.getElementById('auth').append(confirmBtn);
        confirmBtn.textContent='發送驗證信';
        confirmBtn.addEventListener('click',()=>{
            document.getElementById('loader').style.display = 'flex';
            sendMail().then((myJson)=>{
                if(myJson['ok']){
                    document.getElementById('loader').style.display = 'none';
                    swal({buttons: false,text: '驗證信件已發送',type: 'success',timer: 800,});
                    console.log(myJson['message']);
                }
            })
        })
    }
}

function userInfo(img, name, email, date) {
    document.getElementById('u-img').src = img;
    document.getElementById('u-id').textContent = name;
    document.getElementById('u-mail').textContent = email;
    document.getElementById('u-bank').value = user['bank'];
    document.getElementById('auth').textContent = (user['confirm']==true)? '(已通過驗證)':'(未通過驗證)'
    document.getElementById('u-name').value = name;
    document.getElementById('u-account').textContent = user['balance'];
    document.getElementById('u-date').textContent = new Date(date).toISOString().slice(0, 10);
    document.getElementById('u-open').textContent = user['openTime'];
    document.getElementById('u-follow').textContent = user['followTime'];
}


//controller
function init() {
    getUser().then((myJson) => {
        if (myJson['data']) {
            loginView();
            user = myJson['data'];
            console.log(user);
            userInfo(user['image'], user['name'], user['email'], user['date']);
            confirmView();
        }
        if(cUser['admin']){
            document.querySelectorAll('.admin').forEach(element=>{
                element.style.display='flex';
                document.getElementById('right-header').style.width = '340px';
            })
        }
    })
}


function events() {
    document.getElementById("img").addEventListener("change", function () {
        changeImage().then(myJson => {
            if (myJson['ok']) {
                location.reload();
            }
        });
        document.getElementById('u-img').src = '/static/img/loading.gif';
    });

    document.getElementById("ch-name").addEventListener("click", function () {
        changeName().then(myJson => {
            if (myJson['ok']) {
                location.reload();
            }
        });
    });

    document.getElementById('withdraw').addEventListener('click',()=>{
        swal("請輸入提取金額", {
            content: "input",
          })
          .then((value)=>{
              value = Number(value);
              if(!value || value>user['balance']){
                  console.log('wrong value');
                  return
              }else{
                withdraw(value).then(myJson=>{
                    if(myJson['ok']){
                        location.reload();
                    }
                });
              }
          })
    })

    document.getElementById("ch-bank").addEventListener("click", function () {
        changeBank().then(myJson => {
            if (myJson['ok']) {
                location.reload();
            }
        });
    });
}

init()
events()