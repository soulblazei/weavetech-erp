import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  Calendar, 
  IndianRupee, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  FileText 
} from 'lucide-react';

export default function StatutoryReports() {
  const [reportType, setReportType] = useState('gstr1'); // 'gstr1', 'gstr2', 'eway', 'stock'

  const formatRs = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Statutory Tax & Compliance Filings</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated GSTR-1 outward sales, GSTR-2B input tax credit reconciliations, and E-Way bill manifests.
          </p>
        </div>

        <button
          onClick={() => alert("Exporting JSON / Excel file for GST Portal Filing...")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" /> Export GST JSON for Portal
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-2 flex flex-wrap gap-1.5">
        {[
          { id: 'gstr1', label: 'GSTR-1 (Outward Sales Invoices)' },
          { id: 'gstr2', label: 'GSTR-2B (Inward Raw Material ITC)' },
          { id: 'eway', label: 'E-Way Bill Transport Registry' },
          { id: 'stock', label: 'Statutory Stock Ledger Audit' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setReportType(t.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              reportType === t.id ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* GSTR-1 View */}
      {reportType === 'gstr1' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
              <span className="text-xs font-bold uppercase text-slate-500">Taxable Outward Sales</span>
              <p className="text-2xl font-black font-mono text-slate-900 mt-1">{formatRs(5748750)}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
              <span className="text-xs font-bold uppercase text-slate-500">Output IGST / CGST / SGST</span>
              <p className="text-2xl font-black font-mono text-indigo-700 mt-1">{formatRs(287438)}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
              <span className="text-xs font-bold uppercase text-emerald-600">Filing Status</span>
              <p className="text-xl font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" /> Ready for Upload
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="p-3.5">Invoice / Contract #</th>
                  <th className="p-3.5">Buyer GSTIN</th>
                  <th className="p-3.5">Recipient Company</th>
                  <th className="p-3.5">HSN Code</th>
                  <th className="p-3.5 text-right">Taxable Value</th>
                  <th className="p-3.5 text-right">GST Rate</th>
                  <th className="p-3.5 text-right">Total Tax Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="p-3.5 font-mono font-bold text-indigo-700">SO-20260210-001</td>
                  <td className="p-3.5 font-mono">24AAACV1234A1Z5</td>
                  <td className="p-3.5 font-bold text-slate-900">Vardhman Textiles</td>
                  <td className="p-3.5 font-mono">5208</td>
                  <td className="p-3.5 text-right font-mono font-bold">{formatRs(2125000)}</td>
                  <td className="p-3.5 text-right font-mono">5.0%</td>
                  <td className="p-3.5 text-right font-mono font-bold text-slate-900">{formatRs(106250)}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3.5 font-mono font-bold text-indigo-700">SO-20260214-002</td>
                  <td className="p-3.5 font-mono">27AAACR5678D1Z3</td>
                  <td className="p-3.5 font-bold text-slate-900">Raymond Ltd</td>
                  <td className="p-3.5 font-mono">5208</td>
                  <td className="p-3.5 text-right font-mono font-bold">{formatRs(1650000)}</td>
                  <td className="p-3.5 text-right font-mono">5.0%</td>
                  <td className="p-3.5 text-right font-mono font-bold text-slate-900">{formatRs(82500)}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3.5 font-mono font-bold text-indigo-700">SO-20260218-003</td>
                  <td className="p-3.5 font-mono">24AABCA9876C1Z1</td>
                  <td className="p-3.5 font-bold text-slate-900">Arvind Ltd</td>
                  <td className="p-3.5 font-mono">5208</td>
                  <td className="p-3.5 text-right font-mono font-bold">{formatRs(1700000)}</td>
                  <td className="p-3.5 text-right font-mono">5.0%</td>
                  <td className="p-3.5 text-right font-mono font-bold text-slate-900">{formatRs(85000)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GSTR-2B View */}
      {reportType === 'gstr2' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900">GSTR-2B Inward Input Tax Credit Reconciled</h3>
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs">
            ✓ All supplier yarn inward invoices (Nahar Spinning & KPR Mill) matched with GSTN portal records.
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
              <span>Eligible ITC on Raw Yarn Purchases:</span>
              <strong className="font-mono text-slate-900">{formatRs(219000)}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
              <span>Eligible ITC on Sizing Chemicals & Spares:</span>
              <strong className="font-mono text-slate-900">{formatRs(41400)}</strong>
            </div>
          </div>
        </div>
      )}

      {/* E-Way Bill View */}
      {reportType === 'eway' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900">E-Way Bill Transport System (NIC Portal Export)</h3>
          <p className="text-xs text-slate-500">
            Automated Part-A and Part-B generation for vehicle movement above Rs. 50,000 threshold.
          </p>
        </div>
      )}

      {/* Stock Ledger Audit View */}
      {reportType === 'stock' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Statutory Physical Stock Ledger (Month-End Valuation)</h3>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block">Total Yarn Inward Stock Valuation:</span>
              <strong className="text-lg text-slate-900">{formatRs(4380000)}</strong>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block">Grey Fabric Woven Stock on Floor:</span>
              <strong className="text-lg text-slate-900">{formatRs(1850000)}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
