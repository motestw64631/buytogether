import os

class Config():
    JSON_AS_ASCII=False
    TEMPLATES_AUTO_RELOAD=True
    JSON_SORT_KEYS = False
    JSONIFY_PRETTYPRINT_REGULAR = True
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{os.getenv('sql_account')}:{os.getenv('sql_secret')}@{os.getenv('sql_location')}:{os.getenv('sql_port')}/{os.getenv('sql_db')}"
    SECRET_KEY = os.getenv('secret_key')
    ENV = 'development'