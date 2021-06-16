from dotenv import load_dotenv
load_dotenv()
from flask import Flask,render_template
from flask_migrate import Migrate
from config import Config
from model import db
from view.auth_wrap import login_auth


app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
migrate = Migrate(app,db,compare_type=True)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/purchase_order/<id>')
def purchaseGet(id):
    return render_template('merchandiseGet.html')

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

@app.route('/profile')
def profile():
    return render_template('profile.html')

from view.user import user_api
from view.purchaseorder_api import purchaseorder_api
from view.message_api import message_api

app.register_blueprint(user_api)
app.register_blueprint(purchaseorder_api)
app.register_blueprint(message_api)

if __name__ =='__main__':
    app.run(port='5000')