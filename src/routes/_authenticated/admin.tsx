import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminStats, makeMeAdmin } from "@/lib/scans.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart, Cell, Legend } from "recharts";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({ component: AdminPage });

const COLORS = ["oklch(0.32 0.06 150)", "oklch(0.58 0.09 145)", "oklch(0.78 0.07 140)", "oklch(0.78 0.15 75)", "oklch(0.56 0.19 28)"];

function AdminPage() {
  const stats = useServerFn(adminStats);
  const become = useServerFn(makeMeAdmin);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["adminStats"], queryFn: () => stats(), retry: false });

  if (isLoading) return <div className="grid place-items-center py-32"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;

  if (error) {
    return (
      <main className="container mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-3xl">Admin access</h1>
        <p className="mt-3 text-muted-foreground">You don't have admin access yet. If you're the first user, you can claim it below.</p>
        <Button className="mt-6" onClick={async () => {
          try { await become(); toast.success("You are now an admin."); refetch(); }
          catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
        }}>Claim admin</Button>
      </main>
    );
  }

  const d = data!;
  const pie = Object.entries(d.fruitCounts).map(([name, value]) => ({ name, value }));

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="font-display text-4xl">Admin dashboard</h1>
      <p className="mt-2 text-muted-foreground">System-wide statistics across all users.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total analyses" value={d.total} />
        <Stat label="Fresh / Ripe" value={d.fresh} tone="success" />
        <Stat label="Damaged / Rotten" value={d.rotten} tone="destructive" />
        <Stat label="Most analyzed" value={d.top} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Scans · last 14 days</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.days}>
                <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="oklch(0.58 0.09 145)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Fruit distribution</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" outerRadius={90} label>
                  {pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Stat label="Average quality" value={`${d.avgQuality}/100`} />
        <Stat label="Average freshness" value={`${d.avgFreshness}/100`} />
      </div>
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: "success" | "destructive" }) {
  const color = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "";
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`mt-2 font-display text-3xl ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
