from re import T
from flask import Blueprint,request
from flask.globals import session
from model.models import *

chat_room = Blueprint('chat_room',__name__)

@chat_room.route('/api/chatroom',methods=['POST'])
def post_chat_room():#create a room between user1 and user2
    rq = request.get_json()
    #print(rq)
    user_1 = rq['user_1']   
    user_2 = rq['user_2']
    if user_1>user_2: #make sure chatroom will not duplicate if user1 and user2 swap
        user_1,user_2=user_2,user_1
    #print(db.session.query(Chat_Room).filter_by(user_1_id=user_1,user_2_id=user_2).count())
    if db.session.query(Chat_Room).filter_by(user_1_id=user_1,user_2_id=user_2).count()==0:
        ctm = Chat_Room(str(user_1)+str(user_2),user_1_id=user_1,user_2_id=user_2)
        ctm.last_activation_time= datetime.datetime.utcnow()
        db.session.add(ctm)
        db.session.commit()
        return{
            'ok':True,
            'exist':False}
    room = db.session.query(Chat_Room).filter_by(user_1_id=user_1,user_2_id=user_2).first()
    room.last_activation_time= datetime.datetime.utcnow()
    db.session.commit()
    return{
        'ok':True,
        'exist':True
        }

@chat_room.route('/api/chatroom',methods=['GET'])
def get_chat_room():
    user_id = session['id']
    q1 = db.session.query(Chat_Room).filter_by(user_1_id=user_id)
    q2 = db.session.query(Chat_Room).filter_by(user_2_id=user_id)
    q3 = q1.union(q2) #the only room between user1 and user2
    q3 = q3.order_by(Chat_Room.last_activation_time.desc())
    datas = []
    for chat_room in q3.all():
        last_message = chat_room.message[-1].content if len(chat_room.message)!=0 else None #if there is message or not
        friend = chat_room.user_1 if chat_room.user_1_id!=user_id else chat_room.user_2
        friend_id = friend.id
        friend_name = friend.name
        friend_image = friend.image
        data={
            'roomId':chat_room.id,
            'lastMessage':last_message,
            'lastActivation':chat_room.last_activation_time,
            'friendId':friend_id,
            'friendName':friend_name,
            'friendImage':friend_image
        }
        datas.append(data)
    return {
        'data':datas
    }

@chat_room.route('/api/chatroom',methods=['DELETE'])
def delete_chat_room():
    room_id = request.args.get('chatroom')
    room = db.session.query(Chat_Room).filter_by(id=room_id).first()
    db.session.delete(room)
    db.session.commit()
    return{
        "ok":True
    }
