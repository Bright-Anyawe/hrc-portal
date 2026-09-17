import "server-only";
import { sendMail } from "@/lib/mailer";
import { notify, notifyAdmins } from "@/lib/notify";
import { logAudit } from "@/lib/audit";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendWelcomeEmail({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const portalUrl = process.env.PORTAL_URL ?? "http://localhost:3000";
  const clientDashboardUrl = `${portalUrl}/client`;
  const subject = `Welcome to Hedge Resource Centre, ${name}!`;

  const text = `Hi ${name},

Welcome to Hedge Resource Centre (HRC) Portal!

Your account has been successfully created. You can now access your client portal to:
• View and track your active projects and milestones
• Collaborate directly with your dedicated consultants
• Access and download project documents and deliverables
• View and pay invoices securely

Access your portal dashboard anytime at:
${clientDashboardUrl}

If you have any questions or need assistance, reply directly to this email or reach out to our team.

Warm regards,
The Hedge Resource Centre Team
${portalUrl}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to HRC Portal</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 36px; text-align: left;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">
                Hedge Resource Centre
              </h1>
              <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px;">
                Client &amp; Project Management Portal
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
                Welcome aboard, ${escapeHtml(name)}!
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                Thank you for joining <strong>Hedge Resource Centre</strong>. Your client account is active, and your personalized portal is ready.
              </p>

              <!-- Feature List Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #0f172a;">
                      What you can do in your portal:
                    </p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #475569;">
                      <li>Track real-time progress on your active projects</li>
                      <li>Review milestones, deliverables, and upcoming tasks</li>
                      <li>Access, upload, and download project documentation</li>
                      <li>View and manage invoices seamlessly</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0 20px 0;">
                <tr>
                  <td align="center">
                    <a href="${clientDashboardUrl}" target="_blank" style="display: inline-block; background-color: #0284c7; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(2, 132, 199, 0.25);">
                      Open Your Client Portal
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.5; color: #64748b; text-align: center;">
                Or copy and paste this link into your browser:<br>
                <a href="${clientDashboardUrl}" style="color: #0284c7; word-break: break-all;">${clientDashboardUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 36px;">
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px 32px 36px; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.5;">
              <p style="margin: 0 0 8px 0;">
                &copy; ${new Date().getFullYear()} Hedge Resource Centre. All rights reserved.
              </p>
              <p style="margin: 0 0 8px 0;">
                <a href="${portalUrl}/privacy" style="color: #64748b; text-decoration: underline;">Privacy Policy</a>
                &nbsp;&bull;&nbsp;
                <a href="${portalUrl}/terms" style="color: #64748b; text-decoration: underline;">Terms of Service</a>
              </p>
              <p style="margin: 0;">
                This automated welcome message was sent to ${escapeHtml(email)}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendMail({
    to: email,
    subject,
    text,
    html,
  });
}

export async function handleUserSignupStrategy({
  user,
  signupMethod = "email",
}: {
  user: { id: string; name: string; email: string };
  signupMethod?: "email" | "google" | "admin_invitation";
}) {
  // 1. Send automated welcome message via Resend (with SMTP fallback)
  try {
    const mailResult = await sendWelcomeEmail({
      name: user.name,
      email: user.email,
    });
    console.log(
      `[signupStrategy] Welcome email dispatch: provider=${mailResult.provider}, success=${mailResult.success}`
    );
  } catch (err) {
    console.error("[signupStrategy] Failed to send welcome email:", err);
  }

  // 2. Send in-app welcome notification to the user
  try {
    await notify(user.id, {
      type: "WELCOME",
      message: `Welcome to Hedge Resource Centre, ${user.name}! Your account is now active.`,
    });
  } catch (err) {
    console.error("[signupStrategy] Failed to create welcome notification:", err);
  }

  // 3. Notify Admins about new registration
  try {
    await notifyAdmins({
      type: "USER_SIGNUP",
      message: `New client "${user.name}" (${user.email}) registered via ${signupMethod}.`,
    });
  } catch (err) {
    console.error("[signupStrategy] Failed to notify admins:", err);
  }

  // 4. Log audit trail
  try {
    await logAudit({
      actorId: user.id,
      actorName: user.name,
      action: "USER_SIGNUP",
      entityType: "User",
      entityId: user.id,
      details: {
        email: user.email,
        name: user.name,
        signupMethod,
      },
    });
  } catch (err) {
    console.error("[signupStrategy] Failed to log audit:", err);
  }
}
