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

  await send_email(message.first_name, message.email);
});

const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY });

const send_email = async (receiver_name, email) => {
  const sender_email = `mail@${process.env.DOMAIN}`;
  const receiver_email = email;
  const email_subject = "Account Verification Link";
  let email_body;

  const token = uuid.v4();
  const tokenTimestamp = Date.now();

  // Construct the verification link with token and email parameters
  const verificationLink = `http://shantanutyagi.me:8080/v1/user/account-verification?token=${token}&email=${encodeURIComponent(email)}`;

  email_body = `Hi ${receiver_name}, 
  <br><br>Your account needs to be verified. Please click the link below to verify your email address. 
  <br><br><a href="${verificationLink}">${verificationLink}</a>.
  <br><br>Regards, 
  <br>Webapp Team`;

  const data = {
    from: sender_email,
    to: receiver_email,
    subject: email_subject,
    html: email_body
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