import "server-only";
import { Resend } from "resend";

export type Mail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export type MailResult = {
  success: boolean;
  provider: "resend" | "smtp" | "dev";
  id?: string;
  error?: string;
};

export async function sendMail(mail: Mail): Promise<MailResult> {
  const resendApiKey = process.env.RESEND_API_KEY;

  // 1. Send using Resend if configured
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const from =
        process.env.RESEND_FROM_EMAIL ??
        process.env.MAIL_FROM ??
        "HRC Portal <onboarding@resend.dev>";

      const { data, error } = await resend.emails.send({
        from,
        to: mail.to,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      });

      if (error) {
        console.error("[mailer:resend] Resend error:", error);
        // If custom domain is not yet verified, attempt fallback with onboarding@resend.dev
        if (from !== "HRC Portal <onboarding@resend.dev>") {
          console.log(
            "[mailer:resend] Custom domain failed. Retrying with onboarding@resend.dev fallback..."
          );
          const fallbackRes = await resend.emails.send({
            from: "HRC Portal <onboarding@resend.dev>",
            to: mail.to,
            subject: mail.subject,
            text: mail.text,
            html: mail.html,
          });
          if (!fallbackRes.error) {
            console.log(
              `[mailer:resend] Email sent to ${mail.to} via fallback sender, id=${fallbackRes.data?.id}`
            );
            return {
              success: true,
              provider: "resend",
              id: fallbackRes.data?.id,
            };
          }
        }
      } else {
        console.log(`[mailer:resend] Email sent to ${mail.to}, id=${data?.id}`);
        return {
          success: true,
          provider: "resend",
          id: data?.id,
        };
      }
    } catch (err: any) {
      console.error("[mailer:resend] Exception sending via Resend:", err);
    }
  }

  // 2. Fallback to SMTP (nodemailer)
  const smtpHost = process.env.SMTP_HOST;
  if (smtpHost) {
    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      });

      const info = await transporter.sendMail({
        from: process.env.MAIL_FROM ?? "HRC Portal <no-reply@hrc.local>",
        to: mail.to,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      });

      console.log(`[mailer:smtp] Email sent to ${mail.to}, messageId=${info.messageId}`);
      return {
        success: true,
        provider: "smtp",
        id: info.messageId,
      };
    } catch (err: any) {
      console.error("[mailer:smtp] Exception sending via SMTP:", err);
      return {
        success: false,
        provider: "smtp",
        error: err?.message,
      };
    }
  }

  // 3. Dev fallback (Console log)
  console.log(
    `[mailer:dev] to=${mail.to} subject="${mail.subject}"\n${mail.text}${mail.html ? `\n[HTML version included]` : ""}`
  );
  return {
    success: true,
    provider: "dev",
  };
}

