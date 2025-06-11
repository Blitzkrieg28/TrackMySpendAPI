const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TrackMySpend API',
      version: '1.0.0',
      description: 'API for tracking expenses, incomes, budgets, and user management.',
    },
    servers: [
      {
        url: 'https://trackmyspendapi-3.onrender.com',
      },
    ],
    components: {
      schemas: {
        Expense: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d21b4667d0d8992e610c85' },
            category: { type: 'string', example: 'Food' },
            amount: { type: 'number', example: 150 },
            count: { type: 'number', example: 1 },
            date: { type: 'string', format: 'date-time', example: '2025-06-11T12:00:00Z' }
          },
        },
        Income: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d21b4667d0d8992e610c86' },
            category: { type: 'string', example: 'Salary' },
            amount: { type: 'number', example: 5000 },
            count: { type: 'number', example: 1 },
            date: { type: 'string', format: 'date-time', example: '2025-06-11T12:00:00Z' }
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'], // path to your annotated routes
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = swaggerDocs;
