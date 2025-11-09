// Test file to verify EmailJS configuration
console.log('EmailJS Configuration Test:');
console.log('REACT_APP_EMAILJS_SERVICE_ID:', process.env.REACT_APP_EMAILJS_SERVICE_ID);
console.log('REACT_APP_EMAILJS_TEMPLATE_ID:', process.env.REACT_APP_EMAILJS_TEMPLATE_ID);
console.log('REACT_APP_EMAILJS_USER_ID:', process.env.REACT_APP_EMAILJS_USER_ID);

// Check if all required variables are present
const isConfigured = !!(process.env.REACT_APP_EMAILJS_SERVICE_ID && 
                       process.env.REACT_APP_EMAILJS_TEMPLATE_ID && 
                       process.env.REACT_APP_EMAILJS_USER_ID);

console.log('EmailJS Fully Configured:', isConfigured);

export {};