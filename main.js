const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const connectToDatabase = require('./database/database');
const webpush = require('./config/webPushConfig');

const userRouter = require('./routes/userroutes');
const adminRouter = require('./routes/adminroutes');
const expenseRouter = require('./routes/expenseroutes');
const incomeRouter = require('./routes/incomeroutes');
const categoryRouter = require('./routes/categoryroutes');
const budgetRouter = require('./routes/budgetroutes');
const reportRouter = require('./routes/reportroutes');
const reminderRouter = require('./routes/reminderroutes');
const subscriptionRouter = require('./routes/subscriptionroutes');
const ocrRouter = require('./routes/ocrroutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// ✅ Connect to MongoDB
connectToDatabase();

// 1) CORS must be applied before any other middleware or routes
app.use(cors({
  origin: 'https://track-my-spend-frontend-ten.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 2) JSON parser with desired limit
app.use(express.json({ limit: '10mb' }));

// 3) (Optional) Explicit preflight for OCR route
app.options('/ocr/advanced-base64', cors({ origin: 'https://track-my-spend-frontend-ten.vercel.app' }));

// 4) Application routes
app.use('/admin', adminRouter);
app.use('/user', userRouter);
app.use('/expense', expenseRouter);
app.use('/income', incomeRouter);
app.use('/category', categoryRouter);
app.use('/budget', budgetRouter);
app.use('/report', reportRouter);
app.use('/reminder', reminderRouter);
app.use('/subscription', subscriptionRouter);
app.use('/ocr', ocrRouter);

// Healthcheck endpoint
app.get('/', (req, res) => {
  res.send('TrackMySpend API is running');
});

// Initialize Swagger docs
const swaggerDocs = require('./swagger');
swaggerDocs(app);

// Start scheduled jobs
require('./jobs/pushReminders');

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
