// config/webpushConfig.js
const webpush = require('web-push');
const dotenv = require('dotenv');

dotenv.config();

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

module.exports = webpush;
