import os
import logging
from datetime import datetime
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from sqlalchemy import (
    create_engine, Column, Integer, String, Float, 
    DateTime, Boolean, JSON, Text, ForeignKey, Date, text
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

logger = logging.getLogger("weavetech.database")

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./weaving_erp.db"
)

# Detect if target is PostgreSQL (e.g. Supabase) or fallback SQLite
is_postgres = DATABASE_URL.startswith("postgresql")

try:
    if is_postgres:
        # Optimized for Supabase PostgreSQL (Supports Transaction Poolers / PgBouncer)
        engine = create_engine(
            DATABASE_URL,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            pool_recycle=300,
            connect_args={"connect_timeout": 8}
        )
        with engine.connect() as conn:
            pass
        logger.info("Connected to Supabase PostgreSQL successfully.")
    else:
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False}
        )
        logger.info("Using local SQLite storage engine.")
except Exception as e:
    logger.warning(f"PostgreSQL connection failed ({e}). Falling back to local SQLite engine.")
    DATABASE_URL = "sqlite:///./weaving_erp.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================================
# --- DATABASE MODELS (WEAVE-TECH ERP) ---
# ==========================================

class User(Base):
    """Plant User Accounts with Role-Based Access Control."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    # Roles: OWNER, SALES_EXECUTIVE, STORE_MANAGER, CRM_EXECUTIVE, FINANCE_ACCOUNTANT, PAYMENT_OFFICER, QC_INSPECTOR, LOOM_SUPERVISOR
    role = Column(String(30), nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class DailyMISReport(Base):
    """Automated Executive Daily MIS Ledger Aggregation."""
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


# -------------------------------------------------------------
# --- 1. CORE MASTER DATA MODELS ---
# -------------------------------------------------------------

class ClientMaster(Base):
    """Global Client / Party Master: Fabric Buyers, Yarn Suppliers, Brokers, Job Workers."""
    __tablename__ = "client_masters"

    id = Column(Integer, primary_key=True, index=True)
    party_code = Column(String(20), unique=True, index=True, nullable=True) # e.g. CLI-1001
    party_name = Column(String(150), unique=True, index=True, nullable=False)
    party_type = Column(String(50), nullable=False, default="FABRIC_BUYER", index=True) # FABRIC_BUYER, YARN_SUPPLIER, JOB_WORKER, BROKER
    contact_person = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    billing_address = Column(Text, nullable=True)
    city = Column(String(50), nullable=True)
    state = Column(String(50), nullable=True)
    pincode = Column(String(10), nullable=True)
    gstin = Column(String(15), unique=True, nullable=True, index=True)
    pan_number = Column(String(10), nullable=True)
    payment_terms = Column(String(100), nullable=True) # e.g., "30 Days Credit", "Against Delivery / COD"
    credit_limit = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class EmployeeMaster(Base):
    """Staff, Loom Operators, Shift Weavers, QC Incharges & Executives."""
    __tablename__ = "employee_masters"

    id = Column(Integer, primary_key=True, index=True)
    employee_code = Column(String(20), unique=True, index=True, nullable=False) # e.g. "EMP-1001"
    full_name = Column(String(100), index=True, nullable=False)
    designation = Column(String(50), nullable=False) # e.g. "Weaver / Operator", "Shift Supervisor", "QC Incharge", "Sales Officer"
    department = Column(String(50), nullable=False) # e.g. "Weaving Shed", "Store", "Sales", "Quality Control", "Accounts"
    shift_preference = Column(String(20), default="Shift A") # Shift A, Shift B, Night, General
    phone = Column(String(20), nullable=True)
    emergency_contact = Column(String(20), nullable=True)
    id_proof_number = Column(String(50), nullable=True) # Aadhaar / PAN
    date_of_joining = Column(String(20), nullable=True)
    monthly_salary_or_rate = Column(Float, default=0.0)
    target_meters_monthly = Column(Float, default=50000.0) # For sales executive target tracking
    territory = Column(String(100), default="Surat / Gujarat")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ItemMaster(Base):
    """Yarn Counts, Grey Fabric Qualities, Chemical Sizing, and Loom Spares."""
    __tablename__ = "item_masters"

    id = Column(Integer, primary_key=True, index=True)
    item_code = Column(String(30), unique=True, index=True, nullable=False) # e.g. "ITM-YRN-40C", "ITM-FAB-60X60"
    item_name = Column(String(150), index=True, nullable=False)
    item_category = Column(String(50), nullable=False, index=True) # RAW_YARN, GREY_FABRIC, SIZING_MATERIAL, LOOM_SPARE
    hsn_code = Column(String(10), nullable=True) # "5205" for Cotton Yarn, "5208" for Woven Fabric
    unit_of_measure = Column(String(10), default="MTR") # KG, MTR, BAG, PCS
    standard_cost = Column(Float, default=0.0)
    reorder_level = Column(Float, default=0.0)
    gst_rate_percent = Column(Float, default=5.0) # 0%, 5%, 12%, 18%

    # Textile Specification Parameters (Applicable for Grey Fabric & Yarn)
    warp_count = Column(String(30), nullable=True)
    weft_count = Column(String(30), nullable=True)
    epi = Column(Integer, nullable=True)
    ppi = Column(Integer, nullable=True)
    width_inches = Column(Float, nullable=True)
    gsm = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)


# -------------------------------------------------------------
# --- 2. ENTERPRISE CRM SUITE MODELS ---
# -------------------------------------------------------------

class CRMLead(Base):
    """Cold Buyer Contacts, Sourcing Inquiries, Agency Leads."""
    __tablename__ = "crm_leads"

    id = Column(Integer, primary_key=True, index=True)
    lead_title = Column(String(150), nullable=False)
    client_master_id = Column(Integer, ForeignKey("client_masters.id"), nullable=False, index=True)
    party_name = Column(String(150), nullable=False)
    contact_person = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=False)
    email = Column(String(100), nullable=True)
    city = Column(String(50), nullable=True)
    source = Column(String(50), default="DIRECT_CALL") # DIRECT_CALL, BROKER_AGENCY, TEXTILE_EXHIBITION, WEB_INQUIRY, REPEAT_BUYER
    status = Column(String(30), default="NEW", index=True) # NEW, CONTACTED, QUALIFIED, DROPPED
    assigned_to_emp_id = Column(Integer, ForeignKey("employee_masters.id"), nullable=True)
    estimated_meters = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    client = relationship("ClientMaster", lazy="joined")
    assigned_employee = relationship("EmployeeMaster", lazy="joined")


class CRMInquiry(Base):
    """Opportunity / Technical Fabric Inquiry with Loom Specs & Commercials."""
    __tablename__ = "crm_inquiries"

    id = Column(Integer, primary_key=True, index=True)
    inquiry_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. INQ-2026-001
    client_master_id = Column(Integer, ForeignKey("client_masters.id"), nullable=False, index=True)
    party_name = Column(String(150), nullable=False)
    contact_person = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=False)
    city = Column(String(50), nullable=True)
    
    # Linked Item Master (if matching standard quality)
    item_master_id = Column(Integer, ForeignKey("item_masters.id"), nullable=True)
    quality_construction = Column(String(150), nullable=False) # e.g. 60x60 / 92x88 Cotton Poplin
    warp_count = Column(String(30), default="40s Combed")
    weft_count = Column(String(30), default="40s Carded")
    epi = Column(Integer, default=132)
    ppi = Column(Integer, default=72)
    width_inches = Column(Float, default=58.0)
    gsm = Column(Float, default=120.0)
    
    required_meters = Column(Float, default=0.0, nullable=False)
    target_rate_per_meter = Column(Float, default=0.0, nullable=False)
    tax_percent = Column(Float, default=5.0)
    total_raw_value = Column(Float, default=0.0)
    grand_total = Column(Float, default=0.0)
    
    # Pipeline stages
    stage = Column(String(40), default="INQUIRY_RECEIVED", index=True) # INQUIRY_RECEIVED, SAMPLE_SENT, PRICE_QUOTED, RATE_NEGOTIATION, WON_ORDER_CONVERTED, LOST
    assigned_to_emp_id = Column(Integer, ForeignKey("employee_masters.id"), nullable=True)
    lead_id = Column(Integer, ForeignKey("crm_leads.id"), nullable=True)
    delivery_target_date = Column(String(20), nullable=True)
    drop_reason = Column(String(100), nullable=True) # Price High, Delivery Lead Time, Spec Out of Range
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    client = relationship("ClientMaster", lazy="joined")
    item = relationship("ItemMaster", lazy="joined")
    assigned_employee = relationship("EmployeeMaster", lazy="joined")


class CRMForecast(Base):
    """Monthly & Quarterly Weaving Projections vs Actual Targets."""
    __tablename__ = "crm_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    forecast_period = Column(String(30), nullable=False) # e.g. "April 2026", "Q1 2026-27"
    target_meters = Column(Float, default=0.0)
    projected_revenue = Column(Float, default=0.0)
    achieved_meters = Column(Float, default=0.0)
    achieved_revenue = Column(Float, default=0.0)
    assigned_to_emp_id = Column(Integer, ForeignKey("employee_masters.id"), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    assigned_employee = relationship("EmployeeMaster", lazy="joined")


# -------------------------------------------------------------
# --- 3. TRANSACTIONAL ERP MODELS ---
# -------------------------------------------------------------

class SalesOrder(Base):
    """Fabric Sales Contracts & Loom Technical Quality Matrix."""
    __tablename__ = "sales_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    client_master_id = Column(Integer, ForeignKey("client_masters.id"), nullable=True, index=True)
    customer_name = Column(String(100), nullable=False)
    contact_person = Column(String(100), nullable=True)
    customer_city = Column(String(100), nullable=True)
    quality_construction = Column(String(150), nullable=False)
    warp_count = Column(String(50), default="40s Combed")
    weft_count = Column(String(50), default="40s Carded")
    epi = Column(String(20), default="132")
    ppi = Column(String(20), default="72")
    weave_type = Column(String(50), default="Plain 1/1")
    width_inches = Column(Float, default=58.0)
    gsm = Column(Float, default=120.0)
    total_meters = Column(Float, default=0.0)
    rate_per_meter = Column(Float, default=0.0)
    tax_percent = Column(Float, default=5.0)
    total_raw_amount = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    grand_total = Column(Float, default=0.0)
    delivery_date = Column(String(20), nullable=True)
    payment_terms = Column(String(150), default="30 Days Credit")
    status = Column(String(30), default="PENDING", index=True)  # PENDING, IN_WEAVING, READY_TO_DISPATCH, DISPATCHED
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    client = relationship("ClientMaster", lazy="joined")


class SalesTask(Base):
    """Daily Salesperson To-Do & Priority Action Engine."""
    __tablename__ = "sales_tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    task_type = Column(String(50), nullable=False, default="PHONE_CALL")
    priority = Column(String(20), nullable=False, default="P2_HIGH", index=True)
    party_name = Column(String(100), nullable=False)
    contact_person = Column(String(100), nullable=False)
    phone = Column(String(30), nullable=False)
    related_inquiry_or_order_no = Column(String(50), nullable=True)
    inquiry_meters = Column(Float, nullable=True, default=0.0)
    assigned_to_user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    due_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    due_time_slot = Column(String(50), nullable=True)
    status = Column(String(30), default="PENDING", index=True)
    completion_notes = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    assigned_to = relationship("User", foreign_keys=[assigned_to_user_id], lazy="joined")
    created_by = relationship("User", foreign_keys=[created_by_user_id], lazy="joined")


class YarnStock(Base):
    """Raw Yarn Inventory, Lot Tracking & Godown Valuation."""
    __tablename__ = "yarn_stocks"

    id = Column(Integer, primary_key=True, index=True)
    lot_number = Column(String(50), unique=True, index=True, nullable=False)
    yarn_count = Column(String(50), nullable=False)
    supplier_name = Column(String(100), nullable=False)
    bags_count = Column(Integer, default=0)
    net_weight_kg = Column(Float, default=0.0)
    rate_per_kg = Column(Float, default=0.0)
    total_value = Column(Float, default=0.0)
    godown_bay = Column(String(50), default="Bay A-01")
    received_at = Column(DateTime, default=datetime.utcnow)


class Loom(Base):
    """Plant Weaving Looms Machinery Master."""
    __tablename__ = "looms"

    id = Column(Integer, primary_key=True, index=True)
    loom_number = Column(String(30), unique=True, index=True, nullable=False)
    loom_type = Column(String(50), default="Airjet 230cm")
    rated_rpm = Column(Integer, default=650)
    status = Column(String(30), default="RUNNING")


class BeamAllotment(Base):
    """Weaver Beam Allocation & Loom Mounting Tracker."""
    __tablename__ = "beam_allotments"

    id = Column(Integer, primary_key=True, index=True)
    beam_number = Column(String(50), unique=True, index=True, nullable=False)
    loom_id = Column(Integer, ForeignKey("looms.id"), nullable=True)
    set_length_meters = Column(Float, default=0.0)
    warp_yarn_lot = Column(String(50), nullable=False)
    status = Column(String(30), default="MOUNTED")
    mounted_at = Column(DateTime, default=datetime.utcnow)

    loom = relationship("Loom", lazy="joined")


class ShiftLog(Base):
    """Loom Supervisor Shift Production & Efficiency Logs."""
    __tablename__ = "shift_logs"

    id = Column(Integer, primary_key=True, index=True)
    loom_id = Column(Integer, ForeignKey("looms.id"), index=True, nullable=False)
    shift_name = Column(String(20), nullable=False)
    operator_name = Column(String(100), nullable=False)
    start_picks = Column(Integer, default=0)
    end_picks = Column(Integer, default=0)
    total_picks = Column(Integer, default=0)
    actual_rpm = Column(Float, default=0.0)
    efficiency_percent = Column(Float, default=0.0)
    downtime_minutes = Column(Integer, default=0)
    downtime_reason = Column(String(150), nullable=True)
    logged_at = Column(DateTime, default=datetime.utcnow)

    loom = relationship("Loom", lazy="joined")


class GreyRoll(Base):
    """Woven Fabric Rolls Inspected under ASTM D5430 4-Point System."""
    __tablename__ = "grey_rolls"

    id = Column(Integer, primary_key=True, index=True)
    roll_number = Column(String(50), unique=True, index=True, nullable=False)
    loom_id = Column(Integer, ForeignKey("looms.id"), nullable=True)
    quality_construction = Column(String(150), nullable=False)
    total_meters = Column(Float, default=0.0)
    width_inches = Column(Float, default=58.0)
    total_defect_points = Column(Integer, default=0)
    points_per_100_sqm = Column(Float, default=0.0)
    grade = Column(String(20), default="FRESH")
    inspector_name = Column(String(100), nullable=False)
    barcode_data = Column(String(100), nullable=True)
    inspected_at = Column(DateTime, default=datetime.utcnow)


class RollDefect(Base):
    """Specific defect entries logged against a roll during inspection."""
    __tablename__ = "roll_defects"

    id = Column(Integer, primary_key=True, index=True)
    roll_id = Column(Integer, ForeignKey("grey_rolls.id"), index=True, nullable=False)
    meter_mark = Column(Float, nullable=False)
    defect_type = Column(String(100), nullable=False)
    points = Column(Integer, nullable=False)
    defect_size = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class PaymentTransaction(Base):
    """Inward Client Receipts & Outward Supplier Remittances."""
    __tablename__ = "payment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    voucher_number = Column(String(50), unique=True, index=True, nullable=False)
    party_name = Column(String(100), nullable=False)
    transaction_type = Column(String(20), nullable=False)
    amount = Column(Float, nullable=False)
    payment_mode = Column(String(50), default="NEFT/RTGS")
    reference_no = Column(String(100), nullable=True)
    remarks = Column(Text, nullable=True)
    transaction_date = Column(DateTime, default=datetime.utcnow)


class GeneralLedgerAccount(Base):
    """Trial Balance & Double-Entry Chart of Accounts."""
    __tablename__ = "general_ledger_accounts"

    id = Column(Integer, primary_key=True, index=True)
    account_code = Column(String(20), unique=True, index=True, nullable=False)
    account_name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    debit_balance = Column(Float, default=0.0)
    credit_balance = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow)


class ShopFloorStageRecord(Base):
    """
    Comprehensive 13-Stage Sequential Shop-Floor Production & Quality Handover Record.
    Tracks material transformation, upstream quality score (1-5 stars), defects, and end-to-end lineage.
    """
    __tablename__ = "shopfloor_stage_records"

    id = Column(Integer, primary_key=True, index=True)
    stage_key = Column(String(50), nullable=False, index=True) # e.g. "1_YARN_INWARD", "2_YARN_WINDING", ... "13_DELIVERY_CHALLAN"
    stage_name = Column(String(100), nullable=False)
    stage_number = Column(Integer, nullable=False, index=True) # 1 to 13
    batch_code = Column(String(100), unique=True, index=True, nullable=False) # e.g. "YRN-LOT-2026-001", "BM-2026-081", "TK-2026-101"
    
    # Preceding Batch Linkage (Enforces strict sequential handoff)
    preceding_record_id = Column(Integer, ForeignKey("shopfloor_stage_records.id"), nullable=True, index=True)
    preceding_batch_code = Column(String(100), nullable=True, index=True)
    root_yarn_lot = Column(String(100), nullable=False, index=True) # Origin Yarn Lot No propagated throughout lineage
    
    # Operator & Role Attribution
    operator_name = Column(String(100), nullable=False)
    operator_role = Column(String(50), nullable=False) # e.g. "Winding Worker", "TFO Worker", "Warper", "Loom Master", "Supervisor"
    
    # Upstream Inspection & Handover Rating (1 to 5 Stars)
    incoming_rating = Column(Integer, nullable=True) # 1 to 5 stars (null for stage 1)
    incoming_defects = Column(JSON, default=list) # List of defect codes selected (e.g. ["snarls", "uneven_tension"])
    incoming_notes = Column(Text, nullable=True) # Operator feedback on previous stage quality
    is_quality_alert = Column(Boolean, default=False, index=True) # True if incoming_rating < 3
    alert_resolved = Column(Boolean, default=False)
    supervisor_resolution_notes = Column(Text, nullable=True)

    # Weights & Material Balances
    input_weight_kg = Column(Float, nullable=True, default=0.0)
    output_weight_kg = Column(Float, nullable=True, default=0.0)
    waste_weight_kg = Column(Float, nullable=True, default=0.0)
    
    # Stage Specific Parameters (Stored flexibly in JSON)
    stage_data = Column(JSON, default=dict)
    
    status = Column(String(30), default="COMPLETED", index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Self-referencing relationship for upstream/downstream tree traversal
    preceding_record = relationship("ShopFloorStageRecord", remote_side=[id], backref="downstream_records")


# -------------------------------------------------------------
# --- 4. STORE SUB-MODULE MODELS ---
# -------------------------------------------------------------

class StoreRequisition(Base):
    """Internal plant requests for yarn, bobbins, sizing materials, or spares."""
    __tablename__ = "store_requisitions"

    id = Column(Integer, primary_key=True, index=True)
    req_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. REQ-2026-001
    department = Column(String(50), nullable=False) # Winding, Warping, Loom Shed, Sizing, Maintenance
    item_master_id = Column(Integer, ForeignKey("item_masters.id"), nullable=True)
    item_name = Column(String(150), nullable=False)
    quantity = Column(Float, nullable=False, default=0.0)
    uom = Column(String(20), default="KG")
    urgency = Column(String(20), default="NORMAL") # NORMAL, URGENT, BREAKDOWN
    requested_by = Column(String(100), nullable=False)
    required_by_date = Column(String(20), nullable=True)
    status = Column(String(30), default="PENDING", index=True) # PENDING, APPROVED, ISSUED, REJECTED
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    item = relationship("ItemMaster", lazy="joined")


class StoreMaterialIssue(Base):
    """Allocation of store inventory to floor departments (winding, warping, loom shed)."""
    __tablename__ = "store_material_issues"

    id = Column(Integer, primary_key=True, index=True)
    issue_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. ISS-2026-001
    requisition_id = Column(Integer, ForeignKey("store_requisitions.id"), nullable=True)
    department = Column(String(50), nullable=False)
    issued_to = Column(String(100), nullable=False)
    item_master_id = Column(Integer, ForeignKey("item_masters.id"), nullable=True)
    item_name = Column(String(150), nullable=False)
    lot_number = Column(String(50), nullable=False)
    issued_quantity = Column(Float, nullable=False, default=0.0)
    uom = Column(String(20), default="KG")
    godown_bay = Column(String(50), default="Bay A-01")
    issued_by = Column(String(100), nullable=False)
    status = Column(String(30), default="ISSUED")
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    requisition = relationship("StoreRequisition", lazy="joined")
    item = relationship("ItemMaster", lazy="joined")


class StoreStockReceived(Base):
    """Entry of inward stocks from suppliers or finished returns (linked to GRN / Gate Inward)."""
    __tablename__ = "store_stock_received"

    id = Column(Integer, primary_key=True, index=True)
    receipt_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. REC-2026-001
    source_type = Column(String(50), default="PURCHASE_GRN") # PURCHASE_GRN, PRODUCTION_RETURN, JOB_WORK_INWARD, INITIAL_OPENING
    grn_id = Column(Integer, nullable=True, index=True)
    supplier_name = Column(String(150), nullable=False)
    item_master_id = Column(Integer, ForeignKey("item_masters.id"), nullable=True)
    item_name = Column(String(150), nullable=False)
    lot_number = Column(String(50), index=True, nullable=False)
    quantity_received = Column(Float, nullable=False, default=0.0)
    uom = Column(String(20), default="KG")
    net_weight_kg = Column(Float, default=0.0)
    rate_per_unit = Column(Float, default=0.0)
    total_valuation = Column(Float, default=0.0)
    godown_bay = Column(String(50), default="Bay A-01")
    qc_status = Column(String(30), default="APPROVED") # APPROVED, QUARANTINED, REJECTED
    received_at = Column(DateTime, default=datetime.utcnow)

    item = relationship("ItemMaster", lazy="joined")


class StoreItemOpening(Base):
    """Opening balance configuration for raw materials and spares at session/financial year init."""
    __tablename__ = "store_item_openings"

    id = Column(Integer, primary_key=True, index=True)
    financial_year = Column(String(20), nullable=False, default="2026-2027")
    item_master_id = Column(Integer, ForeignKey("item_masters.id"), nullable=False)
    item_name = Column(String(150), nullable=False)
    item_category = Column(String(50), nullable=False)
    opening_quantity = Column(Float, nullable=False, default=0.0)
    uom = Column(String(20), default="KG")
    opening_rate = Column(Float, default=0.0)
    total_valuation = Column(Float, default=0.0)
    godown_bay = Column(String(50), default="Bay A-01")
    configured_by = Column(String(100), default="Store Incharge")
    created_at = Column(DateTime, default=datetime.utcnow)

    item = relationship("ItemMaster", lazy="joined")


# -------------------------------------------------------------
# --- 5. PURCHASE SUB-MODULE MODELS ---
# -------------------------------------------------------------

class PurchaseIndent(Base):
    """Purchase requests raised against pending floor requisitions."""
    __tablename__ = "purchase_indents"

    id = Column(Integer, primary_key=True, index=True)
    indent_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. IND-2026-001
    requisition_id = Column(Integer, ForeignKey("store_requisitions.id"), nullable=True)
    department = Column(String(50), nullable=False)
    item_master_id = Column(Integer, ForeignKey("item_masters.id"), nullable=True)
    item_name = Column(String(150), nullable=False)
    required_quantity = Column(Float, nullable=False, default=0.0)
    uom = Column(String(20), default="KG")
    target_date = Column(String(20), nullable=True)
    priority = Column(String(20), default="MEDIUM") # HIGH, MEDIUM, LOW
    estimated_rate = Column(Float, default=0.0)
    status = Column(String(30), default="APPROVED", index=True) # DRAFT, APPROVED, PO_RAISED, CANCELLED
    created_by = Column(String(100), default="Purchase Officer")
    created_at = Column(DateTime, default=datetime.utcnow)

    requisition = relationship("StoreRequisition", lazy="joined")
    item = relationship("ItemMaster", lazy="joined")


class PurchaseOrder(Base):
    """Commercial order sent to yarn spinning mills and chemical suppliers."""
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. PO-2026-001
    indent_id = Column(Integer, ForeignKey("purchase_indents.id"), nullable=True)
    supplier_id = Column(Integer, ForeignKey("client_masters.id"), nullable=True)
    supplier_name = Column(String(150), nullable=False)
    item_master_id = Column(Integer, ForeignKey("item_masters.id"), nullable=True)
    item_name = Column(String(150), nullable=False)
    quantity = Column(Float, nullable=False, default=0.0)
    uom = Column(String(20), default="KG")
    rate_per_unit = Column(Float, nullable=False, default=0.0)
    tax_percent = Column(Float, default=5.0)
    total_raw_amount = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    grand_total = Column(Float, default=0.0)
    payment_terms = Column(String(100), default="30 Days Credit")
    delivery_date = Column(String(20), nullable=True)
    status = Column(String(30), default="PENDING", index=True) # PENDING, PARTIALLY_RECEIVED, CLOSED, CANCELLED
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    indent = relationship("PurchaseIndent", lazy="joined")
    supplier = relationship("ClientMaster", lazy="joined")
    item = relationship("ItemMaster", lazy="joined")


class PurchaseInwardEntry(Base):
    """Gate inward entry of shipments arriving at the mill gate."""
    __tablename__ = "purchase_inward_entries"

    id = Column(Integer, primary_key=True, index=True)
    inward_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. GIN-2026-001
    po_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=True)
    supplier_name = Column(String(150), nullable=False)
    item_name = Column(String(150), nullable=False)
    delivery_challan_no = Column(String(100), nullable=False)
    vehicle_no = Column(String(50), nullable=False)
    gate_entry_time = Column(DateTime, default=datetime.utcnow)
    received_packages_count = Column(Integer, default=100)
    reported_weight_kg = Column(Float, default=0.0)
    driver_name = Column(String(100), nullable=True)
    status = Column(String(30), default="UNLOADED", index=True) # AT_GATE, UNLOADED, GRN_PENDING, COMPLETED
    created_at = Column(DateTime, default=datetime.utcnow)

    po = relationship("PurchaseOrder", lazy="joined")


class GoodsReceiptNote(Base):
    """Verification and stock addition note following store weighbridge and physical count."""
    __tablename__ = "goods_receipt_notes"

    id = Column(Integer, primary_key=True, index=True)
    grn_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. GRN-2026-001
    po_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=True)
    inward_id = Column(Integer, ForeignKey("purchase_inward_entries.id"), nullable=True)
    supplier_name = Column(String(150), nullable=False)
    item_name = Column(String(150), nullable=False)
    lot_number = Column(String(50), index=True, nullable=False)
    gross_weight_kg = Column(Float, default=0.0)
    tare_weight_kg = Column(Float, default=0.0)
    net_weight_kg = Column(Float, default=0.0)
    accepted_weight_kg = Column(Float, default=0.0)
    rejected_weight_kg = Column(Float, default=0.0)
    rate_per_kg = Column(Float, default=0.0)
    total_valuation = Column(Float, default=0.0)
    qc_status = Column(String(30), default="PASSED") # PASSED, REJECTED, CONDITIONAL
    inspector_name = Column(String(100), default="Ramesh QC")
    godown_bay = Column(String(50), default="Bay A-01")
    status = Column(String(30), default="CONFIRMED", index=True) # DRAFT, CONFIRMED
    verified_at = Column(DateTime, default=datetime.utcnow)

    po = relationship("PurchaseOrder", lazy="joined")
    inward = relationship("PurchaseInwardEntry", lazy="joined")


class PurchaseBill(Base):
    """Commercial purchase bill recording with GST, supplier credit terms, and rate confirmations."""
    __tablename__ = "purchase_bills"

    id = Column(Integer, primary_key=True, index=True)
    bill_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. PB-2026-001
    supplier_invoice_no = Column(String(100), nullable=False)
    supplier_id = Column(Integer, ForeignKey("client_masters.id"), nullable=True)
    supplier_name = Column(String(150), nullable=False)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=True)
    grn_id = Column(Integer, ForeignKey("goods_receipt_notes.id"), nullable=True)
    item_name = Column(String(150), nullable=False)
    net_weight_kg = Column(Float, default=0.0)
    rate_per_kg = Column(Float, default=0.0)
    total_raw_amount = Column(Float, default=0.0)
    tax_percent = Column(Float, default=5.0)
    tax_amount = Column(Float, default=0.0)
    grand_total = Column(Float, default=0.0)
    due_date = Column(String(20), nullable=True)
    payment_status = Column(String(30), default="UNPAID", index=True) # UNPAID, PARTIALLY_PAID, PAID, PAYMENT_HELD
    approval_status = Column(String(30), default="APPROVED", index=True) # APPROVED, PENDING, REJECTED
    created_at = Column(DateTime, default=datetime.utcnow)

    supplier = relationship("ClientMaster", lazy="joined")
    po = relationship("PurchaseOrder", lazy="joined")
    grn = relationship("GoodsReceiptNote", lazy="joined")


class PurchaseReturn(Base):
    """Return note for rejected yarn lots, damaged cones, or non-spec materials."""
    __tablename__ = "purchase_returns"

    id = Column(Integer, primary_key=True, index=True)
    return_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. PRET-2026-001
    grn_id = Column(Integer, ForeignKey("goods_receipt_notes.id"), nullable=True)
    bill_id = Column(Integer, ForeignKey("purchase_bills.id"), nullable=True)
    supplier_id = Column(Integer, ForeignKey("client_masters.id"), nullable=True)
    supplier_name = Column(String(150), nullable=False)
    lot_number = Column(String(50), nullable=False)
    item_name = Column(String(150), nullable=False)
    rejected_weight_kg = Column(Float, default=0.0)
    rate_per_kg = Column(Float, default=0.0)
    debit_amount = Column(Float, default=0.0)
    reason_for_rejection = Column(Text, nullable=False)
    qc_reference = Column(String(100), nullable=True)
    debit_note_id = Column(Integer, nullable=True)
    status = Column(String(30), default="CONFIRMED", index=True) # DRAFT, CONFIRMED, DISPATCHED
    created_at = Column(DateTime, default=datetime.utcnow)

    grn = relationship("GoodsReceiptNote", lazy="joined")
    bill = relationship("PurchaseBill", lazy="joined")
    supplier = relationship("ClientMaster", lazy="joined")


# -------------------------------------------------------------
# --- 6. QC (QUALITY CONTROL) SUB-MODULE MODELS ---
# -------------------------------------------------------------

class QCMasterStandard(Base):
    """Inspection standards, tolerance thresholds, ASTM D5430 4-point penalty grids, and defect categories."""
    __tablename__ = "qc_master_standards"

    id = Column(Integer, primary_key=True, index=True)
    standard_code = Column(String(50), unique=True, index=True, nullable=False) # e.g. "QC-STD-POPLIN"
    standard_name = Column(String(150), nullable=False)
    fabric_or_yarn_category = Column(String(50), default="GREY_FABRIC")
    astm_grid_type = Column(String(50), default="ASTM_D5430_4_POINT")
    points_per_100sqm_fresh_limit = Column(Float, default=20.0)
    points_per_100sqm_seconds_limit = Column(Float, default=28.0)
    tolerance_rules_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)


class JobWorkQCAudit(Base):
    """Incoming and outgoing quality audits for third-party twisting, sizing, or processing work."""
    __tablename__ = "job_work_qc_audits"

    id = Column(Integer, primary_key=True, index=True)
    audit_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. JWQC-2026-001
    job_worker_name = Column(String(150), nullable=False)
    process_type = Column(String(50), nullable=False) # SIZING, TWISTING, PROCESSING
    lot_number = Column(String(50), nullable=False)
    yarn_count_or_quality = Column(String(150), nullable=False)
    sample_size = Column(String(50), default="10 Bobbins / 100m")
    tests_conducted_json = Column(JSON, default=list) # e.g. [{"test": "Twist TPM", "spec": "450", "actual": "448", "status": "PASS"}]
    audit_score_percent = Column(Float, default=95.0)
    grade = Column(String(30), default="GRADE_A_PASS") # GRADE_A_PASS, GRADE_B_ACCEPTABLE, GRADE_C_REJECTED
    inspector_name = Column(String(100), default="Ramesh QC")
    is_tolerated = Column(Boolean, default=True)
    rejection_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# -------------------------------------------------------------
# --- 7. SALES SUB-MODULE MODELS ---
# -------------------------------------------------------------

class DispatchOrder(Base):
    """Delivery packing list generated from inspected, graded grey fabric rolls (Takas)."""
    __tablename__ = "dispatch_orders"

    id = Column(Integer, primary_key=True, index=True)
    dispatch_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. DSP-2026-001
    sales_order_id = Column(Integer, ForeignKey("sales_orders.id"), nullable=True)
    client_id = Column(Integer, ForeignKey("client_masters.id"), nullable=True)
    customer_name = Column(String(150), nullable=False)
    quality_construction = Column(String(150), nullable=False)
    selected_roll_numbers_json = Column(JSON, default=list) # e.g. ["ROL-L01-104", "ROL-L01-105"]
    total_rolls_count = Column(Integer, default=1)
    total_meters = Column(Float, default=0.0)
    gross_weight_kg = Column(Float, default=0.0)
    destination_city = Column(String(100), default="Ludhiana")
    vehicle_no = Column(String(50), default="GJ-05-BX-9812")
    transporter_name = Column(String(100), default="Gati KWE Logistics")
    status = Column(String(30), default="DISPATCHED", index=True) # STAGED, DISPATCHED, DELIVERED
    dispatched_at = Column(DateTime, default=datetime.utcnow)

    sales_order = relationship("SalesOrder", lazy="joined")
    client = relationship("ClientMaster", lazy="joined")


class SalesInvoice(Base):
    """Commercial sales tax invoice (GST compliant) based on dispatch orders."""
    __tablename__ = "sales_invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. INV-2026-001
    sales_order_id = Column(Integer, ForeignKey("sales_orders.id"), nullable=True)
    dispatch_order_id = Column(Integer, ForeignKey("dispatch_orders.id"), nullable=True)
    client_id = Column(Integer, ForeignKey("client_masters.id"), nullable=True)
    customer_name = Column(String(150), nullable=False)
    customer_gstin = Column(String(20), nullable=True)
    quality_construction = Column(String(150), nullable=False)
    total_meters = Column(Float, default=0.0)
    rate_per_meter = Column(Float, default=0.0)
    taxable_amount = Column(Float, default=0.0)
    tax_percent = Column(Float, default=5.0)
    gst_amount = Column(Float, default=0.0)
    grand_total = Column(Float, default=0.0)
    due_date = Column(String(20), nullable=True)
    payment_status = Column(String(30), default="UNPAID", index=True) # UNPAID, PARTIAL, PAID
    status = Column(String(30), default="ISSUED", index=True) # ISSUED, CANCELLED
    created_at = Column(DateTime, default=datetime.utcnow)

    sales_order = relationship("SalesOrder", lazy="joined")
    dispatch_order = relationship("DispatchOrder", lazy="joined")
    client = relationship("ClientMaster", lazy="joined")


class SalesReturn(Base):
    """Credit-linked intake of returned fabrics with defect mapping and credit note generation."""
    __tablename__ = "sales_returns"

    id = Column(Integer, primary_key=True, index=True)
    return_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. SRET-2026-001
    invoice_id = Column(Integer, ForeignKey("sales_invoices.id"), nullable=True)
    client_id = Column(Integer, ForeignKey("client_masters.id"), nullable=True)
    customer_name = Column(String(150), nullable=False)
    returned_rolls_json = Column(JSON, default=list)
    total_meters = Column(Float, default=0.0)
    rate_per_meter = Column(Float, default=0.0)
    credit_amount = Column(Float, default=0.0)
    defect_reason = Column(Text, nullable=False) # e.g. Heavy Weft Bars, GSM Mismatch
    credit_note_id = Column(Integer, nullable=True)
    quarantine_status = Column(String(30), default="QUARANTINED") # QUARANTINED, RESTOCKED, SCRAPPED
    status = Column(String(30), default="CONFIRMED", index=True) # DRAFT, CONFIRMED
    created_at = Column(DateTime, default=datetime.utcnow)

    invoice = relationship("SalesInvoice", lazy="joined")
    client = relationship("ClientMaster", lazy="joined")


# -------------------------------------------------------------
# --- 8. FINANCE SUB-MODULE MODELS ---
# -------------------------------------------------------------

class FinancePayment(Base):
    """Outward disbursements to yarn suppliers, job-workers, power, and mill overheads."""
    __tablename__ = "finance_payments"

    id = Column(Integer, primary_key=True, index=True)
    payment_voucher_no = Column(String(50), unique=True, index=True, nullable=False) # e.g. PAY-2026-001
    purchase_bill_id = Column(Integer, ForeignKey("purchase_bills.id"), nullable=True)
    supplier_id = Column(Integer, ForeignKey("client_masters.id"), nullable=True)
    payee_name = Column(String(150), nullable=False)
    amount = Column(Float, nullable=False, default=0.0)
    payment_mode = Column(String(50), default="NEFT/RTGS") # NEFT/RTGS, CHEQUE, CASH
    bank_account_code = Column(String(30), default="GL-1010") # HDFC Bank
    reference_utr = Column(String(100), nullable=True)
    remarks = Column(Text, nullable=True)
    payment_date = Column(DateTime, default=datetime.utcnow)

    purchase_bill = relationship("PurchaseBill", lazy="joined")
    supplier = relationship("ClientMaster", lazy="joined")


class FinanceReceipt(Base):
    """Inward payment collections against outstanding customer sales invoices."""
    __tablename__ = "finance_receipts"

    id = Column(Integer, primary_key=True, index=True)
    receipt_voucher_no = Column(String(50), unique=True, index=True, nullable=False) # e.g. RCP-2026-001
    sales_invoice_id = Column(Integer, ForeignKey("sales_invoices.id"), nullable=True)
    client_id = Column(Integer, ForeignKey("client_masters.id"), nullable=True)
    customer_name = Column(String(150), nullable=False)
    amount_received = Column(Float, nullable=False, default=0.0)
    payment_mode = Column(String(50), default="NEFT/RTGS")
    bank_account_code = Column(String(30), default="GL-1010")
    reference_utr = Column(String(100), nullable=True)
    remarks = Column(Text, nullable=True)
    received_date = Column(DateTime, default=datetime.utcnow)

    sales_invoice = relationship("SalesInvoice", lazy="joined")
    client = relationship("ClientMaster", lazy="joined")


class CreditNote(Base):
    """Financial adjustment issued to buyers against sales returns or agreed rate discounts."""
    __tablename__ = "credit_notes"

    id = Column(Integer, primary_key=True, index=True)
    note_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. CN-2026-001
    sales_return_id = Column(Integer, ForeignKey("sales_returns.id"), nullable=True)
    client_id = Column(Integer, ForeignKey("client_masters.id"), nullable=True)
    customer_name = Column(String(150), nullable=False)
    invoice_reference = Column(String(100), nullable=True)
    credit_amount = Column(Float, nullable=False, default=0.0)
    reason = Column(Text, nullable=False)
    status = Column(String(30), default="ISSUED", index=True) # ISSUED, ADJUSTED
    created_at = Column(DateTime, default=datetime.utcnow)

    sales_return = relationship("SalesReturn", lazy="joined")
    client = relationship("ClientMaster", lazy="joined")


class DebitNote(Base):
    """Financial deduction issued to yarn mills for excess tare, weight shortage, or substandard yarn lots."""
    __tablename__ = "debit_notes"

    id = Column(Integer, primary_key=True, index=True)
    note_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. DN-2026-001
    purchase_return_id = Column(Integer, ForeignKey("purchase_returns.id"), nullable=True)
    supplier_id = Column(Integer, ForeignKey("client_masters.id"), nullable=True)
    supplier_name = Column(String(150), nullable=False)
    bill_reference = Column(String(100), nullable=True)
    debit_amount = Column(Float, nullable=False, default=0.0)
    reason = Column(Text, nullable=False)
    status = Column(String(30), default="ISSUED", index=True) # ISSUED, DEDUCTED
    created_at = Column(DateTime, default=datetime.utcnow)

    purchase_return = relationship("PurchaseReturn", lazy="joined")
    supplier = relationship("ClientMaster", lazy="joined")


class AuditEvent(Base):
    """Immutable audit trail for automatic cross-module mutations and reactive event sync."""
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    event_key = Column(String(100), nullable=False, index=True) # e.g. "GRN_FINALIZED_STOCK_ADDED", "DISPATCH_INVOICE_GENERATED"
    module_source = Column(String(50), nullable=False)
    module_target = Column(String(50), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    details_json = Column(JSON, default=dict)
    triggered_by = Column(String(100), default="SYSTEM_SYNC_ENGINE")
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    """Initializes tables and automatically applies schema migrations."""
    Base.metadata.create_all(bind=engine)
    
    # Safe column additions if PostgreSQL tables pre-existed with older schemas
    migrations = [
        "ALTER TABLE client_masters ADD COLUMN IF NOT EXISTS party_code VARCHAR(50);",
        "ALTER TABLE client_masters ADD COLUMN IF NOT EXISTS billing_address TEXT;",
        "ALTER TABLE client_masters ADD COLUMN IF NOT EXISTS state VARCHAR(50);",
        "ALTER TABLE client_masters ADD COLUMN IF NOT EXISTS pincode VARCHAR(10);",
        "ALTER TABLE client_masters ADD COLUMN IF NOT EXISTS pan_number VARCHAR(20);",
        "ALTER TABLE client_masters ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(100);",
        "ALTER TABLE client_masters ADD COLUMN IF NOT EXISTS credit_limit FLOAT DEFAULT 0;",
        "ALTER TABLE employee_masters ADD COLUMN IF NOT EXISTS employee_code VARCHAR(50);",
        "ALTER TABLE employee_masters ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(30);",
        "ALTER TABLE employee_masters ADD COLUMN IF NOT EXISTS id_proof_number VARCHAR(50);",
        "ALTER TABLE employee_masters ADD COLUMN IF NOT EXISTS date_of_joining VARCHAR(20);",
        "ALTER TABLE employee_masters ADD COLUMN IF NOT EXISTS monthly_salary_or_rate FLOAT DEFAULT 0;",
        "ALTER TABLE employee_masters ADD COLUMN IF NOT EXISTS target_meters_monthly FLOAT DEFAULT 0;",
        "ALTER TABLE employee_masters ADD COLUMN IF NOT EXISTS territory VARCHAR(100);",
        "ALTER TABLE item_masters ADD COLUMN IF NOT EXISTS item_code VARCHAR(50);",
        "ALTER TABLE item_masters ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(20);",
        "ALTER TABLE item_masters ADD COLUMN IF NOT EXISTS unit_of_measure VARCHAR(20);",
        "ALTER TABLE item_masters ADD COLUMN IF NOT EXISTS standard_cost FLOAT DEFAULT 0;",
        "ALTER TABLE item_masters ADD COLUMN IF NOT EXISTS reorder_level FLOAT DEFAULT 0;",
        "ALTER TABLE item_masters ADD COLUMN IF NOT EXISTS gst_rate_percent FLOAT DEFAULT 5.0;",
        "ALTER TABLE item_masters ADD COLUMN IF NOT EXISTS warp_count VARCHAR(50);",
        "ALTER TABLE item_masters ADD COLUMN IF NOT EXISTS weft_count VARCHAR(50);",
        "ALTER TABLE item_masters ADD COLUMN IF NOT EXISTS epi INTEGER;",
        "ALTER TABLE item_masters ADD COLUMN IF NOT EXISTS ppi INTEGER;",
        "ALTER TABLE item_masters ADD COLUMN IF NOT EXISTS width_inches FLOAT;",
        "ALTER TABLE item_masters ADD COLUMN IF NOT EXISTS gsm FLOAT;",
        "ALTER TABLE shopfloor_stage_records ADD COLUMN IF NOT EXISTS is_quality_alert BOOLEAN DEFAULT FALSE;",
        "ALTER TABLE shopfloor_stage_records ADD COLUMN IF NOT EXISTS alert_resolved BOOLEAN DEFAULT FALSE;",
        "ALTER TABLE shopfloor_stage_records ADD COLUMN IF NOT EXISTS supervisor_resolution_notes TEXT;"
    ]
    try:
        with engine.connect() as conn:
            for sql in migrations:
                try:
                    conn.execute(text(sql))
                    conn.commit()
                except Exception:
                    pass
    except Exception as e:
        logger.warning(f"Schema migration skipped or failed: {e}")

init_db()