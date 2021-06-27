from flask import Blueprint, json,session,jsonify,redirect,request
from model import *

book_api = Blueprint('book_api',__name__)

@book_api.route('/api/booking',methods=['POST'])
def post_booking():
    pass