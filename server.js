const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration VAPID
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@sadtrans.com';

if (!vapidPublicKey || !vapidPrivateKey) {
  console.error('❌ VAPID keys not configured!');
  console.log('Run: npm run generate-keys');
  process.exit(1);
}

webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);

console.log('✅ VAPID configured');
console.log('📧 Email:', vapidEmail);
console.log('🔑 Public Key:', vapidPublicKey.substring(0, 20) + '...');

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    vapidConfigured: !!(vapidPublicKey && vapidPrivateKey),
  });
});

// Get VAPID public key
app.get('/vapid-public-key', (req, res) => {
  res.json({
    publicKey: vapidPublicKey,
  });
});

// Send push notification
app.post('/send-push', async (req, res) => {
  try {
    const { subscription, notification } = req.body;

    console.log('📨 Received push request');
    console.log('Endpoint:', subscription?.endpoint?.substring(0, 50) + '...');

    // Validation
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription object',
      });
    }

    if (!notification || !notification.title) {
      return res.status(400).json({
        success: false,
        error: 'Invalid notification object',
      });
    }

    // Préparer le payload
    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body || '',
      icon: notification.icon || '/favicon.ico',
      badge: notification.badge || '/favicon.ico',
      image: notification.image,
      data: notification.data || {},
      actions: notification.actions || [],
      tag: notification.tag || 'sadtrans-notification',
      requireInteraction: notification.requireInteraction !== false,
      timestamp: Date.now(),
    });

    console.log('📦 Payload prepared:', payload.substring(0, 100) + '...');

    // Envoyer la notification
    const result = await webpush.sendNotification(subscription, payload);

    console.log('✅ Push sent successfully');
    console.log('Status:', result.statusCode);

    res.json({
      success: true,
      statusCode: result.statusCode,
      message: 'Push notification sent successfully',
    });
  } catch (error) {
    console.error('❌ Error sending push:', error);

    // Gestion des erreurs spécifiques
    if (error.statusCode === 410 || error.statusCode === 404) {
      return res.status(410).json({
        success: false,
        error: 'Subscription expired or invalid',
        statusCode: error.statusCode,
        shouldDelete: true,
      });
    }

    if (error.statusCode === 401) {
      return res.status(401).json({
        success: false,
        error: 'Invalid VAPID keys',
        statusCode: error.statusCode,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send push notification',
      statusCode: error.statusCode,
    });
  }
});

// Send batch notifications
app.post('/send-push-batch', async (req, res) => {
  try {
    const { subscriptions, notification } = req.body;

    console.log(`📨 Received batch push request for ${subscriptions?.length} subscriptions`);

    if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscriptions array',
      });
    }

    if (!notification || !notification.title) {
      return res.status(400).json({
        success: false,
        error: 'Invalid notification object',
      });
    }

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body || '',
      icon: notification.icon || '/favicon.ico',
      badge: notification.badge || '/favicon.ico',
      image: notification.image,
      data: notification.data || {},
      actions: notification.actions || [],
      tag: notification.tag || 'sadtrans-notification',
      requireInteraction: notification.requireInteraction !== false,
      timestamp: Date.now(),
    });

    // Envoyer à toutes les subscriptions
    const results = await Promise.allSettled(
      subscriptions.map((subscription) =>
        webpush.sendNotification(subscription, payload)
      )
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;
    const expired = results.filter(
      (r) =>
        r.status === 'rejected' &&
        (r.reason?.statusCode === 410 || r.reason?.statusCode === 404)
    );

    console.log(`✅ Batch complete: ${sent} sent, ${failed} failed`);

    res.json({
      success: sent > 0,
      sent,
      failed,
      expired: expired.length,
      total: subscriptions.length,
      results: results.map((r, i) => ({
        index: i,
        success: r.status === 'fulfilled',
        statusCode: r.status === 'fulfilled' ? r.value?.statusCode : r.reason?.statusCode,
        error: r.status === 'rejected' ? r.reason?.message : null,
        shouldDelete: r.status === 'rejected' && (r.reason?.statusCode === 410 || r.reason?.statusCode === 404),
      })),
    });
  } catch (error) {
    console.error('❌ Error in batch send:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send batch notifications',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Push server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 VAPID public key: http://localhost:${PORT}/vapid-public-key`);
});
