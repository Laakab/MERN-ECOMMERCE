// test-email.js
const emailjs = require('@emailjs/nodejs');

const testEmail = async () => {
  try {
    const result = await emailjs.send(
      'service_vsmrtac',
      '__ejs-test-mail-service__',
      {
        to_email: 'test@example.com',
        reset_code: 'TEST123',
        to_name: 'Test User',
        from_name: 'Your App'
      },
      {
        publicKey: 'kTcgkllI0h8ibACdD',
        privateKey: '4WVC7I7uw2I3uOZQu8MNR'
      }
    );
    console.log('Test email sent successfully:', result);
  } catch (error) {
    console.error('Test email failed:', error);
  }
};

testEmail();