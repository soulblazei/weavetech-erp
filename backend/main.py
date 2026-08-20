from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime
from pydantic import BaseModel

from database import (
    engine, Base, get_db, 
    User, DailyMISReport, YarnStock, SalesOrder, PaymentTransaction
)
from auth import (
    verify_password, create_access_token, get_current_user, require_roles
)

# Auto-generate tables on Supabase
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Weaving Factory ERP Backend")

# Allow LAN shop-floor connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AUTHENTICATION ---

@app.post("/api/auth/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect username or password"
        )
    
    token = create_access_token(data={"sub": user.username, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "full_name": user.full_name,
        "username": user.username
    }

@app.get("/api/auth/me")
def get_logged_in_user(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": current_user.role
    }

# --- OWNER MODULE & DAILY MIS GENERATION ---

@app.get("/api/owner/daily-mis")
def fetch_daily_mis(
    target_date: str = None, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_roles(["OWNER"]))
):
    selected_date = target_date or date.today().isoformat()
    report = db.query(DailyMISReport).filter(DailyMISReport.report_date == selected_date).first()

    # Aggregate live metrics across tables if record doesn't exist
    if not report:
        total_sales = db.query(func.sum(SalesOrder.total_amount)).scalar() or 0.0
        inventory_val = db.query(func.sum(YarnStock.total_value)).scalar() or 0.0
        payments_collected = db.query(func.sum(PaymentTransaction.amount))\
            .filter(PaymentTransaction.transaction_type == "INWARD").scalar() or 0.0

        report = DailyMISReport(
            report_date=selected_date,
            total_sales_amount=float(total_sales),
            total_payments_collected=float(payments_collected),
            total_payments_pending=max(0.0, float(total_sales - payments_collected)),
            inventory_valuation=float(inventory_val),
            active_leads_count=0,
            fabric_meters_produced=0.0,
            report_summary_json={
                "status": "Auto-Compiled",
                "notes": "Generated automatically from live table ledgers."
            }
        )
        db.add(report)
        db.commit()
        db.refresh(report)

    return report

# --- STORE MODULE ---

@app.get("/api/store/summary", dependencies=[Depends(require_roles(["STORE_MANAGER"]))])
def get_store_summary(db: Session = Depends(get_db)):
    stocks = db.query(YarnStock).all()
    total_val = sum(item.total_value for item in stocks)
    return {"total_lots": len(stocks), "valuation": total_val, "data": stocks}

# --- SALES MODULE ---

@app.get("/api/sales/summary", dependencies=[Depends(require_roles(["SALES_EXECUTIVE"]))])
def get_sales_summary(db: Session = Depends(get_db)):
    orders = db.query(SalesOrder).all()
    return {"total_orders": len(orders), "data": orders}

# --- CRM MODULE ---

@app.get("/api/crm/summary", dependencies=[Depends(require_roles(["CRM_EXECUTIVE"]))])
def get_crm_summary():
    return {"status": "CRM Module ready for client pipeline and interaction logs."}

# --- FINANCE MODULE ---

@app.get("/api/finance/summary", dependencies=[Depends(require_roles(["FINANCE_ACCOUNTANT"]))])
def get_finance_summary():
    return {"status": "Finance Module ready for general ledger and P&L statements."}

# --- PAYMENTS MODULE ---

@app.get("/api/payments/summary", dependencies=[Depends(require_roles(["PAYMENT_OFFICER"]))])
def get_payments_summary(db: Session = Depends(get_db)):
    txns = db.query(PaymentTransaction).all()
    return {"total_transactions": len(txns), "data": txns}