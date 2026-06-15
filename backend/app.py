from datetime import date, datetime, timedelta
import os

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from models import db
from models.reservation import Reservation
from models.restaurant import Restaurant
from models.table import Table
from models.user import User
from routes.admin import admin_bp
from routes.auth import auth_bp
from routes.reservations import reservations_bp
from routes.restaurants import restaurants_bp
from routes.tables import tables_bp


def create_app():
    app = Flask(__name__)
    db_path = os.path.join(os.path.dirname(__file__), "restaurant.db")

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL", f"sqlite:///{db_path}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv(
        "JWT_SECRET_KEY", "change-this-secret-for-production"
    )
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
                    "http://localhost:3001",
                    "http://127.0.0.1:3001",
                ]
            }
        },
        supports_credentials=True,
    )
    JWTManager(app)
    db.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(tables_bp, url_prefix="/api/tables")
    app.register_blueprint(reservations_bp, url_prefix="/api/reservations")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(restaurants_bp, url_prefix="/api/restaurants")

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": getattr(error, "description", "Bad request")}), 400

    @app.errorhandler(404)
    def not_found(_error):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(_error):
        return jsonify({"error": "Unexpected server error"}), 500

    @app.cli.command("init-db")
    def init_db_command():
        db.create_all()
        seed_database()
        print("Database initialized and seeded.")

    with app.app_context():
        db.create_all()
        seed_database()

    return app


def seed_database():
    if User.query.filter_by(email="admin@restaurant.com").first():
        return

    admin = User(name="Restaurant Admin", email="admin@restaurant.com", role="admin")
    admin.set_password("admin123")

    customer = User(name="Test Customer", email="customer@test.com", role="customer")
    customer.set_password("test123")

    db.session.add_all([admin, customer])
    db.session.flush()

    restaurants_data = [
        {"name": "The Golden Spoon", "location": "Manhattan, NY"},
        {"name": "Bella Italia", "location": "Brooklyn, NY"},
        {"name": "Sakura Sushi", "location": "San Francisco, CA"},
        {"name": "Le Bistro", "location": "Boston, MA"},
        {"name": "Taco Fiesta", "location": "Austin, TX"},
        {"name": "The Steakhouse", "location": "Chicago, IL"},
        {"name": "Ocean Catch", "location": "Seattle, WA"},
        {"name": "Curry House", "location": "Denver, CO"},
        {"name": "Olive Garden", "location": "Atlanta, GA"},
        {"name": "The Green Kitchen", "location": "Portland, OR"}
    ]

    restaurants = []
    for r in restaurants_data:
        restaurant = Restaurant(name=r["name"], location=r["location"])
        db.session.add(restaurant)
        restaurants.append(restaurant)
    
    db.session.flush()

    all_tables = []
    for r in restaurants:
        prefix = "".join([w[0] for w in r.name.split() if w]).upper()[:3]
        tables = [
            Table(table_number=f"{prefix}-1", capacity=2, location="Window", restaurant_id=r.id),
            Table(table_number=f"{prefix}-2", capacity=2, location="Indoor", restaurant_id=r.id),
            Table(table_number=f"{prefix}-3", capacity=4, location="Indoor", restaurant_id=r.id),
            Table(table_number=f"{prefix}-4", capacity=4, location="Outdoor", restaurant_id=r.id),
            Table(table_number=f"{prefix}-5", capacity=6, location="Private", restaurant_id=r.id),
        ]
        db.session.add_all(tables)
        all_tables.extend(tables)

    db.session.flush()

    today = date.today()
    sample_reservations = [
        Reservation(
            user_id=customer.id,
            table_id=all_tables[0].id,
            reservation_date=today,
            reservation_time=datetime.strptime("18:00", "%H:%M").time(),
            guest_count=2,
            status="pending",
            special_requests="Window table if possible",
        ),
        Reservation(
            user_id=customer.id,
            table_id=all_tables[2].id,
            reservation_date=today + timedelta(days=1),
            reservation_time=datetime.strptime("19:30", "%H:%M").time(),
            guest_count=4,
            status="confirmed",
            special_requests="Birthday dinner",
        ),
        Reservation(
            user_id=customer.id,
            table_id=all_tables[4].id,
            reservation_date=today + timedelta(days=3),
            reservation_time=datetime.strptime("20:00", "%H:%M").time(),
            guest_count=5,
            status="pending",
        ),
        Reservation(
            user_id=customer.id,
            table_id=all_tables[1].id,
            reservation_date=today + timedelta(days=5),
            reservation_time=datetime.strptime("17:30", "%H:%M").time(),
            guest_count=2,
            status="cancelled",
        ),
        Reservation(
            user_id=customer.id,
            table_id=all_tables[3].id,
            reservation_date=today + timedelta(days=7),
            reservation_time=datetime.strptime("18:45", "%H:%M").time(),
            guest_count=4,
            status="confirmed",
            special_requests="High chair needed",
        ),
    ]
    db.session.add_all(sample_reservations)
    db.session.commit()



app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
