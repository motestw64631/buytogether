from enum import unique
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import backref
from werkzeug.security import generate_password_hash,check_password_hash
import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100))
    password_hash = db.Column(db.String(500))
    provider = db.Column(db.String(100))
    confirm = db.Column(db.Boolean)
    image = db.Column(db.String(600))
    date = db.Column(db.DateTime,default=datetime.datetime.utcnow)
    product = db.relationship('Product',backref='user')
    message = db.relationship('Message',backref='user')
    order = db.relationship('Order',backref='user')
    chat_message = db.relationship('Chat_Message',backref='user')
    sub_message = db.relationship('Sub_Message',backref='user')
    def __init__(self,name,email,password,provider):
        self.name = name
        self.image = 'https://d84l4b8eh7ljv.cloudfront.net/animal_inu.png'
        self.email = email
        self.password_hash = generate_password_hash(password) if password is not None else None
        self.provider = provider
        self.confirm = False

    def __repr__(self):
        return f'<user {self.name}>'

class Chat_Room(db.Model):
    __tablename__ = 'chat_room'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    room_id = db.Column(db.Integer,unique=True)
    user_1_id = db.Column(db.Integer,db.ForeignKey('user.id'),nullable=False)
    user_2_id = db.Column(db.Integer,db.ForeignKey('user.id'),nullable=False)
    unread = db.Column(db.Boolean)
    last_activation_time = db.Column(db.DateTime,default=datetime.datetime.utcnow)
    date = db.Column(db.DateTime,default=datetime.datetime.utcnow)
    message = db.relationship('Chat_Message',backref='chat_room',passive_deletes=True)
    user_1 = db.relationship("User", foreign_keys=[user_1_id])
    user_2 = db.relationship("User", foreign_keys=[user_2_id])

    def __init__(self,room_id,user_1_id,user_2_id):
        self.room_id=room_id
        self.user_1_id=user_1_id
        self.user_2_id=user_2_id
        self.unread = True

class Chat_Message(db.Model):
    __tablename__ = 'chat_message'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    user_id = db.Column(db.Integer,db.ForeignKey('user.id'),nullable=False)
    chat_room_id = db.Column(db.Integer,db.ForeignKey('chat_room.id', ondelete='CASCADE'),nullable=False)
    content = db.Column(db.Text)
    date = db.Column(db.DateTime,default=datetime.datetime.utcnow)
    def __init__(self,user_id,chat_room_id,content):
        self.user_id = user_id
        self.chat_room_id = chat_room_id
        self.content = content

class Product(db.Model):
    __tablename__ = 'product'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    name = db.Column(db.String(200),nullable=False)
    describe = db.Column(db.Text(8000))
    url = db.Column(db.String(2000),nullable=False)
    date = db.Column(db.DateTime,default=datetime.datetime.utcnow)
    product_class = db.Column(db.Integer,nullable=False)
    status = db.Column(db.Integer,nullable=False)
    ownerId = db.Column(db.Integer,db.ForeignKey('user.id'),nullable=False)
    order = db.relationship('Order',backref='product', passive_deletes=True)
    spec = db.relationship('Spec',backref='product', passive_deletes=True)
    condition = db.relationship('Condition',backref='product', passive_deletes=True)
    images = db.relationship('Product_Image',backref='product', passive_deletes=True)
    shipping = db.relationship('Shipping',backref='product', passive_deletes=True)
    def __init__(self,name,describe,url,product_class,ownerId):
        self.name = name
        self.describe = describe
        self.url = url
        self.product_class = product_class
        self.status = 0
        self.ownerId = ownerId

class Condition(db.Model):
    __tablename__ = 'condition'
    __table_args__ = {'extend_existing': True}
    condition_id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    condition_class = db.Column(db.String(200),nullable=False)
    condition_number = db.Column(db.Integer)
    condition_date = db.Column(db.DateTime)
    condition_price = db.Column(db.Integer)
    date = db.Column(db.DateTime,default=datetime.datetime.utcnow)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id', ondelete='CASCADE'))
    def __init__(self,condition_class,condition_number=None,condition_date=None,condition_price=None):
        self.condition_class=condition_class
        self.condition_number=condition_number
        self.condition_date=condition_date
        self.condition_price=condition_price

