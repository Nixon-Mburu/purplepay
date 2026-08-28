import os
from uuid import uuid4

import requests
from flask import Blueprint, jsonify, request

from models import record_request

WEBHOOK_SERVICE_URL = os.getenv("WEBHOOK_SERVICE_URL", "http://localhost:5005")
REQUEST_TIMEOUT_SECONDS = float(os.getenv("REQUEST_TIMEOUT_SECONDS", "5"))

activity_blueprint = Blueprint("activity", __name__, url_prefix="/api/activity")


def forward_activity_request(path):
    request_id = request.headers.get("X-Request-ID", str(uuid4()))
    headers = {"Content-Type": "application/json", "X-Request-ID": request_id}

    try:
        response = requests.request(
            method=request.method,
            url=f"{WEBHOOK_SERVICE_URL}{path}",
            json=request.get_json(silent=True),
            params=request.args,
            headers=headers,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.RequestException:
        record_request(request_id, request.method, request.path, "webhook_service", 502)
        return jsonify({"error": "Activity service is unavailable"}), 502

    record_request(
        request_id,
        request.method,
        request.path,
        "webhook_service",
        response.status_code,
    )

    try:
        payload = response.json()
    except ValueError:
        payload = {"message": response.text}

    return jsonify(payload), response.status_code


@activity_blueprint.get("")
@activity_blueprint.get("/")
def list_activity():
    return forward_activity_request("/events")
