-- ==============================================================================
-- WEAVE-TECH ERP: Core Architecture Migration
-- Version: 001_core_architecture.sql
-- Target Database: Supabase PostgreSQL (15+)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. MASTER TABLES

-- Client / Party Master
CREATE TABLE IF NOT EXISTS client_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name TEXT NOT NULL,
    gstin VARCHAR(15),
    address TEXT,
    contact_phone VARCHAR(20),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigram index for high-speed fuzzy matching on client name
CREATE INDEX IF NOT EXISTS idx_client_master_name_trgm 
ON client_master USING gin (name gin_trgm_ops);

-- Item Master (Yarn counts, Grey qualities, Chemicals, Spares)
CREATE TABLE IF NOT EXISTS item_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code VARCHAR(50) NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'YARN', 'GREY_FABRIC', 'CHEMICAL', 'SPARES', 'SIZING_MATERIAL'
    unit VARCHAR(20) NOT NULL, -- 'KGS', 'MTRS', 'BAGS', 'LITRES', 'NOS'
    hsn_code VARCHAR(20),
    gst_rate NUMERIC(5, 2) DEFAULT 5.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigram index for high-speed fuzzy matching on item name
CREATE INDEX IF NOT EXISTS idx_item_master_name_trgm 
ON item_master USING gin (name gin_trgm_ops);

-- 3. STORE & PURCHASE INVENTORY LINKAGE TABLES

-- Store Inventory Balance Table
CREATE TABLE IF NOT EXISTS store_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES item_master(id) ON DELETE RESTRICT,
    batch_no VARCHAR(100) DEFAULT 'GENERAL',
    current_stock NUMERIC(14, 3) NOT NULL DEFAULT 0.000,
    allocated_stock NUMERIC(14, 3) NOT NULL DEFAULT 0.000,
    available_stock NUMERIC(14, 3) GENERATED ALWAYS AS (current_stock - allocated_stock) STORED,
    unit VARCHAR(20) NOT NULL,
    warehouse_location VARCHAR(100) DEFAULT 'MAIN_STORE',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_item_batch UNIQUE (item_id, batch_no)
);

-- Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id UUID NOT NULL REFERENCES client_master(id) ON DELETE RESTRICT,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_amount NUMERIC(14, 2) DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('DRAFT', 'PENDING', 'PARTIALLY_RECEIVED', 'FULFILLED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Goods Receipt Notes (GRN) Table
CREATE TABLE IF NOT EXISTS goods_receipt_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grn_number VARCHAR(50) NOT NULL UNIQUE,
    po_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
    item_id UUID NOT NULL REFERENCES item_master(id) ON DELETE RESTRICT,
    challan_no VARCHAR(50),
    lot_number VARCHAR(100),
    received_qty NUMERIC(14, 3) NOT NULL DEFAULT 0.000,
    accepted_qty NUMERIC(14, 3) NOT NULL DEFAULT 0.000,
    rejected_qty NUMERIC(14, 3) NOT NULL DEFAULT 0.000,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_INSPECTION', 'COMPLETED', 'REJECTED')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 4. 13-STAGE PRODUCTION PIPELINE LEDGER

-- Production Batches
CREATE TABLE IF NOT EXISTS production_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_number VARCHAR(50) NOT NULL UNIQUE,
    item_id UUID NOT NULL REFERENCES item_master(id) ON DELETE RESTRICT,
    current_stage_id INT NOT NULL DEFAULT 1 CHECK (current_stage_id BETWEEN 1 AND 13),
    target_meters NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    produced_meters NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PENDING', 'ACTIVE', 'ON_HOLD', 'QUARANTINED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partitioned Quality Audits Table
CREATE TABLE IF NOT EXISTS stage_quality_audits (
    audit_id UUID NOT NULL DEFAULT uuid_generate_v4(),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    stage_id INT NOT NULL CHECK (stage_id BETWEEN 1 AND 13),
    origin_stage VARCHAR(100) NOT NULL,
    target_stage VARCHAR(100) NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    inspector_id UUID,
    defect_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    remarks TEXT,
    PRIMARY KEY (audit_id, recorded_at)
) PARTITION BY RANGE (recorded_at);

-- Partition Tables for current and upcoming operational periods
CREATE TABLE IF NOT EXISTS stage_quality_audits_2026_h1 PARTITION OF stage_quality_audits
    FOR VALUES FROM ('2026-01-01 00:00:00+00') TO ('2026-07-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS stage_quality_audits_2026_h2 PARTITION OF stage_quality_audits
    FOR VALUES FROM ('2026-07-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS stage_quality_audits_2027_h1 PARTITION OF stage_quality_audits
    FOR VALUES FROM ('2027-01-01 00:00:00+00') TO ('2027-07-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS stage_quality_audits_default PARTITION OF stage_quality_audits DEFAULT;

-- GIN Index on Defect Payload for JSON inspection querying
CREATE INDEX IF NOT EXISTS idx_stage_quality_audits_defects 
ON stage_quality_audits USING gin (defect_payload);

-- Immutable Production Stage Transitions Log
CREATE TABLE IF NOT EXISTS production_stage_transitions (
    transition_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_stage INT NOT NULL CHECK (from_stage BETWEEN 1 AND 13),
    to_stage INT NOT NULL CHECK (to_stage BETWEEN 1 AND 13),
    operator_id UUID NOT NULL,
    batch_id UUID NOT NULL REFERENCES production_batches(id) ON DELETE CASCADE,
    audit_id UUID NOT NULL,
    meters_transferred NUMERIC(12, 2) DEFAULT 0.00,
    transitioned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stage_transitions_batch 
ON production_stage_transitions (batch_id, transitioned_at DESC);

-- 5. CROSS-MODULE TRIGGER: GRN Finalized
-- When GRN status changes to 'COMPLETED', automatically increment store_inventory
-- and update purchase_orders status to 'FULFILLED'

CREATE OR REPLACE FUNCTION fn_handle_grn_finalized()
RETURNS TRIGGER AS $$
DECLARE
    v_unit VARCHAR(20);
    v_item_code VARCHAR(50);
BEGIN
    -- Only trigger on status transition to COMPLETED
    IF (NEW.status = 'COMPLETED' AND (OLD.status IS NULL OR OLD.status <> 'COMPLETED')) THEN
        -- Fetch item unit
        SELECT unit, item_code INTO v_unit, v_item_code 
        FROM item_master 
        WHERE id = NEW.item_id;

        -- 1. Increment or insert into store_inventory with accepted_qty
        INSERT INTO store_inventory (
            item_id,
            batch_no,
            current_stock,
            allocated_stock,
            unit,
            warehouse_location,
            updated_at
        )
        VALUES (
            NEW.item_id,
            COALESCE(NEW.lot_number, 'GRN-' || NEW.grn_number),
            NEW.accepted_qty,
            0.000,
            COALESCE(v_unit, 'KGS'),
            'MAIN_STORE',
            NOW()
        )
        ON CONFLICT (item_id, batch_no) 
        DO UPDATE SET
            current_stock = store_inventory.current_stock + EXCLUDED.current_stock,
            updated_at = NOW();

        -- 2. Update linked Purchase Order status to FULFILLED if present
        IF NEW.po_id IS NOT NULL THEN
            UPDATE purchase_orders
            SET status = 'FULFILLED'
            WHERE id = NEW.po_id;
        END IF;

        -- Set completed timestamp
        NEW.completed_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_grn_finalized ON goods_receipt_notes;
CREATE TRIGGER trg_grn_finalized
BEFORE UPDATE ON goods_receipt_notes
FOR EACH ROW
EXECUTE FUNCTION fn_handle_grn_finalized();
