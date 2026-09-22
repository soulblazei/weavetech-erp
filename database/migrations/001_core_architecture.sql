-- ==============================================================================
-- WEAVE-TECH ERP: Idempotent Core Production & Real-Time Migration
-- File: /database/migrations/001_core_architecture.sql
-- Target: PostgreSQL 15+ (Supabase / On-Premise LAN Node)
-- ==============================================================================

-- 1. CORE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. MASTER DIRECTORIES WITH GIN TRIGRAM PERFORMANCE INDEXES

-- Client / Party Master (Buyers, Spinning Mills, Job Workers)
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

-- GIN Trigram Indexes on both name and code to offload fuzzy searching from low-end tablets
CREATE INDEX IF NOT EXISTS idx_client_master_name_trgm 
ON client_master USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_client_master_code_trgm 
ON client_master USING gin (code gin_trgm_ops);

-- Item Master (Yarn Counts, Grey Fabric Qualities, Chemical Spares, Sizing Materials)
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

-- GIN Trigram Indexes on Item name and item_code
CREATE INDEX IF NOT EXISTS idx_item_master_name_trgm 
ON item_master USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_item_master_code_trgm 
ON item_master USING gin (item_code gin_trgm_ops);

-- 3. INVENTORY & PROCUREMENT LEDGERS

-- Store Inventory Ledger (Real-time balance per item & batch)
CREATE TABLE IF NOT EXISTS inventory_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES item_master(id) ON DELETE RESTRICT,
    batch_no VARCHAR(100) NOT NULL DEFAULT 'GENERAL',
    current_stock NUMERIC(14, 3) NOT NULL DEFAULT 0.000,
    allocated_stock NUMERIC(14, 3) NOT NULL DEFAULT 0.000,
    available_stock NUMERIC(14, 3) GENERATED ALWAYS AS (current_stock - allocated_stock) STORED,
    unit VARCHAR(20) NOT NULL,
    warehouse_location VARCHAR(100) DEFAULT 'MAIN_STORE',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_inventory_item_batch UNIQUE (item_id, batch_no)
);

-- Backward compatibility alias view if needed
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
    CONSTRAINT uq_store_item_batch UNIQUE (item_id, batch_no)
);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id UUID NOT NULL REFERENCES client_master(id) ON DELETE RESTRICT,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_amount NUMERIC(14, 2) DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('DRAFT', 'PENDING', 'PARTIALLY_RECEIVED', 'FULFILLED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Goods Receipt Notes (GRN)
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
    current_stage VARCHAR(100) NOT NULL DEFAULT 'Yarn Purchase / Inward',
    target_meters NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    produced_meters NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PENDING', 'ACTIVE', 'ON_HOLD', 'QUARANTINED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_production_batches_stage 
ON production_batches (current_stage_id, status);

-- Partitioned Stage Quality Audits Table
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

-- Partition Tables
CREATE TABLE IF NOT EXISTS stage_quality_audits_2026_h1 PARTITION OF stage_quality_audits
    FOR VALUES FROM ('2026-01-01 00:00:00+00') TO ('2026-07-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS stage_quality_audits_2026_h2 PARTITION OF stage_quality_audits
    FOR VALUES FROM ('2026-07-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS stage_quality_audits_2027_h1 PARTITION OF stage_quality_audits
    FOR VALUES FROM ('2027-01-01 00:00:00+00') TO ('2027-07-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS stage_quality_audits_default PARTITION OF stage_quality_audits DEFAULT;

-- GIN Index on Defect Payload
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

-- 5. CROSS-MODULE TRIGGER: GRN Finalization
CREATE OR REPLACE FUNCTION fn_handle_grn_finalized()
RETURNS TRIGGER AS $$
DECLARE
    v_unit VARCHAR(20);
    v_item_code VARCHAR(50);
BEGIN
    IF (NEW.status = 'COMPLETED' AND (OLD.status IS NULL OR OLD.status <> 'COMPLETED')) THEN
        SELECT unit, item_code INTO v_unit, v_item_code 
        FROM item_master 
        WHERE id = NEW.item_id;

        -- Increment inventory_ledger
        INSERT INTO inventory_ledger (
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
            current_stock = inventory_ledger.current_stock + EXCLUDED.current_stock,
            updated_at = NOW();

        -- Also keep store_inventory in sync
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

        -- Fulfill Purchase Order
        IF NEW.po_id IS NOT NULL THEN
            UPDATE purchase_orders
            SET status = 'FULFILLED'
            WHERE id = NEW.po_id;
        END IF;

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

-- 6. REAL-TIME CDC CONFIGURATION (Supabase & PostgreSQL WAL Publications)
DO $$
BEGIN
    -- Enable full replica identity for delta diffs
    ALTER TABLE production_batches REPLICA IDENTITY FULL;
    ALTER TABLE inventory_ledger REPLICA IDENTITY FULL;
    
    -- Check if publication exists before adding tables
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE production_batches, inventory_ledger;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Notice on realtime publication setup: %', SQLERRM;
END $$;
