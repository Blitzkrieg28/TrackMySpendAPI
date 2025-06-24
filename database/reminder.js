const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user',
    required: false   // make optional
  },
  incomeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'income',
    required: false   // optional too, if you want
  },
  remindAt: {
    type: Date,
    required: true    // remindAt should always be present for a reminder to work
  },
  subscription: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'subscription',
    required: true   // subscription needed to send push notifications
  },
  sent: { 
    type: Boolean, 
    default: false 
  }
});

const Reminder = mongoose.model('reminder', ReminderSchema);

module.exports = Reminder;
