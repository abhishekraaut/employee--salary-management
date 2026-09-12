import express from 'express';
import { compensationController } from './compensation.controller';
import { authenticate } from '../../middleware/auth';

const router = express.Router();
router.use(authenticate);

/**
 * @swagger
 * /api/employees/{id}/compensations:
 *   get:
 *     summary: Get employee compensations
 *     tags: [Employees, Compensation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee compensations
 *       404:
 *         description: Not found
 */
router.get('/:id/compensations', compensationController.getHistory);

/**
 * @swagger
 * /api/employees/{id}/compensations:
 *   post:
 *     summary: Add employee compensation
 *     tags: [Employees, Compensation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - effectiveDate
 *             properties:
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               effectiveDate:
 *                 type: string
 *                 format: date-time
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Compensation added
 *       404:
 *         description: Not found
 */
router.post('/:id/compensations', compensationController.addCompensation);

export default router;