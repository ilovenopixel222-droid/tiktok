"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <Mail className="h-8 w-8 text-success" />
        </div>
        <h1 className="text-2xl font-bold">Check Your Email</h1>
        <p className="mt-3 text-sm text-muted">
          We&apos;ve sent a password reset link to <strong className="text-foreground">{email}</strong>.
          Click the link in the email to reset your password.
        </p>
        <Link href="/login">
          <Button variant="secondary" className="mt-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <h1 className="text-2xl font-bold text-center">Reset Password</h1>
      <p className="mt-2 text-center text-sm text-muted">
        Enter your email and we&apos;ll send you a reset link
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
      >
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button className="w-full" size="lg" glow>
          Send Reset Link
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary-light hover:text-primary transition-colors"
        >
          Sign in
        </Link>
      </p>
    </Card>
  );
}
