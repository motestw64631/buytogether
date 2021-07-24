from logging import error
from flask import Blueprint, json,session,jsonify,redirect,request
from model import db,User
from werkzeug.security import check_password_hash
from bt3 import upload_file_to_s3
import os
from google.oauth2 import id_token
from google.auth.transport import requests
from view.ledger import calculate_balance


user_api = Blueprint('user_api',__name__)



@user_api.route('/api/user',methods=['PATCH'])
def loginUser():
    try:
        rq = request.get_json()
        user = db.session.query(User).filter_by(email=rq['email'],provider='native').first()
        if not user:
            return jsonify({
                'error':True,
                'message':'No user found'
            }),400
        if check_password_hash(user.password_hash,rq['password']):
            balance = calculate_balance(user)
            session['id']=user.id
            session['name']=user.name
            session['email']=user.email
            session['confirm']=user.confirm
            session['bank']=user.bank
            session['image']=user.image
            session['admin']=user.admin
            session['balance']= balance
            session['date']=user.date
            return jsonify({
                'ok':True
            })
        return jsonify({
            'error':True,
            "message":'wrong password'
        }),400
    except:
        return {
            'error':True
        },500

@user_api.route('/api/user',methods=['GET'])
def getUser():
    try:
        if 'email' not in session:
            return jsonify({
                'data':None
            }),400
        user = db.session.query(User).filter_by(id=session['id']).first()
        return jsonify({
            'data':{
                'id':session['id'],
                'name':session['name'],
                'email':session['email'],
                'image':session['image'],
                'admin':session['admin'],
                'confirm':session['confirm'],
                'bank':session['bank'],
                'balance':calculate_balance(user),
                'date':session['date'],
                'openTime':len(db.session.query(User).filter_by(id=session['id']).first().product),
                'followTime':len(db.session.query(User).filter_by(id=session['id']).first().order),
            }
        }),200
    except:
        return{
            'error':True
        },500

@user_api.route('/logout',methods=['GET'])
def logout():
    session.clear()
    return redirect('/')

@user_api.route('/api/user',methods=['POST'])
def sign_up():
    try:
        rq = request.get_json()
        #---check if duplicate
        if db.session.query(User).filter_by(email=rq['email'],provider='native').count()!=0:
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
    except:
        db.session.rollback()
        return{
            'error':True
        },500

@user_api.route('/user/image',methods=['PATCH'])
def change_image():
    try:
        url = upload_file_to_s3(request.files['file'],'shauncc','user')
        user = db.session.query(User).filter_by(id=session['id']).first()
        user.image = url
        db.session.commit()
        session['image']=url
        return {
            "ok":True
        }
    except:
        db.session.rollback()
        return{
            'error':True
        },500
@user_api.route('/user/name',methods=['PATCH'])
def change_name():
    try:
        name = request.form.get('name')
        user = db.session.query(User).filter_by(id=session['id']).first()
        user.name = name
        db.session.commit()
        session['name']=name
        return{
            "ok":True
        }
    except:
        db.session.rollback()
        return{
            'error':True
        },500

@user_api.route('/user/bank',methods=['PATCH'])
def change_bank():
    try:
        bank = request.form.get('bank')
        user = db.session.query(User).filter_by(id=session['id']).first()
        user.bank = bank
        db.session.commit()
        session['bank']=bank
        return{
            "ok":True
        }
    except:
        db.session.rollback()
        return{
            'error':True
        },500

@user_api.route('/api/google_user',methods=['POST'])
def google_login():
    try:
        rq = request.get_json()
        token = rq['token']
        id_info = id_token.verify_oauth2_token(token,requests.Request(),os.getenv('google_oauth_client_id'))
        email = id_info['email']
        name = id_info['name']
        image = id_info['picture']
        exist = db.session.query(User).filter_by(email=email,provider='google').count()
        if not exist:
            user = User(name,email,None,'google')
            user.image=image
            user.confirm = True
            db.session.add(user)
            db.session.commit()
        user = db.session.query(User).filter_by(email=email,provider='google').first()
        balance = calculate_balance(user)
        session['id']=user.id
        session['name']=user.name
        session['email']=user.email
        session['confirm']=user.confirm
        session['bank']=user.bank
        session['image']=user.image
        session['admin']=user.admin
        session['balance']= balance
        session['date']=user.date
        return{
            'ok':True
        }
    except:
        db.session.rollback()
        return{
            'error':True
        },500


@user_api.route('/user/new_message',methods=['GET'])
def read_message():
    try:
        user_id = session['id']
        user = db.session.query(User).filter_by(id=user_id).first()
        user.new_message=False
        db.session.commit()
        return{
            'ok':True
        }
    except:
        db.session.rollback()
        return{
            'error':True
        },500