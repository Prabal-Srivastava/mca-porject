from flask_jwt_extended import JWTManager

jwt = JWTManager()

def init_security(app):
    jwt.init_app(app)
