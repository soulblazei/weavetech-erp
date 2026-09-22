import { getClient, query } from '../config/db.js';
import { syncHub } from '../realtime/syncHub.js';

/**
 * 13 Sequential Shop-Floor Production Stages
 */
export const STAGES = [
  { id: 1, name: 'Yarn Purchase / Inward', shortCode: 'YARN_IN' },
  { id: 2, name: 'Winding & Doubling', shortCode: 'WINDING' },
  { id: 3, name: 'Warping & Creeling', shortCode: 'WARPING' },
  { id: 4, name: 'Sizing & Beam Preparation', shortCode: 'SIZING' },
  { id: 5, name: 'Drawing-in & Denting', shortCode: 'DENTING' },
  { id: 6, name: 'Loom Gaiting & Knotting', shortCode: 'GAITING' },
  { id: 7, name: 'Weaving / Loom Shed', shortCode: 'WEAVING' },
  { id: 8, name: 'Doffing & Roll Numbering', shortCode: 'DOFFING' },
  { id: 9, name: 'Grey Fabric Inspection (ASTM 4-Point)', shortCode: 'QC_INSPECT' },
  { id: 10, name: 'Mending & Cropping', shortCode: 'MENDING' },
  { id: 11, name: 'Folding, Rolling & Lapping', shortCode: 'FOLDING' },
  { id: 12, name: 'Packaging, Baling & Weighting', shortCode: 'PACKING' },
  { id: 13, name: 'Finished Warehouse / Dispatch', shortCode: 'DISPATCH' }
];

