import boto3, botocore 

access_key_id = 'AKIAWBGPPXPDLVPR3ZAO'
access_key_secret = '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'
s3_bucket = 'shauncc'

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