import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/profile")({ component: ProfilePage });

function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  return (
    <main className="container mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl">Your profile</h1>
      <Card className="mt-6">
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div><span className="text-muted-foreground">Email: </span>{user?.email}</div>
          <div><span className="text-muted-foreground">User ID: </span><code className="text-xs">{user?.id}</code></div>
          <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); router.navigate({ to: "/" }); }}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
