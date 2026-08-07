import "server-only";

export type Mail = {
  to: string;
  subject: string;
  text: string;
};

export async function sendMail(mail: Mail) {
  const smtpHost = process.env.SMTP_HOST;

  if (!smtpHost) {
    console.log(
      `[mailer:dev] to=${mail.to} subject="${mail.subject}"\n${mail.text}`
    );
    return;
  }

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? "HRC Portal <no-reply@hrc.local>",
    to: mail.to,
    subject: mail.subject,
    text: mail.text,
  });
}
