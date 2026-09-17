import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Image
          src="/images/HRC-logo - Copy.png"
          alt="HRC Portal logo"
          width={40}
          height={40}
          className="h-10 w-10 rounded-lg object-contain"
          priority
        />
        <div>
          <p className="text-lg font-bold leading-tight">HRC Portal</p>
          <p className="text-xs text-muted-foreground">
            Hedge Resource Centre
          </p>
        </div>
      </div>
      {children}
      <footer className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
        <Link href="/privacy" className="hover:underline underline-offset-4">
          Privacy Policy
        </Link>
        <span>•</span>
        <Link href="/terms" className="hover:underline underline-offset-4">
          Terms of Service
        </Link>
      </footer>
    </div>
  );
}