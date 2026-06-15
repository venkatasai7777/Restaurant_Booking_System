from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from middleware.auth import admin_required
from models import db
from models.table import Table
from routes.utils import error, has_table_conflict, parse_date, parse_time, request_json


tables_bp = Blueprint("tables", __name__)


@tables_bp.get("")
def list_tables():
    include_inactive = request.args.get("include_inactive") == "true"
    query = Table.query
    if not include_inactive:
        query = query.filter_by(is_active=True)
    tables = query.order_by(Table.table_number.asc()).all()
    return jsonify({"tables": [table.to_dict() for table in tables]})


@tables_bp.get("/available")
def available_tables():
    try:
        reservation_date = parse_date(request.args.get("date") or request.args.get("reservation_date"))
        reservation_time = parse_time(request.args.get("time") or request.args.get("reservation_time"))
        guest_count = int(request.args.get("guest_count", "0"))
        duration_minutes = int(request.args.get("duration_minutes", "90"))
        restaurant_id = request.args.get("restaurant_id")
    except ValueError as exc:
        return error(str(exc))

    if guest_count <= 0:
        return error("guest_count must be greater than zero")

    query = Table.query.filter(
        Table.is_active.is_(True), Table.capacity >= guest_count
    )
    if restaurant_id:
        try:
            query = query.filter_by(restaurant_id=int(restaurant_id))
        except ValueError:
            return error("Invalid restaurant_id")

    tables = query.order_by(Table.capacity.asc(), Table.table_number.asc()).all()

    available = [
        table.to_dict()
        for table in tables
        if not has_table_conflict(table.id, reservation_date, reservation_time, duration_minutes)
    ]
    return jsonify({"tables": available})


@tables_bp.post("")
@admin_required
def create_table():
    data = request_json()
    table_number = (data.get("table_number") or "").strip()
    capacity = data.get("capacity")
    location = (data.get("location") or "").strip()

    if not table_number or not capacity or not location:
        return error("Table number, capacity, and location are required")
    if Table.query.filter_by(table_number=table_number).first():
        return error("A table with this number already exists", 409)

    table = Table(table_number=table_number, capacity=int(capacity), location=location)
    db.session.add(table)
    db.session.commit()
    return jsonify({"table": table.to_dict()}), 201


@tables_bp.put("/<int:table_id>")
@admin_required
def update_table(table_id):
    table = Table.query.get_or_404(table_id)
    data = request_json()

    if "table_number" in data:
        next_number = (data.get("table_number") or "").strip()
        existing = Table.query.filter(Table.table_number == next_number, Table.id != table.id).first()
        if existing:
            return error("A table with this number already exists", 409)
        table.table_number = next_number
    if "capacity" in data:
        table.capacity = int(data["capacity"])
    if "location" in data:
        table.location = (data.get("location") or "").strip()
    if "is_active" in data:
        table.is_active = bool(data["is_active"])

    db.session.commit()
    return jsonify({"table": table.to_dict()})


@tables_bp.delete("/<int:table_id>")
@admin_required
def deactivate_table(table_id):
    table = Table.query.get_or_404(table_id)
    table.is_active = False
    db.session.commit()
    return jsonify({"table": table.to_dict()})
