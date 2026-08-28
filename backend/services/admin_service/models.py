import os
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = Path(os.getenv("DATABASE_PATH", BASE_DIR / "admin.db"))


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    with get_connection() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS admin_audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                admin_user_id TEXT NOT NULL,
                action TEXT NOT NULL,
                target_type TEXT NOT NULL,
                target_id TEXT NOT NULL,
                notes TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )


def audit_log_to_dict(log):
    if log is None:
        return None

    return {
        "id": log["id"],
        "admin_user_id": log["admin_user_id"],
        "action": log["action"],
        "target_type": log["target_type"],
        "target_id": log["target_id"],
        "notes": log["notes"],
        "created_at": log["created_at"],
    }


def record_admin_action(admin_user_id, action, target_type, target_id, notes=None):
    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO admin_audit_logs (
                admin_user_id, action, target_type, target_id, notes
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (admin_user_id, action, target_type, target_id, notes),
        )
        connection.commit()
        return cursor.lastrowid


def list_audit_logs(limit=50):
    with get_connection() as connection:
        return connection.execute(
            """
            SELECT * FROM admin_audit_logs
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
