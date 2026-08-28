from uuid import uuid4

from models import create_order, find_order, list_orders_for_user, order_to_dict


def create_order_for_user(data):
    merchant = (data.get("merchant") or "").strip()
    description = (data.get("description") or "").strip()
    amount = data.get("amount")
    currency = (data.get("currency") or "USD").strip().upper()
    user_id = str(data.get("user_id") or "demo-user")

    if not merchant or not description or amount in (None, ""):
        return {"error": "Merchant, description, and amount are required"}, 400

    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return {"error": "Amount must be a valid number"}, 400

    if amount <= 0:
        return {"error": "Amount must be greater than zero"}, 400

    order_id = f"ORD-{uuid4().hex[:8].upper()}"
    order = create_order(order_id, user_id, merchant, description, amount, currency)

    return {"order": order_to_dict(order)}, 201


def get_order(order_id):
    order = find_order(order_id)
    if order is None:
        return {"error": "Order not found"}, 404

    return {"order": order_to_dict(order)}, 200


def list_user_orders(user_id):
    orders = list_orders_for_user(str(user_id or "demo-user"))
    return {"orders": [order_to_dict(order) for order in orders]}, 200
