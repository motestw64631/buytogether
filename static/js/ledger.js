function getLedgers(){
    return fetch('/api/credit')
        .then(response=>response.json())
}

function creditStatusChange(id){
    return fetch(`/api/creditstatus/${id}`)
        .then(response=>response.json())
}

function getAccount(){
    return fetch('/api/account')
        .then(response=>response.json())
}

getLedgers().then(myJson=>{
    myJson['data'].forEach((data)=>{
        const tr = document.createElement('tr');
        const id = document.createElement('td');
        const email = document.createElement('td');
        const bank = document.createElement('td');
        const amount = document.createElement('td');
        const blance = document.createElement('td');
        const act = document.createElement('td');
        const date = document.createElement('td');
        id.textContent=data['userId'];
        email.textContent = data['userEmail'];
        bank.textContent = data['userBank'];
        amount.textContent = data['amount'];
        blance.textContent = data['blance'];
        act.textContent = data['creditStatus']==false?'未付款':'已付款';
        let pay='';
        if(data['creditStatus']==false){
            pay=document.createElement('td');
            pay.className = 'pay-bt'
            pay.textContent='付款';
            pay.addEventListener('click',()=>{
                creditStatusChange(data['creditId']).then(myJson=>{
                    if(myJson['ok']){
                        location.reload();
                    }
                })
            })
        }
        date.textContent = data['date'];
        tr.append(id,email,bank,amount,blance,date,act,pay);
        document.getElementById('customers').append(tr);
    })
})

getAccount().then((data)=>{
    document.querySelector('#acc').textContent=data['amount']
})