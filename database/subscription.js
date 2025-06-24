const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
  endpoint: {
    type: String,
    required: true,
    unique: true // optional: prevents duplicate subscriptions
  },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: null // ✅ Explicitly allows null user
  }
});

const Subscription = mongoose.model('subscription', SubscriptionSchema);

module.exports = Subscription;
