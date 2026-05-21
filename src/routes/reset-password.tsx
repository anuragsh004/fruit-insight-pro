import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/reset-password")({ component: ResetPage });

function ResetPage() {
  const [mode, setMode] = useState<"request" | "update">("request");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      setMode("update");
    }
  }, []);

  const request = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Check your email for a reset link.");
  };

  const update = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Password updated."); window.location.href = "/app"; }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container mx-auto grid place-items-center px-4 py-16">
        <div className="glass-card w-full max-w-md rounded-3xl p-8">
          {mode === "request" ? (
            <>
              <h1 className="font-display text-2xl">Reset password</h1>
              <form onSubmit={request} className="mt-6 space-y-4">
                <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <Button type="submit" className="w-full" disabled={busy}>Send reset link</Button>
              </form>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl">Set a new password</h1>
              <form onSubmit={update} className="mt-6 space-y-4">
                <div><Label htmlFor="pw">New password</Label><Input id="pw" type="password" minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} required /></div>
                <Button type="submit" className="w-full" disabled={busy}>Update password</Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
