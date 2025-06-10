// swagger.js
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
  },
  apis: ['./routes/*.js'], // includes all your route files
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = swaggerDocs;
