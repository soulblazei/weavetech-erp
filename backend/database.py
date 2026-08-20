import os
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, 
    DateTime, Boolean, JSON, ForeignKey, Text
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("CRITICAL: DATABASE_URL not set in .env file.")

# Optimized for Supabase PostgreSQL (supports connection poolers like PgBouncer)
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- MODELS ---

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    # Roles: OWNER, STORE_MANAGER, SALES_EXECUTIVE, CRM_EXECUTIVE, FINANCE_ACCOUNTANT, PAYMENT_OFFICER
    role = Column(String(30), nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class DailyMISReport(Base):
    __tablename__ = "daily_mis_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_date = Column(String(10), unique=True, index=True, nullable=False)  # YYYY-MM-DD
    total_sales_amount = Column(Float, default=0.0)
    total_payments_collected = Column(Float, default=0.0)
    total_payments_pending = Column(Float, default=0.0)
    inventory_valuation = Column(Float, default=0.0)
    active_leads_count = Column(Integer, default=0)
    fabric_meters_produced = Column(Float, default=0.0)
    report_summary_json = Column(JSON, default=dict)
    generated_at = Column(DateTime, default=datetime.utcnow)

# Module Foundation Models for Future Form Data

class YarnStock(Base):
    __tablename__ = "yarn_stocks"

    id = Column(Integer, primary_key=True, index=True)
    lot_number = Column(String(50), unique=True, index=True, nullable=False)
    yarn_count = Column(String(30), nullable=False)
    supplier_name = Column(String(100), nullable=False)
    bags_count = Column(Integer, default=0)
    net_weight_kg = Column(Float, default=0.0)
    rate_per_kg = Column(Float, default=0.0)
    total_value = Column(Float, default=0.0)
    received_at = Column(DateTime, default=datetime.utcnow)

class SalesOrder(Base):
    __tablename__ = "sales_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    customer_name = Column(String(100), nullable=False)
    quality_construction = Column(String(100), nullable=False)  # e.g., 60x60 / 92x88
    total_meters = Column(Float, default=0.0)
    rate_per_meter = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    order_status = Column(String(30), default="PENDING")  # PENDING, IN_WEAVING, DISPATCHED
    created_at = Column(DateTime, default=datetime.utcnow)

class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    voucher_number = Column(String(50), unique=True, index=True, nullable=False)
    party_name = Column(String(100), nullable=False)
    transaction_type = Column(String(20), nullable=False)  # INWARD (Collection), OUTWARD (Payment)
    amount = Column(Float, nullable=False)
    payment_mode = Column(String(30), default="NEFT/RTGS")
    reference_no = Column(String(50))
    transaction_date = Column(DateTime, default=datetime.utcnow)