from flask import Flask, jsonify, request

from models import init_db
from wallet_data import get_wallet_summary, record_ledger_entry


def create_app():
    app = Flask(__name__)
    init_db()

    @app.get("/health")
    def health():
        return jsonify({"service": "wallet_service", "status": "healthy"})

    @app.get("/wallet/<user_id>")
    def wallet_show(user_id):
        result, status = get_wallet_summary(user_id)
        return jsonify(result), status

    @app.post("/wallet/ledger")
    def ledger_create():
        result, status = record_ledger_entry(request.get_json(silent=True) or {})
        return jsonify(result), status

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5003, debug=True)
