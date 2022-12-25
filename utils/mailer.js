import nodeMailer from 'nodemailer';

export const sendEmail = async (options) => {
  const trasnporter = nodeMailer.createTransport({
    service: process.env.SMTP_SERVICE,
    port: +process.env.SMTP_PORT,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await trasnporter.sendMail(mailOptions);
};


