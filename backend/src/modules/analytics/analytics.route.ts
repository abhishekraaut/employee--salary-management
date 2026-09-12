import express from 'express';
import { analyticsController } from './analytics.controller';
import { authenticate } from '../../middleware/auth';

const router = express.Router();
router.use(authenticate);

/**
 * @swagger
 * /api/analytics/compensation-summary:
 *   get:
 *     summary: Get compensation summary
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics summary
 *       401:
 *         description: Unauthorized
 */
router.get('/compensation-summary', analyticsController.getCompensationSummary);

export default router;