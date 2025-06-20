const express = require('express');
const cors = require('cors');

const dotenv = require('dotenv');
const connectToDatabase = require('./database/database'); // ✅ Import DB connection

const userRouter = require('./routes/userroutes');
const adminRouter = require('./routes/adminroutes');
const expenseRouter = require('./routes/expenseroutes');
const incomeRouter = require('./routes/incomeroutes');
const categoryRouter = require('./routes/categoryroutes');
const budgetRouter = require('./routes/budgetroutes');
const reportRouter = require('./routes/reportroutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// ✅ Connect to MongoDB
connectToDatabase();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

// Routes
app.use('/admin', adminRouter);
app.use('/user', userRouter);
app.use('/expense', expenseRouter);
app.use('/income', incomeRouter);
app.use('/category', categoryRouter);
app.use('/budget', budgetRouter);
app.use('/report', reportRouter);
app.get('/', (req, res) => {
  res.send('TrackMySpend API is running');
});

const swaggerDocs = require('./swagger');
swaggerDocs(app);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
