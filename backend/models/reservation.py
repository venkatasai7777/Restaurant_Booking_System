from datetime import datetime, timezone

from models import db


class Reservation(db.Model):
    __tablename__ = "reservations"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    table_id = db.Column(db.Integer, db.ForeignKey("restaurant_tables.id"), nullable=False)
    reservation_date = db.Column(db.Date, nullable=False, index=True)
    reservation_time = db.Column(db.Time, nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False, default=90)
    guest_count = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="pending", index=True)
    special_requests = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = db.relationship("User", back_populates="reservations")
    table = db.relationship("Table", back_populates="reservations")

    def to_dict(self, include_user=False, include_table=True):
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "table_id": self.table_id,
            "reservation_date": self.reservation_date.isoformat(),
            "reservation_time": self.reservation_time.strftime("%H:%M"),
            "duration_minutes": self.duration_minutes,
            "guest_count": self.guest_count,
            "status": self.status,
            "special_requests": self.special_requests or "",
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_user and self.user:
            data["user"] = self.user.to_dict()
        if include_table and self.table:
            data["table"] = self.table.to_dict()
        return data
