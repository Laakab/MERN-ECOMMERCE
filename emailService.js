// emailService.js - UPDATED
const emailjs = require('@emailjs/nodejs');

// Initialize with your credentials
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || 'service_vsmrtac';
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || 'template_lj7g21u'; // You need a real template ID
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || 'kTcgkllI0h8ibACdD';
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || '4WVC7I7uw2I3uOZQu8MNR';

const sendResetCodeEmail = async (toEmail, resetCode) => {
  try {
    console.log('Attempting to send email to:', toEmail);
    
    const templateParams = {
      to_email: toEmail,
      reset_code: resetCode,
      to_name: toEmail.split('@')[0],
      from_name: 'Your App Name',
      reply_to: 'noreply@yourapp.com',
      subject: 'Password Reset Code'
    };

    console.log('EmailJS Configuration:', {
      serviceId: EMAILJS_SERVICE_ID,
      templateId: EMAILJS_TEMPLATE_ID,
      publicKey: EMAILJS_PUBLIC_KEY.substring(0, 5) + '...' // Partial for security
    });

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: EMAILJS_PUBLIC_KEY,
        privateKey: EMAILJS_PRIVATE_KEY,
      }
    );

    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Email sending error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      response: error.response?.data
    });
    
    // More specific error handling
    if (error.status === 400) {
      throw new Error('Bad request - check template parameters and service configuration');
    } else if (error.status === 401) {
      throw new Error('Unauthorized - check your EmailJS API keys');
    } else if (error.status === 404) {
      throw new Error('Service or template not found');
    }
    
    throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
  }
};

module.exports = { sendResetCodeEmail };