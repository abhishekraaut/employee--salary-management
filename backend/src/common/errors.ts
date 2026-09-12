export class AppError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) { super(400, message); }
}
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') { super(401, message); }
}
export class NotFoundError extends AppError {
  constructor(message: string) { super(404, message); }
}

export class ConflictError extends AppError {
  constructor(message: string) { super(409, message); }
}
