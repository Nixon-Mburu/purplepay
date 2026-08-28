import json
import os
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = Path(os.getenv("DATABASE_PATH", BASE_DIR / "webhooks.db"))


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    with get_connection() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS webhook_events (
                id TEXT PRIMARY KEY,
                provider TEXT NOT NULL,
                event_type TEXT NOT NULL,
                payload TEXT NOT NULL,
                processed INTEGER NOT NULL DEFAULT 0,
                received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                processed_at TEXT
            );
            """
        )


def event_to_dict(event):
    if event is None:
        return None

    try:
        payload = json.loads(event["payload"])
    except json.JSONDecodeError:
        payload = event["payload"]

    return {
        "id": event["id"],
        "provider": event["provider"],
        "event_type": event["event_type"],
        "payload": payload,
        "processed": bool(event["processed"]),
        "received_at": event["received_at"],
        "processed_at": event["processed_at"],
    }


def record_event(event_id, provider, event_type, payload):
    with get_connection() as connection:
        connection.execute(
            """
            INSERT OR IGNORE INTO webhook_events (
                id, provider, event_type, payload
            )
            VALUES (?, ?, ?, ?)
            """,
            (event_id, provider, event_type, payload),
        )
        connection.commit()
        return find_event(event_id)


def find_event(event_id):
    with get_connection() as connection:
        return connection.execute(
            "SELECT * FROM webhook_events WHERE id = ?",
            (event_id,),
        ).fetchone()


def mark_processed(event_id):
    with get_connection() as connection:
        connection.execute(
            """
            UPDATE webhook_events
            SET processed = 1, processed_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (event_id,),
        )
        connection.commit()
        return find_event(event_id)


def list_events(limit=25):
    with get_connection() as connection:
        return connection.execute(
            """
            SELECT * FROM webhook_events
            ORDER BY received_at DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
