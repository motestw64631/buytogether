from logging import debug
from dotenv import load_dotenv
load_dotenv()
from flask import Flask,render_template,request
from flask_session import Session
from flask_migrate import Migrate
from flask_socketio import SocketIO,emit,join_room,send,leave_room
import os
from config import Config
from model import db
from view.auth_wrap import login_auth


app = Flask(__name__)
socketio = SocketIO(cors_allowed_origins="*")

app.config.from_object(Config)
Session(app)
db.init_app(app)
socketio.init_app(app)
migrate = Migrate(app,db,compare_type=True)


@app.route('/')
def home():
    return render_template('home.html')

@app.route('/product/<id>')
def product(id):
    return render_template('product.html')

@app.route('/purchase_set/')
@login_auth
def purchaseSet():
    return render_template('merchandisePost.html')

@app.route('/sign_up')
def sign_up():
    return render_template('sign_up.html')

@app.route('/sign_in')
def sign_in():
    return render_template('sign_in.html',client_id=os.getenv('google_oauth_client_id'),client_password=os.getenv('google_oauth_client_password'))

@app.route('/board')
@login_auth
def board():
    return render_template('board.html')

@app.route('/checkout')
def cart():
    return render_template('checkout.html')

@app.route('/profile')
@login_auth
def profile():
    return render_template('profile.html')

@app.route('/booking')
@login_auth
def group():
    return render_template('booking.html')

@app.route('/message')
@login_auth
def message():
    return render_template('message.html')

@app.route('/seller')
@login_auth
def seller():
    return render_template('seller.html')


@app.route('/seller/product/<p_id>')
@login_auth
def seller_product(p_id):
    return render_template('seller_product.html')

@app.route('/details')
@login_auth
def detail():
    return render_template('detail.html')


    

# @socketio.on('connect')
# def test_connect():
#     print('what')

@socketio.on('join')
def on_join(data):
    username = data['username']
    room = data['room']
    join_room(room)
    #send(username + f' has entered the room{room}.', room=room)

@socketio.on('leave')
def on_leave(data):
    username = data['username']
    room = data['room']
    leave_room(room)
    #send(username + ' has left the room.', to=room)


@socketio.on('receive message')
def handle_my_custom_event(msg):
    print(msg['message'])
    send(msg,room=msg['room'])
    

@socketio.on('json')
def handle_json(json):
    print('received json: ' + str(json))

from view.user import user_api
from view.product import product
from view.message_api import message_api
from view.sub_message_api import sub_message_api
from view.cart import cart
from view.chat_room import chat_room
from view.chat_message import chat_message
from view.order import order

app.register_blueprint(user_api)
app.register_blueprint(product)
app.register_blueprint(message_api)
app.register_blueprint(sub_message_api)
app.register_blueprint(cart)
app.register_blueprint(chat_room)
app.register_blueprint(chat_message)
app.register_blueprint(order)

if __name__ =='__main__':
    socketio.run(app, host="0.0.0.0",port=5000,debug=True)