const mongoose= require('mongoose');

const expenseSchema= new mongoose.Schema({
    amount: Number,
    category: String,
    date: String,
    count: Number,
    to: String,
    time: String
})

const Expense= mongoose.model('expense' ,expenseSchema);

module.exports= Expense;