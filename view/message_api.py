from flask import Blueprint, json,session,jsonify,redirect,request
from model import *
from werkzeug.utils import secure_filename
from os import path
from bt3 import upload_file_to_s3


message_api = Blueprint('message_api',__name__)

@message_api.route('/api/message',methods=['POST'])
def post_message():
    images = request.files.getlist('images')
    title = request.form.get('title')
    message = request.form.get('message')
    id = request.form.get('user')
    m = Message(title,id,message)
    for image in images:
        url = upload_file_to_s3(image,'shauncc','message')
        img = Image(url)
        m.image.append(img)
    db.session.add(m)
    db.session.commit()
    return {'ok':True}

@message_api.route('/api/message',methods=['GET'])
def get_message():
    page = int(request.args.get('page'))
    count = db.session.query(Message).count()
    page_count = count//3
    next_page = page+1 if page<page_count else None
    datas = db.session.query(Message).order_by(Message.date.desc()).slice(3*page,3*(page+1)).all()
    json_data = []
    for data in datas:
        js = {
            'messageId':data.id,
            'userId':data.user_id,
            'userName':data.user.name,
            'userImage':data.user.image,
            'title':data.title,
            'content':data.message,
            'contentImage':[image.image_url for image in data.image],
            'date':data.date
        }
        json_data.append(js)
    
    return {
        'nextPage':next_page,
        'data':json_data
    }

@message_api.route('/api/message',methods=['DELETE'])
def delete_message():
    rq = request.get_json()
    m_id = rq['messageId']
    message = db.session.query(Message).filter_by(id=m_id).first()
    db.session.delete(message)
    db.session.commit()
    return{
        'ok':True
    }