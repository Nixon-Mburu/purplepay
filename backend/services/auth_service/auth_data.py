from datetime import datetime, timedelta, UTC
from secrets import token_urlsafe
from sqlite3 import IntegrityError

from werkzeug.security import check_password_hash, generate_password_hash

from models import (
    create_session,
    create_user,
    delete_session,
    find_session_by_token,
    find_user_by_id,
    find_user_by_email,
    user_to_dict,
)

TOKEN_HOURS = 24


def _clean_email(email):
    return (email or "").strip().lower()


def _extract_token(auth_header):
    if not auth_header:
        return None

    prefix = "Bearer "
    if auth_header.startswith(prefix):
        return auth_header[len(prefix) :].strip()

    return None


def register_user(data):
    name = (data.get("name") or "").strip()
    email = _clean_email(data.get("email"))
    password = data.get("password") or ""

    if not name or not email or not password:
        return {"error": "Name, email, and password are required"}, 400

    if len(password) < 6:
        return {"error": "Password must be at least 6 characters"}, 400

    password_hash = generate_password_hash(password)

    try:
        user_id = create_user(name, email, password_hash)
    except IntegrityError:
        return {"error": "An account with that email already exists"}, 409

    return _create_auth_response(user_id), 201


def login_user(data):
    email = _clean_email(data.get("email"))
    password = data.get("password") or ""

    if not email or not password:
        return {"error": "Email and password are required"}, 400

    user = find_user_by_email(email)
    if user is None or not check_password_hash(user["password_hash"], password):
        return {"error": "Invalid email or password"}, 401

    return _create_auth_response(user["id"]), 200


def get_current_user(auth_header):
    token = _extract_token(auth_header)
    if not token:
        return {"error": "Missing auth token"}, 401

    session = find_session_by_token(token)
    if session is None:
        return {"error": "Invalid or expired auth token"}, 401

    return {
        "user": {
            "id": session["user_id"],
            "name": session["name"],
            "email": session["email"],
        }
    }, 200


def logout_user(auth_header):
    token = _extract_token(auth_header)
    if not token:
        return {"error": "Missing auth token"}, 401

    delete_session(token)
    return {"message": "Signed out successfully"}, 200


def _create_auth_response(user_id):
    user = find_user_by_id(user_id)
    token = token_urlsafe(32)
    expires_at = datetime.now(UTC) + timedelta(hours=TOKEN_HOURS)
    create_session(user_id, token, expires_at.strftime("%Y-%m-%d %H:%M:%S"))

    return {
        "token": token,
        "user": user_to_dict(user),
    }
