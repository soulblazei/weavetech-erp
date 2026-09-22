import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FolderTree, 
  Building2, 
  Users, 
  Package, 
  Settings, 
  FileSpreadsheet, 
  MessageSquareText, 
  Factory, 
  Boxes, 
  ShoppingCart, 
  CheckSquare, 
  Truck, 
  Landmark, 
  Scale, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Minus, 
  Search, 
  Bell, 
  Building,
  TrendingUp,
  UserPlus,
  Layers,
  ShoppingBag,
  BarChart3,
  ClipboardList,
  Send,
  Warehouse,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Scissors,
  FileText,
  FileCheck2,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';

import LoginScreen from './components/LoginScreen';
import OwnerDashboard from './components/OwnerDashboard';
import MasterPanel from './components/masters/MasterPanel';
import CRMModule from './components/CRMModule';
import ShopFloorModule from './components/production/ShopFloorModule';
import LoomSupervisor from './components/LoomSupervisor';
import StoreModule from './components/StoreModule';
import PurchaseModule from './components/PurchaseModule';
import FabricQCInspection from './components/FabricQCInspection';
import SalesModule from './components/SalesModule';
import FinanceModule from './components/FinanceModule';
import StatutoryReports from './components/StatutoryReports';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeModule, setActiveModule] = useState('dashboard'); 
  const [masterSubTab, setMasterSubTab] = useState('clients'); 
  const [crmSubTab, setCrmSubTab] = useState('inquiries'); 
  const [productionSubTab, setProductionSubTab] = useState('shopfloor'); 
  const [storeSubTab, setStoreSubTab] = useState('requisition');
  const [purchaseSubTab, setPurchaseSubTab] = useState('po');
  const [qcSubTab, setQcSubTab] = useState('rolls');
  const [salesSubTab, setSalesSubTab] = useState('queue');
  const [financeSubTab, setFinanceSubTab] = useState('payments');

  // Accordion expansion states
  const [isMasterExpanded, setIsMasterExpanded] = useState(false);
  const [isCrmExpanded, setIsCrmExpanded] = useState(false);
  const [isProductionExpanded, setIsProductionExpanded] = useState(false);
  const [isStoreExpanded, setIsStoreExpanded] = useState(false);
  const [isPurchaseExpanded, setIsPurchaseExpanded] = useState(false);
  const [isQcExpanded, setIsQcExpanded] = useState(false);
  const [isSalesExpanded, setIsSalesExpanded] = useState(false);
  const [isFinanceExpanded, setIsFinanceExpanded] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Restore session
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('weaving_user_profile');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
      }
    } catch (e) {
      localStorage.removeItem('weaving_user_profile');
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveModule('dashboard');
  };

  const handleSignOut = () => {
    localStorage.removeItem('weaving_auth_token');
    localStorage.removeItem('weaving_user_profile');
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const masterSubItems = [
    { id: 'clients', label: 'Client / Party Master', icon: Building2 },
    { id: 'employees', label: 'Employee Master', icon: Users },
    { id: 'items', label: 'Item & Fabric Master', icon: Package },
    { id: 'company', label: 'Company Master', icon: Building },
    { id: 'parameters', label: 'Categories & Parameters', icon: Settings },
    { id: 'mis', label: 'Master MIS Analytics', icon: FileSpreadsheet },
  ];

  const crmSubItems = [
    { id: 'forecast', label: 'Forecast Projections', icon: TrendingUp },
    { id: 'sales_team', label: 'Sales Team Queues', icon: Users },
    { id: 'leads', label: 'Lead Management', icon: UserPlus },
    { id: 'inquiries', label: 'Opportunity / Inquiry', icon: Layers },
    { id: 'orders', label: 'Sales Order Queue', icon: ShoppingBag },
    { id: 'mis', label: 'CRM MIS & Pipeline', icon: BarChart3 },
  ];

  const productionSubItems = [
    { id: 'shopfloor', label: '13-Stage Traceability', icon: Factory },
    { id: 'looms', label: 'Loom Shifts & RPM', icon: Settings },
  ];

  const storeSubItems = [
    { id: 'requisition', label: 'Requisition', icon: ClipboardList },
    { id: 'issue', label: 'Material Issue', icon: Send },
    { id: 'received', label: 'Material Received', icon: Warehouse },
    { id: 'opening', label: 'Item Opening Balance', icon: FileCheck2 },
  ];

  const purchaseSubItems = [
    { id: 'indent', label: 'Indent', icon: FileText },
    { id: 'po', label: 'Purchase Order (PO)', icon: ShoppingCart },
    { id: 'inward', label: 'Gate Inward', icon: Truck },
    { id: 'grn', label: 'GRN (Receipt & QC)', icon: CheckSquare },
    { id: 'bills', label: 'Purchase Bills', icon: Receipt },
    { id: 'returns', label: 'Purchase Returns', icon: RotateCcw },
  ];

  const qcSubItems = [
    { id: 'standards', label: 'Quality Standards', icon: ShieldCheck },
    { id: 'rolls', label: 'ASTM 4-Pt Roll QC', icon: Scissors },
    { id: 'jobwork', label: 'Job Work QC & Sizing', icon: Building2 },
    { id: 'analysis', label: 'Quality Analytics', icon: BarChart3 },
  ];

  const salesSubItems = [
    { id: 'queue', label: 'Fabric Booking Queue', icon: ShoppingBag },
    { id: 'dispatch', label: 'Dispatch Orders', icon: Truck },
    { id: 'invoice', label: 'Sales Invoices (GST)', icon: Receipt },
    { id: 'return', label: 'Sales Returns', icon: RotateCcw },
  ];

  const financeSubItems = [
    { id: 'payments', label: 'Outward Payments', icon: ArrowUpRight },
    { id: 'receipts', label: 'Inward Receipts', icon: ArrowDownLeft },
    { id: 'credit_notes', label: 'Credit Notes', icon: RotateCcw },
    { id: 'debit_notes', label: 'Debit Notes', icon: Receipt },
    { id: 'ledger', label: 'General Ledger & P&L', icon: Landmark },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden">
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Hierarchical Sidebar Navigation */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-sm flex flex-col justify-between transition-transform duration-200 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Logo Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                <Factory className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-slate-900">WEAVE-TECH ERP</h1>
                <span className="text-[10px] font-bold text-slate-400 block -mt-0.5">Enterprise Edition</span>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Badge */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="truncate">
              <div className="text-xs font-bold text-slate-900 truncate">{currentUser.full_name}</div>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">
                {currentUser.role}
              </span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
          </div>

          {/* Hierarchical Navigation Tree */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {/* 1. Dashboard */}
            <button
              onClick={() => {
                setActiveModule('dashboard');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeModule === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard (Daily MIS)</span>
            </button>

            {/* 2. Master Directory */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsMasterExpanded(!isMasterExpanded);
                  setActiveModule('masters');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeModule === 'masters' ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FolderTree className="w-4 h-4 text-indigo-600" />
                  <span>Master Directory</span>
                </div>
                <div className="p-0.5 rounded bg-slate-200 text-slate-600">
                  {isMasterExpanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </div>
              </button>

              {isMasterExpanded && (
                <div className="ml-4 pl-3 border-l-2 border-slate-200 mt-1 space-y-0.5">
                  {masterSubItems.map(sub => {
                    const SubIcon = sub.icon;
                    const isSubActive = activeModule === 'masters' && masterSubTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveModule('masters');
                          setMasterSubTab(sub.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                          isSubActive ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <SubIcon className="w-3.5 h-3.5" />
                        <span className="truncate">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. CRM & Sales Engine */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsCrmExpanded(!isCrmExpanded);
                  setActiveModule('crm');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeModule === 'crm' ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquareText className="w-4 h-4 text-indigo-600" />
                  <span>CRM</span>
                </div>
                <div className="p-0.5 rounded bg-slate-200 text-slate-600">
                  {isCrmExpanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </div>
              </button>

              {isCrmExpanded && (
                <div className="ml-4 pl-3 border-l-2 border-slate-200 mt-1 space-y-0.5">
                  {crmSubItems.map(sub => {
                    const SubIcon = sub.icon;
                    const isSubActive = activeModule === 'crm' && crmSubTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveModule('crm');
                          setCrmSubTab(sub.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                          isSubActive ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <SubIcon className="w-3.5 h-3.5" />
                        <span className="truncate">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. Production & Looms */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsProductionExpanded(!isProductionExpanded);
                  setActiveModule('production');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeModule === 'production' ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Factory className="w-4 h-4 text-indigo-600" />
                  <span>Production</span>
                </div>
                <div className="p-0.5 rounded bg-slate-200 text-slate-600">
                  {isProductionExpanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </div>
              </button>

              {isProductionExpanded && (
                <div className="ml-4 pl-3 border-l-2 border-slate-200 mt-1 space-y-0.5">
                  {productionSubItems.map(sub => {
                    const SubIcon = sub.icon;
                    const isSubActive = activeModule === 'production' && productionSubTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveModule('production');
                          setProductionSubTab(sub.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                          isSubActive ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <SubIcon className="w-3.5 h-3.5" />
                        <span className="truncate">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 5. Store Module */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsStoreExpanded(!isStoreExpanded);
                  setActiveModule('store');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeModule === 'store' ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Boxes className="w-4 h-4 text-indigo-600" />
                  <span>Store</span>
                </div>
                <div className="p-0.5 rounded bg-slate-200 text-slate-600">
                  {isStoreExpanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </div>
              </button>

              {isStoreExpanded && (
                <div className="ml-4 pl-3 border-l-2 border-slate-200 mt-1 space-y-0.5">
                  {storeSubItems.map(sub => {
                    const SubIcon = sub.icon;
                    const isSubActive = activeModule === 'store' && storeSubTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveModule('store');
                          setStoreSubTab(sub.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                          isSubActive ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <SubIcon className="w-3.5 h-3.5" />
                        <span className="truncate">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 6. Purchase Module */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsPurchaseExpanded(!isPurchaseExpanded);
                  setActiveModule('purchase');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeModule === 'purchase' ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-4 h-4 text-indigo-600" />
                  <span>Purchase</span>
                </div>
                <div className="p-0.5 rounded bg-slate-200 text-slate-600">
                  {isPurchaseExpanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </div>
              </button>

              {isPurchaseExpanded && (
                <div className="ml-4 pl-3 border-l-2 border-slate-200 mt-1 space-y-0.5">
                  {purchaseSubItems.map(sub => {
                    const SubIcon = sub.icon;
                    const isSubActive = activeModule === 'purchase' && purchaseSubTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveModule('purchase');
                          setPurchaseSubTab(sub.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                          isSubActive ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <SubIcon className="w-3.5 h-3.5" />
                        <span className="truncate">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 7. QC Quality Module */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsQcExpanded(!isQcExpanded);
                  setActiveModule('qc');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeModule === 'qc' ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  <span>QC (ASTM 4-Pt)</span>
                </div>
                <div className="p-0.5 rounded bg-slate-200 text-slate-600">
                  {isQcExpanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </div>
              </button>

              {isQcExpanded && (
                <div className="ml-4 pl-3 border-l-2 border-slate-200 mt-1 space-y-0.5">
                  {qcSubItems.map(sub => {
                    const SubIcon = sub.icon;
                    const isSubActive = activeModule === 'qc' && qcSubTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveModule('qc');
                          setQcSubTab(sub.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                          isSubActive ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <SubIcon className="w-3.5 h-3.5" />
                        <span className="truncate">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 8. Sales Module */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsSalesExpanded(!isSalesExpanded);
                  setActiveModule('sales');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeModule === 'sales' ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  <span>Sales</span>
                </div>
                <div className="p-0.5 rounded bg-slate-200 text-slate-600">
                  {isSalesExpanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </div>
              </button>

              {isSalesExpanded && (
                <div className="ml-4 pl-3 border-l-2 border-slate-200 mt-1 space-y-0.5">
                  {salesSubItems.map(sub => {
                    const SubIcon = sub.icon;
                    const isSubActive = activeModule === 'sales' && salesSubTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveModule('sales');
                          setSalesSubTab(sub.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                          isSubActive ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <SubIcon className="w-3.5 h-3.5" />
                        <span className="truncate">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 9. Finance Module */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsFinanceExpanded(!isFinanceExpanded);
                  setActiveModule('finance');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeModule === 'finance' ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Landmark className="w-4 h-4 text-indigo-600" />
                  <span>Finance</span>
                </div>
                <div className="p-0.5 rounded bg-slate-200 text-slate-600">
                  {isFinanceExpanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </div>
              </button>

              {isFinanceExpanded && (
                <div className="ml-4 pl-3 border-l-2 border-slate-200 mt-1 space-y-0.5">
                  {financeSubItems.map(sub => {
                    const SubIcon = sub.icon;
                    const isSubActive = activeModule === 'finance' && financeSubTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveModule('finance');
                          setFinanceSubTab(sub.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                          isSubActive ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <SubIcon className="w-3.5 h-3.5" />
                        <span className="truncate">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 10. Statutory Reports */}
            <button
              onClick={() => {
                setActiveModule('statutory');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeModule === 'statutory' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Statutory Reports</span>
            </button>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-200 bg-slate-50">
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Company Switch Header */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <span className="font-black text-sm text-slate-900 block leading-tight">
                  Moti Textiles - [26-27]
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Unit 1: Sachin Weaving Shed • Surat
                </span>
              </div>
            </div>
          </div>

          {/* Global Search and Status */}
          <div className="flex items-center gap-3">
            <div className="relative hidden lg:block w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
                placeholder="Global ERP Search..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-mono">
              ● Factory LAN Active
            </span>
          </div>
        </header>

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/70">
          <div className="max-w-7xl mx-auto">
            {activeModule === 'dashboard' && <OwnerDashboard />}
            {activeModule === 'masters' && (
              <MasterPanel 
                key={masterSubTab} 
                defaultTab={masterSubTab} 
                onTabChange={(tab) => setMasterSubTab(tab)} 
              />
            )}
            {activeModule === 'crm' && (
              <CRMModule 
                key={crmSubTab} 
                defaultTab={crmSubTab} 
                initialSubTab={crmSubTab} 
                onTabChange={(tab) => setCrmSubTab(tab)} 
              />
            )}
            {activeModule === 'production' && (
              productionSubTab === 'shopfloor' 
                ? <ShopFloorModule currentUser={currentUser} />
                : <LoomSupervisor />
            )}
            {activeModule === 'store' && <StoreModule key={storeSubTab} defaultTab={storeSubTab} />}
            {activeModule === 'purchase' && <PurchaseModule key={purchaseSubTab} defaultTab={purchaseSubTab} />}
            {activeModule === 'qc' && <FabricQCInspection key={qcSubTab} defaultTab={qcSubTab} />}
            {activeModule === 'sales' && <SalesModule key={salesSubTab} defaultTab={salesSubTab} />}
            {activeModule === 'finance' && <FinanceModule key={financeSubTab} defaultTab={financeSubTab} />}
            {activeModule === 'statutory' && <StatutoryReports />}
          </div>
        </main>
      </div>
    </div>
  );
}