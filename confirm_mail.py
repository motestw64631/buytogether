from itsdangerous import URLSafeTimedSerializer
import os
from flask import url_for
from flask_mail import Message,Mail

mail = Mail()

secret_key = os.getenv('secret_key')
salt = os.getenv('what')
sender = os.getenv('MAIL_DEFAULT_SENDER')

class Email_comfirm():
    secret_key = os.getenv('secret_key')
    def __init__(self):
        self.serializer = URLSafeTimedSerializer(secret_key)
    
    def generate_confirmation_token(self,email):
        return self.serializer.dumps(email, salt=salt)

    def confirm_token(self,token,expiration=3600):
        try:
            email = self.serializer.loads(token,salt=salt,max_age=expiration)
        except:
            return False
        return email


def send_email(recipients,subject,token):
    msg = Message(subject,recipients=recipients,sender=sender)
    url = url_for('confirm.confirm_email', token=token, _external=True)
    msg.html = f"請點擊以下連接進行驗證<br><a href='{url}'>{url}</a>"
    mail.send(msg)
    return '成功寄送'