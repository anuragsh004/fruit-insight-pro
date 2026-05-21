import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password: pw,
      options: { data: { display_name: name }, emailRedirectTo: window.location.origin + "/app" },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — check your email to verify if required.");
    router.navigate({ to: "/app" });
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/app" });
    if (r.error) toast.error(r.error.message);
    else if (!r.redirected) router.navigate({ to: "/app" });
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container mx-auto grid place-items-center px-4 py-16">
        <div className="glass-card w-full max-w-md rounded-3xl p-8">
          <h1 className="font-display text-2xl">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Free, unlimited fruit analyses.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div><Label htmlFor="name">Name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div><Label htmlFor="pw">Password</Label><Input id="pw" type="password" minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} required /></div>
            <Button type="submit" className="w-full" disabled={busy}>{busy ? "Creating…" : "Create account"}</Button>
          </form>
          <div className="my-4 text-center text-xs uppercase text-muted-foreground">or</div>
          <Button variant="outline" className="w-full" onClick={google}>Continue with Google</Button>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-accent">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
