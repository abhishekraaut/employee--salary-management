import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    id: string;
    user?: {
      id: string;
      tenantId: string;
      email: string;
    };
  }
}
