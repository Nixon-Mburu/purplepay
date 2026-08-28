from flask import Flask, jsonify, request

from models import init_db
from order_data import create_order_for_user, get_order, list_user_orders


def create_app():
    app = Flask(__name__)
    init_db()

    @app.get("/health")
    def health():
        return jsonify({"service": "orders_service", "status": "healthy"})

    @app.get("/orders")
    def orders_index():
        user_id = request.args.get("user_id") or "demo-user"
        result, status = list_user_orders(user_id)
        return jsonify(result), status

    @app.post("/orders")
    def orders_create():
        result, status = create_order_for_user(request.get_json(silent=True) or {})
        return jsonify(result), status

    @app.get("/orders/<order_id>")
    def orders_show(order_id):
        result, status = get_order(order_id)
        return jsonify(result), status

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)
