import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowLeft, ShieldCheck, Mail } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Privacy Policy | Hedge Resource Centre",
  description: "Privacy Policy and data protection practices for the HRC Portal.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-muted/20 text-foreground">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold">
            <Image
              src="/images/HRC-logo - Copy.png"
              alt="HRC Portal logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <span className="text-base font-semibold">Hedge Resource Centre</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "flex items-center gap-1.5 text-xs font-medium"
              )}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign in
            </Link>
            <Link
              href="/signup"
              className={cn(buttonVariants({ size: "sm" }), "text-xs font-medium")}
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-8 border-b pb-6">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Legal Document</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: September 2026 • Hedge Resource Centre (HRC Portal)
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Introduction</h2>
            <p>
              Hedge Resource Centre (&quot;HRC&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) provides a client and project management portal accessible at <strong>portal.hrcghana.com</strong> (the &quot;Portal&quot;). We respect your privacy and are committed to protecting the personal data and sensitive project information entrusted to us by our clients, consultants, and partners.
            </p>
            <p>
              This Privacy Policy explains how we collect, store, use, and protect your information when you access or use the Portal.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. Information We Collect</h2>
            <p>We collect information necessary to provide our consulting, project management, and portal services:</p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li>
                <strong>Account Information:</strong> Your full name, email address, password hash, and assigned portal role (Client, Consultant, or Administrator).
              </li>
              <li>
                <strong>Google Account Information (OAuth):</strong> When you choose to sign in with Google, we collect your verified name, email address, and Google profile ID to authenticate your session. We do not store or access your Google password.
              </li>
              <li>
                <strong>Project &amp; Collaboration Data:</strong> Project titles, descriptions, status, task milestones, uploaded deliverables, documents, and notes shared between you and your consultants.
              </li>
              <li>
                <strong>Billing &amp; Invoice Information:</strong> Invoices generated for project work, itemized breakdowns, dates, and payment status records.
              </li>
              <li>
                <strong>Usage &amp; Audit Logs:</strong> Timestamped records of portal activities (logins, account changes, document uploads, project updates) to ensure system security and accountability.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. How We Use Your Information</h2>
            <p>We use the collected information for specific, legitimate business purposes:</p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li>To provide, maintain, and secure your access to the client portal.</li>
              <li>To facilitate seamless communication and file exchange with your assigned consultants.</li>
              <li>To issue, track, and update invoices and project milestones.</li>
              <li>To send essential transactional notifications (such as welcome messages, password resets, project updates, and invoice alerts) via email.</li>
              <li>To comply with regulatory obligations, resolve disputes, and enforce our Terms of Service.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Third-Party Service Providers</h2>
            <p>
              We do not sell, rent, or trade your personal data. We only share information with trusted third-party service providers essential to portal operations:
            </p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li>
                <strong>Google Identity Services:</strong> Used for secure single sign-on authentication.
              </li>
              <li>
                <strong>Resend:</strong> Used to deliver transactional email notifications (such as welcome greetings, project assignments, and invoice notifications).
              </li>
              <li>
                <strong>Database &amp; Hosting Infrastructure:</strong> Managed cloud databases (Neon PostgreSQL) and hosting providers with encrypted transit and storage.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Data Security &amp; Storage</h2>
            <p>
              We implement industry-standard administrative, technical, and physical security measures to safeguard your information:
            </p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li>All traffic between your browser and the Portal is encrypted using Transport Layer Security (TLS/HTTPS).</li>
              <li>Passwords are cryptographically hashed using bcrypt and never stored in plain text.</li>
              <li>Authentication sessions use secure, HTTP-only, encrypted JWT tokens.</li>
              <li>Access controls ensure that clients can only view projects, invoices, and documents directly assigned to them.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Cookies &amp; Tracking</h2>
            <p>
              The Portal uses essential HTTP cookies strictly required for user authentication and session security. We do not use third-party advertising cookies or cross-site tracking technologies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">7. Your Rights &amp; Data Retention</h2>
            <p>
              You have the right to request access to the personal data we hold about you, request corrections to inaccurate records, or request deletion of your account (subject to legal and record-keeping requirements).
            </p>
            <p>
              To exercise any of these rights, please contact our administrator team.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">8. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data handling practices, please contact:
            </p>
            <div className="rounded-lg border bg-card p-4 text-card-foreground">
              <p className="font-semibold">Hedge Resource Centre</p>
              <p className="text-xs text-muted-foreground mt-0.5">Accra, Ghana</p>
              <p className="mt-2 flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:hrcghana@gmail.com" className="text-primary hover:underline">
                  hrcghana@gmail.com
                </a>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Portal: <a href="https://portal.hrcghana.com" className="hover:underline">portal.hrcghana.com</a>
              </p>
            </div>
          </section>
        </div>

        {/* Bottom Nav Links */}
        <div className="mt-12 flex items-center justify-between border-t pt-6 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Hedge Resource Centre. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
            <Link href="/login" className="hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
