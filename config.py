import os
from redis import Redis
from datetime import timedelta

class Config():
    JSON_AS_ASCII=False
    SESSION_TYPE = 'redis' 
    SESSION_REDIS = Redis(host=os.getenv('redis_host'),port=os.getenv('redis_port')) 
    PERMANENT_SESSION_LIFETIME = timedelta(days=1)
    SESSION_USE_SIGNER = True
    TEMPLATES_AUTO_RELOAD=True
    JSON_SORT_KEYS = False
    JSONIFY_PRETTYPRINT_REGULAR = True
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{os.getenv('sql_account')}:{os.getenv('sql_secret')}@{os.getenv('sql_location')}:{os.getenv('sql_port')}/{os.getenv('sql_db')}"
    SECRET_KEY = os.getenv('secret_key')
    ENV = 'development'

    CACHE_TYPE = 'redis'
    CACHE_DEFAULT_TIMEOUT = 300
    CACHE_REDIS_HOST = os.getenv('redis_host')
    CACHE_REDIS_PORT =  os.getenv('redis_port')
    CACHE_KEY_PREFIX = 'SandS'

    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 465
    MAIL_USE_SSL = True
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER')