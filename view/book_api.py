import re
from flask import Blueprint, json,session,jsonify,redirect,request
from model import *

book_api = Blueprint('book_api',__name__)

def ship_model_to_json(md):
    ls = {"seven":md.seven,"family":md.family,"hilife":md.hilife,"ok":md.ok,"face":md.face,"home":md.home_delivery}
    return [key for key in ls if ls[key]==True]


@book_api.route('/api/booking',methods=['POST'])
def post_booking():
    duplicate_flag = False
    normalize = request.form.get('normalize')
    product_id = request.form.get('productId')
    product = db.session.query(Product).filter_by(id=product_id).first()
    if normalize=='1':
        spec_id = request.form.get('specId')
        number = request.form.get('bookingNumber')
        spec = db.session.query(Spec).filter_by(spec_id=spec_id).first()
        if 'cart' not in session:
            session['cart']={}
        if f'product_{product_id}' not in session['cart']:
            session['cart'][f'product_{product_id}']={}
            session['cart'][f'product_{product_id}']['productId']=product.id
            session['cart'][f'product_{product_id}']['normalize']=True
            session['cart'][f'product_{product_id}']['name']=product.name
            session['cart'][f'product_{product_id}']['shipping']=ship_model_to_json(product.shipping[0])
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
                'specPrice':spec.spec_price,
                'specTotalPrice':int(spec.spec_price)*int(number),
            })
        return {
            'ok':True
        }
    else:
        datas = request.form.get('data')
        datas = json.loads(datas)
        if 'cart' not in session:
            session['cart']={}
        if f'product_{product_id}' not in session['cart']:
            session['cart'][f'product_{product_id}']={}
            session['cart'][f'product_{product_id}']['productId']=product.id
            session['cart'][f'product_{product_id}']['normalize']=False
            session['cart'][f'product_{product_id}']['name']=product.name
            session['cart'][f'product_{product_id}']['shipping']=ship_model_to_json(product.shipping[0])
            session['cart'][f'product_{product_id}']['image']=product.images[0].image_url
            session['cart'][f'product_{product_id}']['datas']=[]
        for data in datas:
            for single_data in session['cart'][f'product_{product_id}']['datas']:
                if single_data["specName"]==data['spec']:
                    single_data['number']=int(single_data['number'])+int(data['number'])
                    single_data['specTotalPrice']=int(data['price'])*int(single_data['number'])
                    return {
                        'ok':True
                    }
            session['cart'][f'product_{product_id}']['datas'].append({
                'specName':data['spec'],
                'number':data['number'],
                'specPrice':data['price'],
                'specTotalPrice':int(data['price'])*int(data['number']),
            })
        return {
            'ok':True
        }

@book_api.route('/api/booking',methods=['GET'])
def get_booking():
    product_id = request.args.get('productId')
    if not product_id:
        if 'cart' not in session:
            return{
                'cart':None
            }
        return {
            'cart':session['cart']
        }
    elif product_id:
        for key in session['cart']:
            if key==f'product_{product_id}':
                return {
                    'data':session['cart'][key]
                }
    return{
        'data':None
    }



@book_api.route('/api/booking',methods=['DELETE'])
def delete_booking():
    product_id = request.args.get('productId')
    spec_name = request.args.get('specName')
    for i,data in enumerate(session['cart'][f'{product_id}']['datas']):
        if data['specName']==spec_name:
            session['cart'][f'{product_id}']['datas'].pop(i)
    if len(session['cart'][f'{product_id}']['datas'])==0:
        session['cart'].pop(product_id)
    return {
        'ok':True
    }