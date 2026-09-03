export const openApiDocument = {
  openapi: '3.0.3',
  info: { title: 'ACME HR API', version: '1.0.0' },
  servers: [{ url: '/api' }],
  paths: {
    '/auth/login': {
      post: {
        summary: 'Authenticate a user',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Login' } } } },
        responses: { '200': { description: 'Authenticated' }, '401': { description: 'Invalid credentials' } }
      }
    },
    '/employees': { get: { summary: 'List employees', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Employee list' } } } },
    '/analytics/compensation-summary': { get: { summary: 'Compensation summary', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Summary' } } } }
  },
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: { Login: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', format: 'password' } } } }
  }
};
