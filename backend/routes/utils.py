from datetime import date, datetime, time, timedelta

from flask import jsonify, request

from models.reservation import Reservation


ACTIVE_STATUSES = ("pending", "confirmed")


def error(message, status=400):
    return jsonify({"error": message}), status


def parse_date(value, field="date"):
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        raise ValueError(f"{field} must use YYYY-MM-DD format")


def parse_time(value, field="time"):
    try:
        return datetime.strptime(value, "%H:%M").time()
    except (TypeError, ValueError):
        raise ValueError(f"{field} must use HH:MM format")


def reservation_window(reservation):
    start = datetime.combine(reservation.reservation_date, reservation.reservation_time)
    return start, start + timedelta(minutes=reservation.duration_minutes)


def requested_window(reservation_date, reservation_time, duration_minutes=90):
    start = datetime.combine(reservation_date, reservation_time)
    return start, start + timedelta(minutes=duration_minutes)


def overlaps(start_a, end_a, start_b, end_b):
    return start_a < end_b and end_a > start_b


def has_table_conflict(table_id, reservation_date, reservation_time, duration_minutes=90, exclude_id=None):
    request_start, request_end = requested_window(
        reservation_date, reservation_time, duration_minutes
    )
    query = Reservation.query.filter(
        Reservation.table_id == table_id,
        Reservation.reservation_date == reservation_date,
        Reservation.status.in_(ACTIVE_STATUSES),
    )
    if exclude_id:
        query = query.filter(Reservation.id != exclude_id)

    for reservation in query.all():
        existing_start, existing_end = reservation_window(reservation)
        if overlaps(request_start, request_end, existing_start, existing_end):
            return True
    return False


def is_upcoming(reservation):
    booking_start = datetime.combine(
        reservation.reservation_date, reservation.reservation_time or time.min
    )
    return booking_start > datetime.now()


def request_json():
    return request.get_json(silent=True) or {}
