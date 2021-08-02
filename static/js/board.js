//model
let user;
let nextPage = 0;
let timeout;


function getUser() {
    return fetch('/api/user')
        .then((response) => response.json())
}

function postMessage() {
    let title = document.getElementById('message-input-title').value;
    let message = document.getElementById('message-input-main').value;
    let images = document.querySelectorAll("input[type='file']")
    let data = new FormData();
    data.append('user', user['id']);
    data.append('title', title);
    data.append('message', message);
    for (let i = 0; i < images.length; i++) {
        data.append('images', images[i].files[0])
    }

    // for (var value of data.values()) {
    //     console.log(value);
    // }

    return fetch('/api/message', {
        method: 'POST',
        body: data
    }).then((response) => response.json())
}

function getMessage(page) {
    return fetch(`/api/message?page=${page}`)
        .then((response) => response.json())
}

function deleteMessage(messageId) {
    return fetch('/api/message', {
        body: JSON.stringify({
            'messageId': messageId
        }),
        method: 'DELETE',
        headers: {
            'content-type': 'application/json'
        }
    }).then((response) => response.json())
}

function postSubMessage(messageId,userId,content){
    return fetch('/api/sub_message',{
        method:'POST',
        headers:{
            'content-type': 'application/json'
        },
        body:JSON.stringify({
            "messageId":messageId,
            "userId":userId,
            "content":content
        })
    })
}

function getSubMessage(messageId){
    return fetch(`/api/sub_message?message_id=${messageId}`)
        .then(response=>response.json())
}

//view

function enlargeImage(){
    $(document).ready(function () {
        $('.message-image img').each(function () {
          var currentImage = $(this);
          currentImage.wrap("<a class='image-link' href='" + currentImage.attr("src") + "'</a>");
        });
        $('.image-link').magnificPopup({ type: 'image' });
      });
}

function loginView() {
    document.getElementById('right-header').style.width = '280px'
    let beforeLogin = Array.from(document.getElementsByClassName('before-login'));
    beforeLogin.forEach((node) => { node.style.display = 'none' });
    let afterLogin = Array.from(document.getElementsByClassName('after-login'));
    afterLogin.forEach((node) => { node.style.display = 'inline' });
}
function userView() {
    let userImage = document.getElementById('u-img');
    userImage.src = user['image'];
}


