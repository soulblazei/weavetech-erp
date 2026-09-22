import { query } from '../config/db.js';

/**
 * Controller for Master Data Lookups and Fuzzy Trigram Matching
 */
export const masterController = {
  /**
   * Search masters with parameter-safe PostgreSQL trigram similarity
   * GET /api/masters/search?type=client|item&q=searchTerm
   */
  async search(req, res, next) {
    try {
      const { type = 'client', q = '', limit = 10 } = req.query;
      const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
      const searchTerm = (typeof q === 'string' ? q.trim() : '');

      if (!searchTerm) {
        // Return latest active records if no search query provided
        let fallbackSql = '';
        if (type === 'client') {
          fallbackSql = `
            SELECT id, code, name, gstin, is_active
            FROM client_master
            WHERE is_active = TRUE
            ORDER BY created_at DESC
            LIMIT $1
          `;
        } else if (type === 'item') {
          fallbackSql = `
            SELECT id, item_code as code, name, type, unit, gst_rate, is_active
            FROM item_master
            WHERE is_active = TRUE
            ORDER BY created_at DESC
            LIMIT $1
          `;
        } else {
          return res.status(400).json({ error: `Unsupported master type: ${type}. Expected 'client' or 'item'.` });
        }

        const result = await query(fallbackSql, [parsedLimit]);
        return res.json({
          success: true,
          type,
          count: result.rows.length,
          data: result.rows
        });
      }

      // Execute parameter-safe trigram similarity search
      let sql = '';
      if (type === 'client') {
        sql = `
          SELECT 
            id, 
            code, 
            name, 
            gstin, 
            is_active,
            similarity(name, $1) AS score
          FROM client_master
          WHERE 
            is_active = TRUE 
            AND (
              similarity(name, $1) > 0.2 
              OR name ILIKE '%' || $1 || '%'
              OR code ILIKE '%' || $1 || '%'
            )
          ORDER BY 
            similarity(name, $1) DESC,
            name ASC
          LIMIT $2
        `;
      } else if (type === 'item') {
        sql = `
          SELECT 
            id, 
            item_code as code, 
            name, 
            type, 
            unit, 
            gst_rate, 
            is_active,
            similarity(name, $1) AS score
          FROM item_master
          WHERE 
            is_active = TRUE 
            AND (
              similarity(name, $1) > 0.2 
              OR name ILIKE '%' || $1 || '%'
              OR item_code ILIKE '%' || $1 || '%'
            )
          ORDER BY 
            similarity(name, $1) DESC,
            name ASC
          LIMIT $2
        `;
      } else {
        return res.status(400).json({ error: `Unsupported master type: ${type}` });
      }

      const result = await query(sql, [searchTerm, parsedLimit]);

      return res.json({
        success: true,
        type,
        query: searchTerm,
        count: result.rows.length,
        data: result.rows
      });
    } catch (error) {
      console.error('Error executing fuzzy master search:', error);
      return next(error);
    }
  },

  /**
   * Quick Add a new Master entry inline from Combobox
   * POST /api/masters/quick-add
   */
  async quickAdd(req, res, next) {
    try {
      const { type, name, code, gstin, itemType, unit } = req.body;

      if (!type || !name) {
        return res.status(400).json({ error: 'Master type and name are required.' });
      }

      if (type === 'client') {
        const clientCode = code || `CLT-${Date.now().toString().slice(-5)}`;
        const sql = `
          INSERT INTO client_master (code, name, gstin, is_active)
          VALUES ($1, $2, $3, TRUE)
          RETURNING id, code, name, gstin, is_active
        `;
        const result = await query(sql, [clientCode, name.trim(), gstin || null]);
        return res.status(201).json({
          success: true,
          message: 'Client created successfully',
          data: result.rows[0]
        });
      } else if (type === 'item') {
        const itemCode = code || `ITM-${Date.now().toString().slice(-5)}`;
        const sql = `
          INSERT INTO item_master (item_code, name, type, unit, is_active)
          VALUES ($1, $2, $3, $4, TRUE)
          RETURNING id, item_code as code, name, type, unit, is_active
        `;
        const result = await query(sql, [
          itemCode, 
          name.trim(), 
          itemType || 'GREY_FABRIC', 
          unit || 'MTRS'
        ]);
        return res.status(201).json({
          success: true,
          message: 'Item created successfully',
          data: result.rows[0]
        });
      } else {
        return res.status(400).json({ error: `Unsupported master type: ${type}` });
      }
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({ error: 'A master record with this code or name already exists.' });
      }
      return next(error);
    }
  }
};

export default masterController;
