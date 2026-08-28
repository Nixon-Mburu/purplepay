from flask import Flask, jsonify
from flask_cors import CORS

from auth import auth_blueprint
from models import init_db


def create_app():
    app = Flask(__name__)
    CORS(app)
    init_db()

    app.register_blueprint(auth_blueprint)

    @app.get("/health")
    def health():
        return jsonify({"service": "api_gateway", "status": "healthy"})

    @app.get("/")
    def index():
        return jsonify(
            {
                "service": "api_gateway",
                "message": "PurplePay API gateway is running",
            }
        )

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
