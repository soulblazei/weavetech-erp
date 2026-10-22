# 👥 WEAVE-TECH ERP: Project Team & Module Ownership

This document details the architectural division of labor and simultaneous collaborative contributions for **WEAVE-TECH ERP** developed by **Jugal Patel** and **Himani Tanwani**.

---

## 👨‍💻👩‍💻 Team Members

| Name | Role / Focus Area | Contact / GitHub |
| :--- | :--- | :--- |
| **Jugal Patel** | Lead Backend & Systems Architect | `jugalpatel204@gmail.com` • [@soulblazei](https://github.com/soulblazei) |
| **Himani Tanwani** | Lead Frontend & Quality Control Architect | `himanitanwani6@gmail.com` • [@himanitanwani](https://github.com/himanitanwani) |

---

## 🏗️ Simultaneous Contribution & Module Division Matrix

Both team members contributed simultaneously across the full stack. The core module ownership is distributed as follows:

```mermaid
graph LR
    subgraph Jugal ["Jugal Patel (Systems & Backend Focus)"]
        J1[Database Schema & GIN Trigram Indexing]
        J2[13-Stage Production Pipeline & Handover Engine]
        J3[FastAPI & Express Real-time Sync Hub]
        J4[PostgreSQL Partitioning & Trigger Automation]
        J5[Vercel Serverless & PgBouncer Configuration]
    end

    subgraph Himani ["Himani Tanwani (Frontend & Domain Focus)"]
        H1[Role-Based Access Control - RBAC Engine]
        H2[ASTM D5430 4-Point QC Formula & Grading Engine]
        H3[Store & Purchase Inward Integration]
        H4[GST Sales Invoicing & Commercial Ledgers]
        H5[Shop-Floor Tablet Ergonomics - 48px Touch UI]
    end

    subgraph Joint ["Joint Collaborative Pair Programming"]
        C1[Master Data Interlock & Inline Quick-Add]
        C2[Zero-Polling SSE / WebSocket LAN Sync]
        C3[Automated Cross-Module Reactive Triggers]
    end

    Jugal --- Joint
    Himani --- Joint
```

### 1. Jugal Patel's Key Contributions
* **PostgreSQL Architecture (`database/migrations/001_core_architecture.sql`):** Designed schema with `pg_trgm` GIN indexes, range partitioning for `stage_quality_audits`, and `trg_grn_finalized` triggers.
* **Shop-Floor Handover Engine (`server/src/controllers/productionController.js`):** Built transactional stage handover logic with mandatory quality gates and rollbacks.
* **Real-time Sync Hub (`server/src/realtime/syncHub.js`):** Implemented zero-polling SSE and WebSocket broadcaster for factory LANs.
* **Python Backend (`backend/`):** Developed FastAPI endpoints and 39 SQLAlchemy data models with SQLite/Supabase hybrid fallback.

### 2. Himani Tanwani's Key Contributions
* **Role-Based Access Control (`frontend/src/config/rbac.js`, `AccessDenied.jsx`):** Engineered 8-role permission matrix, dynamic sidebar filtering, and route protection.
* **ASTM 4-Point QC Engine (`ASTMInspectionCard.jsx`, `FabricQCInspection.jsx`):** Implemented ASTM D5430 defect scoring formula, auto-quarantine routing, and roll grading.
* **Store & Procurement Suite (`StoreModule.jsx`, `PurchaseModule.jsx`):** Developed material requisition, issue logs, gate inward, and GRN inspection notes.
* **Commercial Sales & Finance (`SalesModule.jsx`, `FinanceModule.jsx`):** Built fabric booking queues, taka dispatch packing slips, HSN 5208 GST invoices, and credit/debit notes.
* **Touch-First UI Design System (`tailwind.config.js`):** Designed high-contrast Bright Enterprise Light Theme with 48px touch targets for shop-floor Android tablets.
