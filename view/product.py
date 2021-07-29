from datetime import time
from flask import Blueprint, json,session,jsonify,redirect,request
from sqlalchemy import or_
from model import *
from flask_sqlalchemy import inspect
from werkzeug.utils import secure_filename
from os import path
from bt3 import upload_file_to_s3

statusCode = {
    '0':'開團中',
    '1':'已成團',
    '2':'主購已下單',
    '3':'店家已出貨',
    '4':'主購已取貨',
    '5':'商品已寄出',
    '6':'團購結束'
}

def ship_model_to_json(md):
    ls = {"seven":md.seven,"family":md.family,"hilife":md.hilife,"ok":md.ok,"face":md.face,"home":md.home_delivery}
    return [key for key in ls if ls[key]==True]

product_class_code={
    "outfit":1,
    "makeup":2,
    "food":3,
    "3c":4,
    "travel":5,
    "other":6,
    }


product = Blueprint('product',__name__)

@product.route('/api/product',methods=['POST'])
def post_purchase():
    image_urls = []
    try:
        images = request.files.getlist('file')
        if len(images)!=0:
            for i,image in enumerate(images):
                url = upload_file_to_s3(image,'shauncc','purchase')
                image_urls.append(url)
        print(image_urls)
    except Exception as e:
        print(e)
    images = image_urls
    origin = request.form.get('origin')
    name = request.form.get('name')
    describe = request.form.get('describe')
    purchase_cls = request.form.get('cls')
    spec = request.form.get('spec')
    specs = json.loads(spec)
    # spec = [value for key,value in spec.items()]
    # spec = {'spec':spec}
    shipping = request.form.get('shipping')
    shipping = shipping.split(',')
    condition = request.form.get('condition')
    condition_value = request.form.get('conditionValue')
    condition = {str(condition):str(condition_value)}
    print(shipping)
    product = Product(name=name,describe=describe,url=origin,product_class=purchase_cls,ownerId=session['id'])
    for spec in specs:
        sp = Spec(spec_name=spec['name'],spec_price=spec['price'],spec_number=spec['number'])
        product.spec.append(sp)
    for image in images:
        img = Product_Image(image)
        product.images.append(img)
    if 'number' in condition:
        cdtion = Condition(condition_class=[k for k in condition.keys()][0],condition_number=condition['number'])
    elif 'time' in condition:
        cdtion = Condition(condition_class=[k for k in condition.keys()][0],condition_date=condition['time'])
    elif 'price' in condition:
        cdtion = Condition(condition_class=[k for k in condition.keys()][0],condition_price=condition['price'])
    product.condition.append(cdtion)
    seven = True if 'seven' in shipping else False
    family = True if 'family' in shipping else False
    hilife = True if 'hilife' in shipping else False
    ok = True if 'ok' in shipping else False
    face = True if 'face' in shipping else False
    home = True if 'home' in shipping else False
    ship = Shipping(seven=seven,family=family,hilife=hilife,ok=ok,face=face,home_delivery=home)
    product.shipping.append(ship) 
    db.session.add(product)
    db.session.commit()
    return jsonify({
        'ok':True
    })


@product.route('/api/product/<p_id>')
def productbyid(p_id):
    product = db.session.query(Product).filter_by(id=p_id).first()
    print(product.shipping)
    return {
        "owner":{
            "productOwnerID":product.user.id,
            "productOwnerName":product.user.name,
            "productOwnerImage":product.user.image
        },
        "data":{
            "productId":product.id,
            "productName":product.name,
            "productDescribe":product.describe,
            "productPostDate":product.date,
            "productSource":product.url,
            "productStatus":product.status,
            "productShip":ship_model_to_json(product.shipping[0]),
            "productSpec":[{'specId':spec.spec_id,'spec_name':spec.spec_name,'specNumber':spec.spec_number,'specPrice':spec.spec_price} for spec in product.spec],
            "productImage":[images.image_url for images in product.images],
            "productCondition":[{'condition':cdn.condition_class,'conditionNumber':cdn.condition_number,'conditionPrice':cdn.condition_price,'conditionDate':cdn.condition_date} for cdn in product.condition][0]
        }
    }


