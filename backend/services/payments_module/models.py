import os
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = Path(os.getenv("DATABASE_PATH", BASE_DIR / "payments.db"))


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    with get_connection() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS payments (
                id TEXT PRIMARY KEY,
                order_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                merchant TEXT NOT NULL,
                amount REAL NOT NULL,
                currency TEXT NOT NULL DEFAULT 'USD',
                status TEXT NOT NULL DEFAULT 'pending',
                idempotency_key TEXT NOT NULL UNIQUE,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )


def payment_to_dict(payment):
    if payment is None:
        return None

    status_labels = {
        "pending": "Pending",
        "successful": "Successful",
        "failed": "Failed",
        "refunded": "Refunded",
    }

    return {
        "id": payment["id"],
        "orderId": payment["order_id"],
        "order_id": payment["order_id"],
        "user_id": payment["user_id"],
        "merchant": payment["merchant"],
        "amount": payment["amount"],
        "currency": payment["currency"],
        "status": status_labels.get(payment["status"], payment["status"]),
        "idempotency_key": payment["idempotency_key"],
        "created_at": payment["created_at"],
        "updated_at": payment["updated_at"],
    }


def create_payment(
    payment_id,
    order_id,
    user_id,
    merchant,
    amount,
    idempotency_key,
    currency="USD",
):
    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO payments (
                id, order_id, user_id, merchant, amount, currency, idempotency_key
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (payment_id, order_id, user_id, merchant, amount, currency, idempotency_key),
        )
        connection.commit()
        return find_payment(payment_id)


def find_payment(payment_id):
    with get_connection() as connection:
        return connection.execute(
            "SELECT * FROM payments WHERE id = ?",
            (payment_id,),
        ).fetchone()


def update_payment_status(payment_id, status):
    with get_connection() as connection:
        connection.execute(
            """
            UPDATE payments
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (status, payment_id),
        )
        connection.commit()
        return find_payment(payment_id)


def find_payment_by_idempotency_key(idempotency_key):
    with get_connection() as connection:
        return connection.execute(
            "SELECT * FROM payments WHERE idempotency_key = ?",
            (idempotency_key,),
        ).fetchone()


def list_payments_for_user(user_id):
    with get_connection() as connection:
        return connection.execute(
            """
            SELECT * FROM payments
            WHERE user_id = ?
            ORDER BY created_at DESC
            """,
            (user_id,),
        ).fetchall()
