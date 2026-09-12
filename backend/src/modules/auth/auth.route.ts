import express from 'express';
import { authController } from './auth.controller';

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user
 *     description: Returns a JWT for the user's tenant. Use the token with the Authorize button to test protected APIs.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authController.login);

export default router;