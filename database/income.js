const mongoose= require('mongoose');

const incomeSchema= new mongoose.Schema({
    amount: Number,
    category: String,
    date: String,
    count: Number
})

const Income= mongoose.model('income' ,incomeSchema);

module.exports= Income;