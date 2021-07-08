from functools import wraps
from flask import session,jsonify

def login_auth(func):
    @wraps(func)
    def wrap(*args, **kwargs):
        if 'email' not in session:
            return jsonify({
                "error": True,
                "message": "未登入系統"
            }),403
        return func(*args, **kwargs)
    return wrap