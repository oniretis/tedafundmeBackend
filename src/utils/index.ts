import nodemailer from "nodemailer";

export const generateOtp = (): string => {
  const numbers = "0123456789";
  let otp: string = "";

  for (let i = 0; i < 4; i++) {
    otp += numbers[Math.floor(Math.random() * 10)];
  }

  return otp;
};

export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `Teda ${process.env.GMAIL_USER}`,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions).then(() => {
      console.log(`${mailOptions.subject} mail sent to ${mailOptions.to} 🚀`);
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
