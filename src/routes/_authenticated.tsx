import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/use-auth";
import { SiteHeader } from "@/components/site-header";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({ component: Gate });

function Gate() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.navigate({ to: "/login" });
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="grid place-items-center py-32"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Outlet />
    </div>
  );
}
