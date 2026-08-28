from flask import Flask, jsonify, request

from admin_data import create_audit_log, list_logs
from models import init_db


def create_app():
    app = Flask(__name__)
    init_db()

    @app.get("/health")
    def health():
        return jsonify({"service": "admin_service", "status": "healthy"})

    @app.get("/audit-logs")
    def audit_logs_index():
        result, status = list_logs(int(request.args.get("limit", "50")))
        return jsonify(result), status

    @app.post("/audit-logs")
    def audit_logs_create():
        result, status = create_audit_log(request.get_json(silent=True) or {})
        return jsonify(result), status

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5006, debug=True)