@product.route('/api/products',methods=['GET'])
def getPs():
    cls = request.args.get('class')
    #----find_by_user
    user_id = request.args.get('userId')
    if user_id:
        datas = db.session.query(Product).filter_by(ownerId=user_id).all()
        json_data=[]
        for data in datas:
            condition = data.condition[0].condition_class
            if condition=='number':
                value = data.condition[0].condition_number
                value_now = 0
                for order in data.order:
                    value_now +=sum([item.item_number for item in order.item])
                gap = value-value_now
            elif condition=='time':
                value = data.condition[0].condition_date
                value_now = datetime.datetime.utcnow()
                gap = (value-value_now).days
            elif condition=='price':
                value = data.condition[0].condition_price
                value_now = 0
                for order in data.order:
                    value_now+=order.total_price
                gap = value-value_now
            js={
                "productId":data.id,
                "productName":data.name,
                "productImage":data.images[0].image_url,
                "productStatus":data.status,
                "productDate":data.date,
                "productCondition":condition,
                "productConditionValue":value,
                "productConditionValueNow":value_now,
                "conditionGap":gap,
                "productBuyerNumber":len(data.order)
            }
            json_data.append(js)
        return {
            'data':json_data
            }
    #----
    keyword = request.args.get('keyword')
    page = int(request.args.get('page'))
    if not keyword:
        count = db.session.query(Product).filter_by(product_class=product_class_code[cls],status=0).count()
        page_count = count//8
        next_page = page+1 if page<page_count else None
        datas = db.session.query(Product).filter_by(product_class=product_class_code[cls],status=0).order_by(Product.date.desc()).slice(8*page,8*(page+1)).all()
    elif keyword: 
        count = db.session.query(Product).filter(or_(Product.name.like(f'%{keyword}%'),Product.describe.like(f'%{keyword}%'))).count()
        page_count = count//8
        next_page = page+1 if page<page_count else None
        datas = db.session.query(Product).filter(or_(Product.name.like(f'%{keyword}%'),Product.describe.like(f'%{keyword}%'))).order_by(Product.date.desc()).slice(8*page,8*(page+1)).all()
    json_data=[]
    for data in datas:                            
        condition = data.condition[0].condition_class
        if condition=='number':
            value = data.condition[0].condition_number
            value_now = 0
            for order in data.order:
                value_now +=sum([item.item_number for item in order.item])
            gap = value-value_now
        elif condition=='time':
            value = data.condition[0].condition_date
            value_now = datetime.datetime.utcnow()
            gap = (value-value_now).days
        elif condition=='price':
            value = data.condition[0].condition_price
            value_now = 0
            for order in data.order:
                value_now+=order.total_price
            gap = value-value_now
        js={
            "productId":data.id,
            "productName":data.name,
            "productImage":data.images[0].image_url,
            "condition":condition,
            "gap":gap
        }
        json_data.append(js)
    return {
        'nextPage':next_page,
        'data':json_data
        }


@product.route('/api/product',methods=['PATCH'])
def status_change():
    try:
        rq = request.get_json()
        if 'status' in rq:
            pid = rq['productId']
            status = rq['status']
            product = db.session.query(Product).filter_by(id=pid).first()
            product.status = int(status)
            #notify zone
            notify = Notify(f"{product.name} 商品狀態已變為 {statusCode[status]}")
            for order in product.order:
                order.user.new_message=True
                order.user.notify.append(notify)
            #
            db.session.commit()
            return {
                'ok':True
            }
    except Exception as e:
        print(e)
        db.session.rollback()
        return {
            'error':True
        },500

@product.route('/api/product',methods=['DELETE'])
def delete_product():
    try:
        rq = request.get_json()
        product_id = rq['productId']
        product = db.session.query(Product).filter_by(id=product_id).first()
        if product.ownerId!=session['id']:
            return{
                'error':True,
                'message':'not authorize'
            },403
        db.session.delete(product)
        db.session.commit()
        return {
            'ok':True
        }
    except Exception as e:
        print(e)
        db.session.rollback()
        return {
            'error':True
        },500