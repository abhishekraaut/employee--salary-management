import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BadRequestError } from '../../common/errors';
import { sendSuccess } from '../../common/response';
import { authService } from './auth.service';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export class AuthController {
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = loginSchema.parse(req.body);
      const result = await authService.login(input.email, input.password);
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(new BadRequestError('Invalid email or password'));
      }
      next(error);
    }
  };
}

export const authController = new AuthController();