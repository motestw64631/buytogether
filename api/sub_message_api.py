from operator import sub
from flask import Blueprint, json,session,jsonify,redirect,request
from model.models import *


sub_message_api = Blueprint('sub_message_api',__name__)

@sub_message_api.route('/api/sub_message',methods=['POST'])
def post_submessage():
    try:
        rq = request.get_json()
        message_id = rq['messageId']
        user_id = rq['userId']
        content = rq['content']
        sub_message = Sub_Message(user_id,message_id,content)
        db.session.add(sub_message)
        db.session.commit()
        return {
            'ok':True
        },200
    except:
        db.session.rollback()
        return{
            'error':True
        },500

@sub_message_api.route('/api/sub_message',methods=['GET'])
def get_submessage():
    try:   
        message_id = request.args.get('message_id')
        sub_messages = db.session.query(Sub_Message).filter_by(message_id=message_id).order_by(Sub_Message.date.desc()).all()
        datas = []
        for sub_message in sub_messages:
            data={
                'userId':sub_message.user.id,
                'userName':sub_message.user.name,
                'userImage':sub_message.user.image,
                'subMessageId':sub_message.id,
                'content':sub_message.content,
            }
            datas.append(data)
        return {
            'data':datas
        }
    except:
        return{
            'error':True
        },500