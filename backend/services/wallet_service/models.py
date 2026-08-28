import os
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = Path(os.getenv("DATABASE_PATH", BASE_DIR / "wallet.db"))


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    with get_connection() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS wallets (
                user_id TEXT PRIMARY KEY,
                balance REAL NOT NULL DEFAULT 0,
                currency TEXT NOT NULL DEFAULT 'USD',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS ledger_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                payment_id TEXT,
                entry_type TEXT NOT NULL,
                amount REAL NOT NULL,
                description TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES wallets (user_id)
            );
            """
        )


def wallet_to_dict(wallet):
    if wallet is None:
        return None

    return {
        "user_id": wallet["user_id"],
        "balance": wallet["balance"],
        "currency": wallet["currency"],
        "created_at": wallet["created_at"],
        "updated_at": wallet["updated_at"],
    }


def ledger_entry_to_dict(entry):
    if entry is None:
        return None

    return {
        "id": entry["id"],
        "user_id": entry["user_id"],
        "payment_id": entry["payment_id"],
        "entry_type": entry["entry_type"],
        "amount": entry["amount"],
        "description": entry["description"],
        "created_at": entry["created_at"],
    }


def create_wallet(user_id, opening_balance=0, currency="USD"):
    with get_connection() as connection:
        connection.execute(
            """
            INSERT OR IGNORE INTO wallets (user_id, balance, currency)
            VALUES (?, ?, ?)
            """,
            (user_id, opening_balance, currency),
        )
        connection.commit()
        return get_wallet(user_id)


def get_wallet(user_id):
    with get_connection() as connection:
        return connection.execute(
            "SELECT * FROM wallets WHERE user_id = ?",
            (user_id,),
        ).fetchone()


def add_ledger_entry(user_id, entry_type, amount, description, payment_id=None):
    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO ledger_entries (
                user_id, payment_id, entry_type, amount, description
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (user_id, payment_id, entry_type, amount, description),
        )
        connection.execute(
            """
            UPDATE wallets
            SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
            """,
            (amount, user_id),
        )
        connection.commit()
        return get_wallet(user_id)


def list_ledger_entries(user_id):
    with get_connection() as connection:
        return connection.execute(
            """
            SELECT * FROM ledger_entries
            WHERE user_id = ?
            ORDER BY created_at DESC, id DESC
            """,
            (user_id,),
        ).fetchall()