function messageView(datas) {
    const mainContent = document.getElementById('show-message');
    datas['data'].forEach(function (data) {
        const messages = document.createElement('div');
        messages.className = 'messages';
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header'
        const messageImage = document.createElement('div');
        messageImage.className = 'message-image'
        const message = document.createElement('div');
        message.className = 'message';
        const userDiv = document.createElement('div');
        userDiv.className = 'user';
        const messageTitle = document.createElement('div')
        messageTitle.className = 'message-title';
        const messageUserIcon = document.createElement('img');
        messageUserIcon.className = 'message-user-icon';
        const name = document.createElement('a');
        name.className = 'name';
        const more = document.createElement('div');
        more.className = 'more';
        const menu = document.createElement('div');
        menu.classList.add('menu-none');
        const title = document.createElement('div');
        title.className = 'title';
        const time = document.createElement('div');
        time.className = 'time';
        const img = document.createElement('img');
        const subMessage = document.createElement('div');
        const subMessageHeader = document.createElement('div');
        subMessageHeader.className='sub-header';
        const subMessageUser = document.createElement('img');
        subMessageUser.className='sub-user';
        const subMessageInput = document.createElement('div');
        subMessageInput.contentEditable=true;
        subMessageInput.className='sub-input';
        const subMessageBtn = document.createElement('button');
        const subMessages = document.createElement('div');
        //show sub-messages
        subMessageBtn.addEventListener('click',()=>{
            let content = subMessageInput.innerText;
            postSubMessage(data['messageId'],user['id'],content).then((response)=>{
                getSubMessage(data['messageId']).then((json)=>{
                    json['data'].forEach(function subView(data){
                        const subMessageOther=document.createElement('div');
                        subMessageOther.className='other-message';
                        const subMessageOtherUser=document.createElement('img');
                        subMessageOtherUser.className='sub-user';
                        const subMessageOtherRight=document.createElement('div');
                        subMessageOtherRight.className='other-message-right';
                        const subMessageOtherName=document.createElement('div');
                        subMessageOtherName.className='other-message-name';
                        const subMessageOtherContent=document.createElement('div');
                        subMessageOtherUser.src=data['userImage'];
                        subMessageOtherName.textContent=data['userName'];
                        subMessageOtherContent.textContent=data['content'];
                        subMessageOther.appendChild(subMessageOtherUser);
                        subMessageOther.appendChild(subMessageOtherRight);
                        subMessageOtherRight.appendChild(subMessageOtherName);
                        subMessageOtherRight.appendChild(subMessageOtherContent);
                        subMessages.appendChild(subMessageOther);
                    });
                })
            });
            subMessageInput.textContent='';
            while(subMessages.firstChild){
                subMessages.removeChild(subMessages.firstChild);
            }
        })
        subMessageInput.addEventListener('keydown',function(e){
            if (e.key === 'Enter'&& e.shiftKey === false) {
                e.preventDefault();
                subMessageBtn.click();
              }
        })
        getSubMessage(data['messageId']).then((json)=>{
            json['data'].forEach(function subView(data){
                const subMessageOther=document.createElement('div');
                subMessageOther.className='other-message';
                const subMessageOtherUser=document.createElement('img');
                subMessageOtherUser.className='sub-user';
                const subMessageOtherRight=document.createElement('div');
                subMessageOtherRight.className='other-message-right';
                const subMessageOtherName=document.createElement('div');
                subMessageOtherName.className='other-message-name';
                const subMessageOtherContent=document.createElement('div');
                subMessageOtherUser.src=data['userImage'];
                subMessageOtherName.textContent=data['userName'];
                subMessageOtherContent.textContent=data['content'].replace(/\n/g, "\r\n");
                subMessageOther.appendChild(subMessageOtherUser);
                subMessageOther.appendChild(subMessageOtherRight);
                subMessageOtherRight.appendChild(subMessageOtherName);
                subMessageOtherRight.appendChild(subMessageOtherContent);
                subMessages.appendChild(subMessageOther);
            });
        })
        //content
        messageUserIcon.src = data['userImage'];
        name.textContent = data['userName'];
        more.textContent = '...'
        menu.textContent = '刪除'
        menu.addEventListener('click', function (e) {
            e.stopPropagation();
            b = swal({
                title: "確定要刪除此篇貼文嗎?",
                icon: "warning",
                buttons: true,
                dangerMode: true
            }).then(response => {
                if (response) {
                    deleteMessage(data['messageId']).then(response => {
                        if (response['ok']) {
                            location.reload()
                        }
                    })
                }
            })
        })
        title.textContent = data['title'];
        time.textContent = data['date'];
        if (data['contentImage'][0] !== undefined) {
            img.src = data['contentImage'][0];
            img.width = '500';
        }
        let content = data['content'].replace(/\n/g, "\r\n");
        message.textContent = content;
        more.addEventListener('click', function () {
            menu.classList.toggle('menu');
        })
        subMessageUser.src=user['image'];
        subMessageBtn.textContent='發佈';
        if (data['contentImage'][0] !== undefined) {
            messageImage.appendChild(img);
        }
        //structure
        messageTitle.appendChild(title);
        messageTitle.appendChild(time);
        userDiv.appendChild(messageUserIcon);
        userDiv.appendChild(name);
        more.appendChild(menu);
        if (user['id'] == data['userId']) {
            userDiv.appendChild(more);
        }
        messageHeader.appendChild(userDiv);
        messageHeader.appendChild(messageTitle);
        messages.appendChild(messageHeader);
        messages.appendChild(messageImage);
        messages.appendChild(message);
        subMessageHeader.appendChild(subMessageUser);
        subMessageHeader.appendChild(subMessageInput);
        subMessageHeader.appendChild(subMessageBtn);
        subMessage.appendChild(subMessages);
        subMessage.appendChild(subMessageHeader);
        messages.appendChild(document.createElement('hr'));
        messages.appendChild(subMessage);
        mainContent.append(messages);
    })
    enlargeImage();
}

//controller
function init() {
    getUser().then((myJson) => {
        if (myJson['data']) {
            user = myJson['data'];
            loginView();
            userView();
            if(cUser['admin']){
                document.querySelectorAll('.admin').forEach(element=>{
                    element.style.display='flex';
                    document.getElementById('right-header').style.width = '340px';
                })
            }
            getMessage(nextPage).then((myJson => {
                messageView(myJson);
                nextPage = myJson['nextPage'];
            }))
        }
    })
}


function events() {
    document.getElementById('upload_icon').addEventListener('click', (e) => {
        const footer = document.getElementById('preview');
        let input = document.createElement('input');
        let image = document.createElement('img');
        let imageDiv = document.createElement('div');
        let rmImage = document.createElement('div');
        imageDiv.className = 'imageDiv';
        rmImage.className = 'rmImage';
        rmImage.textContent = '✖'
        image.className = 'previewImage';
        input.type = 'file';
        input.accept = "image/*";
        input.style.display = 'none';
        rmImage.addEventListener('click', () => {
            imageDiv.remove();
            input.remove();
            if (document.getElementById("upload_icon").style.display == 'none') {
                document.getElementById('upload_icon').style.display = 'block';
            }
        })
        input.addEventListener('change', function (e) {
            let file = input.files[0];
            image.src = URL.createObjectURL(file);
            imageDiv.appendChild(image);
            imageDiv.appendChild(rmImage);
            footer.appendChild(imageDiv);
            if (document.querySelectorAll("input[type='file']").length >= 1) {
                document.getElementById('upload_icon').style.display = 'none';
            }
        })
        footer.appendChild(input);
        input.click();
    })
    document.getElementById('post-message').addEventListener('click', (e) => {
        postMessage().then((response) => {
            if (response['ok']) {
                location.reload()
            }
        });
        document.getElementById('loader').style.display='flex';
    })

    window.addEventListener('scroll', function btEvent(event) {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            if (nextPage !== null) {
                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight * 0.95) {
                    getMessage(nextPage).then((myJson => {
                        messageView(myJson);
                        nextPage = myJson['nextPage'];
                    }))
                }
            }
        }, 50);
    });
}

init()
events()
