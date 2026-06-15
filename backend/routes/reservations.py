from datetime import date

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from middleware.auth import current_user
from models import db
from models.reservation import Reservation
from models.table import Table
from routes.utils import (
    error,
    has_table_conflict,
    is_upcoming,
    parse_date,
    parse_time,
    request_json,
)


reservations_bp = Blueprint("reservations", __name__)


@reservations_bp.post("")
@jwt_required()
def create_reservation():
    user = current_user()
    if not user:
        return error("Authentication required", 401)

    data = request_json()
    try:
        table_id = int(data.get("table_id"))
        reservation_date = parse_date(data.get("reservation_date"), "reservation_date")
        reservation_time = parse_time(data.get("reservation_time"), "reservation_time")
        guest_count = int(data.get("guest_count"))
        duration_minutes = int(data.get("duration_minutes") or 90)
    except (TypeError, ValueError) as exc:
        return error(str(exc) if str(exc) else "Invalid reservation details")

    table = Table.query.filter_by(id=table_id, is_active=True).first()
    if not table:
        return error("Selected table is not available", 404)
    if guest_count <= 0 or guest_count > table.capacity:
        return error("Guest count must fit within the selected table capacity")
    if reservation_date < date.today():
        return error("Reservation date cannot be in the past")
    if has_table_conflict(table_id, reservation_date, reservation_time, duration_minutes):
        return error("This table is already reserved for the selected time", 409)

    reservation = Reservation(
        user_id=user.id,
        table_id=table_id,
        reservation_date=reservation_date,
        reservation_time=reservation_time,
        duration_minutes=duration_minutes,
        guest_count=guest_count,
        special_requests=(data.get("special_requests") or "").strip(),
        status="pending",
    )
    db.session.add(reservation)
    db.session.commit()
    return jsonify({"reservation": reservation.to_dict()}), 201


@reservations_bp.get("/my")
@jwt_required()
def my_reservations():
    user = current_user()
    if not user:
        return error("Authentication required", 401)

    reservations = (
        Reservation.query.filter_by(user_id=user.id)
        .order_by(Reservation.reservation_date.desc(), Reservation.reservation_time.desc())
        .all()
    )
    return jsonify({"reservations": [item.to_dict() for item in reservations]})


@reservations_bp.put("/<int:reservation_id>")
@jwt_required()
def update_reservation(reservation_id):
    user = current_user()
    reservation = Reservation.query.get_or_404(reservation_id)

    if not user or reservation.user_id != user.id:
        return error("Reservation not found", 404)
    if reservation.status not in ("pending", "confirmed") or not is_upcoming(reservation):
        return error("Only upcoming pending or confirmed reservations can be modified", 403)

    data = request_json()
    try:
        table_id = int(data.get("table_id", reservation.table_id))
        reservation_date = parse_date(
            data.get("reservation_date", reservation.reservation_date.isoformat()),
            "reservation_date",
        )
        reservation_time = parse_time(
            data.get("reservation_time", reservation.reservation_time.strftime("%H:%M")),
            "reservation_time",
        )
        duration_minutes = int(data.get("duration_minutes", reservation.duration_minutes))
        guest_count = int(data.get("guest_count", reservation.guest_count))
    except (TypeError, ValueError) as exc:
        return error(str(exc) if str(exc) else "Invalid reservation details")

    table = Table.query.filter_by(id=table_id, is_active=True).first()
    if not table:
        return error("Selected table is not available", 404)
    if guest_count <= 0 or guest_count > table.capacity:
        return error("Guest count must fit within the selected table capacity")
    if reservation_date < date.today():
        return error("Reservation date cannot be in the past")
    if has_table_conflict(
        table_id,
        reservation_date,
        reservation_time,
        duration_minutes,
        exclude_id=reservation.id,
    ):
        return error("This table is already reserved for the selected time", 409)

    reservation.table_id = table_id
    reservation.reservation_date = reservation_date
    reservation.reservation_time = reservation_time
    reservation.duration_minutes = duration_minutes
    reservation.guest_count = guest_count
    reservation.special_requests = (data.get("special_requests") or "").strip()
    db.session.commit()
    return jsonify({"reservation": reservation.to_dict()})


@reservations_bp.delete("/<int:reservation_id>/cancel")
@jwt_required()
def cancel_reservation(reservation_id):
    user = current_user()
    reservation = Reservation.query.get_or_404(reservation_id)

    if not user:
        return error("Authentication required", 401)
    if user.role != "admin" and reservation.user_id != user.id:
        return error("Reservation not found", 404)
    if reservation.reservation_date < date.today():
        return error("Past reservations cannot be cancelled", 403)

    reservation.status = "cancelled"
    db.session.commit()
    return jsonify({"reservation": reservation.to_dict(include_user=user.role == "admin")})
