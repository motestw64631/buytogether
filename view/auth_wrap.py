from functools import wraps
from flask import session,jsonify,redirect,url_for

def login_auth(func): #check if login
    @wraps(func)
    def wrap(*args, **kwargs):
        if 'email' not in session:
            return jsonify({
                "error": True,
                "message": "未登入系統"
            }),403
        return func(*args, **kwargs)
    return wrap



def confirm_auth(func): #check if email confirm
    @wraps(func)
    def wrap(*args, **kwargs):
        if session['confirm']!=True:
            return redirect(url_for('profile'))
        return func(*args, **kwargs)
    return wrap
