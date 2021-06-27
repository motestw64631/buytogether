from dotenv import load_dotenv
load_dotenv()
from flask import Flask,render_template
from flask_session import Session
from flask_migrate import Migrate
from config import Config
from model import db
from view.auth_wrap import login_auth


app = Flask(__name__)
app.config.from_object(Config)
Session(app)

db.init_app(app)
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
    return render_template('sign_in.html')

@app.route('/board')
@login_auth
def board():
    return render_template('board.html')

@app.route('/cart')
def cart():
    return render_template('cart.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

from view.user import user_api
from view.purchaseorder_api import purchaseorder_api
from view.message_api import message_api
from view.sub_message_api import sub_message_api
from view.book_api import book_api

app.register_blueprint(user_api)
app.register_blueprint(purchaseorder_api)
app.register_blueprint(message_api)
app.register_blueprint(sub_message_api)
app.register_blueprint(book_api)

if __name__ =='__main__':
    app.run(host='0.0.0.0',port='5000')