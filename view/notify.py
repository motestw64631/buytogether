import re
from flask import Blueprint, json,session,jsonify,redirect,request,url_for
from model import *

notify = Blueprint('notify',__name__)


@notify.route('/api/notify',methods=['GET'])
def get_notify():
    '''
    can only get current user's notify
    '''
    user_id = session['id']    
    user = db.session.query(User).filter_by(id=user_id).first()
    notifys = [{'content':notify.content} for notify in user.notify]
    notifys.reverse()
    return{
        'newMessage':user.new_message,
        'data':notifys
    }
