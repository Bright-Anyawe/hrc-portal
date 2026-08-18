"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { GoogleIcon } from "@/components/google-icon";
import { login, type LoginState } from "@/app/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const error = searchParams.get("error");

  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    {}
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card className="w-full max-w-md border-white/50 bg-white shadow-2xl">
      <CardHeader className="border-b bg-muted/40">
        <span className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-red/10 px-2.5 py-0.5 text-xs font-semibold text-brand-red">
          <ShieldCheck className="h-3.5 w-3.5" />
          Secure sign in
        </span>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Enter your credentials to access your portal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {next && (
          <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            You need to sign in to view that page.
          </p>
        )}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error === "access_denied"
              ? "Google sign-in was cancelled."
              : error === "google_email_unverified"
                ? "Please verify your Google email address."
                : "Could not sign in with Google. Please try again."}
          </div>
        )}
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
<Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              required
              className="pl-9 pr-9"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          </div>
          {state.error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {state.error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase text-muted-foreground">
            <span className="bg-card px-2">or</span>
          </div>
        </div>
        <a
          href={`/api/auth/google?next=${encodeURIComponent(next ?? "/")}`}
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          <GoogleIcon className="mr-2 h-4 w-4" />
          Continue with Google
        </a>
      </CardContent>
    </Card>
  );
}
