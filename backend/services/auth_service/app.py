from flask import Flask, jsonify, request

from auth_data import get_current_user, login_user, logout_user, register_user
from models import init_db


def create_app():
    app = Flask(__name__)
    init_db()

    @app.get("/health")
    def health():
        return jsonify({"service": "auth_service", "status": "healthy"})

    @app.post("/register")
    def register():
        result, status = register_user(request.get_json(silent=True) or {})
        return jsonify(result), status

    @app.post("/login")
    def login():
        result, status = login_user(request.get_json(silent=True) or {})
        return jsonify(result), status

    @app.get("/me")
    def me():
        result, status = get_current_user(request.headers.get("Authorization"))
        return jsonify(result), status

    @app.post("/logout")
    def logout():
        result, status = logout_user(request.headers.get("Authorization"))
        return jsonify(result), status

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
