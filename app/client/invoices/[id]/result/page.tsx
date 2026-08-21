import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Receipt,
  Download,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { confirmPayment } from "@/lib/payments";
import { formatCents } from "@/lib/invoices";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function PaymentResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ reference?: string }>;
}) {
  const session = await requireRole(["CLIENT"]);

  const { id } = await params;
  const { reference } = await searchParams;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { lines: true },
  });
  if (!invoice || invoice.clientId !== session.sub) redirect("/client/invoices");

  const total = formatCents(
    invoice.lines.reduce(
      (sum, l) => sum + l.quantity * l.unitPriceCents,
      0
    )
  );

  const result = reference
    ? await confirmPayment({ reference, ownerId: session.sub })
    : { ok: false, error: "No payment reference was provided by Paystack." };

  const success = result.ok || invoice.status === "PAID";

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 py-10 text-center">
      {success ? (
        <div className="animate-pop-in flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-600/20">
          <CheckCircle2 className="h-8 w-8" />
        </div>
      ) : (
        <div className="animate-pop-in flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <XCircle className="h-8 w-8" />
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {success ? "Payment received" : "Payment not completed"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {success
            ? `Thank you. Your payment for invoice ${invoice.number} was recorded.`
            : result.error}
        </p>
      </div>

      {success && reference && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-4 w-4 text-brand-gold" />
              Payment details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 pt-0 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invoice</span>
              <span className="font-medium">{invoice.number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">{total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-mono text-xs">{reference}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        {!success && (
          <Link
            href={`/client/invoices/${id}`}
            className={buttonVariants({ variant: "default" })}
          >
            <ArrowLeft className="h-4 w-4" />
            Try again
          </Link>
        )}
        <Link
          href="/client/invoices"
          className={buttonVariants({ variant: "outline" })}
        >
          View your invoices
        </Link>
        <a
          href={`/api/invoices/${invoice.id}/pdf`}
          className={buttonVariants({ variant: "outline" })}
        >
          <Download className="h-4 w-4" />
          Download PDF
        </a>
      </div>

      <p className="text-xs text-muted-foreground">
        Need help? Contact Hedge Resource Centre support.
      </p>
    </div>
  );
}