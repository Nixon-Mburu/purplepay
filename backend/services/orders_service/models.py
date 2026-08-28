import os
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = Path(os.getenv("DATABASE_PATH", BASE_DIR / "orders.db"))


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    with get_connection() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                merchant TEXT NOT NULL,
                description TEXT NOT NULL,
                amount REAL NOT NULL,
                currency TEXT NOT NULL DEFAULT 'USD',
                status TEXT NOT NULL DEFAULT 'ready_to_pay',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )


def create_order(order_id, user_id, merchant, description, amount, currency="USD"):
    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO orders (id, user_id, merchant, description, amount, currency)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (order_id, user_id, merchant, description, amount, currency),
        )
        return find_order(order_id)


def find_order(order_id):
    with get_connection() as connection:
        return connection.execute(
            "SELECT * FROM orders WHERE id = ?",
            (order_id,),
        ).fetchone()


def list_orders():
    with get_connection() as connection:
        return connection.execute(
            "SELECT * FROM orders ORDER BY created_at DESC",
        ).fetchall()
