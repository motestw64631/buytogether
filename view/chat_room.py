from re import T
from flask import Blueprint,request
from flask.globals import session
from model import *

chat_room = Blueprint('chat_room',__name__)

@chat_room.route('/api/chatroom',methods=['POST'])
def post_chat_room():
    rq = request.get_json()
    print(rq)
    user_1 = rq['user_1']
    user_2 = rq['user_2']
    if user_1>user_2:
        user_1,user_2=user_2,user_1
    print(db.session.query(Chat_Room).filter_by(user_1_id=user_1,user_2_id=user_2).count())
    if db.session.query(Chat_Room).filter_by(user_1_id=user_1,user_2_id=user_2).count()==0:
        ctm = Chat_Room(str(user_1)+str(user_2),user_1_id=user_1,user_2_id=user_2)
        db.session.add(ctm)
        db.session.commit()
        return{
            'ok':True,
            'exist':False}
    return{
        'ok':True,
        'exist':True}

@chat_room.route('/api/chatroom',methods=['GET'])
def get_chat_room():
    user_id = session['id']
    q1 = db.session.query(Chat_Room).filter_by(user_1_id=user_id)
    q2 = db.session.query(Chat_Room).filter_by(user_2_id=user_id)
    q3 = q1.union(q2)
    datas = []
    for chat_room in q3.all():
        friend = chat_room.user_1 if chat_room.user_1_id!=user_id else chat_room.user_2
        friend_id = friend.id
        friend_name = friend.name
        friend_image = friend.image
        data={
            'roomId':chat_room.id,
            'friendId':friend_id,
            'friendName':friend_name,
            'friendImage':friend_image
        }
        datas.append(data)
    return {
        'data':datas
    }