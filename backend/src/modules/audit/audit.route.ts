import express from 'express';
import { auditController } from './audit.controller';
import { authenticate } from '../../middleware/auth';

const router = express.Router();
router.use(authenticate);

/**
 * @swagger
 * /api/audit:
 *   get:
 *     summary: Get audit logs
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of audit logs
 *       401:
 *         description: Unauthorized
 */
router.get('/', auditController.getLogs);

export default router;