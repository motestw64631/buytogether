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

//view
function loginView() {
    document.getElementById('right-header').style.width = '200px'
    let beforeLogin = Array.from(document.getElementsByClassName('before-login'));
    beforeLogin.forEach((node) => { node.style.display = 'none' });
    let afterLogin = Array.from(document.getElementsByClassName('after-login'));
    afterLogin.forEach((node) => { node.style.display = 'inline' });
}

function userInfo(img, name, email, date) {
    document.getElementById('u-img').src = img;
    document.getElementById('u-id').textContent = name;
    document.getElementById('u-mail').textContent = email;
    document.getElementById('u-name').value = name;
    document.getElementById('u-date').textContent = date;
}


//controller
function init() {
    getUser().then((myJson) => {
        if (myJson['data']) {
            loginView();
            user = myJson['data'];
            console.log(user);
            userInfo(user['image'], user['name'], user['email'], user['date']);
        }
    })
}


function events() {
    document.getElementById('toggle-control').addEventListener('click', () => {
        let menu = document.getElementById('menu');
        if (menu.style.display == 'none' || menu.style.display == "") {
            menu.style.display = 'flex';
        } else {
            menu.style.display = 'none';
        }
    })
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
}

init()
events()