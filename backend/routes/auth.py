from flask import Blueprint, jsonify
from flask_jwt_extended import create_access_token, jwt_required

from middleware.auth import current_user
from models import db
from models.user import User
from routes.utils import error, request_json


auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    data = request_json()
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return error("Name, email, and password are required")
    if len(password) < 6:
        return error("Password must be at least 6 characters")
    if User.query.filter_by(email=email).first():
        return error("An account with this email already exists", 409)

    user = User(name=name, email=email, role="customer")
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()}), 201


@auth_bp.post("/login")
def login():
    data = request_json()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return error("Invalid email or password", 401)

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()})


@auth_bp.get("/me")
@jwt_required()
def me():
    user = current_user()
    if not user:
        return error("Authentication required", 401)
    return jsonify({"user": user.to_dict()})
