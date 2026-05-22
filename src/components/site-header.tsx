import { Link, useRouter } from "@tanstack/react-router";
import { Apple, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/" });
  };

  const nav = user
    ? [
        { to: "/app", label: "Analyze" },
        { to: "/history", label: "History" },
        { to: "/admin", label: "Admin" },
      ]
    : [
        { to: "/app", label: "Analyze" },
        { to: "/#features", label: "Features" },
        { to: "/#how", label: "How it works" },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Apple className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold">FruitSense AI</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to as never}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link to="/profile" className="text-sm text-muted-foreground hover:text-foreground">
                {user.email}
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
              <Link to="/signup"><Button size="sm">Get started</Button></Link>
            </>
          )}
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((o) => !o)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className={cn("border-t border-border/50 md:hidden", open ? "block" : "hidden")}>
        <div className="container mx-auto flex flex-col gap-1 px-4 py-3">
          {nav.map((n) => (
            <Link key={n.to} to={n.to as never} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-muted">
              {n.label}
            </Link>
          ))}
          {user ? (
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Sign out</Button>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1"><Button variant="outline" className="w-full">Sign in</Button></Link>
              <Link to="/signup" className="flex-1"><Button className="w-full">Get started</Button></Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
