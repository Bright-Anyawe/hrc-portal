import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowLeft, FileText, Mail } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Terms of Service | Hedge Resource Centre",
  description: "Terms of Service and conditions for using the HRC Portal.",
};

export default function TermsOfServicePage() {
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
            <FileText className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Legal Document</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: September 2026 • Hedge Resource Centre (HRC Portal)
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Agreement to Terms</h2>
            <p>
              These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you and Hedge Resource Centre (&quot;HRC&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) governing your access to and use of the HRC Portal at <strong>portal.hrcghana.com</strong> (the &quot;Portal&quot;).
            </p>
            <p>
              By creating an account, signing in, or using the Portal, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, you must not access or use the Portal.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. User Accounts &amp; Access Roles</h2>
            <p>To use the Portal, you must register or be invited with an authorized user account:</p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li>
                <strong>Client Accounts:</strong> Access is provided to authorized client representatives to view assigned projects, upload project-related documents, communicate with assigned consultants, and view/pay invoices.
              </li>
              <li>
                <strong>Consultant / Staff Accounts:</strong> Access is provided to authorized staff and consultants to manage assigned project deliverables, track tasks, and collaborate with clients.
              </li>
              <li>
                <strong>Account Credentials:</strong> You are responsible for safeguarding your login credentials and maintaining the confidentiality of your password. You agree to notify us immediately of any unauthorized access to your account.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. Consulting Services &amp; Project Deliverables</h2>
            <p>
              The Portal serves as an operational interface for managing consulting engagements, documents, deliverables, and tasks. Specific deliverables, project milestones, timelines, and commercial terms are defined in individual consulting agreements, engagement letters, or statements of work between HRC and the client.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Acceptable Use Policy</h2>
            <p>When using the Portal, you agree not to:</p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li>Violate any applicable national or international laws or regulations.</li>
              <li>Upload malicious code, viruses, malware, or harmful files.</li>
              <li>Attempt to gain unauthorized access to any accounts, computer systems, or networks connected to the Portal.</li>
              <li>Interfere with or disrupt the integrity, security, or performance of the Portal.</li>
              <li>Extract or scrape data from the Portal without prior written consent.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Invoices &amp; Payments</h2>
            <p>
              Invoices generated through the Portal reflect consulting fees, milestones, and reimbursable expenses in accordance with client engagement agreements. Payment terms, due dates, and itemized descriptions are detailed on each invoice. Inquiries or disputes regarding invoice line items must be reported within 14 days of invoice receipt.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Intellectual Property &amp; Confidentiality</h2>
            <p>
              All proprietary software, branding, designs, logos, and portal architecture are the exclusive property of Hedge Resource Centre.
            </p>
            <p>
              Client project files, proprietary business information, and deliverables uploaded to or shared via the Portal are treated as strictly confidential and will not be disclosed to unauthorized third parties without prior written consent.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">7. Termination &amp; Suspension</h2>
            <p>
              HRC reserves the right to suspend or terminate your access to the Portal at any time, with or without notice, in the event of a breach of these Terms, non-payment, or security violations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">8. Disclaimer of Warranties &amp; Limitation of Liability</h2>
            <p>
              The Portal is provided on an &quot;as is&quot; and &quot;as available&quot; basis. While we strive for maximum uptime, reliability, and security, HRC does not warrant that the Portal will be entirely error-free or uninterrupted.
            </p>
            <p>
              To the fullest extent permitted by law, HRC shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use the Portal.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">9. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Republic of Ghana, without regard to its conflict of law principles.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">10. Contact Information</h2>
            <p>
              For questions regarding these Terms of Service, please contact:
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
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
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
