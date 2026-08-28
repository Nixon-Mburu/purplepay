import os
from uuid import uuid4

import requests
from flask import Blueprint, jsonify, request

from models import record_request

WALLET_SERVICE_URL = os.getenv("WALLET_SERVICE_URL", "http://localhost:5003")
REQUEST_TIMEOUT_SECONDS = float(os.getenv("REQUEST_TIMEOUT_SECONDS", "5"))

wallet_blueprint = Blueprint("wallet", __name__, url_prefix="/api/wallet")


def forward_wallet_request(path):
    request_id = request.headers.get("X-Request-ID", str(uuid4()))
    headers = {"Content-Type": "application/json", "X-Request-ID": request_id}

    auth_header = request.headers.get("Authorization")
    if auth_header:
        headers["Authorization"] = auth_header

    try:
        response = requests.request(
            method=request.method,
            url=f"{WALLET_SERVICE_URL}{path}",
            json=request.get_json(silent=True),
            params=request.args,
            headers=headers,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.RequestException:
        record_request(request_id, request.method, request.path, "wallet_service", 502)
        return jsonify({"error": "Wallet service is unavailable"}), 502

    record_request(
        request_id,
        request.method,
        request.path,
        "wallet_service",
        response.status_code,
    )

    try:
        payload = response.json()
    except ValueError:
        payload = {"message": response.text}

    return jsonify(payload), response.status_code


@wallet_blueprint.get("/<user_id>")
def get_wallet(user_id):
    return forward_wallet_request(f"/wallet/{user_id}")
