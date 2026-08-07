import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4">
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
    </div>
  );
}