from flask import Blueprint,request
from model import *

chat_message = Blueprint('chat_message',__name__)

@chat_message.route('/api/chat_message',methods=['POST'])
def post_chat_message():
    rq = request.get_json()
    message = Chat_Message(rq['user'],rq['room'],rq['content'])
    db.session.add(message)
    db.session.commit()
    return {
        'ok':True
    }

@chat_message.route('/api/chat_message',methods=['GET'])
def get_chat_message():
    room_id = request.args.get('chatroom')
    room = db.session.query(Chat_Room).filter_by(id=room_id).first()
    messages = room.message
    messages = [{'userId':message.user_id,'userImage':message.user.image,'userName':message.user.name,'message':message.content} for message in messages]
    return{
        'data':messages
    }

