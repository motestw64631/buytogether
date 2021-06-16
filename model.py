from enum import unique
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash,check_password_hash
import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100),unique=True)
    password_hash = db.Column(db.String(500))
    provider = db.Column(db.String(100))
    image = db.Column(db.String(600))
    date = db.Column(db.DateTime,default=datetime.datetime.utcnow)
    purchase = db.relationship('PurchaseOrder',backref='user')
    message = db.relationship('Message',backref='user')
    def __init__(self,name,email,password,provider):
        self.name = name
        self.image = 'https://d84l4b8eh7ljv.cloudfront.net/animal_inu.png'
        self.email = email
        self.password_hash = generate_password_hash(password) if password is not None else None
        self.provider = provider

    def __repr__(self):
        return f'<user {self.name}>'



class PurchaseOrder(db.Model):
    __tablename__ = 'purchase_order'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    name = db.Column(db.String(200),nullable=False)
    describe = db.Column(db.Text(8000))
    url = db.Column(db.String(2000),nullable=False)
    date = db.Column(db.DateTime,default=datetime.datetime.utcnow)
    merchandiseClass = db.Column(db.Integer,nullable=False)
    shipping = db.Column(db.JSON)
    spec = db.Column(db.JSON)
    images = db.Column(db.JSON)
    condition = db.Column(db.JSON)
    ownerId = db.Column(db.Integer,db.ForeignKey('user.id'),nullable=False)
    def __init__(self,name,describe,url,merchandiseClass,spec,images,shipping,condition,ownerId):
        self.name = name
        self.describe = describe
        self.url = url
        self.merchandiseClass = merchandiseClass
        self.spec = spec
        self.images = images
        self.shipping = shipping
        self.condition = condition
        self.ownerId = ownerId


class Message(db.Model):
    __tablename__ = 'message'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    title = db.Column(db.Text)
    message = db.Column(db.Text)
    date = db.Column(db.DateTime,default=datetime.datetime.utcnow)
    image = db.relationship('Image',backref='message')
    def __init__(self,title,user_id,message):
        self.title = title
        self.message = message
        self.user_id = user_id


class Image(db.Model):
    __tablename__ = 'image'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    image_url = db.Column(db.String(1000))
    message_id = db.Column(db.Integer, db.ForeignKey('message.id'))
    date = db.Column(db.DateTime,default=datetime.datetime.utcnow)
    def __init__(self,image_url):
        self.image_url = image_url



'''
class BuyerList():
    __tablename__ = 'buyer'
    id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    buyerId = db.column(db.Integer,db.ForeignKey('user.id'))
    number = db.Column(db.Integer,nullable=False)
    merchandiseId = db.Column(db.Integer,db.ForeignKey('merchandise.id'))
    paymentState =db.Column(db.Integer,nullable=False)
    location = db.column(db.String(1000),nullable=False)
    date = db.Column(db.DateTime,default=datetime.datetime.utcnow)
'''