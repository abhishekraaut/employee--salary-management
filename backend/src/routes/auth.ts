import express from 'express';
import { z } from 'zod';
import { BadRequestError } from '../common/errors';
import { sendSuccess } from '../common/response';
import { login } from '../services/auth.service';

const router = express.Router();
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

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
router.post('/login', async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    sendSuccess(res, await login(input.email, input.password), 'Login successful');
  } catch (error) {
    if (error instanceof z.ZodError) return next(new BadRequestError('Invalid email or password'));
    next(error);
  }
});

export default router;
