let socket = io.connect();
let chatrooms;
let currentRoom = null;

//model 
function getChatRoom() {
    return fetch('/api/chatroom')
        .then(response => response.json())
}

function postChatMessage() {
    const content = document.getElementById('ipt').innerText;
    const user = cUser['id'];
    const room = currentRoom;
    return fetch('/api/chat_message', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            'user': user,
            'room': room,
            'content': content
        })
    })
}

function getChatMessage() {
    return fetch(`/api/chat_message?chatroom=${currentRoom}`)
        .then(response => response.json())
}

//view

function renderMessageView(msg){
    const messageDiv = document.querySelector('.message-content');
    const singleMessage = document.createElement('div');
    singleMessage.className = 'single-message';
    const singleMessageAvatar = document.createElement('img');
    singleMessageAvatar.className = 'avatar';
    const singleMessageContent = document.createElement('div');
    const singleMessageContentName = document.createElement('div');
    const singleMessageContentMessage = document.createElement('div');
    singleMessageContentName.className = 'msg-n'
    singleMessageContentMessage.className = 'msg-ct';
    singleMessage.appendChild(singleMessageAvatar);
    singleMessage.appendChild(singleMessageContent);
    if (msg['userId'] == cUser['id']) {
        singleMessage.style.flexDirection = 'row-reverse';
        singleMessageContentName.style.justifyContent = 'flex-end';
    }
    singleMessageContent.appendChild(singleMessageContentName);
    singleMessageContent.appendChild(singleMessageContentMessage);
    singleMessageAvatar.src = msg['userImage'];
    singleMessageContentName.textContent = msg['userName'];
    singleMessageContentMessage.textContent = msg['message'];
    messageDiv.appendChild(singleMessage);
}

function renderfriendView() {
    const friendView = document.querySelector('.message-list');
    chatrooms['data'].forEach(function (friend) {
        const singleFriend = document.createElement('div');
        const friendImage = document.createElement('img');
        const friendContent = document.createElement('div');
        const friendName = document.createElement('div');
        const friendPreview = document.createElement('div');
        singleFriend.className = 'friend';
        friendImage.className = 'friend-img';
        friendContent.className = 'friend-content';
        friendName.className = 'friend-name';
        friendPreview.className = 'friend-preview';
        singleFriend.addEventListener('click', function () {
            if (currentRoom !== null) {
                socket.emit('leave', {
                    "username": cUser['name'],
                    "room": currentRoom
                })
                document.querySelector('.message-content').innerHTML = '';
            }
            currentRoom = friend['roomId'];
            socket.emit('join', {
                "username": cUser['name'],
                "room": friend['roomId']
            })
            getChatMessage().then((messages) => {
                messages['data'].forEach((message) => {
                    renderMessageView(message);
                    $(".message-content").scrollTop($(".message-content")[0].scrollHeight);
                });
            })
        })
        singleFriend.appendChild(friendImage);
        singleFriend.appendChild(friendContent);
        friendContent.appendChild(friendName);
        friendName.textContent = friend['friendName'];
        friendImage.src = friend['friendImage'];
        friendView.appendChild(singleFriend);
    })
}

function clickUserView() {
    let nodes = document.querySelectorAll('.friend');
    nodes.forEach((node) => {
        node.addEventListener('click', function () {
            nodes.forEach((node) => node.style.background = 'rgb(220, 234, 247)');
            node.style.background = 'rgb(206, 226, 245)';
        })
    })
}




// $(document).ready(function () {
//     var socket = io.connect();
//     socket.on('status_response', function (msg) {
//         var date = new Date();
//         console.log('fucj' + msg);
//         $('.message-content').append('<p>status: ' + msg.data + "Time:" + date + '</p>');
//     });
// });


document.getElementById('push').addEventListener('click', function () {
    let m = document.getElementById('ipt').textContent;
    postChatMessage();
    socket.emit('receive message', {
        'userId': cUser['id'],
        'userName': cUser['name'],
        'userImage': cUser['image'],
        'message': m,
        'room': currentRoom,
    })
    document.getElementById('ipt').textContent = '';
})

socket.on('message', function (msg) {
    renderMessageView(msg);
    $(".message-content").scrollTop($(".message-content")[0].scrollHeight);
});

//controller

getChatRoom().then((myJson) => {
    chatrooms = myJson;
    console.log(chatrooms);
    renderfriendView();
    clickUserView();
    document.querySelector('.friend:first-child').click();
})
