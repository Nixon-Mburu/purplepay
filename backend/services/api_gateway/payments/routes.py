import os
from uuid import uuid4

import requests
from flask import Blueprint, jsonify, request

from models import record_request

PAYMENTS_SERVICE_URL = os.getenv("PAYMENTS_SERVICE_URL", "http://localhost:5004")
REQUEST_TIMEOUT_SECONDS = float(os.getenv("REQUEST_TIMEOUT_SECONDS", "5"))

payments_blueprint = Blueprint("payments", __name__, url_prefix="/api/payments")


def forward_payments_request(path):
    request_id = request.headers.get("X-Request-ID", str(uuid4()))
    headers = {"Content-Type": "application/json", "X-Request-ID": request_id}

    for header in ["Authorization", "Idempotency-Key"]:
        value = request.headers.get(header)
        if value:
            headers[header] = value

    try:
        response = requests.request(
            method=request.method,
            url=f"{PAYMENTS_SERVICE_URL}{path}",
            json=request.get_json(silent=True),
            params=request.args,
            headers=headers,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.RequestException:
        record_request(request_id, request.method, request.path, "payments_module", 502)
        return jsonify({"error": "Payments service is unavailable"}), 502

    record_request(
        request_id,
        request.method,
        request.path,
        "payments_module",
        response.status_code,
    )

    try:
        payload = response.json()
    except ValueError:
        payload = {"message": response.text}

    return jsonify(payload), response.status_code


@payments_blueprint.get("")
@payments_blueprint.get("/")
def list_payments():
    return forward_payments_request("/payments")


@payments_blueprint.post("")
@payments_blueprint.post("/")
def create_payment():
    return forward_payments_request("/payments")


@payments_blueprint.get("/<payment_id>")
def get_payment(payment_id):
    return forward_payments_request(f"/payments/{payment_id}")
