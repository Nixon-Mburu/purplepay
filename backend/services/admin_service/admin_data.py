from models import audit_log_to_dict, list_audit_logs, record_admin_action


def create_audit_log(data):
    admin_user_id = str(data.get("admin_user_id") or "admin-demo")
    action = (data.get("action") or "").strip()
    target_type = (data.get("target_type") or "").strip()
    target_id = (data.get("target_id") or "").strip()
    notes = data.get("notes")

    if not action or not target_type or not target_id:
        return {"error": "Action, target type, and target ID are required"}, 400

    log_id = record_admin_action(
        admin_user_id,
        action,
        target_type,
        target_id,
        notes,
    )

    return {"audit_log_id": log_id}, 201


def list_logs(limit=50):
    logs = list_audit_logs(limit)
    return {"audit_logs": [audit_log_to_dict(log) for log in logs]}, 200
