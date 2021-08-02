let user;
let statusCode = {
    0:'開團中',
    1:'已成團',
    2:'主購已下單',
    3:'店家已出貨',
    4:'主購已取貨',
    5:'商品已寄出',
    6:'團購結束'
}
//model

function getUser() {
    return fetch('/api/user')
        .then((response) => response.json())
        .then((user)=>user=user)
}


function getProductByUser(){
    return fetch(`/api/products?userId=${cUser['id']}`)
        .then(response=>response.json())
}

//view
function renderUserProductView(products){
    const main = document.getElementById('my-group');
    products['data'].forEach(product => {
        const productView = document.createElement('div');
        productView.className = 'product-view';
        const productHeader = document.createElement('div');
        productHeader.className = 'product-header';
        const productImage = document.createElement('div');
        productImage.className = 'product-image';
        const productName = document.createElement('div');
        const productStatus = document.createElement('div');
        productStatus.className = 'product-status';
        const productCotent = document.createElement('div');
        productCotent.className = 'product-content';
        const productDate = document.createElement('div');
        const dateA = document.createElement('a');
        const productCondition = document.createElement('div');
        const conditionA = document.createElement('a');
        const productFollower = document.createElement('div');
        const followA = document.createElement('a');
        productImage.style.backgroundImage = `url('${product['productImage']}')`;
        productName.textContent = product['productName'];
        productStatus.textContent = statusCode[product['productStatus']];
        productDate.textContent = '開團日期';
        dateA.textContent = new Date(product['productDate']).toISOString().slice(0, 10);
        productCondition.textContent='成團條件'
        if (product['productCondition']=='price'){
            conditionA.textContent='當價格達到$'+product['productConditionValue'];
        }else if(product['productCondition']=='number'){
            conditionA.textContent='當數量達到'+product['productConditionValue'];
        }else if(product['productCondition']=='time'){
            conditionA.textContent='當時間達到'+new Date(product['productConditionValue']).toISOString().slice(0, 10);
        }
        productFollower.textContent='跟團人數';
        followA.textContent = product['productBuyerNumber']+'人';
        productHeader.appendChild(productImage);
        productHeader.appendChild(productName);
        productHeader.appendChild(productStatus);
        productCotent.appendChild(productDate);
        productCotent.appendChild(productCondition);
        productCotent.appendChild(productFollower);
        productDate.appendChild(dateA);
        productCondition.appendChild(conditionA);
        productFollower.appendChild(followA);
        productView.appendChild(productHeader);
        productView.appendChild(productCotent);
        productView.addEventListener('click',()=>{
            location.href='/seller/product/'+product['productId'];
        })
        main.appendChild(productView);
    });
}


//controller
getUser().then(()=>{
    getProductByUser().then((products)=>{
        renderUserProductView(products);
    });
})


