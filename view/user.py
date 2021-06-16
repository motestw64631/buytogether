from logging import error
from flask import Blueprint, json,session,jsonify,redirect,request
from model import db,User
from werkzeug.security import check_password_hash
from bt3 import upload_file_to_s3

user_api = Blueprint('user_api',__name__)

@user_api.route('/api/user',methods=['PATCH'])
def loginUser():
    rq = request.get_json()
    user = db.session.query(User).filter_by(email=rq['email']).first()
    if not user:
        return jsonify({
            'error':True,
            'message':'No user found'
        })
    if check_password_hash(user.password_hash,rq['password']):
        session['id']=user.id
        session['name']=user.name
        session['email']=user.email
        session['image']=user.image
        session['date']=user.date
        return jsonify({
            'ok':True
        })
    return jsonify({
        "ok":True,
        "message":'wrong password'
    })

@user_api.route('/api/user',methods=['GET'])
def getUser():
    if 'email' not in session:
        return jsonify({
            'data':None
        })
    return jsonify({
        'data':{
            'id':session['id'],
            'name':session['name'],
            'email':session['email'],
            'image':session['image'],
            'date':session['date']
        }
    }),200

@user_api.route('/logout',methods=['GET'])
def logout():
    session.clear()
    return redirect('/')

@user_api.route('/api/user',methods=['POST'])
def sign_up():
    
    rq = request.get_json()
    #---check if duplicate
    if db.session.query(User).filter_by(email=rq['email']).count()!=0:
        return jsonify({
            "error":True,
            "message":"email exists"
        })
    #----
    user = User(rq['name'],rq['email'],rq['password'],'native')
    db.session.add(user)
    db.session.commit()
    return jsonify({
        'ok':True
    })

@user_api.route('/user/image',methods=['PATCH'])
def change_image():
    url = upload_file_to_s3(request.files['file'],'shauncc','user')
    user = db.session.query(User).filter_by(email=session['email']).first()
    user.image = url
    db.session.commit()
    session['image']=url
    return {
        "ok":True
    }

@user_api.route('/user/name',methods=['PATCH'])
def change_name():
    name = request.form.get('name')
    user = db.session.query(User).filter_by(email=session['email']).first()
    user.name = name
    db.session.commit()
    session['name']=name
    return{
        "ok":True
    }