import os
from flask import Blueprint, json,session,jsonify,redirect,request,make_response
import requests
from model.models import *
from cache import cache
import datetime


ledger = Blueprint('ledger',__name__)


@cache.memoize(60*30)
def calculate_balance(user):
    balance = 0
    for product in user.product:
        for order in product.order:
            balance+=order.total_price
    for withdraw in user.withdraw:
        balance-=withdraw.amount
    return balance


# @ledger.route('/api/debit',methods=['POST'])
# def deposit():
#     try:
#         rq = request.get_json()
#         debt = Debit(session['id'],rq['order_id'],rq['amount'],rq['receiver_id'])
#         db.session.add(debt)
#         db.session.commit()
#     except Exception as e:
#         print(e)
#         db.session.rollback()
#         return{
#             'error':True,
#         }



@ledger.route('/api/credit',methods=['POST'])
def withdraw():
    try:
        rq = request.get_json()
        credit = Credit(session['id'],rq['amount'])
        db.session.add(credit)
        db.session.commit()
        return{
            'ok':True
        }
    except Exception as e:
        print(e)
        db.session.rollback()
        return{
            'error':True,
        }

@ledger.route('/api/credit',methods=['GET'])
def get_ledger():
    if session['admin']!=True:
        er = {'error': True}
        return make_response(jsonify(er), 403)
    credit = db.session.query(Credit).all()
    datas = [{"creditStatus":data.activation,"creditId":data.id,"userId":data.user.id,"userEmail":data.user.email,"userBank":data.user.bank,"amount":data.amount,"blance":calculate_balance(db.session.query(User).filter_by(id=data.user_id).first()),"date":data.date} for data in credit]
    return {
        "data":datas
    }

@ledger.route('/api/account',methods=['GET'])
def get_account():
    if session['admin']!=True:
        er = {'error': True}
        return make_response(jsonify(er), 403)
    data = [order.total_price for order in db.session.query(Order).all()]
    credit_paid = [cdt.amount for cdt in db.session.query(Credit).filter_by(activation=True).all()]
    return{
        'amount':sum(data)-sum(credit_paid)
    }

@ledger.route('/api/creditstatus/<id>',methods=['GET'])
def pay_credit(id):
    if session['admin']!=True:
        er = {'error': True}
        return make_response(jsonify(er), 403)
    try:
        cdt = db.session.query(Credit).filter_by(id=id).first()
        cdt.activation=True
        db.session.commit()
        return{
            'ok':True
        }
    except Exception as e:
        print(e)
        db.session.rollback()
        return{
            'error':True
        }