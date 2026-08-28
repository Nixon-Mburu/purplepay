import os
from uuid import uuid4

import requests

from models import (
    create_payment,
    find_payment,
    find_payment_by_idempotency_key,
    list_payments_for_user,
    payment_to_dict,
    update_payment_status,
)

WALLET_SERVICE_URL = os.getenv("WALLET_SERVICE_URL", "http://localhost:5003")
WEBHOOK_SERVICE_URL = os.getenv("WEBHOOK_SERVICE_URL", "http://localhost:5005")
REQUEST_TIMEOUT_SECONDS = float(os.getenv("REQUEST_TIMEOUT_SECONDS", "5"))


def create_payment_for_order(data, idempotency_key):
    order_id = (data.get("order_id") or data.get("orderId") or "").strip()
    merchant = (data.get("merchant") or "").strip()
    user_id = str(data.get("user_id") or "demo-user")
    amount = data.get("amount")
    currency = (data.get("currency") or "USD").strip().upper()

    if not idempotency_key:
        return {"error": "Idempotency-Key header is required"}, 400

    existing_payment = find_payment_by_idempotency_key(idempotency_key)
    if existing_payment:
        return {"payment": payment_to_dict(existing_payment)}, 200

    if not order_id or not merchant or amount in (None, ""):
        return {"error": "Order, merchant, and amount are required"}, 400

    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return {"error": "Amount must be a valid number"}, 400

    if amount <= 0:
        return {"error": "Amount must be greater than zero"}, 400

    payment_id = f"PAY-{uuid4().hex[:8].upper()}"
    create_payment(
        payment_id,
        order_id,
        user_id,
        merchant,
        amount,
        idempotency_key,
        currency,
    )
    payment = update_payment_status(payment_id, "successful")
    payment_payload = payment_to_dict(payment)

    _record_wallet_spend(payment_payload)
    _record_activity(payment_payload)

    return {"payment": payment_payload}, 201


def get_payment(payment_id):
    payment = find_payment(payment_id)
    if payment is None:
        return {"error": "Payment not found"}, 404

    return {"payment": payment_to_dict(payment)}, 200


def list_user_payments(user_id):
    payments = list_payments_for_user(str(user_id or "demo-user"))
    return {"payments": [payment_to_dict(payment) for payment in payments]}, 200


def _record_wallet_spend(payment):
    try:
        requests.post(
            f"{WALLET_SERVICE_URL}/wallet/ledger",
            json={
                "user_id": payment["user_id"],
                "payment_id": payment["id"],
                "entry_type": "debit",
                "amount": -abs(payment["amount"]),
                "description": f"Payment to {payment['merchant']}",
            },
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.RequestException:
        pass


def _record_activity(payment):
    try:
        requests.post(
            f"{WEBHOOK_SERVICE_URL}/events",
            json={
                "provider": "purplepay-demo",
                "event_type": "payment.successful",
                "payload": payment,
            },
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.RequestException:
        pass