export const productionController = {
  /**
   * GET /api/production/batches
   * Fetch live batch list with lightweight payload for budget tablets
   */
  async getBatches(req, res, next) {
    try {
      const sql = `
        SELECT 
          b.id,
          b.batch_number,
          b.item_id,
          i.name AS item_name,
          b.current_stage_id,
          b.current_stage,
          b.target_meters,
          b.produced_meters,
          b.status,
          b.updated_at
        FROM production_batches b
        LEFT JOIN item_master i ON b.item_id = i.id
        WHERE b.status NOT IN ('CANCELLED')
        ORDER BY b.updated_at DESC
        LIMIT 50
      `;
      const result = await query(sql);
      return res.json({
        success: true,
        count: result.rows.length,
        data: result.rows
      });
    } catch (err) {
      return next(err);
    }
  },

  /**
   * POST /api/production/handover
   * Atomic transactional execution validating upstream star rating and defect checklist
   */
  async handover(req, res, next) {
    const client = await getClient();

    try {
      const {
        batchId,
        fromStage,
        toStage,
        operatorId,
        rating,
        defectPayload = {},
        metersTransferred = 0,
        remarks = ''
      } = req.body;

      // 1. Strict Validation Guards
      if (!batchId) {
        return res.status(400).json({ error: 'batchId is required.' });
      }

      const numericFromStage = parseInt(fromStage, 10);
      const numericToStage = parseInt(toStage, 10);
      const numericRating = parseInt(rating, 10);

      if (isNaN(numericFromStage) || numericFromStage < 1 || numericFromStage > 13) {
        return res.status(400).json({ error: 'Invalid fromStage (must be between 1 and 13).' });
      }

      if (isNaN(numericToStage) || numericToStage < 1 || numericToStage > 13) {
        return res.status(400).json({ error: 'Invalid toStage (must be between 1 and 13).' });
      }

      if (numericToStage <= numericFromStage) {
        return res.status(400).json({ error: 'toStage must be sequentially greater than fromStage.' });
      }

      if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ error: 'Quality rating is mandatory and must be an integer between 1 and 5 stars.' });
      }

      const parsedMeters = Math.max(parseFloat(metersTransferred) || 0, 0);

      // 2. BEGIN EXPLICIT DATABASE TRANSACTION
      await client.query('BEGIN');

      // Lock batch row for update
      const batchCheckSql = `
        SELECT id, batch_number, current_stage_id, current_stage, produced_meters, status 
        FROM production_batches 
        WHERE id = $1 
        FOR UPDATE
      `;
      const batchResult = await client.query(batchCheckSql, [batchId]);

      if (batchResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: `Production batch ${batchId} not found.` });
      }

      const batch = batchResult.rows[0];

      if (batch.status === 'COMPLETED' || batch.status === 'CANCELLED') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Cannot advance batch with status: ${batch.status}.` });
      }

      const originStageName = STAGES.find(s => s.id === numericFromStage)?.name || `Stage ${numericFromStage}`;
      const targetStageName = STAGES.find(s => s.id === numericToStage)?.name || `Stage ${numericToStage}`;

      // 3. Insert into partitioned stage_quality_audits
      const auditInsertSql = `
        INSERT INTO stage_quality_audits (
          recorded_at,
          stage_id,
          origin_stage,
          target_stage,
          rating,
          inspector_id,
          defect_payload,
          remarks
        )
        VALUES (
          NOW(),
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7
        )
        RETURNING audit_id, recorded_at, rating, defect_payload
      `;

      const auditRes = await client.query(auditInsertSql, [
        numericFromStage,
        originStageName,
        targetStageName,
        numericRating,
        operatorId || null,
        JSON.stringify(defectPayload),
        remarks
      ]);

      const auditId = auditRes.rows[0].audit_id;

      // 4. Insert into immutable production_stage_transitions
      const transitionInsertSql = `
        INSERT INTO production_stage_transitions (
          from_stage,
          to_stage,
          operator_id,
          batch_id,
          audit_id,
          meters_transferred,
          transitioned_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          NOW()
        )
        RETURNING transition_id, transitioned_at
      `;

      const transitionRes = await client.query(transitionInsertSql, [
        numericFromStage,
        numericToStage,
        operatorId || '00000000-0000-0000-0000-000000000000',
        batchId,
        auditId,
        parsedMeters
      ]);

      // 5. Update production_batches current_stage_id, current_stage, produced_meters, and status
      const newStatus = numericToStage === 13 ? 'COMPLETED' : (numericRating <= 2 ? 'QUARANTINED' : 'ACTIVE');
      const updateBatchSql = `
        UPDATE production_batches
        SET 
          current_stage_id = $1,
          current_stage = $2,
          produced_meters = produced_meters + $3,
          status = $4,
          updated_at = NOW()
        WHERE id = $5
        RETURNING id, batch_number, current_stage_id, current_stage, produced_meters, status, updated_at
      `;

      const updatedBatchRes = await client.query(updateBatchSql, [
        numericToStage,
        targetStageName,
        parsedMeters,
        newStatus,
        batchId
      ]);

      // 6. COMMIT TRANSACTION
      await client.query('COMMIT');

      const updatedBatch = updatedBatchRes.rows[0];

      // 7. REAL-TIME BROADCAST: Send lightweight delta to all factory tablets & PCs
      syncHub.broadcast('HANDOVER_COMPLETED', {
        batchId: updatedBatch.id,
        batchNumber: updatedBatch.batch_number,
        fromStageId: numericFromStage,
        toStageId: numericToStage,
        currentStage: updatedBatch.current_stage,
        status: updatedBatch.status,
        rating: numericRating,
        producedMeters: updatedBatch.produced_meters,
        updatedAt: updatedBatch.updated_at
      });

      return res.status(200).json({
        success: true,
        message: `Batch ${batch.batch_number} advanced to ${targetStageName}`,
        data: {
          transition: transitionRes.rows[0],
          audit: auditRes.rows[0],
          batch: updatedBatch
        }
      });

    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Rollback error:', rollbackErr.message);
      }
      console.error('Handover transaction error:', error);
      return res.status(500).json({
        success: false,
        error: 'Database transaction failed and was cleanly rolled back.',
        detail: error.message
      });
    } finally {
      client.release();
    }
  }
};

export default productionController;
