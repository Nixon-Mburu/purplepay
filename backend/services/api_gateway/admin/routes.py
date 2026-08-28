import os
from uuid import uuid4

import requests
from flask import Blueprint, jsonify, request

from models import record_request

ADMIN_SERVICE_URL = os.getenv("ADMIN_SERVICE_URL", "http://localhost:5006")
REQUEST_TIMEOUT_SECONDS = float(os.getenv("REQUEST_TIMEOUT_SECONDS", "5"))

admin_blueprint = Blueprint("admin", __name__, url_prefix="/api/admin")


def forward_admin_request(path):
    request_id = request.headers.get("X-Request-ID", str(uuid4()))
    headers = {"Content-Type": "application/json", "X-Request-ID": request_id}

    try:
        response = requests.request(
            method=request.method,
            url=f"{ADMIN_SERVICE_URL}{path}",
            json=request.get_json(silent=True),
            params=request.args,
            headers=headers,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.RequestException:
        record_request(request_id, request.method, request.path, "admin_service", 502)
        return jsonify({"error": "Admin service is unavailable"}), 502

    record_request(
        request_id,
        request.method,
        request.path,
        "admin_service",
        response.status_code,
    )

    try:
        payload = response.json()
    except ValueError:
        payload = {"message": response.text}

    return jsonify(payload), response.status_code


@admin_blueprint.get("/audit-logs")
def list_audit_logs():
    return forward_admin_request("/audit-logs")


@admin_blueprint.post("/audit-logs")
def create_audit_log():
    return forward_admin_request("/audit-logs")