class Spec(db.Model):
    __tablename__ = 'spec'
    __table_args__ = {'extend_existing': True}
    spec_id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    spec_name = db.Column(db.String(200),nullable=False)
    spec_price = db.Column(db.Integer)
    spec_number = db.Column(db.Integer)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id', ondelete='CASCADE'))
    def __init__(self,spec_name,spec_price=None,spec_number=None):
        self.spec_name=spec_name
        self.spec_price=spec_price
        self.spec_number=spec_number

class Shipping(db.Model):
    __tablename__ = 'shipping'
    __table_args__ = {'extend_existing': True}
    shipping_id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    seven = db.Column(db.Boolean,nullable=False)
    family = db.Column(db.Boolean,nullable=False)
    hilife = db.Column(db.Boolean,nullable=False)
    ok = db.Column(db.Boolean,nullable=False)
    home_delivery = db.Column(db.Boolean,nullable=False)
    face = db.Column(db.Boolean,nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id', ondelete='CASCADE'))
    def __init__(self,seven,family,hilife,ok,home_delivery,face):
        self.seven=seven
        self.family=family
        self.hilife=hilife
        self.ok=ok
        self.home_delivery = home_delivery
        self.face = face



class Message(db.Model):
    __tablename__ = 'message'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'))
    title = db.Column(db.Text)
    message = db.Column(db.Text)
    date = db.Column(db.DateTime,default=datetime.datetime.utcnow)
    image = db.relationship('Message_Image',backref='message')
    sub_message = db.relationship('Sub_Message',backref='message')
    def __init__(self,title,user_id,message):
        self.title = title
        self.message = message
        self.user_id = user_id

class Sub_Message(db.Model):
    __tablename__ = 'sub_message'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    message_id = db.Column(db.Integer, db.ForeignKey('message.id'))
    content = db.Column(db.Text)
    date = db.Column(db.DateTime,default=datetime.datetime.utcnow)
    def __init__(self,user_id,message_id,content):
        self.message_id = message_id
        self.user_id = user_id
        self.content = content

class Message_Image(db.Model):
    __tablename__ = 'message_image'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    image_url = db.Column(db.String(1000))
    message_id = db.Column(db.Integer, db.ForeignKey('message.id'))
    date = db.Column(db.DateTime,default=datetime.datetime.utcnow)
    def __init__(self,image_url):
        self.image_url = image_url

class Product_Image(db.Model):
    __tablename__ = 'product_image'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    image_url = db.Column(db.String(1000))
    product_id = db.Column(db.Integer, db.ForeignKey('product.id', ondelete='CASCADE'))
    date = db.Column(db.DateTime,default=datetime.datetime.utcnow)
    def __init__(self,image_url):
        self.image_url = image_url


class Order(db.Model):
    __tablename__ = 'order'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    buyer_id = db.Column(db.Integer,db.ForeignKey('user.id'))
    buyer_name = db.Column(db.String(200))
    buyer_phone = db.Column(db.String(300))
    buyer_mail = db.Column(db.String(500))
    product_id = db.Column(db.Integer,db.ForeignKey('product.id' , ondelete='CASCADE'))
    serial_number = db.Column(db.String(500),unique=True)
    shipping_way = db.Column(db.String(500))
    shipping_location = db.Column(db.String(500))
    total_price = db.Column(db.Integer,nullable=False)
    payment_state = db.Column(db.Boolean,nullable=False)
    message = db.Column(db.Text)
    date = db.Column(db.DateTime,default=datetime.datetime.utcnow)
    item = db.relationship('Order_Item',backref='order', passive_deletes=True)
    def __init__(self,buyer_id,buyer_name,buyer_phone,buyer_mail,product_id,shipping_way,shipping_location,total_price,payment_state,message):
        self.buyer_id = buyer_id
        self.buyer_name = buyer_name
        self.buyer_phone =buyer_phone
        self.buyer_mail = buyer_mail
        self.product_id = product_id
        self.shipping_way = shipping_way
        self.shipping_location = shipping_location
        self.total_price = total_price
        self.payment_state = payment_state
        self.message = message

class Order_Item(db.Model):
    __tablename__ = 'order_item'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    order_id = db.Column(db.Integer,db.ForeignKey('order.id' , ondelete='CASCADE'))
    item_name = db.Column(db.String(200),nullable=False)
    item_number = db.Column(db.Integer)
    item_total_price = db.Column(db.Integer)
    def __init__(self,item_name,item_number,item_total):
        self.item_name=item_name
        self.item_number=item_number
        self.item_total_price= item_total

