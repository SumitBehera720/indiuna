// Copy this file to deploy.config.local.js and fill in real values.
// deploy.config.local.js is gitignored — never commit real credentials.
export default {
  host: 'YOUR_SERVER_IP',
  port: 65002,
  username: 'YOUR_SSH_USER',
  password: 'YOUR_SSH_PASSWORD',
  remoteHome: 'domains/YOUR_DOMAIN', // e.g. 'domains/indiuna.com'
  remoteBackendDir: 'backend', // relative to remoteHome
  remotePublicDir: 'public_html', // relative to remoteHome (storefront + admin land here)

  // Backend production environment values
  env: {
    APP_URL: 'https://indiuna.com',
    DB_HOST: 'localhost',
    DB_PORT: '3306',
    DB_DATABASE: 'YOUR_DB',
    DB_USERNAME: 'YOUR_DB_USER',
    DB_PASSWORD: 'YOUR_DB_PASSWORD',
    MAIL_MAILER: 'smtp',
    MAIL_HOST: 'smtp.gmail.com',
    MAIL_PORT: '587',
    MAIL_USERNAME: '',
    MAIL_PASSWORD: '',
    MAIL_FROM_ADDRESS: 'noreply@indiuna.com',
    RAZORPAY_KEY_ID: '',
    RAZORPAY_KEY_SECRET: '',
    SHIPROCKET_EMAIL: '',
    SHIPROCKET_PASSWORD: '',
  },
};
