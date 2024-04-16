const functions = require('@google-cloud/functions-framework');
const Email = require('./model/Email');
const uuid = require('uuid');

// Register a CloudEvent callback with the Functions Framework that will
// be executed when the Pub/Sub trigger topic receives a message.
functions.cloudEvent('verifyUser', async cloudEvent => {
  // The Pub/Sub message is passed as the CloudEvent's data payload.
  const base64message = cloudEvent.data.message.data;

  const message = base64message ? JSON.parse(Buffer.from(base64message, 'base64').toString()) : {};
  console.log(`Received message: ${JSON.stringify(message)}!`);

  await send_email(message.first_name, message.last_name, message.email);
});

const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY });

const send_email = async (first_name, last_name, email) => {
  const sender_email = `CloudShaan support <support@shantanutyagi.me>`;
  const receiver_email = email;
  const email_subject = "Account Verification Link";

  const token = uuid.v4();
  const tokenTimestamp = Date.now();

  // Construct the verification link with token and email parameters
  const verificationLink = `https://shantanutyagi.me/v1/user/account-verification?token=${token}&email=${encodeURIComponent(email)}`;

  let htmlContent = "<html>"
            + "<body>"
            + "<h1>Welcome to Cloud Shaan, "+first_name+" "+last_name+" !</h1>"
            + "<p>Thank you for signing up. Please click the following link to verify your email:</p>"
            + "<a href=\"" + verificationLink + "\">Verify Email</a>"
            + "<p>If you are unable to click the link, you can copy and paste it into your browser's address bar.</p>"
            + "<p>We're excited to have you on board!</p>"
            + "<h3>Thanks<h3>"
            + "<p>Cloud Shaan team</p>"
            + "</body>"

  const data = {
    from: sender_email,
    to: receiver_email,
    subject: email_subject,
    html: htmlContent
  };
  try {
    await mg.messages.create(process.env.DOMAIN, data)
      .then(msg => console.log(msg));
    await recordMailToDatabase(receiver_email, token, tokenTimestamp)
    console.log("Mail sent successfully.")
  } catch (error) {
    console.error('Error sending email:', error);
    return;
  }
};

const recordMailToDatabase = async (receiver_email, token, tokenTimestamp) => {
  try {
    await Email.create({
      receiver_email,
      token,
      token_timestamp: tokenTimestamp,
      status: "Mail Sent",
    });
    console.log('Email record saved to database.');
  } catch (error) {
    console.error('Error saving email record to database:', error);
    return;
  }
}