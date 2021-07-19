from flask import Blueprint, json,session,render_template
import requests
from model import *
from view.auth_wrap import login_auth
from confirm_mail import *


confirm = Blueprint('confirm',__name__)



@confirm.route('/confirm/<token>')
@login_auth
def confirm_email(token):
    email_confirm = Email_comfirm()
    try:
        email = email_confirm.confirm_token(token)
    except:
        return render_template('confirm.html',message='The confirmation link is invalid or has expired.')
        # return {
        #     'error':True,
        #     'message':'The confirmation link is invalid or has expired.'
        # }
    user = User.query.filter_by(email=email,provider='native').first_or_404()
    if user.confirm:
        return render_template('confirm.html',message='Account already confirmed. Please login.')
        # return {
        #     'error':True,
        #     'message':'Account already confirmed. Please login.'
        # }
    else:
        user.confirm = True
        db.session.add(user)
        db.session.commit()
        if 'email' in session:
            if session['email']==email:
                session['confirm']=True
    return render_template('confirm.html',message='You have confirmed your account. Thanks!')
    # return {
    #     'ok':True,
    #     'message':'You have confirmed your account. Thanks!'
    # }

@confirm.route('/confirm/send')
@login_auth
def confirm_send():
    email_confirm = Email_comfirm()
    token = email_confirm.generate_confirmation_token(session['email'])
    send_email([session['email']],'S&S驗證信',token)
    return{
        'ok':True,
        'message':'已送出驗證信'
    }