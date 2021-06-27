from flask import Blueprint, json,session,jsonify,redirect,request
from model import *
from flask_sqlalchemy import inspect
from werkzeug.utils import secure_filename
from os import path
from bt3 import upload_file_to_s3

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


purchaseorder_api = Blueprint('purchaseorder_api',__name__)

@purchaseorder_api.route('/api/purchaseorder',methods=['POST'])
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


@purchaseorder_api.route('/api/product/<p_id>')
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


@purchaseorder_api.route('/api/products',methods=['GET'])
def getPs():
    cls = request.args.get('class')
    keyword = request.args.get('keyword')
    page = int(request.args.get('page'))
    if keyword is None:
        count = db.session.query(Product).filter_by(product_class=product_class_code[cls]).count()
        page_count = count//8
        next_page = page+1 if page<page_count else None
        datas = db.session.query(Product).filter_by(product_class=product_class_code[cls]).slice(8*page,8*(page+1)).all()
        json_data=[]
        for data in datas:
            js={
                "productId":data.id,
                "productName":data.name,
                "productImage":data.images[0].image_url
            }
            json_data.append(js)
        return {
            'nextPage':next_page,
            'data':json_data
            }

