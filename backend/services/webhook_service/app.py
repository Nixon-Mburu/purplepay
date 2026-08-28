from flask import Flask, jsonify, request

from models import init_db
from webhook_data import list_webhook_events, record_webhook_event


def create_app():
    app = Flask(__name__)
    init_db()

    @app.get("/health")
    def health():
        return jsonify({"service": "webhook_service", "status": "healthy"})

    @app.get("/events")
    def events_index():
        result, status = list_webhook_events(
            int(request.args.get("limit", "25")),
        )
        return jsonify(result), status

    @app.post("/events")
    def events_create():
        result, status = record_webhook_event(request.get_json(silent=True) or {})
        return jsonify(result), status

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005, debug=True)
