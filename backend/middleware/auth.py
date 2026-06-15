from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from models.user import User


def current_user():
    user_id = get_jwt_identity()
    return User.query.get(int(user_id)) if user_id else None


def role_required(role):
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            user = current_user()
            if not user:
                return jsonify({"error": "Authentication required"}), 401
            if user.role != role:
                return jsonify({"error": "You do not have permission to perform this action"}), 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator


admin_required = role_required("admin")
customer_required = role_required("customer")
