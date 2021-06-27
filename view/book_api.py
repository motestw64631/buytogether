import re
from flask import Blueprint, json,session,jsonify,redirect,request
from model import *

book_api = Blueprint('book_api',__name__)

@book_api.route('/api/booking',methods=['POST'])
def post_booking():
    duplicate_flag = False
    normalize = request.form.get('normalize')
    spec_id = request.form.get('specId')
    number = request.form.get('bookingNumber')
    product_id = request.form.get('productId')
    #cart_name = f'cart_id_{product_id}'
    product = db.session.query(Product).filter_by(id=product_id).first()
    spec = db.session.query(Spec).filter_by(spec_id=spec_id).first()
    if normalize:
        if 'cart' not in session:
            session['cart']={}
        if f'product_{product_id}' not in session['cart']:
            session['cart'][f'product_{product_id}']={}
            session['cart'][f'product_{product_id}']['name']=product.name
            session['cart'][f'product_{product_id}']['image']=product.images[0].image_url
            session['cart'][f'product_{product_id}']['datas']=[]
        for data in session['cart'][f'product_{product_id}']['datas']:
            if data["specId"] == spec_id:
                data['number']=int(data['number'])+int(number)
                data['specTotalPrice']=int(spec.spec_price)*data['number']
                duplicate_flag = True
        if duplicate_flag==False:
            session['cart'][f'product_{product_id}']['datas'].append({
                'specId':spec_id,
                'specName':spec.spec_name,
                'number':number,
                'specTotalPrice':int(spec.spec_price)*int(number),
            })
        print(session['cart'])
        return {
            'ok':True
        }

@book_api.route('/api/booking',methods=['GET'])
def get_booking():
    if 'cart' not in session:
        return{
            'cart':None
        }
    return {
        'cart':session['cart']
    }

@book_api.route('/api/booking',methods=['DELETE'])
def delete_booking():
    product_id = request.args.get('productId')
    spec_id = request.args.get('specId')
    print(product_id)
    print(spec_id)
    for i,data in enumerate(session['cart'][f'{product_id}']['datas']):
        if data['specId']==spec_id:
            session['cart'][f'{product_id}']['datas'].pop(i)
    if len(session['cart'][f'{product_id}']['datas'])==0:
        session['cart'].pop(product_id)
    return {
        'ok':True
    }