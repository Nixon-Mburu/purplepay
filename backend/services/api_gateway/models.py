import os
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = Path(os.getenv("DATABASE_PATH", BASE_DIR / "gateway.db"))


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    with get_connection() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS request_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                request_id TEXT NOT NULL,
                method TEXT NOT NULL,
                path TEXT NOT NULL,
                target_service TEXT NOT NULL,
                status_code INTEGER NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )


def record_request(request_id, method, path, target_service, status_code):
    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO request_logs (
                request_id, method, path, target_service, status_code
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (request_id, method, path, target_service, status_code),
        )
        return cursor.lastrowid


def list_recent_requests(limit=25):
    with get_connection() as connection:
        return connection.execute(
            """
            SELECT * FROM request_logs
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
