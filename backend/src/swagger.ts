import path from 'node:path';
import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'ACME HR API',
      version: '1.0.0',
      description: 'Use POST /api/auth/login to obtain a JWT, then authorize protected requests.',
    },
    servers: [{ url: '/', description: 'Development server' }],
    paths: {
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Authenticate a user',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
          responses: { '200': { description: 'Login successful' }, '400': { description: 'Invalid request' }, '401': { description: 'Invalid credentials' } },
        },
      },
      '/api/employees': {
        get: {
          tags: ['Employees'],
          summary: 'List employees',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 100 } },
            { in: 'query', name: 'search', schema: { type: 'string' } },
            { in: 'query', name: 'department', schema: { type: 'string' } },
            { in: 'query', name: 'country', schema: { type: 'string' } },
            { in: 'query', name: 'sortBy', schema: { type: 'string', enum: ['firstName', 'lastName', 'hireDate', 'createdAt'] } },
            { in: 'query', name: 'sortOrder', schema: { type: 'string', enum: ['asc', 'desc'] } },
          ],
          responses: { '200': { description: 'Employee list' }, '401': { description: 'Unauthorized' } },
        },
      },
      '/api/employees/{id}': {
        get: {
          tags: ['Employees'],
          summary: 'Get an employee',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Employee details' }, '401': { description: 'Unauthorized' }, '404': { description: 'Employee not found' } },
        },
      },
      '/api/employees/{id}/compensations': {
        get: {
          tags: ['Compensation'],
          summary: 'List compensation history',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Compensation history' }, '401': { description: 'Unauthorized' }, '404': { description: 'Employee not found' } },
        },
        post: {
          tags: ['Compensation'],
          summary: 'Add employee compensation',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CompensationRequest' } } } },
          responses: { '201': { description: 'Compensation created' }, '400': { description: 'Invalid request' }, '401': { description: 'Unauthorized' }, '404': { description: 'Employee not found' } },
        },
      },
      '/api/analytics/compensation-summary': {
        get: {
          tags: ['Analytics'],
          summary: 'Get compensation summary',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'query', name: 'groupBy', schema: { type: 'string', enum: ['department', 'country'], default: 'department' } }],
          responses: { '200': { description: 'Compensation summary' }, '401': { description: 'Unauthorized' } },
        },
      },
      '/api/audit': {
        get: {
          tags: ['Audit'],
          summary: 'List audit logs',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          ],
          responses: { '200': { description: 'Audit log list' }, '401': { description: 'Unauthorized' } },
        },
      },
      '/health/live': {
        get: {
          tags: ['Health'],
          summary: 'Check application liveness',
          responses: { '200': { description: 'Server is healthy' } },
        },
      },
      '/health/ready': {
        get: {
          tags: ['Health'],
          summary: 'Check database readiness',
          responses: { '200': { description: 'Database is ready' }, '500': { description: 'Database unavailable' } },
        },
      },
    },
    components: {
      securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
      schemas: {
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'abhishek.hr@abhitech.com' },
            password: { type: 'string', format: 'password', example: 'abhi@123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            code: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'Login successful' },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                user: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, tenantId: { type: 'string' } } },
              },
            },
          },
        },
        CompensationRequest: {
          type: 'object',
          required: ['amount', 'currency', 'effectiveDate'],
          properties: {
            amount: { type: 'number', minimum: 0 },
            currency: { type: 'string', minLength: 3, maxLength: 3, example: 'USD' },
            effectiveDate: { type: 'string', format: 'date-time' },
            reason: { type: 'string' },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, 'routes', '*.ts'), path.join(__dirname, 'routes', '*.js')],
};

export const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
