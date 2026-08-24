import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = await prisma.user.findFirst({
    where: { email }
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const secret = process.env.JWT_SECRET || 'supersecret_for_assessment';
  const token = jwt.sign(
    { id: user.id, tenantId: user.tenantId, email: user.email },
    secret,
    { expiresIn: '1d' }
  );

  res.json({ token, user: { id: user.id, name: user.name, tenantId: user.tenantId } });
});

export default router;
