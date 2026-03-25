from flask import Flask
from flask_cors import CORS
from app.api.routes import api_bp
from app.api.websocket import socketio
from app.core.config import Config
from app.core.database import init_db
from app.core.security import init_security
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# Import all blueprints
from app.blueprints.auth import auth_bp
from app.blueprints.projects import projects_bp
from app.blueprints.ai import ai_bp
from app.blueprints.execution import execution_bp
from app.blueprints.codevault import codevault_bp
from app.blueprints.codemetrics import codemetrics_bp
from app.blueprints.codemap import codemap_bp
from app.blueprints.taskboard import taskboard_bp
from app.blueprints.tests import tests_bp
from app.blueprints.admin import admin_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    # Initialize Core Modules
    init_db()
    init_security(app)
    limiter.init_app(app)
    socketio.init_app(app, cors_allowed_origins="*")

    # Register Blueprints
    app.register_blueprint(api_bp, url_prefix="/api/v1")
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(projects_bp, url_prefix="/history") # Kept as /history to avoid breaking frontend
    app.register_blueprint(ai_bp, url_prefix="/ai")
    app.register_blueprint(execution_bp, url_prefix="") # Matches /job/<id> for frontend polling
    app.register_blueprint(codevault_bp, url_prefix="/codevault")
    app.register_blueprint(codemetrics_bp, url_prefix="/metrics")
    app.register_blueprint(codemap_bp, url_prefix="/codemap")
    app.register_blueprint(taskboard_bp, url_prefix="/tasks")
    app.register_blueprint(tests_bp, url_prefix="/tests")
    app.register_blueprint(admin_bp, url_prefix="/admin")

    @app.route("/")
    def home():
        return {"message": "CodeForge Flask API running"}

    return app

if __name__ == "__main__":
    app = create_app()
    socketio.run(app, host="0.0.0.0", port=8000)
