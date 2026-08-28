import os
from uuid import uuid4

import requests
from flask import Blueprint, jsonify, request

from models import record_request

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:5001")
REQUEST_TIMEOUT_SECONDS = float(os.getenv("REQUEST_TIMEOUT_SECONDS", "5"))

auth_blueprint = Blueprint("auth", __name__, url_prefix="/api/auth")


def forward_auth_request(path):
    request_id = request.headers.get("X-Request-ID", str(uuid4()))
    target_url = f"{AUTH_SERVICE_URL}{path}"
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
            headers=headers,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.RequestException:
        record_request(request_id, request.method, request.path, "auth_service", 502)
        return jsonify({"error": "Auth service is unavailable"}), 502

    record_request(
        request_id,
        request.method,
        request.path,
        "auth_service",
        response.status_code,
    )

    try:
        payload = response.json()
    except ValueError:
        payload = {"message": response.text}

    return jsonify(payload), response.status_code


@auth_blueprint.post("/register")
def register():
    return forward_auth_request("/register")


@auth_blueprint.post("/login")
def login():
    return forward_auth_request("/login")


@auth_blueprint.get("/me")
def me():
    return forward_auth_request("/me")


@auth_blueprint.post("/logout")
def logout():
    return forward_auth_request("/logout")
