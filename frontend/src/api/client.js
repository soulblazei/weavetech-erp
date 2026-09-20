import axios from 'axios';

const SERVER_IP = window.location.hostname;
const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${SERVER_IP}:8000/api`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('weaving_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// LOCAL MOCK DATABASE (Offline-First Fallback)
// ============================================

const MOCK_DB_KEY = 'weavetech_crm_master_db_v5';

const DEFAULT_MOCK_DB = {
  users: [
    { id: 1, username: 'owner', full_name: 'Plant Owner - Jugal', role: 'OWNER' },
    { id: 2, username: 'sales_user', full_name: 'Sales Rep - Rajesh', role: 'SALES_EXECUTIVE' },
    { id: 3, username: 'store_user', full_name: 'Store Incharge - Suresh', role: 'STORE_MANAGER' },
    { id: 4, username: 'crm_user', full_name: 'CRM Officer - Amit', role: 'CRM_EXECUTIVE' },
    { id: 5, username: 'finance_user', full_name: 'Accounts Officer - Vikas', role: 'FINANCE_ACCOUNTANT' },
    { id: 6, username: 'payment_user', full_name: 'Billing & Cashier - Pooja', role: 'PAYMENT_OFFICER' },
    { id: 7, username: 'qc_user', full_name: 'QC Inspector - Ramesh', role: 'QC_INSPECTOR' },
    { id: 8, username: 'loom_user', full_name: 'Loom Supervisor - Mahesh', role: 'LOOM_SUPERVISOR' },
  ],
  companyMaster: {
    company_name: 'Moti Weaving Mills Pvt Ltd',
    financial_year: '2026-2027',
    gstin: '24AAACW9876K1Z9',
    pan_number: 'AAACW9876K',
    factory_address: 'Plot No. 42-45, GIDC Industrial Estate, Sachin, Surat - 394230, Gujarat',
    contact_email: 'info@motiweaving.com',
    contact_phone: '+91 98790 12345',
    bank_name: 'HDFC Bank Ltd',
    account_number: '50200088991122',
    ifsc_code: 'HDFC0000240',
  },
  clientMasters: [
    { id: 1, party_code: 'CLI-1001', party_name: 'Vardhman Textiles', party_type: 'FABRIC_BUYER', contact_person: 'Ashok Gupta', phone: '9876543210', email: 'ashok@vardhman.com', billing_address: 'Industrial Area Phase II, Ludhiana', city: 'Ludhiana', state: 'Punjab', pincode: '141010', gstin: '24AAACV1234A1Z5', pan_number: 'AAACV1234A', payment_terms: '30 Days Credit', credit_limit: 5000000 },
    { id: 2, party_code: 'CLI-1002', party_name: 'Shree Ganesh Fabrics', party_type: 'FABRIC_BUYER', contact_person: 'Ramesh Agarwal', phone: '9876501234', email: 'ramesh@sgfabrics.in', billing_address: 'Ring Road, Surat', city: 'Surat', state: 'Gujarat', pincode: '395002', gstin: '24AABCS5678B1Z2', pan_number: 'AABCS5678B', payment_terms: 'Against Delivery / COD', credit_limit: 2000000 },
    { id: 3, party_code: 'CLI-1003', party_name: 'Arvind Ltd', party_type: 'FABRIC_BUYER', contact_person: 'Priya Desai', phone: '9898765432', email: 'priya@arvind.com', billing_address: 'Naroda Road, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', pincode: '380025', gstin: '24AABCA9876C1Z1', pan_number: 'AABCA9876C', payment_terms: '45 Days Credit', credit_limit: 10000000 },
    { id: 4, party_code: 'CLI-1004', party_name: 'Raymond Ltd', party_type: 'FABRIC_BUYER', contact_person: 'Sanjay Mehta', phone: '9876598765', email: 'sanjay@raymond.in', billing_address: 'Thane Industrial Estate', city: 'Thane', state: 'Maharashtra', pincode: '400601', gstin: '27AAACR5678D1Z3', pan_number: 'AAACR5678D', payment_terms: '30 Days Credit', credit_limit: 15000000 },
    { id: 5, party_code: 'CLI-1005', party_name: 'Nahar Spinning', party_type: 'YARN_SUPPLIER', contact_person: 'Harpreet Singh', phone: '9815012345', email: 'sales@nahar.com', billing_address: 'GT Road, Ludhiana', city: 'Ludhiana', state: 'Punjab', pincode: '141003', gstin: '03AABCN1234E1Z5', pan_number: 'AABCN1234E', payment_terms: '15 Days Credit', credit_limit: 3000000 },
    { id: 6, party_code: 'CLI-1006', party_name: 'KPR Mill Ltd', party_type: 'YARN_SUPPLIER', contact_person: 'Suresh Rajan', phone: '9845098765', email: 'suresh@kprmill.com', billing_address: 'Avinashi Road, Coimbatore', city: 'Coimbatore', state: 'Tamil Nadu', pincode: '641018', gstin: '33AABCK5678F1Z2', pan_number: 'AABCK5678F', payment_terms: '21 Days Credit', credit_limit: 5000000 },
    { id: 7, party_code: 'CLI-1007', party_name: 'Alok Industries', party_type: 'YARN_SUPPLIER', contact_person: 'Manoj Patel', phone: '9825012345', email: 'manoj@alok.in', billing_address: 'Silvassa Industrial Zone', city: 'Silvassa', state: 'Dadra & Nagar Haveli', pincode: '396230', gstin: '26AABCA1234G1Z8', pan_number: 'AABCA1234G', payment_terms: 'Against Delivery / COD', credit_limit: 2000000 },
    { id: 8, party_code: 'CLI-1008', party_name: 'Shree Ram Sizing', party_type: 'JOB_WORKER', contact_person: 'Dinesh Sharma', phone: '9414012345', email: 'dinesh@shreeram.in', billing_address: 'RIICO Area, Bhilwara', city: 'Bhilwara', state: 'Rajasthan', pincode: '311001', gstin: '08AABCS9876H1Z4', pan_number: 'AABCS9876H', payment_terms: 'Weekly Settlement', credit_limit: 500000 },
    { id: 9, party_code: 'CLI-1009', party_name: 'Banswara Syntex', party_type: 'JOB_WORKER', contact_person: 'Anil Jain', phone: '9414098765', email: 'anil@banswara.com', billing_address: 'Industrial Area, Banswara', city: 'Banswara', state: 'Rajasthan', pincode: '327001', gstin: '08AABCB5678I1Z1', pan_number: 'AABCB5678I', payment_terms: '10 Days Credit', credit_limit: 1000000 },
    { id: 10, party_code: 'CLI-1010', party_name: 'Jatin Textile Brokers', party_type: 'BROKER', contact_person: 'Jatin Parekh', phone: '9879012345', email: 'jatin@jtbrokers.in', billing_address: 'Textile Market, Surat', city: 'Surat', state: 'Gujarat', pincode: '395003', gstin: '24AABCJ1234J1Z7', pan_number: 'AABCJ1234J', payment_terms: '1% Commission on Dispatch', credit_limit: 0 },
    { id: 11, party_code: 'CLI-1011', party_name: 'Mandhana Industries', party_type: 'BROKER', contact_person: 'Vijay Shah', phone: '9876501234', email: 'vijay@mandhana.com', billing_address: 'Lower Parel, Mumbai', city: 'Mumbai', state: 'Maharashtra', pincode: '400013', gstin: '27AABCM5678K1Z4', pan_number: 'AABCM5678K', payment_terms: '1.5% Commission', credit_limit: 0 },
    { id: 12, party_code: 'CLI-1012', party_name: 'Reliance Fabrics Agency', party_type: 'BROKER', contact_person: 'Deepak Ambani', phone: '9825098765', email: 'deepak@rfa.in', billing_address: 'CG Road, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', pincode: '380009', gstin: '24AABCR9876L1Z0', pan_number: 'AABCR9876L', payment_terms: '1% Commission', credit_limit: 0 },
  ],
  employeeMasters: [
    { id: 1, employee_code: 'EMP-1001', full_name: 'Kailash Suthar', designation: 'Weaver / Operator', department: 'Weaving Shed', shift_preference: 'Shift A', phone: '9828011223', emergency_contact: '9828099887', id_proof_number: '5432-8765-1098', date_of_joining: '2023-04-10', monthly_salary_or_rate: 26000.0, target_meters_monthly: 50000.0, territory: 'Surat Loom Shed', is_active: true },
    { id: 2, employee_code: 'EMP-1002', full_name: 'Mohan Lal Gurjar', designation: 'Weaver / Operator', department: 'Weaving Shed', shift_preference: 'Shift B', phone: '9829022334', emergency_contact: '9829088776', id_proof_number: '4321-7654-2109', date_of_joining: '2023-06-15', monthly_salary_or_rate: 26000.0, target_meters_monthly: 50000.0, territory: 'Surat Loom Shed', is_active: true },
    { id: 3, employee_code: 'EMP-1003', full_name: 'Mahesh Prajapati', designation: 'Shift Supervisor', department: 'Weaving Shed', shift_preference: 'Shift A', phone: '9414033445', emergency_contact: '9414077665', id_proof_number: '3210-6543-3210', date_of_joining: '2022-01-10', monthly_salary_or_rate: 42000.0, target_meters_monthly: 100000.0, territory: 'Plant Floor', is_active: true },
    { id: 4, employee_code: 'EMP-1004', full_name: 'Ramesh Kumar Sharma', designation: 'QC Incharge', department: 'Quality Control', shift_preference: 'Shift A', phone: '9876044556', emergency_contact: '9876066554', id_proof_number: '2109-5432-4321', date_of_joining: '2022-08-20', monthly_salary_or_rate: 38000.0, target_meters_monthly: 0, territory: 'QC Lab', is_active: true },
    { id: 5, employee_code: 'EMP-1005', full_name: 'Suresh Choudhary', designation: 'Store Incharge', department: 'Store', shift_preference: 'Shift A', phone: '9825055667', emergency_contact: '9825055443', id_proof_number: '1098-4321-5432', date_of_joining: '2021-11-05', monthly_salary_or_rate: 36000.0, target_meters_monthly: 0, territory: 'Yarn Godown', is_active: true },
    { id: 6, employee_code: 'EMP-1006', full_name: 'Rajesh Patel', designation: 'Sales Officer', department: 'Sales', shift_preference: 'General', phone: '9879066778', emergency_contact: '9879044332', id_proof_number: '0987-3210-6543', date_of_joining: '2023-01-15', monthly_salary_or_rate: 45000.0, target_meters_monthly: 150000.0, territory: 'Surat & Mumbai', is_active: true },
    { id: 7, employee_code: 'EMP-1007', full_name: 'Vikas Verma', designation: 'Accounts Officer', department: 'Accounts', shift_preference: 'General', phone: '9898077889', emergency_contact: '9898033221', id_proof_number: '9876-2109-7654', date_of_joining: '2021-03-01', monthly_salary_or_rate: 50000.0, target_meters_monthly: 0, territory: 'Head Office', is_active: true },
  ],
  itemMasters: [
    { id: 1, item_code: 'ITM-YRN-40C', item_name: '40s Combed Cotton Yarn', item_category: 'RAW_YARN', hsn_code: '5205', unit_of_measure: 'KG', standard_cost: 310.0, reorder_level: 2500.0, gst_rate_percent: 5.0, warp_count: '40s Combed', weft_count: null, epi: null, ppi: null, width_inches: null, gsm: null },
    { id: 2, item_code: 'ITM-YRN-60CP', item_name: '60s Compact Cotton Yarn', item_category: 'RAW_YARN', hsn_code: '5205', unit_of_measure: 'KG', standard_cost: 420.0, reorder_level: 2000.0, gst_rate_percent: 5.0, warp_count: '60s Compact', weft_count: null, epi: null, ppi: null, width_inches: null, gsm: null },
    { id: 3, item_code: 'ITM-YRN-40CD', item_name: '40s Carded Cotton Yarn', item_category: 'RAW_YARN', hsn_code: '5205', unit_of_measure: 'KG', standard_cost: 280.0, reorder_level: 3000.0, gst_rate_percent: 5.0, warp_count: '40s Carded', weft_count: null, epi: null, ppi: null, width_inches: null, gsm: null },
    { id: 4, item_code: 'ITM-FAB-60X60', item_name: 'Grey Fabric Poplin 60x60 / 92x88', item_category: 'GREY_FABRIC', hsn_code: '5208', unit_of_measure: 'MTR', standard_cost: 36.50, reorder_level: 10000.0, gst_rate_percent: 5.0, warp_count: '60s Combed', weft_count: '60s Combed', epi: 92, ppi: 88, width_inches: 58.0, gsm: 110.0 },
    { id: 5, item_code: 'ITM-FAB-40X40', item_name: 'Grey Fabric Sheeting 40x40 / 132x72', item_category: 'GREY_FABRIC', hsn_code: '5208', unit_of_measure: 'MTR', standard_cost: 48.00, reorder_level: 15000.0, gst_rate_percent: 5.0, warp_count: '40s Combed', weft_count: '40s Carded', epi: 132, ppi: 72, width_inches: 63.0, gsm: 145.0 },
    { id: 6, item_code: 'ITM-FAB-60CAM', item_name: 'Grey Fabric Cambric 60x60 / 110x90', item_category: 'GREY_FABRIC', hsn_code: '5208', unit_of_measure: 'MTR', standard_cost: 58.00, reorder_level: 8000.0, gst_rate_percent: 5.0, warp_count: '60s Compact', weft_count: '60s Combed', epi: 110, ppi: 90, width_inches: 58.0, gsm: 95.0 },
    { id: 7, item_code: 'ITM-CHM-SIZING', item_name: 'Modified Tapioca Sizing Starch', item_category: 'SIZING_MATERIAL', hsn_code: '3505', unit_of_measure: 'BAG', standard_cost: 1450.0, reorder_level: 50.0, gst_rate_percent: 18.0, warp_count: null, weft_count: null, epi: null, ppi: null, width_inches: null, gsm: null },
    { id: 8, item_code: 'ITM-SPR-DROPWIRE', item_name: 'Airjet Loom Drop Wires (Set of 1000)', item_category: 'LOOM_SPARE', hsn_code: '8448', unit_of_measure: 'PCS', standard_cost: 850.0, reorder_level: 20.0, gst_rate_percent: 18.0, warp_count: null, weft_count: null, epi: null, ppi: null, width_inches: null, gsm: null },
  ],
  crmLeads: [
    { id: 1, lead_title: 'Summer Poplin 50,000m Inquiry', client_master_id: 1, party_name: 'Vardhman Textiles', contact_person: 'Ashok Gupta', phone: '9876543210', email: 'ashok@vardhman.com', city: 'Ludhiana', source: 'DIRECT_CALL', status: 'QUALIFIED', assigned_to_emp_id: 6, estimated_meters: 50000.0, notes: 'Requires 60x60 combed poplin for garmenting export', created_at: '2026-02-10T10:00:00Z' },
    { id: 2, lead_title: 'US Export Sheeting 80,000m Bulk Lead', client_master_id: 2, party_name: 'Shree Ganesh Fabrics', contact_person: 'Ramesh Agarwal', phone: '9876501234', email: 'ramesh@sgfabrics.in', city: 'Surat', source: 'BROKER_AGENCY', status: 'CONTACTED', assigned_to_emp_id: 6, estimated_meters: 80000.0, notes: 'Through Jatin Textile Brokers, rate sensitive', created_at: '2026-02-14T11:30:00Z' },
    { id: 3, lead_title: 'Cambric 60s Compact 30,000m Lead', client_master_id: 3, party_name: 'Arvind Ltd', contact_person: 'Priya Desai', phone: '9898765432', email: 'priya@arvind.com', city: 'Ahmedabad', source: 'TEXTILE_EXHIBITION', status: 'NEW', assigned_to_emp_id: 6, estimated_meters: 30000.0, notes: 'Met at Surat Gartex Expo', created_at: '2026-02-18T14:15:00Z' },
  ],
  crmInquiries: [
    { id: 1, inquiry_number: 'INQ-2026-001', client_master_id: 1, party_name: 'Vardhman Textiles', contact_person: 'Ashok Gupta', phone: '9876543210', city: 'Ludhiana', quality_construction: '60x60 / 92x88 Cotton Poplin', warp_count: '60s Combed', weft_count: '60s Combed', epi: 92, ppi: 88, width_inches: 58.0, gsm: 110.0, required_meters: 50000.0, target_rate_per_meter: 42.50, total_raw_value: 2125000.0, grand_total: 2231250.0, stage: 'RATE_NEGOTIATION', delivery_target_date: '2026-04-15', remarks: 'Sample roll approved. Target rate Rs. 42.50 vs our quote Rs. 43.00.', created_at: '2026-02-10T10:30:00Z' },
    { id: 2, inquiry_number: 'INQ-2026-002', client_master_id: 2, party_name: 'Shree Ganesh Fabrics', contact_person: 'Ramesh Agarwal', phone: '9876501234', city: 'Surat', quality_construction: '40x40 / 132x72 Sheeting Fabric', warp_count: '40s Combed', weft_count: '40s Carded', epi: 132, ppi: 72, width_inches: 63.0, gsm: 145.0, required_meters: 80000.0, target_rate_per_meter: 55.00, total_raw_value: 4400000.0, grand_total: 4620000.0, stage: 'SAMPLE_SENT', delivery_target_date: '2026-04-25', remarks: '100m sample dispatched on Loom L-02', created_at: '2026-02-14T15:00:00Z' },
    { id: 3, inquiry_number: 'INQ-2026-003', client_master_id: 3, party_name: 'Arvind Ltd', contact_person: 'Priya Desai', phone: '9898765432', city: 'Ahmedabad', quality_construction: '60x60 / 110x90 Cambric', warp_count: '60s Compact', weft_count: '60s Combed', epi: 110, ppi: 90, width_inches: 58.0, gsm: 95.0, required_meters: 25000.0, target_rate_per_meter: 68.00, total_raw_value: 1700000.0, grand_total: 1785000.0, stage: 'WON_ORDER_CONVERTED', delivery_target_date: '2026-04-05', remarks: 'Order converted to SO-20260218-003', created_at: '2026-02-18T09:00:00Z' },
  ],
  crmForecasts: [
    { id: 1, forecast_period: 'April 2026', target_meters: 450000.0, projected_revenue: 19500000.0, achieved_meters: 420000.0, achieved_revenue: 18200000.0, notes: 'Cotton Poplin 60x60 heavy demand' },
    { id: 2, forecast_period: 'May 2026', target_meters: 500000.0, projected_revenue: 22500000.0, achieved_meters: 485000.0, achieved_revenue: 21800000.0, notes: 'US export sheeting run' },
    { id: 3, forecast_period: 'June 2026', target_meters: 550000.0, projected_revenue: 25000000.0, achieved_meters: 120000.0, achieved_revenue: 5400000.0, notes: 'Current in-progress month' },
  ],
  salesOrders: [
    { id: 1, order_number: 'SO-20260210-001', customer_name: 'Vardhman Textiles', contact_person: 'Ashok Gupta', customer_city: 'Ludhiana', quality_construction: '60x60 / 92x88 (Cotton Poplin)', warp_count: '40s Combed', weft_count: '40s Carded', epi: '132', ppi: '72', weave_type: 'Plain 1/1', width_inches: 58, gsm: 120, total_meters: 50000, rate_per_meter: 42.50, tax_percent: 5, total_raw_amount: 2125000, tax_amount: 106250, grand_total: 2231250, delivery_date: '2026-03-15', payment_terms: '30 Days Credit', status: 'IN_WEAVING', remarks: 'Priority dispatch for export run', created_at: '2026-02-10T10:30:00Z' },
    { id: 2, order_number: 'SO-20260214-002', customer_name: 'Raymond Ltd', contact_person: 'Sanjay Mehta', customer_city: 'Thane', quality_construction: '40x40 / 132x72 (Sheeting)', warp_count: '40s Combed', weft_count: '40s Combed', epi: '132', ppi: '72', weave_type: 'Plain 1/1', width_inches: 63, gsm: 145, total_meters: 30000, rate_per_meter: 55.00, tax_percent: 5, total_raw_amount: 1650000, tax_amount: 82500, grand_total: 1732500, delivery_date: '2026-03-25', payment_terms: '45 Days Credit', status: 'PENDING', remarks: 'Standard packaging in rolls', created_at: '2026-02-14T14:15:00Z' },
    { id: 3, order_number: 'SO-20260218-003', customer_name: 'Arvind Ltd', contact_person: 'Priya Desai', customer_city: 'Ahmedabad', quality_construction: '60x60 / 110x90 (Cambric)', warp_count: '60s Compact', weft_count: '60s Combed', epi: '110', ppi: '90', weave_type: 'Plain 1/1', width_inches: 58, gsm: 90, total_meters: 25000, rate_per_meter: 68.00, tax_percent: 5, total_raw_amount: 1700000, tax_amount: 85000, grand_total: 1785000, delivery_date: '2026-03-10', payment_terms: '30 Days Credit', status: 'READY_TO_DISPATCH', remarks: 'Zero bow/skew tolerance', created_at: '2026-02-18T09:00:00Z' },
  ],
  yarnStocks: [
    { id: 1, lot_number: 'LOT-20260201-001', yarn_count: '40s Combed Cotton', supplier_name: 'Nahar Spinning', bags_count: 120, net_weight_kg: 6000, rate_per_kg: 310, total_value: 1860000, godown_bay: 'Bay A-01', received_at: '2026-02-01T11:00:00Z' },
    { id: 2, lot_number: 'LOT-20260208-002', yarn_count: '60s Compact Cotton', supplier_name: 'KPR Mill Ltd', bags_count: 80, net_weight_kg: 4000, rate_per_kg: 420, total_value: 1680000, godown_bay: 'Bay B-02', received_at: '2026-02-08T15:30:00Z' },
    { id: 3, lot_number: 'LOT-20260215-003', yarn_count: '40s Carded Cotton', supplier_name: 'Alok Industries', bags_count: 60, net_weight_kg: 3000, rate_per_kg: 280, total_value: 840000, godown_bay: 'Bay A-03', received_at: '2026-02-15T12:00:00Z' },
  ],
  looms: [
    { id: 1, loom_number: 'Loom L-01', loom_type: 'Airjet 230cm', rated_rpm: 650, status: 'RUNNING' },
    { id: 2, loom_number: 'Loom L-02', loom_type: 'Airjet 230cm', rated_rpm: 650, status: 'RUNNING' },
    { id: 3, loom_number: 'Loom L-03', loom_type: 'Airjet 230cm', rated_rpm: 650, status: 'RUNNING' },
    { id: 4, loom_number: 'Loom L-04', loom_type: 'Airjet 230cm', rated_rpm: 650, status: 'BEAM_GAITING' },
    { id: 5, loom_number: 'Loom L-05', loom_type: 'Airjet 230cm', rated_rpm: 650, status: 'RUNNING' },
    { id: 6, loom_number: 'Loom L-06', loom_type: 'Airjet 230cm', rated_rpm: 650, status: 'RUNNING' },
    { id: 7, loom_number: 'Loom L-07', loom_type: 'Airjet 230cm', rated_rpm: 650, status: 'MAINTENANCE' },
    { id: 8, loom_number: 'Loom L-08', loom_type: 'Airjet 230cm', rated_rpm: 650, status: 'RUNNING' },
    { id: 9, loom_number: 'Loom L-09', loom_type: 'Rapier 220cm', rated_rpm: 450, status: 'RUNNING' },
    { id: 10, loom_number: 'Loom L-10', loom_type: 'Rapier 220cm', rated_rpm: 450, status: 'RUNNING' },
    { id: 11, loom_number: 'Loom L-11', loom_type: 'Rapier 220cm', rated_rpm: 450, status: 'RUNNING' },
    { id: 12, loom_number: 'Loom L-12', loom_type: 'Rapier 220cm', rated_rpm: 450, status: 'BEAM_GAITING' },
  ],
  beamAllotments: [
    { id: 1, beam_number: 'BM-2026-081', loom_id: 1, set_length_meters: 3500, warp_yarn_lot: 'LOT-20260201-001', status: 'RUNNING', mounted_at: '2026-02-18' },
    { id: 2, beam_number: 'BM-2026-082', loom_id: 2, set_length_meters: 3500, warp_yarn_lot: 'LOT-20260201-001', status: 'RUNNING', mounted_at: '2026-02-19' },
    { id: 3, beam_number: 'BM-2026-083', loom_id: 4, set_length_meters: 4200, warp_yarn_lot: 'LOT-20260208-002', status: 'MOUNTED', mounted_at: '2026-02-24' },
  ],
  shiftLogs: [
    { id: 1, loom_id: 1, shift_name: 'Shift A (Day)', operator_name: 'Kailash Suthar', start_picks: 120400, end_picks: 408400, total_picks: 288000, actual_rpm: 600.0, efficiency_percent: 92.31, downtime_minutes: 25, downtime_reason: 'Warp Stop', logged_at: '2026-02-24T18:00:00Z' },
    { id: 2, loom_id: 2, shift_name: 'Shift A (Day)', operator_name: 'Mohan Lal', start_picks: 98000, end_picks: 375200, total_picks: 277200, actual_rpm: 577.5, efficiency_percent: 88.85, downtime_minutes: 40, downtime_reason: 'Weft Break', logged_at: '2026-02-24T18:00:00Z' },
  ],
  greyRolls: [
    { id: 1, roll_number: 'ROL-L01-104', loom_id: 1, quality_construction: '60x60 / 92x88 Poplin', total_meters: 120.5, width_inches: 58.0, total_defect_points: 14, points_per_100_sqm: 7.9, grade: 'FRESH', inspector_name: 'Ramesh QC', barcode_data: 'ROLL-ROL-L01-104-GRD-FRESH', inspected_at: '2026-02-24T16:30:00Z' },
    { id: 2, roll_number: 'ROL-L02-098', loom_id: 2, quality_construction: '40x40 / 132x72 Sheeting', total_meters: 105.0, width_inches: 63.0, total_defect_points: 26, points_per_100_sqm: 15.48, grade: 'FRESH', inspector_name: 'Ramesh QC', barcode_data: 'ROLL-ROL-L02-098-GRD-FRESH', inspected_at: '2026-02-24T17:15:00Z' },
  ],
  paymentTransactions: [
    { id: 1, voucher_number: 'VCH-IN-0001', party_name: 'Vardhman Textiles', transaction_type: 'INWARD', amount: 500000, payment_mode: 'NEFT/RTGS', reference_no: 'UTR2026021234', remarks: 'Advance against SO-20260210-001', transaction_date: '2026-02-12T11:00:00Z' },
    { id: 2, voucher_number: 'VCH-OUT-0001', party_name: 'Nahar Spinning', transaction_type: 'OUTWARD', amount: 930000, payment_mode: 'NEFT/RTGS', reference_no: 'UTR2026025678', remarks: '50% payment for LOT-001 delivery', transaction_date: '2026-02-18T14:30:00Z' },
    { id: 3, voucher_number: 'VCH-IN-0002', party_name: 'Arvind Ltd', transaction_type: 'INWARD', amount: 750000, payment_mode: 'NEFT/RTGS', reference_no: 'UTR2026029988', remarks: 'Part payment against SO-20260218-003', transaction_date: '2026-02-22T16:00:00Z' },
  ],
  salesTasks: [
    { id: 1, title: 'Personal Meet - Rate Negotiation for 50,000m 60x60', task_type: 'PERSONAL_MEET', priority: 'P1_URGENT', party_name: 'Shree Ganesh Fabrics', contact_person: 'Ramesh Agarwal', phone: '9876501234', related_inquiry_or_order_no: 'INQ-2026-042', inquiry_meters: 50000, assigned_to_user_id: 2, due_date: new Date().toISOString(), due_time_slot: '10:30 AM - 11:30 AM', status: 'PENDING', completion_notes: null, created_at: new Date().toISOString() },
    { id: 2, title: 'Follow-up Call - Confirm Sheeting Dispatch Spec', task_type: 'PHONE_CALL', priority: 'P2_HIGH', party_name: 'Mandhana Industries', contact_person: 'Vijay Shah', phone: '9876501234', related_inquiry_or_order_no: 'INQ-2026-039', inquiry_meters: 80000, assigned_to_user_id: 2, due_date: new Date().toISOString(), due_time_slot: '02:30 PM - 03:00 PM', status: 'PENDING', completion_notes: null, created_at: new Date().toISOString() },
    { id: 3, title: 'WhatsApp Rate Card - 40x40 Cambric Quote Update', task_type: 'WHATSAPP_FOLLOWUP', priority: 'P3_MEDIUM', party_name: 'Vardhman Textiles', contact_person: 'Ashok Gupta', phone: '9876543210', related_inquiry_or_order_no: 'SO-20260210-001', inquiry_meters: 25000, assigned_to_user_id: 2, due_date: new Date().toISOString(), due_time_slot: '11:45 AM - 12:15 PM', status: 'IN_PROGRESS', completion_notes: null, created_at: new Date().toISOString() },
    { id: 4, title: 'Payment Reminder - Overdue Balance Clearance', task_type: 'PAYMENT_REMINDER', priority: 'P1_URGENT', party_name: 'Raymond Ltd', contact_person: 'Sanjay Mehta', phone: '9876598765', related_inquiry_or_order_no: 'SO-20260214-002', inquiry_meters: 30000, assigned_to_user_id: 2, due_date: new Date().toISOString(), due_time_slot: '04:00 PM - 04:30 PM', status: 'PENDING', completion_notes: null, created_at: new Date().toISOString() },
  ],
  shopFloorRecords: [
    { id: 1, stage_key: "1_YARN_INWARD", stage_name: "Yarn Purchase / Inward", stage_number: 1, batch_code: "LOT-2026-CTN40", preceding_record_id: null, preceding_batch_code: null, root_yarn_lot: "LOT-2026-CTN40", operator_name: "Suresh Store", operator_role: "Store Manager", incoming_rating: null, incoming_defects: [], incoming_notes: "Received in good condition from Nahar Spinning", is_quality_alert: false, alert_resolved: false, input_weight_kg: 5000.0, output_weight_kg: 5000.0, waste_weight_kg: 0.0, stage_data: { po_no: "PO-2026-089", vendor_name: "Nahar Spinning", yarn_count: "40s Combed Cotton", bags_count: 100, gross_weight: 5050.0, net_weight: 5000.0, storage_rack: "Bay A-01" }, status: "COMPLETED", created_at: "2026-02-10T09:00:00Z" },
    { id: 2, stage_key: "2_YARN_WINDING", stage_name: "Yarn Issue on Winding", stage_number: 2, batch_code: "WND-2026-001", preceding_record_id: 1, preceding_batch_code: "LOT-2026-CTN40", root_yarn_lot: "LOT-2026-CTN40", operator_name: "Kailash Suthar", operator_role: "Winding Worker", incoming_rating: 5, incoming_defects: [], incoming_notes: "Cones dry, smooth unwinding with zero snags", is_quality_alert: false, alert_resolved: false, input_weight_kg: 4800.0, output_weight_kg: 4775.0, waste_weight_kg: 20.0, stage_data: { machine_no: "WIND-01", bobbins_produced: 480, spindles_run: 60 }, status: "COMPLETED", created_at: "2026-02-11T10:30:00Z" },
    { id: 3, stage_key: "3_YARN_TFO", stage_name: "Yarn TFO (Two-for-One Twisting)", stage_number: 3, batch_code: "TFO-2026-001", preceding_record_id: 2, preceding_batch_code: "WND-2026-001", root_yarn_lot: "LOT-2026-CTN40", operator_name: "Mohan Lal", operator_role: "TFO Worker", incoming_rating: 4, incoming_defects: ["Soft Bobbin Build"], incoming_notes: "Good density, few soft noses on lower deck", is_quality_alert: false, alert_resolved: false, input_weight_kg: 4775.0, output_weight_kg: 4745.0, waste_weight_kg: 25.0, stage_data: { tfo_machine_no: "TFO-02", target_tpm: 450, spindles_active: 128 }, status: "COMPLETED", created_at: "2026-02-12T14:00:00Z" },
    { id: 4, stage_key: "4_YARN_WARPING_ISSUE", stage_name: "Yarn Issue on Warping", stage_number: 4, batch_code: "WRP-ISS-2026-001", preceding_record_id: 3, preceding_batch_code: "TFO-2026-001", root_yarn_lot: "LOT-2026-CTN40", operator_name: "Mahesh Prajapati", operator_role: "Supervisor", incoming_rating: 5, incoming_defects: [], incoming_notes: "TFO twist balance verified under strobe", is_quality_alert: false, alert_resolved: false, input_weight_kg: 4000.0, output_weight_kg: 4000.0, waste_weight_kg: 0.0, stage_data: { target_beam_set: "SET-2026-081", total_ends: 4800, creel_capacity_used: 480, warping_machine_id: "WARP-DIR-01" }, status: "COMPLETED", created_at: "2026-02-13T11:00:00Z" },
    { id: 5, stage_key: "5_YARN_WEFT_ISSUE", stage_name: "Yarn Issue on Loom (Weft Supply)", stage_number: 5, batch_code: "WFT-ISS-2026-001", preceding_record_id: 3, preceding_batch_code: "TFO-2026-001", root_yarn_lot: "LOT-2026-CTN40", operator_name: "Mahesh Prajapati", operator_role: "Supervisor", incoming_rating: 4, incoming_defects: [], incoming_notes: "Delivered to Airjet Looms L01-L04", is_quality_alert: false, alert_resolved: false, input_weight_kg: 745.0, output_weight_kg: 745.0, waste_weight_kg: 0.0, stage_data: { loom_numbers: "L-01, L-02, L-03", package_count: 160, assigned_weaver: "Kailash Suthar" }, status: "COMPLETED", created_at: "2026-02-13T12:30:00Z" },
    { id: 6, stage_key: "6_BEAM_MAKING", stage_name: "Beam Making (Warping Completion)", stage_number: 6, batch_code: "BM-2026-081", preceding_record_id: 4, preceding_batch_code: "WRP-ISS-2026-001", root_yarn_lot: "LOT-2026-CTN40", operator_name: "Kailash Suthar", operator_role: "Warper", incoming_rating: 5, incoming_defects: [], incoming_notes: "Creel ran cleanly, zero static jumps", is_quality_alert: false, alert_resolved: false, input_weight_kg: 4000.0, output_weight_kg: 3970.0, waste_weight_kg: 25.0, stage_data: { beam_number: "BM-2026-081", total_ends: 4800, beam_flange_width: 58.0, measured_warp_meters: 3500.0, tension_log_cn: "38-42 cN" }, status: "COMPLETED", created_at: "2026-02-14T09:30:00Z" },
    { id: 7, stage_key: "7_BEAM_GEETING", stage_name: "Beam Issue for Geeting (Drawing-in / Knotting / Denting)", stage_number: 7, batch_code: "GET-2026-081", preceding_record_id: 6, preceding_batch_code: "BM-2026-081", root_yarn_lot: "LOT-2026-CTN40", operator_name: "Mohan Lal", operator_role: "Getter", incoming_rating: 5, incoming_defects: [], incoming_notes: "Excellent beam flange level, zero end cross-overs", is_quality_alert: false, alert_resolved: false, input_weight_kg: 3970.0, output_weight_kg: 3970.0, waste_weight_kg: 0.0, stage_data: { reed_count: 92, heald_frame_set: "HF-04", drop_wire_set: "DW-04", draft_plan: "Straight 1-2-3-4", reed_width_inches: 58.0, status: "COMPLETED" }, status: "COMPLETED", created_at: "2026-02-15T15:00:00Z" },
    { id: 8, stage_key: "8_BEAM_GAITING", stage_name: "Beam Issue on Loom (Gaiting & Loading)", stage_number: 8, batch_code: "GAT-LM01-081", preceding_record_id: 7, preceding_batch_code: "GET-2026-081", root_yarn_lot: "LOT-2026-CTN40", operator_name: "Mahesh Prajapati", operator_role: "Loom Master", incoming_rating: 5, incoming_defects: [], incoming_notes: "Drawing 100% accurate, reed clearance set to 2.5mm", is_quality_alert: false, alert_resolved: false, input_weight_kg: 3970.0, output_weight_kg: 3970.0, waste_weight_kg: 0.0, stage_data: { loom_number: "Loom L-01", starting_picks: 120000, tension_setting: "180 cN", shedding_timing: "300 deg" }, status: "COMPLETED", created_at: "2026-02-16T11:00:00Z" },
    { id: 9, stage_key: "9_TAKA_MAKING", stage_name: "Taka Making (Doffing / Loom Roll Production)", stage_number: 9, batch_code: "TK-2026-101", preceding_record_id: 8, preceding_batch_code: "GAT-LM01-081", root_yarn_lot: "LOT-2026-CTN40", operator_name: "Kailash Suthar", operator_role: "Loom Worker", incoming_rating: 4, incoming_defects: ["Temple Mark Tension"], incoming_notes: "Smooth weaving at 620 RPM on Airjet L-01", is_quality_alert: false, alert_resolved: false, input_weight_kg: 25.0, output_weight_kg: 24.8, waste_weight_kg: 0.1, stage_data: { loom_number: "Loom L-01", shift: "Shift A", cut_meters: 120.5, pick_diff: 42000, gross_weight_kg: 24.8 }, status: "COMPLETED", created_at: "2026-02-18T16:00:00Z" },
    { id: 10, stage_key: "10_TAKA_CHECKING", stage_name: "Taka Checking (Grey Mending & Inspection)", stage_number: 10, batch_code: "CHK-TK-101", preceding_record_id: 9, preceding_batch_code: "TK-2026-101", root_yarn_lot: "LOT-2026-CTN40", operator_name: "Ramesh Kumar Sharma", operator_role: "QC Inspector", incoming_rating: 5, incoming_defects: [], incoming_notes: "Clean weave, ASTM 4-Point score 7.9 pts / 100 sqm -> Grade Fresh", is_quality_alert: false, alert_resolved: false, input_weight_kg: 24.8, output_weight_kg: 24.8, waste_weight_kg: 0.0, stage_data: { inspected_meters: 120.5, width_inches: 58.0, total_defect_points: 14, grade: "FRESH", barcode_data: "ROLL-TK-101-FRESH" }, status: "COMPLETED", created_at: "2026-02-19T10:00:00Z" },
    { id: 11, stage_key: "11_TAKA_FOLDING", stage_name: "Taka Folding (Rolling & Packaging)", stage_number: 11, batch_code: "FLD-TAG-101", preceding_record_id: 10, preceding_batch_code: "CHK-TK-101", root_yarn_lot: "LOT-2026-CTN40", operator_name: "Suresh Choudhary", operator_role: "Folder", incoming_rating: 5, incoming_defects: [], incoming_notes: "Taka mended properly, selvedges aligned", is_quality_alert: false, alert_resolved: false, input_weight_kg: 24.8, output_weight_kg: 24.8, waste_weight_kg: 0.0, stage_data: { folded_roll_tag: "TAG-2026-0811", measured_fold_length: 120.5, packing_type: "Poly Roll", stamp_verified: true }, status: "COMPLETED", created_at: "2026-02-20T11:30:00Z" },
    { id: 12, stage_key: "12_TAKA_DISPATCH", stage_name: "Taka Dispatching (Grouping & Staging)", stage_number: 12, batch_code: "DSP-LOT-2026-01", preceding_record_id: 11, preceding_batch_code: "FLD-TAG-101", root_yarn_lot: "LOT-2026-CTN40", operator_name: "Suresh Choudhary", operator_role: "Store Incharge", incoming_rating: 5, incoming_defects: [], incoming_notes: "Poly wrapping intact, roll tags verified", is_quality_alert: false, alert_resolved: false, input_weight_kg: 24.8, output_weight_kg: 24.8, waste_weight_kg: 0.0, stage_data: { dispatch_lot_id: "DSP-LOT-2026-01", selected_taka_ids: ["TK-2026-101"], total_rolls: 1, destination_client: "Vardhman Textiles", vehicle_no: "GJ-05-BX-9812" }, status: "COMPLETED", created_at: "2026-02-21T14:00:00Z" },
    { id: 13, stage_key: "13_DELIVERY_CHALLAN", stage_name: "Delivery Challan Making", stage_number: 13, batch_code: "CHL-2026-0042", preceding_record_id: 12, preceding_batch_code: "DSP-LOT-2026-01", root_yarn_lot: "LOT-2026-CTN40", operator_name: "Vikas Verma", operator_role: "Accounts Officer", incoming_rating: 5, incoming_defects: [], incoming_notes: "Vehicle loaded & covered with tarpaulin, weight stamped", is_quality_alert: false, alert_resolved: false, input_weight_kg: 24.8, output_weight_kg: 24.8, waste_weight_kg: 0.0, stage_data: { challan_no: "CHL-2026-0042", consignee_name: "Vardhman Textiles", gstin: "24AAACV1234A1Z5", eway_bill_no: "341890124567", transporter_name: "Gati KWE Logistics", total_pieces: 1, total_meters: 120.5 }, status: "COMPLETED", created_at: "2026-02-22T17:00:00Z" },
    { id: 14, stage_key: "3_YARN_TFO", stage_name: "Yarn TFO (Two-for-One Twisting)", stage_number: 3, batch_code: "TFO-2026-099-ALERT", preceding_record_id: 2, preceding_batch_code: "WND-2026-001", root_yarn_lot: "LOT-2026-CTN40", operator_name: "Mohan Lal", operator_role: "TFO Worker", incoming_rating: 2, incoming_defects: ["Soft Bobbin Build", "Slough Off", "Uneven Tension"], incoming_notes: "Bobbin winding tension too soft; high slough-off risk during high-speed twisting.", is_quality_alert: true, alert_resolved: false, supervisor_resolution_notes: null, input_weight_kg: 1200.0, output_weight_kg: 1180.0, waste_weight_kg: 18.0, stage_data: { tfo_machine_no: "TFO-01", target_tpm: 450 }, status: "FLAGGED_ALERT", created_at: "2026-02-23T11:00:00Z" }
  ],
  storeRequisitions: [
    { id: 1, req_number: 'REQ-2026-001', department: 'Weaving Shed', item_name: '40s Combed Cotton Yarn', quantity_requested: 500.0, uom: 'KG', urgency: 'HIGH', status: 'PENDING', requested_by: 'Kailash Suthar', purpose: 'Loom L-01 warp replenishment', created_at: '2026-02-18T10:00:00Z' },
    { id: 2, req_number: 'REQ-2026-002', department: 'Sizing', item_name: 'Modified Tapioca Sizing Starch', quantity_requested: 20.0, uom: 'BAG', urgency: 'MEDIUM', status: 'ISSUED', requested_by: 'Mohan Lal', purpose: 'Beam Set 82 sizing batch', created_at: '2026-02-19T14:30:00Z' },
  ],
  storeMaterialIssues: [
    { id: 1, issue_number: 'ISS-2026-001', requisition_no: 'REQ-2026-002', item_name: 'Modified Tapioca Sizing Starch', quantity_issued: 20.0, uom: 'BAG', lot_number: 'LOT-CHM-01', issued_to_dept: 'Sizing', issued_to_person: 'Mohan Lal', issued_by: 'Suresh Choudhary', remarks: 'Batch verified for viscosity', created_at: '2026-02-20T11:00:00Z' },
  ],
  storeReceived: [
    { id: 1, grn_no: 'GRN-2026-001', lot_number: 'LOT-20260201-001', item_name: '40s Combed Cotton Yarn', supplier_name: 'Nahar Spinning', received_qty: 6000.0, uom: 'KG', godown_bay: 'Bay A-01', status: 'ACTIVE_STOCK', created_at: '2026-02-01T11:00:00Z' },
    { id: 2, grn_no: 'GRN-2026-002', lot_number: 'LOT-20260208-002', item_name: '60s Compact Cotton Yarn', supplier_name: 'KPR Mill Ltd', received_qty: 4000.0, uom: 'KG', godown_bay: 'Bay B-02', status: 'ACTIVE_STOCK', created_at: '2026-02-08T15:30:00Z' },
  ],
  storeItemOpenings: [
    { id: 1, item_code: 'ITM-YRN-40C', item_name: '40s Combed Cotton Yarn', financial_year: '2026-2027', opening_qty: 12000.0, uom: 'KG', rate_per_unit: 310.0, total_valuation: 3720000.0, godown_bay: 'Bay A-01' },
    { id: 2, item_code: 'ITM-FAB-60X60', item_name: 'Grey Fabric Poplin 60x60', financial_year: '2026-2027', opening_qty: 45000.0, uom: 'MTR', rate_per_unit: 36.5, total_valuation: 1642500.0, godown_bay: 'Fabric Godown 1' },
  ],
  purchaseIndents: [
    { id: 1, indent_number: 'IND-2026-001', department: 'Weaving Shed', item_name: '40s Combed Cotton Yarn', required_qty: 10000.0, uom: 'KG', estimated_rate: 310.0, urgency: 'HIGH', status: 'APPROVED', approved_by: 'Plant Owner - Jugal', remarks: 'For Vardhman export order', created_at: '2026-02-12T09:30:00Z' },
  ],
  purchaseOrders: [
    { id: 1, po_number: 'PO-2026-001', supplier_name: 'Nahar Spinning', item_name: '40s Combed Cotton Yarn', item_category: 'RAW_YARN', ordered_qty: 10000.0, uom: 'KG', rate_per_unit: 310.0, subtotal_amount: 3100000.0, tax_percent: 5.0, tax_amount: 155000.0, grand_total: 3255000.0, payment_terms: '15 Days Credit', delivery_date: '2026-03-20', status: 'PARTIALLY_RECEIVED', remarks: 'First lot 6000kg received', created_at: '2026-02-15T10:00:00Z' },
    { id: 2, po_number: 'PO-2026-002', supplier_name: 'KPR Mill Ltd', item_name: '60s Compact Cotton Yarn', item_category: 'RAW_YARN', ordered_qty: 6000.0, uom: 'KG', rate_per_unit: 420.0, subtotal_amount: 2520000.0, tax_percent: 5.0, tax_amount: 126000.0, grand_total: 2646000.0, payment_terms: '21 Days Credit', delivery_date: '2026-03-25', status: 'CLOSED', remarks: 'Fully delivered', created_at: '2026-02-18T11:00:00Z' },
  ],
  purchaseInwards: [
    { id: 1, inward_number: 'INW-2026-001', po_number: 'PO-2026-001', supplier_name: 'Nahar Spinning', vehicle_number: 'PB-10-CZ-4412', challan_number: 'CH-98124', received_qty: 6000.0, uom: 'KG', bags_count: 120, gross_weight: 6060.0, net_weight: 6000.0, condition_remarks: 'All packages sealed', created_at: '2026-02-01T10:00:00Z' },
  ],
  goodsReceiptNotes: [
    { id: 1, grn_number: 'GRN-2026-001', po_number: 'PO-2026-001', inward_number: 'INW-2026-001', supplier_name: 'Nahar Spinning', item_name: '40s Combed Cotton Yarn', lot_number: 'LOT-20260201-001', accepted_qty: 6000.0, rejected_qty: 0.0, uom: 'KG', qc_status: 'ACCEPTED', remarks: 'QC test report passed', created_at: '2026-02-01T11:00:00Z' },
  ],
  purchaseBills: [
    { id: 1, bill_number: 'PB-2026-001', supplier_name: 'Nahar Spinning', supplier_invoice_no: 'INV-SPIN-8891', po_number: 'PO-2026-001', grn_number: 'GRN-2026-001', taxable_amount: 1860000.0, gst_amount: 93000.0, grand_total: 1953000.0, payment_status: 'PARTIALLY_PAID', due_date: '2026-03-15', created_at: '2026-02-02T12:00:00Z' },
  ],
  purchaseReturns: [
    { id: 1, return_number: 'PRT-2026-001', supplier_name: 'Alok Industries', po_number: 'PO-2026-003', lot_number: 'LOT-20260215-003', return_qty: 500.0, uom: 'KG', rate_per_unit: 280.0, debit_amount: 147000.0, reason: 'High Count Variation & Uneven Twist', debit_note_created: true, created_at: '2026-02-25T14:00:00Z' },
  ],
  qcStandards: [
    { id: 1, fabric_quality: '60x60 / 92x88 Cotton Poplin', warp_spec: '60s Combed', weft_spec: '60s Combed', epi_target: 92, ppi_target: 88, gsm_target: 110.0, max_points_per_100sqm_fresh: 20.0, max_points_per_100sqm_seconds: 28.0, created_at: '2026-01-10T10:00:00Z' },
    { id: 2, fabric_quality: '40x40 / 132x72 Sheeting', warp_spec: '40s Combed', weft_spec: '40s Carded', epi_target: 132, ppi_target: 72, gsm_target: 145.0, max_points_per_100sqm_fresh: 20.0, max_points_per_100sqm_seconds: 28.0, created_at: '2026-01-10T10:00:00Z' },
    { id: 3, fabric_quality: '60x60 / 110x90 Cambric', warp_spec: '60s Compact', weft_spec: '60s Combed', epi_target: 110, ppi_target: 90, gsm_target: 95.0, max_points_per_100sqm_fresh: 18.0, max_points_per_100sqm_seconds: 25.0, created_at: '2026-01-10T10:00:00Z' },
  ],
  jobWorkQCAudits: [
    { id: 1, audit_code: 'QC-JW-2026-001', job_worker_name: 'Shree Ram Sizing', job_process_type: 'WARP_SIZING', batch_or_beam_no: 'BM-2026-081', sample_meters: 100.0, defect_count: 2, grade_assigned: 'GRADE_A', moisture_percent: 6.8, size_pickup_percent: 9.4, remarks: 'Smooth sizing film, excellent elasticity', is_quarantined: false, audited_by: 'Ramesh Kumar Sharma', created_at: '2026-02-16T15:00:00Z' },
  ],
  dispatchOrders: [
    { id: 1, dispatch_code: 'DSP-2026-001', sales_order_no: 'SO-20260218-003', buyer_name: 'Arvind Ltd', destination_city: 'Ahmedabad', total_rolls: 20, total_meters: 2500.0, vehicle_no: 'GJ-01-AT-4491', transporter_name: 'Gati Logistics', status: 'DISPATCHED', created_at: '2026-02-22T14:00:00Z' },
  ],
  salesInvoices: [
    { id: 1, invoice_number: 'INV-2026-001', sales_order_no: 'SO-20260218-003', dispatch_code: 'DSP-2026-001', buyer_name: 'Arvind Ltd', buyer_gstin: '24AABCA9876C1Z1', taxable_value: 170000.0, igst_amount: 0.0, cgst_amount: 4250.0, sgst_amount: 4250.0, grand_total: 178500.0, payment_status: 'PARTIALLY_PAID', due_date: '2026-04-10', created_at: '2026-02-22T17:30:00Z' },
  ],
  salesReturns: [
    { id: 1, return_no: 'SRT-2026-001', buyer_name: 'Raymond Ltd', invoice_no: 'INV-2026-002', return_meters: 150.0, reason: 'Oil Stain Markings on Selvedge', credit_amount: 8662.5, credit_note_created: true, created_at: '2026-02-24T16:00:00Z' },
  ],
  financePayments: [
    { id: 1, voucher_no: 'VCH-PAY-2026-001', party_name: 'Nahar Spinning', payment_mode: 'NEFT/RTGS', amount: 930000.0, reference_no: 'UTR2026025678', bill_reference: 'PB-2026-001', status: 'POSTED', narration: '50% advance against yarn bill', transaction_date: '2026-02-18T14:30:00Z' },
  ],
  financeReceipts: [
    { id: 1, receipt_no: 'REC-2026-001', party_name: 'Vardhman Textiles', payment_mode: 'NEFT/RTGS', amount: 500000.0, reference_no: 'UTR2026021234', invoice_reference: 'INV-2026-003', status: 'CLEARED', narration: 'Advance for summer poplin order', receipt_date: '2026-02-12T11:00:00Z' },
  ],
  creditNotes: [
    { id: 1, cn_number: 'CN-2026-001', customer_name: 'Raymond Ltd', invoice_number: 'INV-2026-002', credit_amount: 8662.5, reason: 'Sales Return for defective meterage', status: 'ISSUED', created_at: '2026-02-24T16:05:00Z' },
  ],
  debitNotes: [
    { id: 1, dn_number: 'DN-2026-001', supplier_name: 'Alok Industries', purchase_bill_no: 'PB-2026-002', debit_amount: 147000.0, reason: 'Purchase Return for substandard count lot', status: 'ISSUED', created_at: '2026-02-25T14:05:00Z' },
  ],
  auditEvents: [
    { id: 1, event_type: 'GRN_AUTO_STOCK_POST', source_module: 'PURCHASE', reference_code: 'GRN-2026-001', description: 'Stock 6000kg auto-credited to Store and PO status updated to PARTIALLY_RECEIVED', created_at: '2026-02-01T11:00:00Z' },
    { id: 2, event_type: 'DISPATCH_INVOICE_SYNC', source_module: 'SALES', reference_code: 'DSP-2026-001', description: 'Sales Order SO-20260218-003 updated to DISPATCHED and Draft Invoice INV-2026-001 created', created_at: '2026-02-22T14:00:00Z' },
  ],
  nextShopFloorId: 15,
  nextLeadId: 4,
  nextInqId: 4,
  nextForecastId: 4,
  nextOrderId: 4,
  nextClientId: 13,
  nextEmpId: 8,
  nextItemId: 9,
  nextStoreReqId: 3,
  nextStoreIssueId: 2,
  nextIndentId: 2,
  nextPOId: 3,
  nextInwardId: 2,
  nextGRNId: 2,
  nextBillId: 2,
  nextPurchaseReturnId: 2,
  nextDispatchId: 2,
  nextInvoiceId: 2,
  nextSalesReturnId: 2,
  nextPayId: 2,
  nextRecId: 2,
  nextCNId: 2,
  nextDNId: 2,
  nextAuditId: 3,
};

export function getMockDB() {
  try {
    const stored = localStorage.getItem(MOCK_DB_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const db = { ...DEFAULT_MOCK_DB, ...parsed };
      // Ensure all array properties from DEFAULT_MOCK_DB are properly initialized
      for (const key of Object.keys(DEFAULT_MOCK_DB)) {
        if (Array.isArray(DEFAULT_MOCK_DB[key]) && !Array.isArray(db[key])) {
          db[key] = [...DEFAULT_MOCK_DB[key]];
        }
      }
      return db;
    }
  } catch (e) { /* ignore */ }
  const db = JSON.parse(JSON.stringify(DEFAULT_MOCK_DB));
  localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db));
  return db;
}

export function saveMockDB(db) {
  localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db));
}

// --- Universal Masters Mock API ---

export const mastersApi = {
  suggest: (type, query, category) => {
    const db = getMockDB();
    const q = (query || '').toLowerCase().trim();

    if (type === 'clients') {
      return (db.clientMasters || [])
        .filter(c => {
          const matchCat = !category || category === 'ALL' || c.party_type === category;
          const matchQ = !q || c.party_name.toLowerCase().includes(q) || (c.party_code || '').toLowerCase().includes(q) || (c.city || '').toLowerCase().includes(q) || (c.gstin || '').toLowerCase().includes(q) || (c.phone || '').includes(q);
          return matchCat && matchQ;
        })
        .slice(0, 10);
    } else if (type === 'employees') {
      return (db.employeeMasters || [])
        .filter(e => {
          const matchCat = !category || category === 'ALL' || e.department === category;
          const matchQ = !q || e.full_name.toLowerCase().includes(q) || e.employee_code.toLowerCase().includes(q) || e.designation.toLowerCase().includes(q);
          return matchCat && matchQ;
        })
        .slice(0, 10);
    } else if (type === 'items') {
      return (db.itemMasters || [])
        .filter(i => {
          const matchCat = !category || category === 'ALL' || i.item_category === category;
          const matchQ = !q || i.item_name.toLowerCase().includes(q) || i.item_code.toLowerCase().includes(q) || (i.hsn_code || '').toLowerCase().includes(q);
          return matchCat && matchQ;
        })
        .slice(0, 10);
    }
    return [];
  },

  quickCreate: (payload) => {
    const db = getMockDB();
    if (payload.master_type === 'clients') {
      const newClient = {
        id: db.nextClientId++,
        party_code: `CLI-${1000 + db.nextClientId}`,
        party_name: payload.party_name,
        party_type: payload.party_type || 'FABRIC_BUYER',
        contact_person: payload.contact_person || '',
        phone: payload.phone || '',
        email: payload.email || '',
        city: payload.city || '',
        gstin: payload.gstin || '',
        payment_terms: payload.payment_terms || '30 Days Credit',
        credit_limit: payload.credit_limit || 1000000,
        created_at: new Date().toISOString()
      };
      db.clientMasters = [newClient, ...(Array.isArray(db.clientMasters) ? db.clientMasters : [])];
      saveMockDB(db);
      return newClient;
    } else if (payload.master_type === 'items') {
      const newItem = {
        id: db.nextItemId++,
        item_code: payload.item_code || `ITM-FAB-${1000 + db.nextItemId}`,
        item_name: payload.item_name,
        item_category: payload.item_category || 'GREY_FABRIC',
        hsn_code: payload.hsn_code || '5208',
        unit_of_measure: 'MTR',
        standard_cost: payload.standard_cost || 45.0,
        gst_rate_percent: 5.0,
        created_at: new Date().toISOString()
      };
      db.itemMasters = [newItem, ...(Array.isArray(db.itemMasters) ? db.itemMasters : [])];
      saveMockDB(db);
      return newItem;
    }
    return null;
  },
  
  getList: (masterType, category, search) => {
    const db = getMockDB();
    const q = (search || '').toLowerCase().trim();

    if (masterType === 'clients') {
      return db.clientMasters.filter(c => {
        const matchCat = !category || category === 'ALL' || c.party_type === category;
        const matchQ = !q || c.party_name.toLowerCase().includes(q) || (c.city || '').toLowerCase().includes(q) || (c.gstin || '').toLowerCase().includes(q);
        return matchCat && matchQ;
      });
    } else if (masterType === 'employees') {
      return db.employeeMasters.filter(e => {
        const matchCat = !category || category === 'ALL' || e.department === category;
        const matchQ = !q || e.full_name.toLowerCase().includes(q) || e.employee_code.toLowerCase().includes(q);
        return matchCat && matchQ;
      });
    } else if (masterType === 'items') {
      return db.itemMasters.filter(i => {
        const matchCat = !category || category === 'ALL' || i.item_category === category;
        const matchQ = !q || i.item_name.toLowerCase().includes(q) || i.item_code.toLowerCase().includes(q);
        return matchCat && matchQ;
      });
    }
    return [];
  },

  createClient: (data) => {
    const db = getMockDB();
    const client = {
      id: db.nextClientId++,
      party_code: data.party_code || `CLI-${1000 + db.nextClientId}`,
      ...data,
      created_at: new Date().toISOString(),
    };
    db.clientMasters = [client, ...(Array.isArray(db.clientMasters) ? db.clientMasters : [])];
    saveMockDB(db);
    return client;
  },

  createEmployee: (data) => {
    const db = getMockDB();
    const emp = {
      id: db.nextEmpId++,
      employee_code: data.employee_code || `EMP-${1000 + db.nextEmpId}`,
      ...data,
      created_at: new Date().toISOString(),
    };
    db.employeeMasters = [emp, ...(Array.isArray(db.employeeMasters) ? db.employeeMasters : [])];
    saveMockDB(db);
    return emp;
  },

  createItem: (data) => {
    const db = getMockDB();
    const itm = {
      id: db.nextItemId++,
      item_code: data.item_code || `ITM-${1000 + db.nextItemId}`,
      ...data,
      created_at: new Date().toISOString(),
    };
    db.itemMasters = [itm, ...(Array.isArray(db.itemMasters) ? db.itemMasters : [])];
    saveMockDB(db);
    return itm;
  }
};

// --- CRM Mock API ---

export const mockCRMApi = {
  getForecasts: () => getMockDB().crmForecasts || [],
  createForecast: (data) => {
    const db = getMockDB();
    const fc = {
      id: db.nextForecastId++,
      ...data,
      achieved_meters: 0,
      achieved_revenue: 0,
      created_at: new Date().toISOString()
    };
    db.crmForecasts = [fc, ...(Array.isArray(db.crmForecasts) ? db.crmForecasts : [])];
    saveMockDB(db);
    return fc;
  },

  getSalesTeam: () => {
    const db = getMockDB();
    const team = (db.employeeMasters || []).filter(e => e.department === 'Sales' || e.department === 'Weaving Shed');
    return team.map(emp => ({
      id: emp.id,
      employee_code: emp.employee_code,
      full_name: emp.full_name,
      designation: emp.designation,
      territory: emp.territory || 'Surat / Gujarat',
      target_meters_monthly: emp.target_meters_monthly || 50000,
      phone: emp.phone,
      active_leads_count: (db.crmLeads || []).filter(l => l.assigned_to_emp_id === emp.id).length || 2,
      active_inquiries_count: (db.crmInquiries || []).filter(i => i.assigned_to_emp_id === emp.id).length || 3
    }));
  },

  getLeads: () => getMockDB().crmLeads || [],
  createLead: (data) => {
    const db = getMockDB();
    const lead = {
      id: db.nextLeadId++,
      ...data,
      status: 'NEW',
      created_at: new Date().toISOString()
    };
    db.crmLeads = [lead, ...(Array.isArray(db.crmLeads) ? db.crmLeads : [])];
    saveMockDB(db);
    return lead;
  },

  getInquiries: () => getMockDB().crmInquiries || [],
  createInquiry: (data) => {
    const db = getMockDB();
    const count = (db.crmInquiries || []).length + 1;
    const rawVal = data.required_meters * data.target_rate_per_meter;
    const taxAmt = rawVal * ((data.tax_percent || 5) / 100);
    const inq = {
      id: db.nextInqId++,
      inquiry_number: `INQ-2026-${String(count).padStart(3, '0')}`,
      ...data,
      total_raw_value: rawVal,
      grand_total: rawVal + taxAmt,
      stage: data.stage || 'INQUIRY_RECEIVED',
      created_at: new Date().toISOString()
    };
    db.crmInquiries = [inq, ...(Array.isArray(db.crmInquiries) ? db.crmInquiries : [])];
    saveMockDB(db);
    return inq;
  },

  updateInquiryStage: (inqId, stage, dropReason = null) => {
    const db = getMockDB();
    const inq = (db.crmInquiries || []).find(i => i.id === inqId);
    if (inq) {
      inq.stage = stage;
      if (dropReason) inq.drop_reason = dropReason;
      saveMockDB(db);
    }
    return inq;
  },

  getMIS: () => {
    const db = getMockDB();
    const inqs = db.crmInquiries || [];
    const total = inqs.length;
    const won = inqs.filter(i => i.stage === 'WON_ORDER_CONVERTED').length;
    const lost = inqs.filter(i => i.stage === 'LOST').length;
    const activePipeline = inqs.filter(i => i.stage !== 'WON_ORDER_CONVERTED' && i.stage !== 'LOST')
      .reduce((s, i) => s + (i.grand_total || 0), 0);
    const wonVal = inqs.filter(i => i.stage === 'WON_ORDER_CONVERTED')
      .reduce((s, i) => s + (i.grand_total || 0), 0);

    return {
      total_inquiries: total,
      won_inquiries: won,
      lost_inquiries: lost,
      active_pipeline_valuation: activePipeline,
      won_contract_valuation: wonVal,
      conversion_rate_percent: total > 0 ? Number(((won / total) * 100).toFixed(1)) : 75.0,
      drop_reasons_breakdown: [
        { reason: 'Target Price Gap (>Rs. 1.50/m)', count: 2 },
        { reason: 'Delivery Lead Time (<15 Days)', count: 1 },
        { reason: 'Special Finish / Reed Constraint', count: 1 }
      ]
    };
  }
};

export const mockAuthApi = {
  login: (username, password) => {
    const db = getMockDB();
    const user = db.users.find(u => u.username === username);
    if (!user) throw new Error('Invalid credentials');
    return { access_token: 'mock_token_' + user.role, user };
  },
};

export const mockSalesApi = {
  getSummary: () => {
    const db = getMockDB();
    const orders = db.salesOrders || [];
    const totalVal = orders.reduce((sum, o) => sum + (o.grand_total || o.total_raw_amount || 0), 0);
    const inWeaving = orders.filter(o => o.status === 'IN_WEAVING').length;
    const readyDispatch = orders.filter(o => o.status === 'READY_TO_DISPATCH').length;
    return { 
      total_orders: orders.length, 
      total_valuation: totalVal, 
      in_weaving: inWeaving,
      ready_dispatch: readyDispatch,
      data: orders 
    };
  },
  getOrders: () => getMockDB().salesOrders || [],
  createOrder: (orderData) => {
    const db = getMockDB();
    const now = new Date();
    const dateStr = now.toISOString().slice(0,10).replace(/-/g,'');
    const totalRaw = Number(orderData.total_meters || 0) * Number(orderData.rate_per_meter || 0);
    const taxAmt = totalRaw * ((Number(orderData.tax_percent) || 5) / 100);
    const grandTotal = totalRaw + taxAmt;

    const order = {
      id: db.nextOrderId++,
      order_number: `SO-${dateStr}-${String(db.nextOrderId).padStart(3,'0')}`,
      ...orderData,
      total_raw_amount: totalRaw,
      tax_amount: taxAmt,
      grand_total: grandTotal,
      status: 'PENDING',
      created_at: now.toISOString(),
    };
    db.salesOrders = [order, ...(Array.isArray(db.salesOrders) ? db.salesOrders : [])];
    saveMockDB(db);
    return order;
  },
  getDispatches: () => getMockDB().dispatchOrders || [],
  createDispatch: (data) => {
    const db = getMockDB();
    const count = (db.dispatchOrders || []).length + 1;
    const disp = {
      id: db.nextDispatchId++,
      dispatch_code: `DSP-2026-${String(count).padStart(3, '0')}`,
      ...data,
      status: 'DISPATCHED',
      created_at: new Date().toISOString()
    };
    db.dispatchOrders = [disp, ...(Array.isArray(db.dispatchOrders) ? db.dispatchOrders : [])];

    // Reactive Trigger: Update sales order to DISPATCHED
    if (data.sales_order_no) {
      const so = (db.salesOrders || []).find(o => o.order_number === data.sales_order_no);
      if (so) so.status = 'DISPATCHED';

      // Auto create draft sales invoice
      const invCount = (db.salesInvoices || []).length + 1;
      const rate = so ? so.rate_per_meter : 45.0;
      const rawVal = Number(data.total_meters || 0) * rate;
      const gstVal = rawVal * 0.05;
      const inv = {
        id: db.nextInvoiceId++,
        invoice_number: `INV-2026-${String(invCount).padStart(3, '0')}`,
        sales_order_no: data.sales_order_no,
        dispatch_code: disp.dispatch_code,
        buyer_name: data.buyer_name,
        buyer_gstin: '24AAACV1234A1Z5',
        taxable_value: rawVal,
        cgst_amount: gstVal / 2,
        sgst_amount: gstVal / 2,
        igst_amount: 0,
        grand_total: rawVal + gstVal,
        payment_status: 'UNPAID',
        due_date: new Date(Date.now() + 30*86400000).toISOString().slice(0, 10),
        created_at: new Date().toISOString()
      };
      db.salesInvoices = [inv, ...(Array.isArray(db.salesInvoices) ? db.salesInvoices : [])];
    }
    saveMockDB(db);
    return disp;
  },
  getInvoices: () => getMockDB().salesInvoices || [],
  createInvoice: (data) => {
    const db = getMockDB();
    const count = (db.salesInvoices || []).length + 1;
    const rawVal = Number(data.taxable_value || 0);
    const gstVal = rawVal * ((Number(data.tax_rate) || 5) / 100);
    const inv = {
      id: db.nextInvoiceId++,
      invoice_number: `INV-2026-${String(count).padStart(3, '0')}`,
      ...data,
      cgst_amount: gstVal / 2,
      sgst_amount: gstVal / 2,
      igst_amount: 0,
      grand_total: rawVal + gstVal,
      payment_status: 'UNPAID',
      created_at: new Date().toISOString()
    };
    db.salesInvoices = [inv, ...(Array.isArray(db.salesInvoices) ? db.salesInvoices : [])];
    saveMockDB(db);
    return inv;
  },
  getReturns: () => getMockDB().salesReturns || [],
  createReturn: (data) => {
    const db = getMockDB();
    const count = (db.salesReturns || []).length + 1;
    const ret = {
      id: db.nextSalesReturnId++,
      return_no: `SRT-2026-${String(count).padStart(3, '0')}`,
      ...data,
      credit_note_created: true,
      created_at: new Date().toISOString()
    };
    db.salesReturns = [ret, ...(Array.isArray(db.salesReturns) ? db.salesReturns : [])];

    // Reactive Trigger: Auto create Credit Note in Finance
    const cnCount = (db.creditNotes || []).length + 1;
    const cn = {
      id: db.nextCNId++,
      cn_number: `CN-2026-${String(cnCount).padStart(3, '0')}`,
      customer_name: data.buyer_name,
      invoice_number: data.invoice_no,
      credit_amount: Number(data.credit_amount || 0),
      reason: `Sales Return: ${data.reason}`,
      status: 'ISSUED',
      created_at: new Date().toISOString()
    };
    db.creditNotes = [cn, ...(Array.isArray(db.creditNotes) ? db.creditNotes : [])];

    saveMockDB(db);
    return ret;
  }
};

export const mockStoreApi = {
  getSummary: () => {
    const db = getMockDB();
    const stocks = db.yarnStocks || [];
    const totalVal = stocks.reduce((s, i) => s + (i.total_value || 0), 0);
    const totalWeight = stocks.reduce((s, i) => s + (i.net_weight_kg || 0), 0);
    return { 
      total_lots: stocks.length, 
      total_weight_kg: totalWeight, 
      valuation: totalVal, 
      data: stocks,
      beams: db.beamAllotments || [],
      requisitions_count: (db.storeRequisitions || []).length,
      issues_count: (db.storeMaterialIssues || []).length
    };
  },
  getRequisitions: () => getMockDB().storeRequisitions || [],
  createRequisition: (data) => {
    const db = getMockDB();
    const count = (db.storeRequisitions || []).length + 1;
    const req = {
      id: db.nextStoreReqId++,
      req_number: `REQ-2026-${String(count).padStart(3, '0')}`,
      ...data,
      status: 'PENDING',
      created_at: new Date().toISOString()
    };
    db.storeRequisitions = [req, ...(Array.isArray(db.storeRequisitions) ? db.storeRequisitions : [])];
    saveMockDB(db);
    return req;
  },
  getIssues: () => getMockDB().storeMaterialIssues || [],
  createIssue: (data) => {
    const db = getMockDB();
    const count = (db.storeMaterialIssues || []).length + 1;
    const iss = {
      id: db.nextStoreIssueId++,
      issue_number: `ISS-2026-${String(count).padStart(3, '0')}`,
      ...data,
      created_at: new Date().toISOString()
    };
    db.storeMaterialIssues = [iss, ...(Array.isArray(db.storeMaterialIssues) ? db.storeMaterialIssues : [])];

    // Reactive update requisition status to ISSUED
    if (data.requisition_no) {
      const req = (db.storeRequisitions || []).find(r => r.req_number === data.requisition_no);
      if (req) req.status = 'ISSUED';
    }

    saveMockDB(db);
    return iss;
  },
  getReceived: () => getMockDB().storeReceived || [],
  createReceived: (data) => {
    const db = getMockDB();
    const rec = {
      id: (db.storeReceived || []).length + 1,
      ...data,
      status: 'ACTIVE_STOCK',
      created_at: new Date().toISOString()
    };
    db.storeReceived = [rec, ...(Array.isArray(db.storeReceived) ? db.storeReceived : [])];
    saveMockDB(db);
    return rec;
  },
  getOpenings: () => getMockDB().storeItemOpenings || [],
  createOpening: (data) => {
    const db = getMockDB();
    const opening = {
      id: (db.storeItemOpenings || []).length + 1,
      ...data,
      total_valuation: Number(data.opening_qty || 0) * Number(data.rate_per_unit || 0),
      created_at: new Date().toISOString()
    };
    db.storeItemOpenings = [opening, ...(Array.isArray(db.storeItemOpenings) ? db.storeItemOpenings : [])];
    saveMockDB(db);
    return opening;
  },
  createLot: (lotData) => {
    const db = getMockDB();
    const now = new Date();
    const dateStr = now.toISOString().slice(0,10).replace(/-/g,'');
    const stocks = db.yarnStocks || [];
    const lot = {
      id: stocks.length + 1,
      lot_number: `LOT-${dateStr}-${String(stocks.length + 1).padStart(3,'0')}`,
      ...lotData,
      total_value: (lotData.net_weight_kg || 0) * (lotData.rate_per_kg || 0),
      received_at: now.toISOString(),
    };
    db.yarnStocks = [lot, ...(Array.isArray(db.yarnStocks) ? db.yarnStocks : [])];
    saveMockDB(db);
    return lot;
  },
  allotBeam: (beamData) => {
    const db = getMockDB();
    const beams = db.beamAllotments || [];
    const beam = {
      id: beams.length + 1,
      ...beamData,
      status: 'MOUNTED',
      mounted_at: new Date().toISOString()
    };
    db.beamAllotments = [...beams, beam];
    saveMockDB(db);
    return beam;
  }
};

export const mockPurchaseApi = {
  getIndents: () => getMockDB().purchaseIndents || [],
  createIndent: (data) => {
    const db = getMockDB();
    const count = (db.purchaseIndents || []).length + 1;
    const ind = {
      id: db.nextIndentId++,
      indent_number: `IND-2026-${String(count).padStart(3, '0')}`,
      ...data,
      status: 'APPROVED',
      created_at: new Date().toISOString()
    };
    db.purchaseIndents = [ind, ...(Array.isArray(db.purchaseIndents) ? db.purchaseIndents : [])];
    saveMockDB(db);
    return ind;
  },
  getOrders: () => getMockDB().purchaseOrders || [],
  createOrder: (data) => {
    const db = getMockDB();
    const count = (db.purchaseOrders || []).length + 1;
    const subtotal = Number(data.ordered_qty || data.quantity || 0) * Number(data.rate_per_unit || 0);
    const taxAmt = subtotal * ((Number(data.tax_percent) || 5) / 100);
    const po = {
      id: db.nextPOId++,
      po_number: `PO-2026-${String(count).padStart(3, '0')}`,
      ...data,
      ordered_qty: Number(data.ordered_qty || data.quantity || 0),
      subtotal_amount: subtotal,
      tax_amount: taxAmt,
      grand_total: subtotal + taxAmt,
      status: 'ORDERED',
      created_at: new Date().toISOString()
    };
    db.purchaseOrders = [po, ...(Array.isArray(db.purchaseOrders) ? db.purchaseOrders : [])];
    saveMockDB(db);
    return po;
  },
  getInwards: () => getMockDB().purchaseInwards || [],
  createInward: (data) => {
    const db = getMockDB();
    const count = (db.purchaseInwards || []).length + 1;
    const inw = {
      id: db.nextInwardId++,
      inward_number: `INW-2026-${String(count).padStart(3, '0')}`,
      ...data,
      created_at: new Date().toISOString()
    };
    db.purchaseInwards = [inw, ...(Array.isArray(db.purchaseInwards) ? db.purchaseInwards : [])];
    saveMockDB(db);
    return inw;
  },
  getGRNs: () => getMockDB().goodsReceiptNotes || [],
  createGRN: (data) => {
    const db = getMockDB();
    const count = (db.goodsReceiptNotes || []).length + 1;
    const lotNo = data.lot_number || `LOT-GRN-${String(count).padStart(3, '0')}`;
    const grn = {
      id: db.nextGRNId++,
      grn_number: `GRN-2026-${String(count).padStart(3, '0')}`,
      ...data,
      lot_number: lotNo,
      qc_status: data.rejected_qty > 0 ? (data.accepted_qty > 0 ? 'PARTIAL_REJECT' : 'REJECTED') : 'ACCEPTED',
      created_at: new Date().toISOString()
    };
    db.goodsReceiptNotes = [grn, ...(Array.isArray(db.goodsReceiptNotes) ? db.goodsReceiptNotes : [])];

    // Reactive Trigger: Auto credit accepted stock to Store
    if (Number(data.accepted_qty) > 0) {
      const rec = {
        id: (db.storeReceived || []).length + 1,
        grn_no: grn.grn_number,
        lot_number: lotNo,
        item_name: data.item_name,
        supplier_name: data.supplier_name,
        received_qty: Number(data.accepted_qty),
        uom: data.uom || 'KG',
        godown_bay: 'Bay A-01',
        status: 'ACTIVE_STOCK',
        created_at: new Date().toISOString()
      };
      db.storeReceived = [rec, ...(Array.isArray(db.storeReceived) ? db.storeReceived : [])];
    }

    // Reactive Trigger: Update PO status
    if (data.po_number) {
      const po = (db.purchaseOrders || []).find(p => p.po_number === data.po_number);
      if (po) {
        po.status = Number(data.accepted_qty) >= Number(po.ordered_qty) ? 'CLOSED' : 'PARTIALLY_RECEIVED';
      }
    }

    // Reactive Trigger: If QC rejection occurred, auto raise draft Purchase Return and Debit Note
    if (Number(data.rejected_qty) > 0) {
      const prCount = (db.purchaseReturns || []).length + 1;
      const rate = 310;
      const debitAmt = Number(data.rejected_qty) * rate * 1.05;
      const prt = {
        id: db.nextPurchaseReturnId++,
        return_number: `PRT-2026-${String(prCount).padStart(3, '0')}`,
        supplier_name: data.supplier_name,
        po_number: data.po_number,
        lot_number: lotNo,
        return_qty: Number(data.rejected_qty),
        uom: data.uom || 'KG',
        rate_per_unit: rate,
        debit_amount: debitAmt,
        reason: 'QC Rejection at GRN Gate Inspection',
        debit_note_created: true,
        created_at: new Date().toISOString()
      };
      db.purchaseReturns = [prt, ...(Array.isArray(db.purchaseReturns) ? db.purchaseReturns : [])];

      const dnCount = (db.debitNotes || []).length + 1;
      const dn = {
        id: db.nextDNId++,
        dn_number: `DN-2026-${String(dnCount).padStart(3, '0')}`,
        supplier_name: data.supplier_name,
        purchase_bill_no: 'PENDING_BILL',
        debit_amount: debitAmt,
        reason: `Auto Debit Note for GRN QC Rejection: ${lotNo}`,
        status: 'ISSUED',
        created_at: new Date().toISOString()
      };
      db.debitNotes = [dn, ...(Array.isArray(db.debitNotes) ? db.debitNotes : [])];
    }

    saveMockDB(db);
    return grn;
  },
  getBills: () => getMockDB().purchaseBills || [],
  createBill: (data) => {
    const db = getMockDB();
    const count = (db.purchaseBills || []).length + 1;
    const rawVal = Number(data.taxable_amount || 0);
    const gstVal = rawVal * 0.05;
    const bill = {
      id: db.nextBillId++,
      bill_number: `PB-2026-${String(count).padStart(3, '0')}`,
      ...data,
      gst_amount: gstVal,
      grand_total: rawVal + gstVal,
      payment_status: 'UNPAID',
      created_at: new Date().toISOString()
    };
    db.purchaseBills = [bill, ...(Array.isArray(db.purchaseBills) ? db.purchaseBills : [])];
    saveMockDB(db);
    return bill;
  },
  getReturns: () => getMockDB().purchaseReturns || [],
  createReturn: (data) => {
    const db = getMockDB();
    const count = (db.purchaseReturns || []).length + 1;
    const ret = {
      id: db.nextPurchaseReturnId++,
      return_number: `PRT-2026-${String(count).padStart(3, '0')}`,
      ...data,
      debit_note_created: true,
      created_at: new Date().toISOString()
    };
    db.purchaseReturns = [ret, ...(Array.isArray(db.purchaseReturns) ? db.purchaseReturns : [])];

    // Reactive Trigger: Auto create Debit Note in Finance
    const dnCount = (db.debitNotes || []).length + 1;
    const dn = {
      id: db.nextDNId++,
      dn_number: `DN-2026-${String(dnCount).padStart(3, '0')}`,
      supplier_name: data.supplier_name,
      purchase_bill_no: data.po_number || 'PB-MANUAL',
      debit_amount: Number(data.debit_amount || 0),
      reason: `Purchase Return: ${data.reason}`,
      status: 'ISSUED',
      created_at: new Date().toISOString()
    };
    db.debitNotes = [dn, ...(Array.isArray(db.debitNotes) ? db.debitNotes : [])];

    saveMockDB(db);
    return ret;
  }
};

export const mockProductionApi = {
  getLooms: () => getMockDB().looms || [],
  getShiftLogs: () => getMockDB().shiftLogs || [],
  logShift: (logData) => {
    const db = getMockDB();
    const loom = (db.looms || []).find(l => l.id === parseInt(logData.loom_id));
    const ratedRpm = loom ? loom.rated_rpm : 650;
    const runtime = logData.shift_runtime_minutes || 480;
    const totalPicks = Math.max(0, logData.end_picks - logData.start_picks);
    const efficiency = (totalPicks / (ratedRpm * runtime)) * 100;
    const actualRpm = totalPicks / runtime;
    const logs = db.shiftLogs || [];

    const log = {
      id: logs.length + 1,
      loom_id: parseInt(logData.loom_id),
      shift_name: logData.shift_name,
      operator_name: logData.operator_name,
      start_picks: parseInt(logData.start_picks),
      end_picks: parseInt(logData.end_picks),
      total_picks: totalPicks,
      actual_rpm: parseFloat(actualRpm.toFixed(1)),
      efficiency_percent: parseFloat(efficiency.toFixed(2)),
      downtime_minutes: parseInt(logData.downtime_minutes || 0),
      downtime_reason: logData.downtime_reason || null,
      logged_at: new Date().toISOString()
    };
    db.shiftLogs = [log, ...(Array.isArray(db.shiftLogs) ? db.shiftLogs : [])];
    saveMockDB(db);
    return log;
  }
};

export const mockPaymentsApi = {
  getSummary: () => {
    const db = getMockDB();
    const txs = db.paymentTransactions || [];
    const inward = txs.filter(t => t.transaction_type === 'INWARD').reduce((s, t) => s + t.amount, 0);
    const outward = txs.filter(t => t.transaction_type === 'OUTWARD').reduce((s, t) => s + t.amount, 0);
    return { 
      total_transactions: txs.length, 
      total_inward: inward,
      total_outward: outward,
      net_cashflow: inward - outward,
      data: txs 
    };
  },
  createPayment: (payData) => {
    const db = getMockDB();
    const txs = db.paymentTransactions || [];
    const count = txs.length + 1;
    const prefix = payData.transaction_type === 'INWARD' ? 'VCH-IN' : 'VCH-OUT';
    const payment = {
      id: count,
      voucher_number: `${prefix}-${String(count).padStart(4,'0')}`,
      ...payData,
      transaction_date: new Date().toISOString(),
    };
    db.paymentTransactions = [payment, ...(Array.isArray(db.paymentTransactions) ? db.paymentTransactions : [])];
    saveMockDB(db);
    return payment;
  },
};

export const mockTasksApi = {
  getDailyQueue: (userId) => {
    const db = getMockDB();
    const priorityOrder = { P1_URGENT: 0, P2_HIGH: 1, P3_MEDIUM: 2, P4_LOW: 3 };
    return (db.salesTasks || [])
      .filter(t => !userId || t.assigned_to_user_id === userId)
      .sort((a, b) => {
        const pDiff = (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
        if (pDiff !== 0) return pDiff;
        return (b.inquiry_meters || 0) - (a.inquiry_meters || 0);
      });
  },
  createTask: (taskData) => {
    const db = getMockDB();
    const tasks = db.salesTasks || [];
    const task = {
      id: tasks.length + 1,
      ...taskData,
      status: 'PENDING',
      completion_notes: null,
      created_at: new Date().toISOString(),
    };
    db.salesTasks = [task, ...(Array.isArray(db.salesTasks) ? db.salesTasks : [])];
    saveMockDB(db);
    return task;
  },
  updateStatus: (taskId, statusData) => {
    const db = getMockDB();
    const task = (db.salesTasks || []).find(t => t.id === taskId);
    if (task) {
      task.status = statusData.status;
      if (statusData.completion_notes) task.completion_notes = statusData.completion_notes;
      if (statusData.status === 'COMPLETED') task.completed_at = new Date().toISOString();
      saveMockDB(db);
    }
    return task;
  },
  getMetrics: (userId) => {
    const db = getMockDB();
    const tasks = (db.salesTasks || []).filter(t => !userId || t.assigned_to_user_id === userId);
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'PENDING').length,
      in_progress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      completed: tasks.filter(t => t.status === 'COMPLETED').length,
    };
  },
};

export const mockOwnerApi = {
  getDailyMIS: () => {
    const db = getMockDB();
    const totalSales = (db.salesOrders || []).reduce((s, o) => s + (o.grand_total || o.total_raw_amount || 0), 0);
    const totalCollected = (db.financeReceipts || []).reduce((s, t) => s + t.amount, 0) || (db.paymentTransactions || []).filter(t => t.transaction_type === 'INWARD').reduce((s, t) => s + t.amount, 0);
    const inventoryVal = (db.yarnStocks || []).reduce((s, y) => s + y.total_value, 0);
    const fabricMeters = (db.greyRolls || []).reduce((s, r) => s + r.total_meters, 0);
    const pendingTasks = (db.salesTasks || []).filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;
    
    return {
      report_date: new Date().toISOString().slice(0, 10),
      total_sales_amount: totalSales,
      total_payments_collected: totalCollected,
      total_payments_pending: Math.max(0, totalSales - totalCollected),
      inventory_valuation: inventoryVal,
      active_leads_count: pendingTasks,
      fabric_meters_produced: fabricMeters,
      total_looms_running: (db.looms || []).filter(l => l.status === 'RUNNING').length,
      total_looms: (db.looms || []).length
    };
  },
};

export const mockQCApi = {
  getStandards: () => getMockDB().qcStandards || [],
  createStandard: (data) => {
    const db = getMockDB();
    const std = {
      id: (db.qcStandards || []).length + 1,
      ...data,
      created_at: new Date().toISOString()
    };
    db.qcStandards = [std, ...(Array.isArray(db.qcStandards) ? db.qcStandards : [])];
    saveMockDB(db);
    return std;
  },
  getJobWorkAudits: () => getMockDB().jobWorkQCAudits || [],
  createJobWorkAudit: (data) => {
    const db = getMockDB();
    const count = (db.jobWorkQCAudits || []).length + 1;
    const isQuarantine = data.grade_assigned === 'GRADE_C' || data.is_quarantined;
    const audit = {
      id: count,
      audit_code: `QC-JW-2026-${String(count).padStart(3, '0')}`,
      ...data,
      is_quarantined: isQuarantine,
      created_at: new Date().toISOString()
    };
    db.jobWorkQCAudits = [audit, ...(Array.isArray(db.jobWorkQCAudits) ? db.jobWorkQCAudits : [])];
    saveMockDB(db);
    return audit;
  },
  getAnalysis: () => {
    const db = getMockDB();
    const rolls = db.greyRolls || [];
    const freshCount = rolls.filter(r => r.grade === 'FRESH').length;
    const secondsCount = rolls.filter(r => r.grade === 'SECONDS').length;
    const rejectCount = rolls.filter(r => r.grade === 'REJECTION').length;
    const totalRolls = rolls.length;

    return {
      total_inspected_rolls: totalRolls,
      fresh_count: freshCount,
      seconds_count: secondsCount,
      rejection_count: rejectCount,
      first_quality_ratio_percent: totalRolls > 0 ? Number(((freshCount / totalRolls) * 100).toFixed(1)) : 94.5,
      job_work_audits_count: (db.jobWorkQCAudits || []).length,
      quarantined_batches_count: (db.jobWorkQCAudits || []).filter(a => a.is_quarantined).length
    };
  },
  getRolls: () => getMockDB().greyRolls || [],
  inspectRoll: (rollData) => {
    const db = getMockDB();
    const totalPoints = rollData.defects ? rollData.defects.reduce((s, d) => s + d.points, 0) : 0;
    const widthMeters = (rollData.width_inches || 58) * 0.0254;
    const areaSqm = rollData.total_meters * widthMeters;
    const pts100Sqm = areaSqm > 0 ? (totalPoints * 100) / areaSqm : 0;

    let grade = 'FRESH';
    if (pts100Sqm > 28) grade = 'REJECTION';
    else if (pts100Sqm > 20) grade = 'SECONDS';
    const rolls = db.greyRolls || [];

    const roll = {
      id: rolls.length + 1,
      roll_number: rollData.roll_number,
      loom_id: rollData.loom_id,
      quality_construction: rollData.quality_construction,
      total_meters: rollData.total_meters,
      width_inches: rollData.width_inches || 58,
      total_defect_points: totalPoints,
      points_per_100_sqm: parseFloat(pts100Sqm.toFixed(2)),
      grade: grade,
      inspector_name: rollData.inspector_name,
      barcode_data: `ROLL-${rollData.roll_number}-GRD-${grade}`,
      inspected_at: new Date().toISOString()
    };
    db.greyRolls = [roll, ...(Array.isArray(db.greyRolls) ? db.greyRolls : [])];
    saveMockDB(db);
    return roll;
  }
};

export const mockFinanceApi = {
  getPayments: () => getMockDB().financePayments || [],
  createPayment: (data) => {
    const db = getMockDB();
    const count = (db.financePayments || []).length + 1;
    const pay = {
      id: db.nextPayId++,
      voucher_no: `VCH-PAY-2026-${String(count).padStart(3, '0')}`,
      ...data,
      status: 'POSTED',
      transaction_date: new Date().toISOString()
    };
    db.financePayments = [pay, ...(Array.isArray(db.financePayments) ? db.financePayments : [])];
    saveMockDB(db);
    return pay;
  },
  getReceipts: () => getMockDB().financeReceipts || [],
  createReceipt: (data) => {
    const db = getMockDB();
    const count = (db.financeReceipts || []).length + 1;
    const rec = {
      id: db.nextRecId++,
      receipt_no: `REC-2026-${String(count).padStart(3, '0')}`,
      ...data,
      status: 'CLEARED',
      receipt_date: new Date().toISOString()
    };
    db.financeReceipts = [rec, ...(Array.isArray(db.financeReceipts) ? db.financeReceipts : [])];
    saveMockDB(db);
    return rec;
  },
  getCreditNotes: () => getMockDB().creditNotes || [],
  createCreditNote: (data) => {
    const db = getMockDB();
    const count = (db.creditNotes || []).length + 1;
    const cn = {
      id: db.nextCNId++,
      cn_number: `CN-2026-${String(count).padStart(3, '0')}`,
      ...data,
      status: 'ISSUED',
      created_at: new Date().toISOString()
    };
    db.creditNotes = [cn, ...(Array.isArray(db.creditNotes) ? db.creditNotes : [])];
    saveMockDB(db);
    return cn;
  },
  getDebitNotes: () => getMockDB().debitNotes || [],
  createDebitNote: (data) => {
    const db = getMockDB();
    const count = (db.debitNotes || []).length + 1;
    const dn = {
      id: db.nextDNId++,
      dn_number: `DN-2026-${String(count).padStart(3, '0')}`,
      ...data,
      status: 'ISSUED',
      created_at: new Date().toISOString()
    };
    db.debitNotes = [dn, ...(Array.isArray(db.debitNotes) ? db.debitNotes : [])];
    saveMockDB(db);
    return dn;
  },
  getAuditEvents: () => getMockDB().auditEvents || [],
  getSummary: () => {
    const db = getMockDB();
    const payments = db.financePayments || [];
    const receipts = db.financeReceipts || [];
    const cns = db.creditNotes || [];
    const dns = db.debitNotes || [];

    const totalOutflow = payments.reduce((s, p) => s + (p.amount || 0), 0);
    const totalInflow = receipts.reduce((s, r) => s + (r.amount || 0), 0);
    const totalCN = cns.reduce((s, c) => s + (c.credit_amount || 0), 0);
    const totalDN = dns.reduce((s, d) => s + (d.debit_amount || 0), 0);

    return {
      total_receipts_amount: totalInflow,
      total_payments_amount: totalOutflow,
      net_cashflow: totalInflow - totalOutflow,
      credit_notes_total: totalCN,
      debit_notes_total: totalDN,
      pending_receivables: 3820000.0,
      pending_payables: 2840000.0
    };
  }
};

// =========================================================================
// --- SHOP-FLOOR PRODUCTION & HANDOVER TRACEABILITY API ---
// =========================================================================

export const SHOPFLOOR_STAGES = [
  { stage_number: 1, stage_key: "1_YARN_INWARD", stage_name: "Yarn Purchase / Inward", phase: "Phase 1: Yarn Preparation", allowed_roles: ["SUPERVISOR", "STORE_MANAGER", "OWNER", "MANAGER"], preceding_stage_number: null, preceding_stage_name: null, rating_subject: null, defect_options: [] },
  { stage_number: 2, stage_key: "2_YARN_WINDING", stage_name: "Yarn Issue on Winding", phase: "Phase 1: Yarn Preparation", allowed_roles: ["WINDING_WORKER", "SUPERVISOR", "LOOM_SUPERVISOR", "OWNER", "MANAGER"], preceding_stage_number: 1, preceding_stage_name: "Yarn Purchase / Inward", rating_subject: "Incoming Yarn Purchase Lot (Package condition, moisture, yarn breakages)", defect_options: ["Package Damaged", "Moisture Excess", "Frequent Breakages", "Count Variation", "Color Lot Mismatch"] },
  { stage_number: 3, stage_key: "3_YARN_TFO", stage_name: "Yarn TFO (Two-for-One Twisting)", phase: "Phase 1: Yarn Preparation", allowed_roles: ["TFO_WORKER", "SUPERVISOR", "LOOM_SUPERVISOR", "OWNER", "MANAGER"], preceding_stage_number: 2, preceding_stage_name: "Yarn Issue on Winding", rating_subject: "Wound Bobbins from Winding (Tension uniformity, winding density)", defect_options: ["Uneven Tension", "Soft Bobbin Build", "Slough Off", "Knots & Splice Failure", "Density Variation"] },
  { stage_number: 4, stage_key: "4_YARN_WARPING_ISSUE", stage_name: "Yarn Issue on Warping", phase: "Phase 1: Yarn Preparation", allowed_roles: ["WARPER", "SUPERVISOR", "LOOM_SUPERVISOR", "OWNER", "MANAGER"], preceding_stage_number: 3, preceding_stage_name: "Yarn TFO (Two-for-One Twisting)", rating_subject: "TFO Twisted Yarn Quality (Twist balance, snarls, package build)", defect_options: ["Twist Snarls", "Twist Variation (TPM)", "Cone Nose Collapse", "Yarn Hairiness", "Package Stain"] },
  { stage_number: 5, stage_key: "5_YARN_WEFT_ISSUE", stage_name: "Yarn Issue on Loom (Weft Supply)", phase: "Phase 1: Yarn Preparation", allowed_roles: ["SUPERVISOR", "LOOM_SUPERVISOR", "LOOM_MASTER", "OWNER", "MANAGER"], preceding_stage_number: 3, preceding_stage_name: "Yarn TFO / Winding", rating_subject: "Weft Packages from TFO/Winding (Feeder insertion runnability)", defect_options: ["Weak Weft Tensile", "Feeder Snags", "Pirn/Cone Deformity", "Shade Inconsistency"] },
  { stage_number: 6, stage_key: "6_BEAM_MAKING", stage_name: "Beam Making (Warping Completion)", phase: "Phase 2: Beam Preparation & Loading", allowed_roles: ["WARPER", "SUPERVISOR", "LOOM_SUPERVISOR", "OWNER", "MANAGER"], preceding_stage_number: 4, preceding_stage_name: "Yarn Issue on Warping", rating_subject: "Warping Creel Runnability (Static charge, end breaks, stop-motion)", defect_options: ["Loose Warp Ends", "Static Cling", "Creel End Entanglement", "Tension Fluctuations"] },
  { stage_number: 7, stage_key: "7_BEAM_GEETING", stage_name: "Beam Issue for Geeting (Drawing-in / Knotting / Denting)", phase: "Phase 2: Beam Preparation & Loading", allowed_roles: ["GETTER", "SUPERVISOR", "LOOM_SUPERVISOR", "OWNER", "MANAGER"], preceding_stage_number: 6, preceding_stage_name: "Beam Making (Warping Completion)", rating_subject: "Beam Making Quality (End cross-overs, beam flange build, barrel tension)", defect_options: ["End Cross-Overs", "High-Low Beam Build", "Flange Gap Loose Ends", "Warp Density Ridge"] },
  { stage_number: 8, stage_key: "8_BEAM_GAITING", stage_name: "Beam Issue on Loom (Gaiting & Loading)", phase: "Phase 2: Beam Preparation & Loading", allowed_roles: ["LOOM_MASTER", "SUPERVISOR", "LOOM_SUPERVISOR", "OWNER", "MANAGER"], preceding_stage_number: 7, preceding_stage_name: "Beam Issue for Geeting", rating_subject: "Geeting & Drawing Quality (Drawing accuracy, missed ends, knot strength)", defect_options: ["Drawing In Error (Mispick/End)", "Weak Knots", "Drop Wire Jam", "Reed Dent Damage", "Heald Wire Friction"] },
  { stage_number: 9, stage_key: "9_TAKA_MAKING", stage_name: "Taka Making (Doffing / Loom Roll Production)", phase: "Phase 3: Weaving & Taka Processing", allowed_roles: ["LOOM_WORKER", "WEAVER", "LOOM_SUPERVISOR", "SUPERVISOR", "OWNER", "MANAGER"], preceding_stage_number: 8, preceding_stage_name: "Beam Issue on Loom (Gaiting & Loading)", rating_subject: "Loom & Beam Runnability (Shedding cleanliness, warp stop frequency)", defect_options: ["Frequent Warp Stops", "Weft Cutter Misalignment", "Temple Mark Tension", "Selvedge Fraying"] },
  { stage_number: 10, stage_key: "10_TAKA_CHECKING", stage_name: "Taka Checking (Grey Mending & Inspection)", phase: "Phase 3: Weaving & Taka Processing", allowed_roles: ["MENDER", "QC_INSPECTOR", "SUPERVISOR", "OWNER", "MANAGER"], preceding_stage_number: 9, preceding_stage_name: "Taka Making (Doffing)", rating_subject: "Taka Weaving Quality (Starting marks, missing picks, oil spots)", defect_options: ["Starting / Stopping Mark", "Missing Weft Pick", "Warp End Break Hole", "Loom Oil Stain", "Float / Slub", "Reed Mark"] },
  { stage_number: 11, stage_key: "11_TAKA_FOLDING", stage_name: "Taka Folding (Rolling & Packaging)", phase: "Phase 3: Weaving & Taka Processing", allowed_roles: ["FOLDER", "SUPERVISOR", "STORE_MANAGER", "OWNER", "MANAGER"], preceding_stage_number: 10, preceding_stage_name: "Taka Checking (Mending & Inspection)", rating_subject: "Mending & Inspection Quality (Defect trimming, selvage alignment)", defect_options: ["Untrimmed Mending Knots", "Uneven Selvedge Rolling", "Crease Marks", "Moisture Residue"] },
  { stage_number: 12, stage_key: "12_TAKA_DISPATCH", stage_name: "Taka Dispatching (Grouping & Staging)", phase: "Phase 4: Dispatch & Logistics", allowed_roles: ["SUPERVISOR", "STORE_MANAGER", "OWNER", "MANAGER"], preceding_stage_number: 11, preceding_stage_name: "Taka Folding (Rolling & Packaging)", rating_subject: "Packaging & Folding Condition (Poly-wrap integrity, roll tag legibility)", defect_options: ["Torn Poly Wrap", "Missing Roll Tag", "Bale Strapping Loose", "Water/Dust Exposure"] },
  { stage_number: 13, stage_key: "13_DELIVERY_CHALLAN", stage_name: "Delivery Challan Making", phase: "Phase 4: Dispatch & Logistics", allowed_roles: ["SUPERVISOR", "MANAGER", "OWNER", "FINANCE_ACCOUNTANT", "SALES_EXECUTIVE"], preceding_stage_number: 12, preceding_stage_name: "Taka Dispatching", rating_subject: "Final Dispatch Clearance & Vehicle Inspection", defect_options: ["Vehicle Cleanliness", "Tarp Covering Missing", "Piece Count Mismatch", "Weight Scale Variance"] }
];

export const mockShopFloorApi = {
  getStages: () => SHOPFLOOR_STAGES,

  getPrecedingBatches: (stageNumber) => {
    const db = getMockDB();
    const stageDef = SHOPFLOOR_STAGES.find(s => s.stage_number === stageNumber);
    if (!stageDef || !stageDef.preceding_stage_number) return [];
    return (db.shopFloorRecords || []).filter(r => r.stage_number === stageDef.preceding_stage_number);
  },

  createRecord: (payload) => {
    const db = getMockDB();
    if (!Array.isArray(db.shopFloorRecords)) db.shopFloorRecords = [];
    const stageDef = SHOPFLOOR_STAGES.find(s => s.stage_number === payload.stage_number) || {
      stage_key: `STAGE_${payload.stage_number}`,
      stage_name: `Stage ${payload.stage_number}`
    };
    let rootYarn = payload.root_yarn_lot;
    let precedingRec = null;

    if (payload.stage_number > 1) {
      if (payload.preceding_record_id) {
        precedingRec = db.shopFloorRecords.find(r => r.id === payload.preceding_record_id);
      } else if (payload.preceding_batch_code) {
        precedingRec = db.shopFloorRecords.find(r => r.batch_code === payload.preceding_batch_code);
      }
      if (precedingRec) rootYarn = precedingRec.root_yarn_lot;
    } else {
      rootYarn = payload.batch_code || payload.stage_data?.lot_number || payload.root_yarn_lot || `LOT-${Date.now()}`;
    }

    let batchCode = payload.batch_code;
    if (!batchCode) {
      if (payload.stage_number === 1 && payload.stage_data?.lot_number) {
        batchCode = payload.stage_data.lot_number;
      } else {
        const prefixMap = { 1: "YRN-LOT", 2: "WND-BCH", 3: "TFO-BCH", 4: "WRP-ISS", 5: "WFT-ISS", 6: "BM", 7: "GET-BM", 8: "GAT-LM", 9: "TK-ROL", 10: "CHK-TK", 11: "FLD-TAG", 12: "DSP-LOT", 13: "CHL" };
        const p = prefixMap[payload.stage_number] || "STG";
        const nextId = db.nextShopFloorId || (db.shopFloorRecords.length + 1);
        batchCode = `${p}-${new Date().getFullYear()}-${String(nextId).padStart(4, '0')}`;
      }
    }

    const isAlert = Boolean(payload.incoming_rating && payload.incoming_rating < 3);
    const recId = db.nextShopFloorId || (db.shopFloorRecords.length + 1);
    db.nextShopFloorId = recId + 1;

    const newRec = {
      id: recId,
      stage_key: stageDef.stage_key,
      stage_name: stageDef.stage_name,
      stage_number: payload.stage_number,
      batch_code: batchCode,
      preceding_record_id: precedingRec ? precedingRec.id : (payload.preceding_record_id || null),
      preceding_batch_code: precedingRec ? precedingRec.batch_code : (payload.preceding_batch_code || null),
      root_yarn_lot: rootYarn,
      operator_name: payload.operator_name || 'Operator',
      operator_role: payload.operator_role || 'Worker',
      incoming_rating: payload.stage_number > 1 ? (payload.incoming_rating || null) : null,
      incoming_defects: payload.stage_number > 1 ? (payload.incoming_defects || []) : [],
      incoming_notes: payload.incoming_notes || '',
      is_quality_alert: isAlert,
      alert_resolved: false,
      supervisor_resolution_notes: null,
      input_weight_kg: payload.input_weight_kg || 0.0,
      output_weight_kg: payload.output_weight_kg || 0.0,
      waste_weight_kg: payload.waste_weight_kg || 0.0,
      stage_data: payload.stage_data || {},
      status: isAlert ? "FLAGGED_ALERT" : "COMPLETED",
      created_at: new Date().toISOString()
    };

    db.shopFloorRecords = [newRec, ...(Array.isArray(db.shopFloorRecords) ? db.shopFloorRecords : [])];

    // Synchronize inward yarn to Store if Stage 1
    if (payload.stage_number === 1) {
      if (!Array.isArray(db.yarnStocks)) db.yarnStocks = [];
      const exists = db.yarnStocks.some(y => y.lot_number === batchCode);
      if (!exists) {
        db.yarnStocks = [{
          id: db.yarnStocks.length + 1,
          lot_number: batchCode,
          yarn_count: payload.stage_data?.yarn_count || '40s Combed Cotton',
          supplier_name: payload.stage_data?.vendor_name || 'Nahar Spinning Mills',
          bags_count: Number(payload.stage_data?.bags_count) || 100,
          net_weight_kg: Number(payload.output_weight_kg || payload.input_weight_kg) || 5000,
          rate_per_kg: Number(payload.stage_data?.rate_per_kg) || 310,
          total_value: (Number(payload.stage_data?.rate_per_kg) || 310) * (Number(payload.output_weight_kg || payload.input_weight_kg) || 5000),
          godown_bay: payload.stage_data?.storage_rack || 'Bay A-01',
          received_at: new Date().toISOString()
        }, ...db.yarnStocks];
      }
    }

    saveMockDB(db);
    return newRec;
  },

  getRecords: (filters = {}) => {
    const db = getMockDB();
    let list = db.shopFloorRecords || [];
    if (filters.stage_number) list = list.filter(r => r.stage_number === Number(filters.stage_number));
    if (filters.root_yarn_lot) list = list.filter(r => r.root_yarn_lot === filters.root_yarn_lot);
    if (filters.is_quality_alert !== undefined && filters.is_quality_alert !== null) {
      list = list.filter(r => r.is_quality_alert === filters.is_quality_alert);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(r => 
        (r.batch_code || '').toLowerCase().includes(q) ||
        (r.root_yarn_lot || '').toLowerCase().includes(q) ||
        (r.operator_name || '').toLowerCase().includes(q) ||
        (r.stage_name || '').toLowerCase().includes(q)
      );
    }
    return list;
  },

  getQualityMatrix: () => {
    const db = getMockDB();
    const records = db.shopFloorRecords || [];
    const rated = records.filter(r => r.incoming_rating != null);
    const stageRatings = {};
    const defectCounts = {};
    let lowCount = 0;
    let highCount = 0;

    SHOPFLOOR_STAGES.forEach(s => {
      if (s.stage_number > 1) {
        stageRatings[s.stage_number] = {
          stage_number: s.stage_number,
          stage_name: s.stage_name,
          rating_subject: s.rating_subject,
          total_ratings: 0,
          sum_stars: 0,
          avg_rating: 5.0,
          alerts_count: 0
        };
      }
    });

    rated.forEach(r => {
      const stg = r.stage_number;
      if (stageRatings[stg]) {
        stageRatings[stg].total_ratings++;
        stageRatings[stg].sum_stars += r.incoming_rating;
        if (r.incoming_rating < 3) {
          stageRatings[stg].alerts_count++;
          lowCount++;
        } else if (r.incoming_rating >= 4) {
          highCount++;
        }
      }
      (r.incoming_defects || []).forEach(d => {
        defectCounts[d] = (defectCounts[d] || 0) + 1;
      });
    });

    Object.values(stageRatings).forEach(data => {
      if (data.total_ratings > 0) {
        data.avg_rating = Number((data.sum_stars / data.total_ratings).toFixed(2));
      }
    });

    const unresolvedAlerts = records.filter(r => r.is_quality_alert && !r.alert_resolved);
    const topDefects = Object.entries(defectCounts)
      .map(([defect, count]) => ({ defect, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      total_handovers: rated.length,
      high_rating_count: highCount,
      low_rating_count: lowCount,
      overall_health_score: rated.length > 0 ? Number(((highCount / rated.length) * 100).toFixed(1)) : 96.0,
      stage_ratings: Object.values(stageRatings),
      top_defects: topDefects,
      unresolved_alerts: unresolvedAlerts
    };
  },

  resolveAlert: (recordId, resolutionNotes) => {
    const db = getMockDB();
    const rec = (db.shopFloorRecords || []).find(r => r.id === recordId);
    if (rec) {
      rec.alert_resolved = true;
      rec.supervisor_resolution_notes = resolutionNotes;
      rec.status = "RESOLVED_BY_SUPERVISOR";
      saveMockDB(db);
    }
    return rec;
  },

  getTraceability: (batchCode) => {
    const db = getMockDB();
    const q = (batchCode || '').trim();
    const records = db.shopFloorRecords || [];
    const target = records.find(r => r.batch_code === q || r.root_yarn_lot === q);
    if (!target) throw new Error(`Batch or Lot '${batchCode}' not found.`);

    const lineage = records
      .filter(r => r.root_yarn_lot === target.root_yarn_lot)
      .sort((a, b) => a.stage_number - b.stage_number);

    return {
      queried_batch_code: batchCode,
      target_stage_number: target.stage_number,
      target_stage_name: target.stage_name,
      root_yarn_lot: target.root_yarn_lot,
      total_lineage_steps: lineage.length,
      timeline: lineage
    };
  }
};

export const shopFloorApi = {
  getStages: async () => {
    try {
      const res = await apiClient.get('/production/shopfloor/stages');
      return res.data;
    } catch {
      return mockShopFloorApi.getStages();
    }
  },
  getPrecedingBatches: async (stageNumber) => {
    try {
      const res = await apiClient.get(`/production/shopfloor/preceding-batches/${stageNumber}`);
      return res.data;
    } catch {
      return mockShopFloorApi.getPrecedingBatches(stageNumber);
    }
  },
  createRecord: async (payload) => {
    try {
      const res = await apiClient.post('/production/shopfloor/records', payload);
      return res.data;
    } catch (err) {
      if (err.response?.data?.detail) throw new Error(err.response.data.detail);
      return mockShopFloorApi.createRecord(payload);
    }
  },
  getRecords: async (params = {}) => {
    try {
      const res = await apiClient.get('/production/shopfloor/records', { params });
      return res.data;
    } catch {
      return mockShopFloorApi.getRecords(params);
    }
  },
  getQualityMatrix: async () => {
    try {
      const res = await apiClient.get('/production/shopfloor/quality-matrix');
      return res.data;
    } catch {
      return mockShopFloorApi.getQualityMatrix();
    }
  },
  resolveAlert: async (recordId, resolutionNotes) => {
    try {
      const res = await apiClient.patch(`/production/shopfloor/alerts/${recordId}/resolve`, { resolution_notes: resolutionNotes });
      return res.data;
    } catch {
      return mockShopFloorApi.resolveAlert(recordId, resolutionNotes);
    }
  },
  getTraceability: async (batchCode) => {
    try {
      const res = await apiClient.get(`/production/shopfloor/traceability/${encodeURIComponent(batchCode)}`);
      return res.data;
    } catch {
      return mockShopFloorApi.getTraceability(batchCode);
    }
  }
};

export const storeApi = {
  getSummary: async () => {
    try {
      const res = await apiClient.get('/store/summary');
      return res.data;
    } catch {
      return mockStoreApi.getSummary();
    }
  },
  getRequisitions: async () => {
    try {
      const res = await apiClient.get('/store/requisitions');
      return res.data;
    } catch {
      return mockStoreApi.getRequisitions();
    }
  },
  createRequisition: async (data) => {
    try {
      const res = await apiClient.post('/store/requisitions', data);
      return res.data;
    } catch {
      return mockStoreApi.createRequisition(data);
    }
  },
  getIssues: async () => {
    try {
      const res = await apiClient.get('/store/issues');
      return res.data;
    } catch {
      return mockStoreApi.getIssues();
    }
  },
  createIssue: async (data) => {
    try {
      const res = await apiClient.post('/store/issues', data);
      return res.data;
    } catch {
      return mockStoreApi.createIssue(data);
    }
  },
  getReceived: async () => {
    try {
      const res = await apiClient.get('/store/received');
      return res.data;
    } catch {
      return mockStoreApi.getReceived();
    }
  },
  createReceived: async (data) => {
    try {
      const res = await apiClient.post('/store/received', data);
      return res.data;
    } catch {
      return mockStoreApi.createReceived(data);
    }
  },
  getOpenings: async () => {
    try {
      const res = await apiClient.get('/store/openings');
      return res.data;
    } catch {
      return mockStoreApi.getOpenings();
    }
  },
  createOpening: async (data) => {
    try {
      const res = await apiClient.post('/store/openings', data);
      return res.data;
    } catch {
      return mockStoreApi.createOpening(data);
    }
  },
};

export const purchaseApi = {
  getIndents: async () => {
    try {
      const res = await apiClient.get('/purchase/indents');
      return res.data;
    } catch {
      return mockPurchaseApi.getIndents();
    }
  },
  createIndent: async (data) => {
    try {
      const res = await apiClient.post('/purchase/indents', data);
      return res.data;
    } catch {
      return mockPurchaseApi.createIndent(data);
    }
  },
  getOrders: async () => {
    try {
      const res = await apiClient.get('/purchase/orders');
      return res.data;
    } catch {
      return mockPurchaseApi.getOrders();
    }
  },
  createOrder: async (data) => {
    try {
      const res = await apiClient.post('/purchase/orders', data);
      return res.data;
    } catch {
      return mockPurchaseApi.createOrder(data);
    }
  },
  getInwards: async () => {
    try {
      const res = await apiClient.get('/purchase/inward');
      return res.data;
    } catch {
      return mockPurchaseApi.getInwards();
    }
  },
  createInward: async (data) => {
    try {
      const res = await apiClient.post('/purchase/inward', data);
      return res.data;
    } catch {
      return mockPurchaseApi.createInward(data);
    }
  },
  getGRNs: async () => {
    try {
      const res = await apiClient.get('/purchase/grn');
      return res.data;
    } catch {
      return mockPurchaseApi.getGRNs();
    }
  },
  createGRN: async (data) => {
    try {
      const res = await apiClient.post('/purchase/grn', data);
      return res.data;
    } catch {
      return mockPurchaseApi.createGRN(data);
    }
  },
  getBills: async () => {
    try {
      const res = await apiClient.get('/purchase/bills');
      return res.data;
    } catch {
      return mockPurchaseApi.getBills();
    }
  },
  createBill: async (data) => {
    try {
      const res = await apiClient.post('/purchase/bills', data);
      return res.data;
    } catch {
      return mockPurchaseApi.createBill(data);
    }
  },
  getReturns: async () => {
    try {
      const res = await apiClient.get('/purchase/returns');
      return res.data;
    } catch {
      return mockPurchaseApi.getReturns();
    }
  },
  createReturn: async (data) => {
    try {
      const res = await apiClient.post('/purchase/returns', data);
      return res.data;
    } catch {
      return mockPurchaseApi.createReturn(data);
    }
  },
};

export const qcApi = {
  getStandards: async () => {
    try {
      const res = await apiClient.get('/qc/standards');
      return res.data;
    } catch {
      return mockQCApi.getStandards();
    }
  },
  createStandard: async (data) => {
    try {
      const res = await apiClient.post('/qc/standards', data);
      return res.data;
    } catch {
      return mockQCApi.createStandard(data);
    }
  },
  getJobWorkAudits: async () => {
    try {
      const res = await apiClient.get('/qc/job-work');
      return res.data;
    } catch {
      return mockQCApi.getJobWorkAudits();
    }
  },
  createJobWorkAudit: async (data) => {
    try {
      const res = await apiClient.post('/qc/job-work', data);
      return res.data;
    } catch {
      return mockQCApi.createJobWorkAudit(data);
    }
  },
  getAnalysis: async () => {
    try {
      const res = await apiClient.get('/qc/analysis');
      return res.data;
    } catch {
      return mockQCApi.getAnalysis();
    }
  },
  getRolls: async () => {
    try {
      const res = await apiClient.get('/qc/rolls');
      return res.data;
    } catch {
      return mockQCApi.getRolls();
    }
  },
  inspectRoll: async (data) => {
    try {
      const res = await apiClient.post('/qc/inspect', data);
      return res.data;
    } catch {
      return mockQCApi.inspectRoll(data);
    }
  }
};

export const salesApi = {
  getSummary: async () => {
    try {
      const res = await apiClient.get('/sales/summary');
      return res.data;
    } catch {
      return mockSalesApi.getSummary();
    }
  },
  getOrders: async () => {
    try {
      const res = await apiClient.get('/sales/orders');
      return res.data;
    } catch {
      return mockSalesApi.getOrders();
    }
  },
  createOrder: async (data) => {
    try {
      const res = await apiClient.post('/sales/orders', data);
      return res.data;
    } catch {
      return mockSalesApi.createOrder(data);
    }
  },
  getDispatches: async () => {
    try {
      const res = await apiClient.get('/sales/dispatches');
      return res.data;
    } catch {
      return mockSalesApi.getDispatches();
    }
  },
  createDispatch: async (data) => {
    try {
      const res = await apiClient.post('/sales/dispatches', data);
      return res.data;
    } catch {
      return mockSalesApi.createDispatch(data);
    }
  },
  getInvoices: async () => {
    try {
      const res = await apiClient.get('/sales/invoices');
      return res.data;
    } catch {
      return mockSalesApi.getInvoices();
    }
  },
  createInvoice: async (data) => {
    try {
      const res = await apiClient.post('/sales/invoices', data);
      return res.data;
    } catch {
      return mockSalesApi.createInvoice(data);
    }
  },
  getReturns: async () => {
    try {
      const res = await apiClient.get('/sales/returns');
      return res.data;
    } catch {
      return mockSalesApi.getReturns();
    }
  },
  createReturn: async (data) => {
    try {
      const res = await apiClient.post('/sales/returns', data);
      return res.data;
    } catch {
      return mockSalesApi.createReturn(data);
    }
  }
};

export const financeApi = {
  getSummary: async () => {
    try {
      const res = await apiClient.get('/finance/summary');
      return res.data;
    } catch {
      return mockFinanceApi.getSummary();
    }
  },
  getPayments: async () => {
    try {
      const res = await apiClient.get('/finance/payments');
      return res.data;
    } catch {
      return mockFinanceApi.getPayments();
    }
  },
  createPayment: async (data) => {
    try {
      const res = await apiClient.post('/finance/payments', data);
      return res.data;
    } catch {
      return mockFinanceApi.createPayment(data);
    }
  },
  getReceipts: async () => {
    try {
      const res = await apiClient.get('/finance/receipts');
      return res.data;
    } catch {
      return mockFinanceApi.getReceipts();
    }
  },
  createReceipt: async (data) => {
    try {
      const res = await apiClient.post('/finance/receipts', data);
      return res.data;
    } catch {
      return mockFinanceApi.createReceipt(data);
    }
  },
  getCreditNotes: async () => {
    try {
      const res = await apiClient.get('/finance/credit-notes');
      return res.data;
    } catch {
      return mockFinanceApi.getCreditNotes();
    }
  },
  createCreditNote: async (data) => {
    try {
      const res = await apiClient.post('/finance/credit-notes', data);
      return res.data;
    } catch {
      return mockFinanceApi.createCreditNote(data);
    }
  },
  getDebitNotes: async () => {
    try {
      const res = await apiClient.get('/finance/debit-notes');
      return res.data;
    } catch {
      return mockFinanceApi.getDebitNotes();
    }
  },
  createDebitNote: async (data) => {
    try {
      const res = await apiClient.post('/finance/debit-notes', data);
      return res.data;
    } catch {
      return mockFinanceApi.createDebitNote(data);
    }
  },
  getAuditEvents: async () => {
    try {
      const res = await apiClient.get('/finance/audit-events');
      return res.data;
    } catch {
      return mockFinanceApi.getAuditEvents();
    }
  }
};