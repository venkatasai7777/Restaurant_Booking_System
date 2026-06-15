from flask import Blueprint, jsonify, request

from middleware.auth import admin_required
from models import db
from models.reservation import Reservation
from models.table import Table
from routes.utils import error, parse_date


admin_bp = Blueprint("admin", __name__)


def reservation_query():
    query = Reservation.query
    date_value = request.args.get("date")
    status = request.args.get("status")
    table_id = request.args.get("table_id")

    if date_value:
        try:
            query = query.filter(Reservation.reservation_date == parse_date(date_value))
        except ValueError as exc:
            return None, error(str(exc))
    if status:
        query = query.filter(Reservation.status == status)
    if table_id:
        query = query.filter(Reservation.table_id == int(table_id))
    return query, None


@admin_bp.get("/reservations")
@admin_required
def all_reservations():
    query, err = reservation_query()
    if err:
        return err

    reservations = (
        query.order_by(Reservation.reservation_date.asc(), Reservation.reservation_time.asc())
        .all()
    )
    return jsonify(
        {"reservations": [item.to_dict(include_user=True, include_table=True) for item in reservations]}
    )


@admin_bp.put("/reservations/<int:reservation_id>/confirm")
@admin_required
def confirm_reservation(reservation_id):
    reservation = Reservation.query.get_or_404(reservation_id)
    if reservation.status != "pending":
        return error("Only pending reservations can be confirmed", 403)

    reservation.status = "confirmed"
    db.session.commit()
    return jsonify({"reservation": reservation.to_dict(include_user=True)})


@admin_bp.put("/reservations/<int:reservation_id>/reject")
@admin_required
def reject_reservation(reservation_id):
    reservation = Reservation.query.get_or_404(reservation_id)
    if reservation.status != "pending":
        return error("Only pending reservations can be rejected", 403)

    reservation.status = "cancelled"
    db.session.commit()
    return jsonify({"reservation": reservation.to_dict(include_user=True)})


@admin_bp.get("/reservations/history")
@admin_required
def booking_history():
    page = max(int(request.args.get("page", 1)), 1)
    per_page = min(max(int(request.args.get("per_page", 10)), 1), 50)
    query, err = reservation_query()
    if err:
        return err

    pagination = query.order_by(Reservation.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return jsonify(
        {
            "reservations": [
                item.to_dict(include_user=True, include_table=True) for item in pagination.items
            ],
            "page": page,
            "per_page": per_page,
            "total": pagination.total,
            "pages": pagination.pages,
        }
    )


@admin_bp.get("/floor")
@admin_required
def floor_view():
    date_value = request.args.get("date")
    try:
        selected_date = parse_date(date_value) if date_value else None
    except ValueError as exc:
        return error(str(exc))

    tables = Table.query.order_by(Table.table_number.asc()).all()
    reservations_query = Reservation.query.filter(Reservation.status.in_(("pending", "confirmed")))
    if selected_date:
        reservations_query = reservations_query.filter(Reservation.reservation_date == selected_date)
    reservations = reservations_query.all()

    return jsonify(
        {
            "tables": [table.to_dict() for table in tables],
            "reservations": [
                item.to_dict(include_user=True, include_table=True) for item in reservations
            ],
        }
    )
