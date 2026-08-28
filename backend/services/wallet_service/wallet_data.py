from models import (
    add_ledger_entry,
    create_wallet,
    get_wallet,
    ledger_entry_to_dict,
    list_ledger_entries,
    wallet_to_dict,
)

DEFAULT_OPENING_BALANCE = 426.75


def get_wallet_summary(user_id):
    user_id = str(user_id or "demo-user")
    wallet = get_wallet(user_id) or create_wallet(user_id, DEFAULT_OPENING_BALANCE)
    entries = list_ledger_entries(user_id)

    return {
        "wallet": wallet_to_dict(wallet),
        "ledger": [ledger_entry_to_dict(entry) for entry in entries],
    }, 200


def record_ledger_entry(data):
    user_id = str(data.get("user_id") or "demo-user")
    entry_type = (data.get("entry_type") or "").strip().lower()
    amount = data.get("amount")
    description = (data.get("description") or "").strip()
    payment_id = data.get("payment_id")

    if entry_type not in ["credit", "debit"]:
        return {"error": "Entry type must be credit or debit"}, 400

    if amount in (None, "") or not description:
        return {"error": "Amount and description are required"}, 400

    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return {"error": "Amount must be a valid number"}, 400

    wallet = get_wallet(user_id) or create_wallet(user_id, DEFAULT_OPENING_BALANCE)
    next_balance = wallet["balance"] + amount
    if next_balance < 0:
        return {"error": "Insufficient wallet balance"}, 409

    updated_wallet = add_ledger_entry(
        user_id,
        entry_type,
        amount,
        description,
        payment_id,
    )

    return {"wallet": wallet_to_dict(updated_wallet)}, 201
