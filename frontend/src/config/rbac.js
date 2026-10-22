/**
 * Role-Based Access Control (RBAC) Specification & Permission Matrix
 * WEAVE-TECH ERP Enterprise Edition
 * 
 * Strict module-level and action-level authorization rules per factory role.
 */

export const ROLES = {
  OWNER: 'OWNER',
  SALES_EXECUTIVE: 'SALES_EXECUTIVE',
  STORE_MANAGER: 'STORE_MANAGER',
  LOOM_SUPERVISOR: 'LOOM_SUPERVISOR',
  QC_INSPECTOR: 'QC_INSPECTOR',
  PAYMENT_OFFICER: 'PAYMENT_OFFICER',
  CRM_EXECUTIVE: 'CRM_EXECUTIVE',
  FINANCE_ACCOUNTANT: 'FINANCE_ACCOUNTANT',
};

export const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: {
    name: 'Plant Owner / Director',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    description: 'Unrestricted plant-wide administrative and financial authority.',
    allowedModules: [
      'dashboard',
      'masters',
      'crm',
      'production',
      'store',
      'purchase',
      'qc',
      'sales',
      'finance',
      'statutory',
    ],
    defaultModule: 'dashboard',
    allowedProductionStages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    canApproveFinancials: true,
    canOverrideQC: true,
  },

  [ROLES.LOOM_SUPERVISOR]: {
    name: 'Loom Shed Supervisor',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    description: 'Loom operations, shift management, beam gaiting, and floor handovers.',
    allowedModules: [
      'production',
      'qc',
    ],
    defaultModule: 'production',
    allowedProductionStages: [2, 3, 4, 5, 6, 7, 8], // Winding to Doffing
    canApproveFinancials: false,
    canOverrideQC: false,
  },

  [ROLES.QC_INSPECTOR]: {
    name: 'Quality Assurance Inspector',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    description: 'ASTM 4-Point fabric grading, defect penalty logging, and sizing audits.',
    allowedModules: [
      'qc',
      'production',
    ],
    defaultModule: 'qc',
    allowedProductionStages: [9, 10], // Grey Inspection & Mending
    canApproveFinancials: false,
    canOverrideQC: true,
  },

  [ROLES.STORE_MANAGER]: {
    name: 'Store & Material Incharge',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    description: 'Yarn receipt, warehouse stock balances, and material requisitions.',
    allowedModules: [
      'store',
      'purchase',
      'masters',
    ],
    defaultModule: 'store',
    allowedProductionStages: [1], // Yarn Purchase / Inward
    canApproveFinancials: false,
    canOverrideQC: false,
  },

  [ROLES.SALES_EXECUTIVE]: {
    name: 'Sales & Dispatch Executive',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    description: 'Fabric booking queue, buyer taka dispatch orders, and GST billing.',
    allowedModules: [
      'sales',
      'crm',
      'dashboard',
    ],
    defaultModule: 'sales',
    allowedProductionStages: [12, 13], // Packaging & Dispatch
    canApproveFinancials: false,
    canOverrideQC: false,
  },

  [ROLES.CRM_EXECUTIVE]: {
    name: 'CRM & Accounts Manager',
    badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    description: 'Lead tracking, technical fabric inquiries, agency queues, and forecasts.',
    allowedModules: [
      'crm',
      'sales',
      'masters',
    ],
    defaultModule: 'crm',
    allowedProductionStages: [],
    canApproveFinancials: false,
    canOverrideQC: false,
  },

  [ROLES.FINANCE_ACCOUNTANT]: {
    name: 'Chief Finance Accountant',
    badgeColor: 'bg-slate-200 text-slate-900 border-slate-400',
    description: 'Double-entry general ledgers, credit/debit notes, and statutory GST reports.',
    allowedModules: [
      'finance',
      'statutory',
      'purchase',
      'sales',
      'dashboard',
    ],
    defaultModule: 'finance',
    allowedProductionStages: [],
    canApproveFinancials: true,
    canOverrideQC: false,
  },

  [ROLES.PAYMENT_OFFICER]: {
    name: 'Billing & Payment Officer',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    description: 'Vendor payment vouchers, buyer receipts, and bank deposit reconciliation.',
    allowedModules: [
      'finance',
      'dashboard',
    ],
    defaultModule: 'finance',
    allowedProductionStages: [],
    canApproveFinancials: false,
    canOverrideQC: false,
  },
};

/**
 * Check if a role has access to a specific module
 */
export function isModuleAllowed(role, moduleId) {
  if (!role || !moduleId) return false;
  // OWNER always has full access
  if (role === ROLES.OWNER) return true;
  const config = ROLE_PERMISSIONS[role];
  if (!config) return false;
  return config.allowedModules.includes(moduleId);
}

/**
 * Get list of allowed modules for a given role
 */
export function getAllowedModules(role) {
  if (!role) return [];
  const config = ROLE_PERMISSIONS[role];
  return config ? config.allowedModules : [];
}

/**
 * Get default starting module for a given role on login
 */
export function getDefaultModule(role) {
  if (!role) return 'dashboard';
  const config = ROLE_PERMISSIONS[role];
  return config ? config.defaultModule : 'dashboard';
}

/**
 * Get human-readable role metadata
 */
export function getRoleMeta(role) {
  return ROLE_PERMISSIONS[role] || {
    name: role || 'Unknown Role',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    description: 'Standard plant user',
    allowedModules: [],
    defaultModule: 'dashboard',
  };
}
