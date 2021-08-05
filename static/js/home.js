let nextPage = 0;
let timeout;
let elementId;
//model

function getUser() {
    return fetch('/api/user')
        .then((response) => response.json())
}

function getProduct(cls, keyword, page) {
    return fetch(`/api/products?class=${cls}&page=${page}`)
        .then(response => response.json())
}

function getProductKeyword(keyword, page) {
    return fetch(`/api/products?keyword=${keyword}&page=${page}`)
        .then(response => response.json())
}

//view
function getMainPic(name) {
    let img = document.getElementById('pic');
    img.style.display = 'inline';
    img.src = `static/img/${name}.jpg`;
}

function changeColor(node) {
    let nodes = document.querySelectorAll('#class td');
    nodes.forEach((node) => node.style.background = 'white');
    node.style.background = 'rgba(197, 206, 238, 0.274)';
}

function loginView() {
    document.getElementById('right-header').style.width = '280px'
    let beforeLogin = Array.from(document.getElementsByClassName('before-login'));
    beforeLogin.forEach((node) => { node.style.display = 'none' });
    let afterLogin = Array.from(document.getElementsByClassName('after-login'));
    afterLogin.forEach((node) => { node.style.display = 'inline' });
}

function productView(myJson) {
    myJson['data'].forEach(function (data) {
        const product = document.createElement('div');
        const productImg = document.createElement('div');
        const productName = document.createElement('div');
        const productCondition = document.createElement('div');
        product.className = 'product';
        productImg.className = 'product-img';
        productName.className = 'product-name';
        productCondition.className = 'product-condition';
        productName.textContent = data['productName'];
        if (data['condition'] == 'time') {
            productCondition.textContent = '距離成團還差' + data['gap'] + '天';
        } else if (data['condition'] == 'price') {
            productCondition.textContent = '距離成團還差$' + data['gap'] + '元';
        } else if (data['condition'] == 'number') {
            productCondition.textContent = '距離成團還差' + data['gap'] + '個';
        }
        productImg.style.backgroundImage = `url('${data['productImage']}')`;
        product.appendChild(productImg);
        product.appendChild(productName);
        product.appendChild(productCondition);
        product.addEventListener('click', () => location.href = `/product/${data['productId']}`);
        document.getElementById('content').appendChild(product);
    })
}

function searchView() {
    const main = document.querySelector('main');
    const content = document.getElementById('content');
    const search = document.createElement('h2');
    search.id = 'search-title';
    search.textContent = '搜尋結果';
    main.insertBefore(search, content);
}

function deSearchView() {
    searchText = document.getElementById('search-title');
    if (searchText !== null) {
        searchText.remove();
    }
}

//controller
function init() {
    getUser().then((myJson) => {
        if (myJson['data']) {
            loginView()
            if (cUser['admin']) {
                document.querySelectorAll('.admin').forEach(element => {
                    element.style.display = 'flex';
                    document.getElementById('right-header').style.width = '340px';
                })
            }
        }
        document.getElementById('loader').style.display = 'none';
    })
}




init()

document.querySelectorAll('#class td').forEach(function (element) {
    element.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        deSearchView();
        nextPage = 0;
        document.getElementById('content').innerHTML = '';
        elementId = element.id;
        getMainPic(element.id);
        changeColor(element);

        getProduct(cls = element.id, keyword = null, page = nextPage).then(function (myJson) {
            productView(myJson);
            nextPage = myJson['nextPage'];
            if (nextPage!=null){
                if (nextPage != null) {
                    window.addEventListener('scroll', function btEvent(event) {
                        clearTimeout(timeout);
                        timeout = setTimeout(function () {
                            if (nextPage !== null) {
                                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight * 0.98) {
                                    getProduct(cls = elementId, keyword = null, page = nextPage).then(function (myJson) {
                                        productView(myJson);
                                        nextPage = myJson['nextPage'];
                                    })
                                }
                            }
                        }, 200);
                    });
                }
            }
        })
    })
})


let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let keyword = urlParams.get('keyword');
if (keyword == null) {
    document.getElementById('outfit').click();
} else {
    nextPage = 0;
    searchView();
    getProductKeyword(keyword = keyword, page = nextPage).then(function (myJson) {
        productView(myJson);
        nextPage = myJson['nextPage'];
    })
    window.addEventListener('scroll', function btEvent(event) {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            if (nextPage !== null) {
                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight * 0.95) {
                    getProductKeyword(keyword = keyword, page = nextPage).then(function (myJson) {
                        productView(myJson);
                        nextPage = myJson['nextPage'];
                    })
                }
            }
        }, 200);
    });
}