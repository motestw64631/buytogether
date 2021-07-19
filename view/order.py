import re
import os
from flask import Blueprint, json,session,jsonify,redirect,request
import requests
from model import *
import datetime
from view.ledger import calculate_balance


order = Blueprint('order',__name__)

x_api_key = os.getenv('tap_pay_x_api_key')


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
    return requests.post('https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime',headers=header,data=json.dumps(body).encode('utf-8'))


@order.route('/api/order',methods=['POST'])
def post_order():
    rq = request.get_json()
    response = prime_to_tappay(rq['prime'],rq['productTotalPrice'],rq['phone'],rq['name'],rq['mail'])
    payment_status = True if response.status_code==200 else False
    order = Order(rq['buyerId'],rq['name'],rq['phone'],rq['mail'],rq['productId'],rq['shipWay'],rq['shipValue'],rq['productTotalPrice'],payment_status,rq['message'])
    serial_number = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    order.serial_number = serial_number
    for item in rq['productItem']:
        order.item.append(Order_Item(item['specName'],item['number'],item['specTotalPrice']))
    db.session.add(order)
    db.session.commit()
    #notify for owner
    db.session.refresh(order)
    notify = Notify(f"{order.user.name} 已加入團購 {order.product.name}")
    order.product.user.notify.append(notify)
    order.product.user.new_message=True
    #notify for condition check
    print(order.product.condition[0].condition_class)
    if order.product.condition[0].condition_class=='number':
        condition_number = order.product.condition[0].condition_number
        now_number = sum([sum([item.item_number for item in order.item]) for order in order.product.order])
        if now_number>=condition_number:
            notify = Notify(f"{order.product.name} 目前購買總數為{now_number}個,已達到成團條件{condition_number}個")
            order.product.user.notify.append(notify)
            order.product.user.new_message=True
    elif order.product.condition[0].condition_class=='price':
        condition_price = order.product.condition[0].condition_price
        now_price = sum([order.total_price for order in order.product.order])
        print(condition_price,now_price)
        if now_price>=condition_price:
            notify = Notify(f"{order.product.name} 目前購買總金額為{now_price}元,已達到成團條件{condition_price}元")
            order.product.user.notify.append(notify)
            order.product.user.new_message=True
    db.session.commit()
    return{
        "ok":True,
        "serial_number":serial_number
    }

@order.route('/api/orders',methods=['GET'])
def get_orders():
    #get order by product
    p_id = request.args.get('productId')
    if p_id:
        product = db.session.query(Product).filter_by(id=p_id).first()
        condition = product.condition[0].condition_class
        if condition=='number':
            value = product.condition[0].condition_number
            value_now = 0
            for order in product.order:
                value_now +=sum([item.item_number for item in order.item])
            gap = value-value_now
        elif condition=='time':
            value = product.condition[0].condition_date
            value_now = datetime.datetime.utcnow()
            gap = (value-value_now).days
        elif condition=='price':
            value = product.condition[0].condition_price
            value_now = 0
            for order in product.order:
                value_now+=order.total_price
            gap = value-value_now
        js = {
            "productId":product.id,
            "productName":product.name,
            "productImage":product.images[0].image_url,
            "productDate":product.date,
            "productStatus":product.status,
            "productCondition":condition,
            "productConditionValue":value,
            "productConditionValueNow":value_now,
            "conditionGap":gap,
            "productBuyerNumber":len(product.order)
        }
        orders = []
        for order in product.order:
            order_temp_json = {
                "userId":order.user.id,
                "userName":order.user.name,
                "userImage":order.user.image,
                "serialNumber":order.serial_number,
                "orderId":order.id,
                "totalPrice":order.total_price,
                "buyerName":order.buyer_name,
                "buyerPhone":order.buyer_phone,
                "buyerMail":order.buyer_mail,
                "ship":order.shipping_way,
                "shipTo":order.shipping_location,
                "message":order.message,
                "orderDate":order.date
            }
            item_js = []
            for item in order.item:
                item_temp_js = {
                "itemName":item.item_name,
                "itemNumber":item.item_number,
                "itemTotalPrice":item.item_total_price
                }
                item_js.append(item_temp_js)
            order_temp_json['items']=item_js  
            orders.append(order_temp_json)
        js['orders']=orders
        return{
            "data":js
        }
    #normal get
    orders = db.session.query(Order).filter_by(buyer_id=session['id']).all()
    data = []
    for order in orders:
        order_js = {
            "orderId":order.id,
            "orderStatus":order.product.status,
            "serialNumber":order.serial_number,
            "productId":order.product_id,
            "productName":order.product.name,
            "productImage":order.product.images[0].image_url,
            "productStatus":order.product.status,
            "orderPrice":order.total_price,
            "buyerName":order.buyer_name,
            "buyerPhone":order.buyer_phone,
            "buyerMail":order.buyer_mail,
            "ship":order.shipping_way,
            "shipTo":order.shipping_location,
            "message":order.message,
            "orderDate":order.date
        }
        item_js = []
        for item in order.item:
            js = {
                "itemName":item.item_name,
                "itemNumber":item.item_number,
                "itemTotalPrice":item.item_total_price
            }
            item_js.append(js)
        order_js["item"]=item_js
        data.append(order_js)
    return{
        "data":data
    }

@order.route('/api/order/<order_id>',methods=['GET'])
def get_order(order_id):
    order = db.session.query(Order).filter_by(id=order_id).first()
    return {
        "buyerName":order.buyer_name,
        "buyerPhone":order.buyer_phone,
        "buyerMail":order.buyer_mail,
        "ship":order.shipping_way,
        "shipTo":order.shipping_location,
        "message":order.message
    }
