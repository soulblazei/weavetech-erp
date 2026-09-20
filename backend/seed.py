from database import (
    engine, SessionLocal, Base, User, ClientMaster, EmployeeMaster, ItemMaster,
    Loom, YarnStock, BeamAllotment, SalesOrder, PaymentTransaction, ShopFloorStageRecord
)
from auth import get_password_hash
from datetime import datetime

# Initialize and create all tables in database
Base.metadata.create_all(bind=engine)

def seed_users():
    db = SessionLocal()
    users_to_seed = [
        {"username": "owner", "password": "owner@123", "full_name": "Plant Owner - Jugal", "role": "OWNER"},
        {"username": "sales_user", "password": "sales@123", "full_name": "Sales Rep - Rajesh", "role": "SALES_EXECUTIVE"},
        {"username": "store_user", "password": "store@123", "full_name": "Store Incharge - Suresh", "role": "STORE_MANAGER"},
        {"username": "crm_user", "password": "crm@123", "full_name": "CRM Officer - Amit", "role": "CRM_EXECUTIVE"},
        {"username": "finance_user", "password": "fin@123", "full_name": "Accounts Officer - Vikas", "role": "FINANCE_ACCOUNTANT"},
        {"username": "payment_user", "password": "pay@123", "full_name": "Billing & Cashier - Pooja", "role": "PAYMENT_OFFICER"},
        {"username": "qc_user", "password": "qc@123", "full_name": "QC Inspector - Ramesh", "role": "QC_INSPECTOR"},
        {"username": "loom_user", "password": "loom@123", "full_name": "Loom Supervisor - Mahesh", "role": "LOOM_SUPERVISOR"},
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
    print("User accounts seeding complete!")


def seed_looms():
    db = SessionLocal()
    if db.query(Loom).count() == 0:
        for i in range(1, 13):
            l = Loom(
                loom_number=f"Loom L-{str(i).zfill(2)}",
                loom_type="Airjet 230cm" if i <= 8 else "Rapier 220cm",
                rated_rpm=650 if i <= 8 else 450,
                status="RUNNING" if i % 4 != 0 else "BEAM_GAITING"
            )
            db.add(l)
        db.commit()
        print("Looms machinery seeded (12 Looms).")


def seed_client_masters():
    db = SessionLocal()
    
    clients_to_seed = [
        # FABRIC_BUYER
        {"party_code": "CLI-1001", "party_name": "Vardhman Textiles", "party_type": "FABRIC_BUYER", "contact_person": "Ashok Gupta", "phone": "9876543210", "email": "ashok@vardhman.com", "billing_address": "Industrial Area Phase II, Ludhiana", "city": "Ludhiana", "state": "Punjab", "pincode": "141010", "gstin": "24AAACV1234A1Z5", "pan_number": "AAACV1234A", "payment_terms": "30 Days Credit", "credit_limit": 5000000},
        {"party_code": "CLI-1002", "party_name": "Shree Ganesh Fabrics", "party_type": "FABRIC_BUYER", "contact_person": "Ramesh Agarwal", "phone": "9876501234", "email": "ramesh@sgfabrics.in", "billing_address": "Ring Road, Surat", "city": "Surat", "state": "Gujarat", "pincode": "395002", "gstin": "24AABCS5678B1Z2", "pan_number": "AABCS5678B", "payment_terms": "Against Delivery / COD", "credit_limit": 2000000},
        {"party_code": "CLI-1003", "party_name": "Arvind Ltd", "party_type": "FABRIC_BUYER", "contact_person": "Priya Desai", "phone": "9898765432", "email": "priya@arvind.com", "billing_address": "Naroda Road, Ahmedabad", "city": "Ahmedabad", "state": "Gujarat", "pincode": "380025", "gstin": "24AABCA9876C1Z1", "pan_number": "AABCA9876C", "payment_terms": "45 Days Credit", "credit_limit": 10000000},
        {"party_code": "CLI-1004", "party_name": "Raymond Ltd", "party_type": "FABRIC_BUYER", "contact_person": "Sanjay Mehta", "phone": "9876598765", "email": "sanjay@raymond.in", "billing_address": "Thane Industrial Estate", "city": "Thane", "state": "Maharashtra", "pincode": "400601", "gstin": "27AAACR5678D1Z3", "pan_number": "AAACR5678D", "payment_terms": "30 Days Credit", "credit_limit": 15000000},
        # YARN_SUPPLIER
        {"party_code": "CLI-1005", "party_name": "Nahar Spinning", "party_type": "YARN_SUPPLIER", "contact_person": "Harpreet Singh", "phone": "9815012345", "email": "sales@nahar.com", "billing_address": "GT Road, Ludhiana", "city": "Ludhiana", "state": "Punjab", "pincode": "141003", "gstin": "03AABCN1234E1Z5", "pan_number": "AABCN1234E", "payment_terms": "15 Days Credit", "credit_limit": 3000000},
        {"party_code": "CLI-1006", "party_name": "KPR Mill Ltd", "party_type": "YARN_SUPPLIER", "contact_person": "Suresh Rajan", "phone": "9845098765", "email": "suresh@kprmill.com", "billing_address": "Avinashi Road, Coimbatore", "city": "Coimbatore", "state": "Tamil Nadu", "pincode": "641018", "gstin": "33AABCK5678F1Z2", "pan_number": "AABCK5678F", "payment_terms": "21 Days Credit", "credit_limit": 5000000},
        {"party_code": "CLI-1007", "party_name": "Alok Industries", "party_type": "YARN_SUPPLIER", "contact_person": "Manoj Patel", "phone": "9825012345", "email": "manoj@alok.in", "billing_address": "Silvassa Industrial Zone", "city": "Silvassa", "state": "Dadra & Nagar Haveli", "pincode": "396230", "gstin": "26AABCA1234G1Z8", "pan_number": "AABCA1234G", "payment_terms": "Against Delivery / COD", "credit_limit": 2000000},
        # JOB_WORKER
        {"party_code": "CLI-1008", "party_name": "Shree Ram Sizing", "party_type": "JOB_WORKER", "contact_person": "Dinesh Sharma", "phone": "9414012345", "email": "dinesh@shreeram.in", "billing_address": "RIICO Area, Bhilwara", "city": "Bhilwara", "state": "Rajasthan", "pincode": "311001", "gstin": "08AABCS9876H1Z4", "pan_number": "AABCS9876H", "payment_terms": "Weekly Settlement", "credit_limit": 500000},
        {"party_code": "CLI-1009", "party_name": "Banswara Syntex", "party_type": "JOB_WORKER", "contact_person": "Anil Jain", "phone": "9414098765", "email": "anil@banswara.com", "billing_address": "Industrial Area, Banswara", "city": "Banswara", "state": "Rajasthan", "pincode": "327001", "gstin": "08AABCB5678I1Z1", "pan_number": "AABCB5678I", "payment_terms": "10 Days Credit", "credit_limit": 1000000},
        # BROKER
        {"party_code": "CLI-1010", "party_name": "Jatin Textile Brokers", "party_type": "BROKER", "contact_person": "Jatin Parekh", "phone": "9879012345", "email": "jatin@jtbrokers.in", "billing_address": "Textile Market, Surat", "city": "Surat", "state": "Gujarat", "pincode": "395003", "gstin": "24AABCJ1234J1Z7", "pan_number": "AABCJ1234J", "payment_terms": "1% Commission on Dispatch", "credit_limit": 0},
        {"party_code": "CLI-1011", "party_name": "Mandhana Industries", "party_type": "BROKER", "contact_person": "Vijay Shah", "phone": "9876501234", "email": "vijay@mandhana.com", "billing_address": "Lower Parel, Mumbai", "city": "Mumbai", "state": "Maharashtra", "pincode": "400013", "gstin": "27AABCM5678K1Z4", "pan_number": "AABCM5678K", "payment_terms": "1.5% Commission", "credit_limit": 0},
        {"party_code": "CLI-1012", "party_name": "Reliance Fabrics Agency", "party_type": "BROKER", "contact_person": "Deepak Ambani", "phone": "9825098765", "email": "deepak@rfa.in", "billing_address": "CG Road, Ahmedabad", "city": "Ahmedabad", "state": "Gujarat", "pincode": "380009", "gstin": "24AABCR9876L1Z0", "pan_number": "AABCR9876L", "payment_terms": "1% Commission", "credit_limit": 0},
    ]
    
    for item in clients_to_seed:
        existing = db.query(ClientMaster).filter(ClientMaster.party_name == item["party_name"]).first()
        if not existing:
            client = ClientMaster(**item)
            db.add(client)
            credit_display = f"Rs. {item.get('credit_limit', 0):,.0f}" if item.get('credit_limit', 0) > 0 else "N/A"
            print(f"Created client master: {item['party_code']} - {item['party_name']} ({item['party_type']}) - Credit: {credit_display}")
    
    db.commit()
    print("Client master directory seeding complete!")


def seed_employee_masters():
    db = SessionLocal()
    employees_to_seed = [
        {"employee_code": "EMP-1001", "full_name": "Kailash Suthar", "designation": "Weaver / Operator", "department": "Weaving Shed", "shift_preference": "Shift A", "phone": "9828011223", "emergency_contact": "9828099887", "id_proof_number": "5432-8765-1098", "date_of_joining": "2023-04-10", "monthly_salary_or_rate": 26000.0, "is_active": True},
        {"employee_code": "EMP-1002", "full_name": "Mohan Lal Gurjar", "designation": "Weaver / Operator", "department": "Weaving Shed", "shift_preference": "Shift B", "phone": "9829022334", "emergency_contact": "9829088776", "id_proof_number": "4321-7654-2109", "date_of_joining": "2023-06-15", "monthly_salary_or_rate": 26000.0, "is_active": True},
        {"employee_code": "EMP-1003", "full_name": "Mahesh Prajapati", "designation": "Shift Supervisor", "department": "Weaving Shed", "shift_preference": "Shift A", "phone": "9414033445", "emergency_contact": "9414077665", "id_proof_number": "3210-6543-3210", "date_of_joining": "2022-01-10", "monthly_salary_or_rate": 42000.0, "is_active": True},
        {"employee_code": "EMP-1004", "full_name": "Ramesh Kumar Sharma", "designation": "QC Incharge", "department": "Quality Control", "shift_preference": "Shift A", "phone": "9876044556", "emergency_contact": "9876066554", "id_proof_number": "2109-5432-4321", "date_of_joining": "2022-08-20", "monthly_salary_or_rate": 38000.0, "is_active": True},
        {"employee_code": "EMP-1005", "full_name": "Suresh Choudhary", "designation": "Store Incharge", "department": "Store", "shift_preference": "Shift A", "phone": "9825055667", "emergency_contact": "9825055443", "id_proof_number": "1098-4321-5432", "date_of_joining": "2021-11-05", "monthly_salary_or_rate": 36000.0, "is_active": True},
        {"employee_code": "EMP-1006", "full_name": "Rajesh Patel", "designation": "Sales Officer", "department": "Sales", "shift_preference": "General", "phone": "9879066778", "emergency_contact": "9879044332", "id_proof_number": "0987-3210-6543", "date_of_joining": "2023-01-15", "monthly_salary_or_rate": 45000.0, "is_active": True},
        {"employee_code": "EMP-1007", "full_name": "Vikas Verma", "designation": "Accounts Officer", "department": "Accounts", "shift_preference": "General", "phone": "9898077889", "emergency_contact": "9898033221", "id_proof_number": "9876-2109-7654", "date_of_joining": "2021-03-01", "monthly_salary_or_rate": 50000.0, "is_active": True},
    ]

    for item in employees_to_seed:
        existing = db.query(EmployeeMaster).filter(EmployeeMaster.employee_code == item["employee_code"]).first()
        if not existing:
            emp = EmployeeMaster(**item)
            db.add(emp)
            print(f"Created employee master: {item['employee_code']} - {item['full_name']} ({item['designation']})")

    db.commit()
    print("Employee master directory seeding complete!")


def seed_item_masters():
    db = SessionLocal()
    items_to_seed = [
        # RAW_YARN
        {"item_code": "ITM-YRN-40C", "item_name": "40s Combed Cotton Yarn", "item_category": "RAW_YARN", "hsn_code": "5205", "unit_of_measure": "KG", "standard_cost": 310.0, "reorder_level": 2500.0, "gst_rate_percent": 5.0, "warp_count": "40s Combed", "weft_count": None, "epi": None, "ppi": None, "width_inches": None, "gsm": None},
        {"item_code": "ITM-YRN-60CP", "item_name": "60s Compact Cotton Yarn", "item_category": "RAW_YARN", "hsn_code": "5205", "unit_of_measure": "KG", "standard_cost": 420.0, "reorder_level": 2000.0, "gst_rate_percent": 5.0, "warp_count": "60s Compact", "weft_count": None, "epi": None, "ppi": None, "width_inches": None, "gsm": None},
        {"item_code": "ITM-YRN-40CD", "item_name": "40s Carded Cotton Yarn", "item_category": "RAW_YARN", "hsn_code": "5205", "unit_of_measure": "KG", "standard_cost": 280.0, "reorder_level": 3000.0, "gst_rate_percent": 5.0, "warp_count": "40s Carded", "weft_count": None, "epi": None, "ppi": None, "width_inches": None, "gsm": None},
        {"item_code": "ITM-YRN-30CD", "item_name": "30s Carded Cotton Yarn", "item_category": "RAW_YARN", "hsn_code": "5205", "unit_of_measure": "KG", "standard_cost": 260.0, "reorder_level": 2000.0, "gst_rate_percent": 5.0, "warp_count": "30s Carded", "weft_count": None, "epi": None, "ppi": None, "width_inches": None, "gsm": None},
        
        # GREY_FABRIC
        {"item_code": "ITM-FAB-60X60", "item_name": "Grey Fabric Poplin 60x60 / 92x88", "item_category": "GREY_FABRIC", "hsn_code": "5208", "unit_of_measure": "MTR", "standard_cost": 36.50, "reorder_level": 10000.0, "gst_rate_percent": 5.0, "warp_count": "60s Combed", "weft_count": "60s Combed", "epi": 92, "ppi": 88, "width_inches": 58.0, "gsm": 110.0},
        {"item_code": "ITM-FAB-40X40", "item_name": "Grey Fabric Sheeting 40x40 / 132x72", "item_category": "GREY_FABRIC", "hsn_code": "5208", "unit_of_measure": "MTR", "standard_cost": 48.00, "reorder_level": 15000.0, "gst_rate_percent": 5.0, "warp_count": "40s Combed", "weft_count": "40s Carded", "epi": 132, "ppi": 72, "width_inches": 63.0, "gsm": 145.0},
        {"item_code": "ITM-FAB-60CAM", "item_name": "Grey Fabric Cambric 60x60 / 110x90", "item_category": "GREY_FABRIC", "hsn_code": "5208", "unit_of_measure": "MTR", "standard_cost": 58.00, "reorder_level": 8000.0, "gst_rate_percent": 5.0, "warp_count": "60s Compact", "weft_count": "60s Combed", "epi": 110, "ppi": 90, "width_inches": 58.0, "gsm": 95.0},
        {"item_code": "ITM-FAB-30TWL", "item_name": "Grey Fabric Twill 2/1 30x30 / 100x64", "item_category": "GREY_FABRIC", "hsn_code": "5208", "unit_of_measure": "MTR", "standard_cost": 52.00, "reorder_level": 5000.0, "gst_rate_percent": 5.0, "warp_count": "30s Carded", "weft_count": "30s Carded", "epi": 100, "ppi": 64, "width_inches": 58.0, "gsm": 165.0},
        
        # SIZING_MATERIAL & LOOM_SPARE
        {"item_code": "ITM-CHM-SIZING", "item_name": "Modified Tapioca Sizing Starch", "item_category": "SIZING_MATERIAL", "hsn_code": "3505", "unit_of_measure": "BAG", "standard_cost": 1450.0, "reorder_level": 50.0, "gst_rate_percent": 18.0, "warp_count": None, "weft_count": None, "epi": None, "ppi": None, "width_inches": None, "gsm": None},
        {"item_code": "ITM-SPR-DROPWIRE", "item_name": "Airjet Loom Drop Wires (Set of 1000)", "item_category": "LOOM_SPARE", "hsn_code": "8448", "unit_of_measure": "PCS", "standard_cost": 850.0, "reorder_level": 20.0, "gst_rate_percent": 18.0, "warp_count": None, "weft_count": None, "epi": None, "ppi": None, "width_inches": None, "gsm": None},
    ]

    for item in items_to_seed:
        existing = db.query(ItemMaster).filter(ItemMaster.item_code == item["item_code"]).first()
        if not existing:
            itm = ItemMaster(**item)
            db.add(itm)
            print(f"Created item master: {item['item_code']} - {item['item_name']} ({item['item_category']})")

    db.commit()
    print("Item master directory seeding complete!")


def seed_shopfloor_stages():
    db = SessionLocal()
    if db.query(ShopFloorStageRecord).count() > 0:
        print("Shop-floor stage records already exist.")
        return

    print("Seeding full 13-stage shop-floor sequential lineage...")
    root_lot = "LOT-2026-CTN40"

    stages_data = [
        # 1. Yarn Inward
        {
            "stage_key": "1_YARN_INWARD", "stage_name": "Yarn Purchase / Inward", "stage_number": 1,
            "batch_code": root_lot, "preceding_record_id": None, "preceding_batch_code": None, "root_yarn_lot": root_lot,
            "operator_name": "Suresh Store", "operator_role": "Store Manager",
            "incoming_rating": None, "incoming_defects": [], "incoming_notes": "Received in good condition from Nahar Spinning",
            "is_quality_alert": False, "input_weight_kg": 5000.0, "output_weight_kg": 5000.0, "waste_weight_kg": 0.0,
            "stage_data": {"po_no": "PO-2026-089", "vendor_name": "Nahar Spinning", "yarn_count": "40s Combed Cotton", "bags_count": 100, "gross_weight": 5050.0, "net_weight": 5000.0, "storage_rack": "Bay A-01"}
        },
        # 2. Winding
        {
            "stage_key": "2_YARN_WINDING", "stage_name": "Yarn Issue on Winding", "stage_number": 2,
            "batch_code": "WND-2026-001", "preceding_record_id": 1, "preceding_batch_code": root_lot, "root_yarn_lot": root_lot,
            "operator_name": "Kailash Suthar", "operator_role": "Winding Worker",
            "incoming_rating": 5, "incoming_defects": [], "incoming_notes": "Cones dry, smooth unwinding with zero snags",
            "is_quality_alert": False, "input_weight_kg": 4800.0, "output_weight_kg": 4775.0, "waste_weight_kg": 20.0,
            "stage_data": {"machine_no": "WIND-01", "bobbins_produced": 480, "spindles_run": 60}
        },
        # 3. TFO Twisting
        {
            "stage_key": "3_YARN_TFO", "stage_name": "Yarn TFO (Two-for-One Twisting)", "stage_number": 3,
            "batch_code": "TFO-2026-001", "preceding_record_id": 2, "preceding_batch_code": "WND-2026-001", "root_yarn_lot": root_lot,
            "operator_name": "Mohan Lal", "operator_role": "TFO Worker",
            "incoming_rating": 4, "incoming_defects": ["Soft Bobbin Build"], "incoming_notes": "Good density, few soft noses on lower deck",
            "is_quality_alert": False, "input_weight_kg": 4775.0, "output_weight_kg": 4745.0, "waste_weight_kg": 25.0,
            "stage_data": {"tfo_machine_no": "TFO-02", "target_tpm": 450, "spindles_active": 128}
        },
        # 4. Warping Issue
        {
            "stage_key": "4_YARN_WARPING_ISSUE", "stage_name": "Yarn Issue on Warping", "stage_number": 4,
            "batch_code": "WRP-ISS-2026-001", "preceding_record_id": 3, "preceding_batch_code": "TFO-2026-001", "root_yarn_lot": root_lot,
            "operator_name": "Mahesh Prajapati", "operator_role": "Supervisor",
            "incoming_rating": 5, "incoming_defects": [], "incoming_notes": "TFO twist balance verified under strobe",
            "is_quality_alert": False, "input_weight_kg": 4000.0, "output_weight_kg": 4000.0, "waste_weight_kg": 0.0,
            "stage_data": {"target_beam_set": "SET-2026-081", "total_ends": 4800, "creel_capacity_used": 480, "warping_machine_id": "WARP-DIR-01"}
        },
        # 5. Weft Supply
        {
            "stage_key": "5_YARN_WEFT_ISSUE", "stage_name": "Yarn Issue on Loom (Weft Supply)", "stage_number": 5,
            "batch_code": "WFT-ISS-2026-001", "preceding_record_id": 3, "preceding_batch_code": "TFO-2026-001", "root_yarn_lot": root_lot,
            "operator_name": "Mahesh Prajapati", "operator_role": "Supervisor",
            "incoming_rating": 4, "incoming_defects": [], "incoming_notes": "Delivered to Airjet Looms L01-L04",
            "is_quality_alert": False, "input_weight_kg": 745.0, "output_weight_kg": 745.0, "waste_weight_kg": 0.0,
            "stage_data": {"loom_numbers": "L-01, L-02, L-03", "package_count": 160, "assigned_weaver": "Kailash Suthar"}
        },
        # 6. Beam Making
        {
            "stage_key": "6_BEAM_MAKING", "stage_name": "Beam Making (Warping Completion)", "stage_number": 6,
            "batch_code": "BM-2026-081", "preceding_record_id": 4, "preceding_batch_code": "WRP-ISS-2026-001", "root_yarn_lot": root_lot,
            "operator_name": "Kailash Suthar", "operator_role": "Warper",
            "incoming_rating": 5, "incoming_defects": [], "incoming_notes": "Creel ran cleanly, zero static jumps",
            "is_quality_alert": False, "input_weight_kg": 4000.0, "output_weight_kg": 3970.0, "waste_weight_kg": 25.0,
            "stage_data": {"beam_number": "BM-2026-081", "total_ends": 4800, "beam_flange_width": 58.0, "measured_warp_meters": 3500.0, "tension_log_cn": "38-42 cN"}
        },
        # 7. Beam Geeting
        {
            "stage_key": "7_BEAM_GEETING", "stage_name": "Beam Issue for Geeting (Drawing-in / Knotting / Denting)", "stage_number": 7,
            "batch_code": "GET-2026-081", "preceding_record_id": 6, "preceding_batch_code": "BM-2026-081", "root_yarn_lot": root_lot,
            "operator_name": "Mohan Lal", "operator_role": "Getter",
            "incoming_rating": 5, "incoming_defects": [], "incoming_notes": "Excellent beam flange level, zero end cross-overs",
            "is_quality_alert": False, "input_weight_kg": 3970.0, "output_weight_kg": 3970.0, "waste_weight_kg": 0.0,
            "stage_data": {"reed_count": 92, "heald_frame_set": "HF-04", "drop_wire_set": "DW-04", "draft_plan": "Straight 1-2-3-4", "reed_width_inches": 58.0, "status": "COMPLETED"}
        },
        # 8. Beam Gaiting
        {
            "stage_key": "8_BEAM_GAITING", "stage_name": "Beam Issue on Loom (Gaiting & Loading)", "stage_number": 8,
            "batch_code": "GAT-LM01-081", "preceding_record_id": 7, "preceding_batch_code": "GET-2026-081", "root_yarn_lot": root_lot,
            "operator_name": "Mahesh Prajapati", "operator_role": "Loom Master",
            "incoming_rating": 5, "incoming_defects": [], "incoming_notes": "Drawing 100% accurate, reed clearance set to 2.5mm",
            "is_quality_alert": False, "input_weight_kg": 3970.0, "output_weight_kg": 3970.0, "waste_weight_kg": 0.0,
            "stage_data": {"loom_number": "Loom L-01", "starting_picks": 120000, "tension_setting": "180 cN", "shedding_timing": "300 deg"}
        },
        # 9. Taka Making
        {
            "stage_key": "9_TAKA_MAKING", "stage_name": "Taka Making (Doffing / Loom Roll Production)", "stage_number": 9,
            "batch_code": "TK-2026-101", "preceding_record_id": 8, "preceding_batch_code": "GAT-LM01-081", "root_yarn_lot": root_lot,
            "operator_name": "Kailash Suthar", "operator_role": "Loom Worker",
            "incoming_rating": 4, "incoming_defects": ["Temple Mark Tension"], "incoming_notes": "Smooth weaving at 620 RPM on Airjet L-01",
            "is_quality_alert": False, "input_weight_kg": 25.0, "output_weight_kg": 24.8, "waste_weight_kg": 0.1,
            "stage_data": {"loom_number": "Loom L-01", "shift": "Shift A", "cut_meters": 120.5, "pick_diff": 42000, "gross_weight_kg": 24.8}
        },
        # 10. Taka Checking
        {
            "stage_key": "10_TAKA_CHECKING", "stage_name": "Taka Checking (Grey Mending & Inspection)", "stage_number": 10,
            "batch_code": "CHK-TK-101", "preceding_record_id": 9, "preceding_batch_code": "TK-2026-101", "root_yarn_lot": root_lot,
            "operator_name": "Ramesh Kumar Sharma", "operator_role": "QC Inspector",
            "incoming_rating": 5, "incoming_defects": [], "incoming_notes": "Clean weave, ASTM 4-Point score 7.9 pts / 100 sqm -> Grade Fresh",
            "is_quality_alert": False, "input_weight_kg": 24.8, "output_weight_kg": 24.8, "waste_weight_kg": 0.0,
            "stage_data": {"inspected_meters": 120.5, "width_inches": 58.0, "total_defect_points": 14, "grade": "FRESH", "barcode_data": "ROLL-TK-101-FRESH"}
        },
        # 11. Taka Folding
        {
            "stage_key": "11_TAKA_FOLDING", "stage_name": "Taka Folding (Rolling & Packaging)", "stage_number": 11,
            "batch_code": "FLD-TAG-101", "preceding_record_id": 10, "preceding_batch_code": "CHK-TK-101", "root_yarn_lot": root_lot,
            "operator_name": "Suresh Choudhary", "operator_role": "Folder",
            "incoming_rating": 5, "incoming_defects": [], "incoming_notes": "Taka mended properly, selvedges aligned",
            "is_quality_alert": False, "input_weight_kg": 24.8, "output_weight_kg": 24.8, "waste_weight_kg": 0.0,
            "stage_data": {"folded_roll_tag": "TAG-2026-0811", "measured_fold_length": 120.5, "packing_type": "Poly Roll", "stamp_verified": True}
        },
        # 12. Taka Dispatching
        {
            "stage_key": "12_TAKA_DISPATCH", "stage_name": "Taka Dispatching (Grouping & Staging)", "stage_number": 12,
            "batch_code": "DSP-LOT-2026-01", "preceding_record_id": 11, "preceding_batch_code": "FLD-TAG-101", "root_yarn_lot": root_lot,
            "operator_name": "Suresh Choudhary", "operator_role": "Store Incharge",
            "incoming_rating": 5, "incoming_defects": [], "incoming_notes": "Poly wrapping intact, roll tags verified",
            "is_quality_alert": False, "input_weight_kg": 24.8, "output_weight_kg": 24.8, "waste_weight_kg": 0.0,
            "stage_data": {"dispatch_lot_id": "DSP-LOT-2026-01", "selected_taka_ids": ["TK-2026-101"], "total_rolls": 1, "destination_client": "Vardhman Textiles", "vehicle_no": "GJ-05-BX-9812"}
        },
        # 13. Delivery Challan
        {
            "stage_key": "13_DELIVERY_CHALLAN", "stage_name": "Delivery Challan Making", "stage_number": 13,
            "batch_code": "CHL-2026-0042", "preceding_record_id": 12, "preceding_batch_code": "DSP-LOT-2026-01", "root_yarn_lot": root_lot,
            "operator_name": "Vikas Verma", "operator_role": "Accounts Officer",
            "incoming_rating": 5, "incoming_defects": [], "incoming_notes": "Vehicle loaded & covered with tarpaulin, weight stamped",
            "is_quality_alert": False, "input_weight_kg": 24.8, "output_weight_kg": 24.8, "waste_weight_kg": 0.0,
            "stage_data": {"challan_no": "CHL-2026-0042", "consignee_name": "Vardhman Textiles", "gstin": "24AAACV1234A1Z5", "eway_bill_no": "341890124567", "transporter_name": "Gati KWE Logistics", "total_pieces": 1, "total_meters": 120.5}
        }
    ]

    for s in stages_data:
        rec = ShopFloorStageRecord(**s)
        db.add(rec)

    # Add a quality alert stage sample for testing supervisor alert matrix
    alert_sample = ShopFloorStageRecord(
        stage_key="3_YARN_TFO", stage_name="Yarn TFO (Two-for-One Twisting)", stage_number=3,
        batch_code="TFO-2026-099-ALERT", preceding_record_id=2, preceding_batch_code="WND-2026-001", root_yarn_lot=root_lot,
        operator_name="Mohan Lal", operator_role="TFO Worker",
        incoming_rating=2, incoming_defects=["Soft Bobbin Build", "Slough Off", "Uneven Tension"],
        incoming_notes="Bobbin winding tension too soft; high slough-off risk during high-speed twisting.",
        is_quality_alert=True, alert_resolved=False, input_weight_kg=1200.0, output_weight_kg=1180.0, waste_weight_kg=18.0,
        stage_data={"tfo_machine_no": "TFO-01", "target_tpm": 450}, status="FLAGGED_ALERT"
    )
    db.add(alert_sample)

    db.commit()
    print("13-Stage Shop-Floor Handover & Traceability Seeding Complete!")


def seed_store_and_purchase():
    from database import (
        StoreRequisition, StoreMaterialIssue, StoreStockReceived, StoreItemOpening,
        PurchaseIndent, PurchaseOrder, PurchaseInwardEntry, GoodsReceiptNote, PurchaseBill, PurchaseReturn
    )
    db = SessionLocal()
    
    if db.query(StoreRequisition).count() == 0:
        req1 = StoreRequisition(
            req_number="REQ-2026-001", department="Loom Shed", item_name="40s Combed Cotton Yarn",
            quantity=5000.0, uom="KG", urgency="NORMAL", requested_by="Mahesh Prajapati",
            required_by_date="2026-03-25", status="APPROVED", remarks="Required for Loom L-01 to L-04 poplin run"
        )
        req2 = StoreRequisition(
            req_number="REQ-2026-002", department="Winding", item_name="Loom Spares - Drop Wires DW-04",
            quantity=2000.0, uom="PCS", urgency="URGENT", requested_by="Kailash Suthar",
            required_by_date="2026-03-22", status="PENDING", remarks="Replacement for worn wires on Gaiting"
        )
        db.add_all([req1, req2])
        db.commit()

        # Material Issue
        iss1 = StoreMaterialIssue(
            issue_number="ISS-2026-001", requisition_id=1, department="Loom Shed",
            issued_to="Kailash Suthar", item_name="40s Combed Cotton Yarn",
            lot_number="LOT-20260201-001", issued_quantity=4800.0, uom="KG",
            godown_bay="Bay A-01", issued_by="Suresh Choudhary", remarks="Issued 96 bags to Winding"
        )
        db.add(iss1)

        # Stock Received
        rec1 = StoreStockReceived(
            receipt_number="REC-2026-001", source_type="PURCHASE_GRN", grn_id=1,
            supplier_name="Nahar Spinning", item_name="40s Combed Cotton Yarn",
            lot_number="LOT-20260201-001", quantity_received=6000.0, uom="KG",
            net_weight_kg=6000.0, rate_per_unit=310.0, total_valuation=1860000.0,
            godown_bay="Bay A-01", qc_status="APPROVED"
        )
        rec2 = StoreStockReceived(
            receipt_number="REC-2026-002", source_type="PURCHASE_GRN", grn_id=2,
            supplier_name="KPR Mill Ltd", item_name="60s Compact Cotton",
            lot_number="LOT-20260208-002", quantity_received=4000.0, uom="KG",
            net_weight_kg=4000.0, rate_per_unit=420.0, total_valuation=1680000.0,
            godown_bay="Bay B-02", qc_status="APPROVED"
        )
        db.add_all([rec1, rec2])

        # Item Opening
        op1 = StoreItemOpening(
            financial_year="2026-2027", item_master_id=1, item_name="40s Combed Cotton",
            item_category="RAW_YARN", opening_quantity=10000.0, uom="KG", opening_rate=310.0,
            total_valuation=3100000.0, godown_bay="Bay A-01", configured_by="Store Incharge"
        )
        db.add(op1)

        # Purchase Indent
        ind1 = PurchaseIndent(
            indent_number="IND-2026-001", requisition_id=1, department="Loom Shed",
            item_name="40s Combed Cotton Yarn", required_quantity=5000.0, uom="KG",
            target_date="2026-03-25", priority="HIGH", estimated_rate=310.0,
            status="PO_RAISED", created_by="Purchase Officer"
        )
        db.add(ind1)
        db.commit()

        # Purchase Order
        po1 = PurchaseOrder(
            po_number="PO-2026-089", indent_id=1, supplier_id=5, supplier_name="Nahar Spinning",
            item_name="40s Combed Cotton Yarn", quantity=5000.0, uom="KG", rate_per_unit=310.0,
            tax_percent=5.0, total_raw_amount=1550000.0, tax_amount=77500.0, grand_total=1627500.0,
            payment_terms="15 Days Credit", delivery_date="2026-03-15", status="CLOSED",
            remarks="Direct mill supply with CSP test report"
        )
        po2 = PurchaseOrder(
            po_number="PO-2026-090", indent_id=None, supplier_id=6, supplier_name="KPR Mill Ltd",
            item_name="60s Compact Cotton", quantity=4000.0, uom="KG", rate_per_unit=420.0,
            tax_percent=5.0, total_raw_amount=1680000.0, tax_amount=84000.0, grand_total=1764000.0,
            payment_terms="21 Days Credit", delivery_date="2026-03-28", status="PENDING",
            remarks="High twist compact yarn for cambric run"
        )
        db.add_all([po1, po2])
        db.commit()

        # Gate Inward
        gin1 = PurchaseInwardEntry(
            inward_number="GIN-2026-001", po_id=1, supplier_name="Nahar Spinning",
            item_name="40s Combed Cotton Yarn", delivery_challan_no="CH-NAHAR-9921",
            vehicle_no="PB-10-CZ-4412", received_packages_count=100, reported_weight_kg=5050.0,
            driver_name="Gurpreet Singh", status="COMPLETED"
        )
        db.add(gin1)
        db.commit()

        # GRN
        grn1 = GoodsReceiptNote(
            grn_number="GRN-2026-001", po_id=1, inward_id=1, supplier_name="Nahar Spinning",
            item_name="40s Combed Cotton Yarn", lot_number="LOT-2026-CTN40",
            gross_weight_kg=5050.0, tare_weight_kg=50.0, net_weight_kg=5000.0,
            accepted_weight_kg=5000.0, rejected_weight_kg=0.0, rate_per_kg=310.0,
            total_valuation=1550000.0, qc_status="PASSED", inspector_name="Ramesh QC",
            godown_bay="Bay A-01", status="CONFIRMED"
        )
        db.add(grn1)
        db.commit()

        # Purchase Bill
        pb1 = PurchaseBill(
            bill_number="PB-2026-001", supplier_invoice_no="INV-NAHAR-2026-881",
            supplier_id=5, supplier_name="Nahar Spinning", po_id=1, grn_id=1,
            item_name="40s Combed Cotton Yarn", net_weight_kg=5000.0, rate_per_kg=310.0,
            total_raw_amount=1550000.0, tax_percent=5.0, tax_amount=77500.0,
            grand_total=1627500.0, due_date="2026-03-30", payment_status="PARTIALLY_PAID",
            approval_status="APPROVED"
        )
        db.add(pb1)
        db.commit()
        print("Store & Purchase demonstration records seeded.")


def seed_qc_sales_and_finance():
    from database import (
        QCMasterStandard, JobWorkQCAudit, DispatchOrder, SalesInvoice, SalesReturn,
        FinancePayment, FinanceReceipt, CreditNote, DebitNote, AuditEvent
    )
    db = SessionLocal()

    if db.query(QCMasterStandard).count() == 0:
        std1 = QCMasterStandard(
            standard_code="QC-STD-POPLIN", standard_name="Export Grade Grey Poplin (ASTM D5430)",
            fabric_or_yarn_category="GREY_FABRIC", points_per_100sqm_fresh_limit=20.0,
            points_per_100sqm_seconds_limit=28.0,
            tolerance_rules_json={
                "max_warp_floats_per_roll": 2, "max_weft_cracks_per_roll": 1,
                "width_tolerance_inches": 0.5, "gsm_tolerance_percent": 3.0
            }
        )
        std2 = QCMasterStandard(
            standard_code="QC-STD-SHEETING", standard_name="Wide Width Bed Sheeting (ASTM D5430)",
            fabric_or_yarn_category="GREY_FABRIC", points_per_100sqm_fresh_limit=22.0,
            points_per_100sqm_seconds_limit=30.0,
            tolerance_rules_json={
                "max_slubs_per_roll": 3, "width_tolerance_inches": 0.75
            }
        )
        db.add_all([std1, std2])

        # Job Work QC
        jw1 = JobWorkQCAudit(
            audit_number="JWQC-2026-001", job_worker_name="Shree Ram Sizing",
            process_type="SIZING", lot_number="LOT-20260201-001",
            yarn_count_or_quality="40s Combed Cotton Warp", sample_size="5 Leas / 100m",
            tests_conducted_json=[
                {"test": "Size Add-on %", "spec": "11.5 - 12.5%", "actual": "12.1%", "status": "PASS"},
                {"test": "Single End Strength (RKM)", "spec": "> 18.5", "actual": "19.2", "status": "PASS"},
                {"test": "Elongation %", "spec": "> 4.8%", "actual": "5.1%", "status": "PASS"}
            ],
            audit_score_percent=96.5, grade="GRADE_A_PASS", inspector_name="Ramesh QC",
            is_tolerated=True, rejection_notes=None
        )
        db.add(jw1)

        # Dispatch Order
        do1 = DispatchOrder(
            dispatch_number="DSP-2026-001", sales_order_id=1, client_id=1,
            customer_name="Vardhman Textiles", quality_construction="60x60 / 92x88 Poplin",
            selected_roll_numbers_json=["ROL-L01-104", "ROL-TK-101"], total_rolls_count=2,
            total_meters=241.0, gross_weight_kg=49.6, destination_city="Ludhiana",
            vehicle_no="GJ-05-BX-9812", transporter_name="Gati KWE Logistics",
            status="DISPATCHED"
        )
        db.add(do1)
        db.commit()

        # Sales Invoice
        inv1 = SalesInvoice(
            invoice_number="INV-2026-001", sales_order_id=1, dispatch_order_id=1,
            client_id=1, customer_name="Vardhman Textiles", customer_gstin="24AAACV1234A1Z5",
            quality_construction="60x60 / 92x88 Poplin", total_meters=50000.0,
            rate_per_meter=42.50, taxable_amount=2125000.0, tax_percent=5.0,
            gst_amount=106250.0, grand_total=2231250.0, due_date="2026-04-10",
            payment_status="PARTIAL", status="ISSUED"
        )
        db.add(inv1)
        db.commit()

        # Finance Payments & Receipts
        pay1 = FinancePayment(
            payment_voucher_no="PAY-2026-001", purchase_bill_id=1, supplier_id=5,
            payee_name="Nahar Spinning", amount=930000.0, payment_mode="NEFT/RTGS",
            bank_account_code="GL-1010", reference_utr="UTR2026025678",
            remarks="Part payment against PB-2026-001"
        )
        rcp1 = FinanceReceipt(
            receipt_voucher_no="RCP-2026-001", sales_invoice_id=1, client_id=1,
            customer_name="Vardhman Textiles", amount_received=500000.0,
            payment_mode="NEFT/RTGS", bank_account_code="GL-1010",
            reference_utr="UTR2026021234", remarks="Advance payment received for SO-001"
        )
        db.add_all([pay1, rcp1])

        # Credit & Debit notes
        cn1 = CreditNote(
            note_number="CN-2026-001", sales_return_id=None, client_id=1,
            customer_name="Vardhman Textiles", invoice_reference="INV-2026-001",
            credit_amount=15000.0, reason="Commercial discount approved on 50,000m prompt booking",
            status="ISSUED"
        )
        dn1 = DebitNote(
            note_number="DN-2026-001", purchase_return_id=None, supplier_id=5,
            supplier_name="Nahar Spinning", bill_reference="PB-2026-001",
            debit_amount=8500.0, reason="Tare weight shortage deduction on LOT-2026-CTN40",
            status="ISSUED"
        )
        db.add_all([cn1, dn1])

        # Audit Events
        ev1 = AuditEvent(
            event_key="GRN_FINALIZED_STOCK_ADDED", module_source="PURCHASE", module_target="STORE",
            entity_type="GRN", entity_id="GRN-2026-001",
            description="GRN-2026-001 confirmed. Added 5,000kg to Store (LOT-2026-CTN40) and closed PO-2026-089.",
            details_json={"lot_number": "LOT-2026-CTN40", "net_weight_kg": 5000.0, "po_number": "PO-2026-089"}
        )
        ev2 = AuditEvent(
            event_key="DISPATCH_INVOICE_GENERATED", module_source="SHOP_FLOOR", module_target="SALES",
            entity_type="DISPATCH", entity_id="DSP-2026-001",
            description="Stage 13 Challan CHL-2026-0042 logged. Sales Order SO-20260210-001 marked DISPATCHED.",
            details_json={"challan_no": "CHL-2026-0042", "order_number": "SO-20260210-001"}
        )
        db.add_all([ev1, ev2])
        db.commit()
        print("QC, Sales, Finance, and Audit event demonstration records seeded.")


if __name__ == "__main__":
    seed_users()
    seed_looms()
    seed_client_masters()
    seed_employee_masters()
    seed_item_masters()
    seed_shopfloor_stages()
    seed_store_and_purchase()
    seed_qc_sales_and_finance()
    print("\n--- All WEAVE-TECH ERP Enterprise Baseline Seeding Complete! ---")