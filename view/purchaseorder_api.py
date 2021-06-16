from threading import Condition
from flask import Blueprint, json,session,jsonify,redirect,request
from model import *
from werkzeug.utils import secure_filename
from os import path
from bt3 import upload_file_to_s3

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
    images = {'images':image_urls}
    origin = request.form.get('origin')
    name = request.form.get('name')
    describe = request.form.get('describe')
    purchase_cls = request.form.get('cls')
    spec = request.form.get('spec')
    spec = json.loads(spec)
    spec = [value for key,value in spec.items()]
    spec = {'spec':spec}
    shipping = request.form.get('shipping')
    shipping = shipping.split(',')
    shipping = {'shipping':shipping}
    condition = request.form.get('condition')
    condition_value = request.form.get('conditionValue')
    condition = {str(condition):str(condition_value)}
    pc = PurchaseOrder(name=name,describe=describe,url=origin,merchandiseClass=purchase_cls,spec=spec,images=images,shipping=shipping,condition=condition,ownerId=session['id'])
    db.session.add(pc)
    db.session.commit()
    return jsonify({
        'ok':True
    })

@purchaseorder_api.route('/api/purchaseorders',methods=['GET'])
def getPs():
    cls = request.args.get('class')
    keyword = request.args.get('keyword')
    page = request.args.get('page')
    count = db.session.query(PurchaseOrder).count()
    page_count = count//6
    next_page = page+1 if page<page_count else None
    data = db.session.query(PurchaseOrder).slice(6*page,6*(page+1)).all()
    print(data)
    #data_json = [data_to_json(i) for i in data]
    return 'ok'
    #return {'nextPage':next_page,'data':data_json}