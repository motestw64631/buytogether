import boto3, botocore 
import os
import datetime
import cv2
import numpy

access_key_id = os.getenv('access_key_id')
access_key_secret = os.getenv('access_key_secret')
s3_bucket = os.getenv('s3_bucket')

s3 = boto3.client(
    "s3",
    aws_access_key_id=access_key_id,
    aws_secret_access_key=access_key_secret
)

def read_from_decode(file):
    filestr = file.read()
    npimg = numpy.fromstring(filestr, numpy.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    return img

def compress_image(img):
    target_size = 1000
    (h, w) = img.shape[:2]
    if h>target_size or w>target_size:
        if h>w:
            ratio = target_size/h
            dim = (int(w * ratio),target_size)
        elif w>h:
            ratio = target_size/w
            dim = (target_size,int(h * ratio))
        elif w==h:
            dim = (target_size,target_size)
        resized = cv2.resize(img, dim, interpolation=cv2.INTER_AREA)
        print(f'image from {h},{w},to {resized.shape[0]},{resized.shape[1]}')
        return resized
    return img


def upload_file_to_s3(file, bucket_name,folder):
    try:
        img = read_from_decode(file)
        resized = compress_image(img)
        temp_file_path = f'./temp_image/{file.filename}'
        print(temp_file_path)
        cv2.imwrite(temp_file_path,resized)
        object_name = f'{folder}/'+f"{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_"+file.filename
        s3.upload_file(temp_file_path, bucket_name,object_name)
        #s3.upload_fileobj(file, bucket_name, f'{folder}/'+file.filename, ExtraArgs={'ContentType': file.content_type})
    except Exception as e:
        print("upload file {} failed! {}".format(file.filename, e))
    finally:
        if os.path.isfile(temp_file_path):
            os.remove(temp_file_path)


    return f'https://d84l4b8eh7ljv.cloudfront.net/{object_name}'