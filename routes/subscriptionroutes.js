const express = require("express");
const Subscription = require("../database/subscription");
const router = express.Router();

// Save push subscription
router.post('/', async (req, res) => {
  try {
    const sub = new Subscription({
      ...req.body,
      user: req.user?._id || null,
    });

    await sub.save();
    res.status(201).json({ message: "Subscription saved", subscriptionId: sub._id });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({ error: "Failed to save subscription" });
  }
});

module.exports = router;
