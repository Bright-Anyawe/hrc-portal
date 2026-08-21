import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-brand-sky via-brand-navy-light to-brand-navy">
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-sky/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-brand-red/20 blur-3xl" />

      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-10">
        <Link
          href="/"
          className="animate-fade-in-up mb-6 flex items-center gap-3 rounded-lg px-2 py-1 transition-opacity hover:opacity-90"
        >
          <Image
            src="/images/HRC-logo - Copy.png"
            alt="HRC Portal logo"
            width={44}
            height={44}
            className="h-11 w-11 rounded-xl bg-white object-contain p-1 shadow-lg"
            priority
          />
          <div className="text-white">
            <p className="text-lg font-extrabold leading-tight">HRC Portal</p>
            <p className="text-xs text-white/70">Hedge Resource Centre</p>
          </div>
        </Link>

        <div className="animate-fade-in-up anim-delay-150">{children}</div>

        <Link
          href="/"
          className="animate-fade-in-up anim-delay-300 mt-6 inline-flex items-center gap-1.5 text-sm text-white/80 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>

      <footer className="relative flex items-center justify-center gap-2 pb-6 text-xs text-white/60">
        <ShieldCheck className="h-3.5 w-3.5" />
        Secure portal · Hedge Resource Centre
      </footer>
    </div>
  );
}
