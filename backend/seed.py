from database import engine, SessionLocal, Base, User
from auth import get_password_hash

# Create tables in Supabase if not already present
Base.metadata.create_all(bind=engine)

def seed_users():
    db = SessionLocal()
    users_to_seed = [
        {"username": "owner", "password": "owner@123", "full_name": "Plant Owner", "role": "OWNER"},
        {"username": "store_user", "password": "store@123", "full_name": "Store Incharge", "role": "STORE_MANAGER"},
        {"username": "sales_user", "password": "sales@123", "full_name": "Sales Rep", "role": "SALES_EXECUTIVE"},
        {"username": "crm_user", "password": "crm@123", "full_name": "CRM Officer", "role": "CRM_EXECUTIVE"},
        {"username": "finance_user", "password": "fin@123", "full_name": "Accounts Officer", "role": "FINANCE_ACCOUNTANT"},
        {"username": "payment_user", "password": "pay@123", "full_name": "Billing & Cashier", "role": "PAYMENT_OFFICER"},
    ]

    for item in users_to_seed:
        existing = db.query(User).filter(User.username == item["username"]).first()
        if not existing:
            user = User(
                username=item["username"],
                hashed_password=get_password_hash(item["password"]),
                full_name=item["full_name"],
                role=item["role"],
                is_active=True
            )
            db.add(user)
            print(f"Created user: {item['username']} ({item['role']})")
    
    db.commit()
    db.close()
    print("Database seeding complete!")

if __name__ == "__main__":
    seed_users()