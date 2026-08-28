import os
from uuid import uuid4

import requests
from flask import Blueprint, jsonify, request

from models import record_request

ORDERS_SERVICE_URL = os.getenv("ORDERS_SERVICE_URL", "http://localhost:5002")
REQUEST_TIMEOUT_SECONDS = float(os.getenv("REQUEST_TIMEOUT_SECONDS", "5"))

orders_blueprint = Blueprint("orders", __name__, url_prefix="/api/orders")


def forward_orders_request(path):
    request_id = request.headers.get("X-Request-ID", str(uuid4()))
    target_url = f"{ORDERS_SERVICE_URL}{path}"
    headers = {
        "Content-Type": "application/json",
        "X-Request-ID": request_id,
    }

    auth_header = request.headers.get("Authorization")
    if auth_header:
        headers["Authorization"] = auth_header

    try:
        response = requests.request(
            method=request.method,
            url=target_url,
            json=request.get_json(silent=True),
            params=request.args,
            headers=headers,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.RequestException:
        record_request(request_id, request.method, request.path, "orders_service", 502)
        return jsonify({"error": "Orders service is unavailable"}), 502

    record_request(
        request_id,
        request.method,
        request.path,
        "orders_service",
        response.status_code,
    )

    try:
        payload = response.json()
    except ValueError:
        payload = {"message": response.text}

    return jsonify(payload), response.status_code


@orders_blueprint.get("")
@orders_blueprint.get("/")
def list_orders():
    return forward_orders_request("/orders")


@orders_blueprint.post("")
@orders_blueprint.post("/")
def create_order():
    return forward_orders_request("/orders")


@orders_blueprint.get("/<order_id>")
def get_order(order_id):
    return forward_orders_request(f"/orders/{order_id}")
