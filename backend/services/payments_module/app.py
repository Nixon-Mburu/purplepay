from flask import Flask, jsonify, request

from models import init_db
from payment_data import create_payment_for_order, get_payment, list_user_payments


def create_app():
    app = Flask(__name__)
    init_db()

    @app.get("/health")
    def health():
        return jsonify({"service": "payments_module", "status": "healthy"})

    @app.get("/payments")
    def payments_index():
        user_id = request.args.get("user_id") or "demo-user"
        result, status = list_user_payments(user_id)
        return jsonify(result), status

    @app.post("/payments")
    def payments_create():
        result, status = create_payment_for_order(
            request.get_json(silent=True) or {},
            request.headers.get("Idempotency-Key"),
        )
        return jsonify(result), status

    @app.get("/payments/<payment_id>")
    def payments_show(payment_id):
        result, status = get_payment(payment_id)
        return jsonify(result), status

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5004, debug=True)
