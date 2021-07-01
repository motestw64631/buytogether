from flask import Blueprint, json,session,jsonify,redirect,request
import requests
from model import *


order_api = Blueprint('order_api',__name__)
x_api_key = 'app_7Fi2UXMJtILHGttCgepAdkVADp0PhDv2c4XzeQvl9xFQyZlP7f0ajPyjqpUg'

def prime_to_tappay(prime,price,phone,name,email):
    header = {
        "Content-Type": "application/json",
        "x-api-key": x_api_key
    }
    body = {
        "prime": str(prime),
        "partner_key": x_api_key,
        "merchant_id": "myweb_CTBC",
        "details":"TapPay Test",
        "amount": price,
        "cardholder": {
            "phone_number": "+886"+phone[1:],
            "name": name,
            "email": email,
        }
    }
    print(body)
    return requests.post('https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime',headers=header,data=json.dumps(body))


@order_api.route('/api/order',methods=['POST'])
def post_order():
    pass