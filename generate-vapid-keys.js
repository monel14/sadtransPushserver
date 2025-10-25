const webpush = require('web-push');

console.log('🔑 Generating VAPID keys...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID keys generated successfully!\n');
console.log('📋 Copy these to your .env file:\n');
console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('VAPID_EMAIL=mailto:admin@sadtrans.com\n');

console.log('📝 Also add the public key to your frontend code:');
console.log('const VAPID_PUBLIC_KEY = "' + vapidKeys.publicKey + '";\n');
