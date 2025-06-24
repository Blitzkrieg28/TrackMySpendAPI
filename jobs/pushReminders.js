const cron = require('node-cron');
const Reminder = require('../database/reminder');
const webpush = require('../config/webPushConfig');

cron.schedule('* * * * *', async () => {
  const now = new Date();
  const due = await Reminder.find({ remindAt: { $lte: now }, sent: false }).populate('subscription');

  for (let r of due) {
    const payload = JSON.stringify({
      title: 'Income Reminder 💰',
      body: `Income due on ${r.remindAt.toLocaleDateString()} is coming up.`,
      url: '/income'
    });
    try {
      await webpush.sendNotification(r.subscription, payload);
      r.sent = true;
      await r.save();
    } catch (e) {
      console.error('Failed to send push', e);
    }
  }
});
