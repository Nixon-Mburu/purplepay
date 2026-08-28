import json
from uuid import uuid4

from models import event_to_dict, list_events, mark_processed, record_event


def record_webhook_event(data):
    event_id = data.get("id") or f"EVT-{uuid4().hex[:8].upper()}"
    provider = (data.get("provider") or "purplepay-demo").strip()
    event_type = (data.get("event_type") or "activity.recorded").strip()
    payload = data.get("payload") or {}

    event = record_event(event_id, provider, event_type, json.dumps(payload))
    event = mark_processed(event["id"])

    return {"event": event_to_dict(event)}, 201


def list_webhook_events(limit=25):
    events = list_events(limit)
    return {"events": [event_to_dict(event) for event in events]}, 200
