from models import db


class Table(db.Model):
    __tablename__ = "restaurant_tables"
    __table_args__ = (db.UniqueConstraint("restaurant_id", "table_number", name="_restaurant_table_uc"),)

    id = db.Column(db.Integer, primary_key=True)
    table_number = db.Column(db.String(20), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    location = db.Column(db.String(80), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    restaurant_id = db.Column(db.Integer, db.ForeignKey("restaurants.id"), nullable=True)

    restaurant = db.relationship("Restaurant", back_populates="tables")
    reservations = db.relationship("Reservation", back_populates="table", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "table_number": self.table_number,
            "capacity": self.capacity,
            "location": self.location,
            "is_active": self.is_active,
            "restaurant_id": self.restaurant_id,
            "restaurant_name": self.restaurant.name if self.restaurant else None,
        }

