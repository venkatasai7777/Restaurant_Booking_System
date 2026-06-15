from flask import Blueprint, jsonify
from models.restaurant import Restaurant
from routes.utils import error

restaurants_bp = Blueprint("restaurants", __name__)


@restaurants_bp.get("")
def list_restaurants():
    try:
        restaurants = Restaurant.query.order_by(Restaurant.name.asc()).all()
        return jsonify({"restaurants": [r.to_dict() for r in restaurants]})
    except Exception as exc:
        return error(f"Failed to fetch restaurants: {str(exc)}", 500)
