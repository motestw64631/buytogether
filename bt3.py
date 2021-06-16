import boto3, botocore 
import os

access_key_id = os.getenv('access_key_id')
access_key_secret = os.getenv('access_key_secret')
s3_bucket = os.getenv('s3_bucket')

s3 = boto3.client(
    "s3",
    aws_access_key_id=access_key_id,
    aws_secret_access_key=access_key_secret
)

def upload_file_to_s3(file, bucket_name,folder):
    try:
        s3.upload_fileobj(file, bucket_name, f'{folder}/'+file.filename, ExtraArgs={'ContentType': file.content_type})
    except Exception as e:
        print("upload file {} failed! {}".format(file.filename, e))

    return f'http://d84l4b8eh7ljv.cloudfront.net/{folder}/{file.filename}'