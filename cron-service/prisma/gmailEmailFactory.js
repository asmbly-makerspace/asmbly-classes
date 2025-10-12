import NodeMailer  from 'nodemailer';

/**
 * Sent a MIME email object to its recipient using GMail
 * @param {Object} MIMEmessage - MIME email object
 */
async function sendMIMEmessage(MIMEmessage, config) {

  console.debug(`Sending email subject "${MIMEmessage['subject']}" to ${MIMEmessage['to']} and CCing ${MIMEmessage['cc']}`);

  const transporter = NodeMailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.GMAIL_USER,
      pass: config.GMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail(MIMEmessage);
  } catch (error) {
    console.error(`Failed sending email subject "${MIMEmessage['subject']}" to ${MIMEmessage['to']}`, error);
  }
}

export { sendMIMEmessage };