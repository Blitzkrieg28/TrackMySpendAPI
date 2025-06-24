const express = require("express");
const Reminder = require("../database/reminder");
const router = express.Router();


// Create reminder
router.post('/add', async (req, res) => {
  try {
    const { incomeId, remindAt, subscriptionId } = req.body;
    const reminder = await Reminder.create({
      incomeId,
      remindAt,
      subscription: subscriptionId,
    });
    res.status(201).json({ message: "Reminder created", reminder });
  } catch (err) {
    console.error("Create reminder error:", err);
    res.status(500).json({ error: "Failed to create reminder" });
  }
});

module.exports = router;
