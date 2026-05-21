import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listScans, deleteScan } from "@/lib/scans.functions";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { downloadScanReport } from "@/lib/pdf-report";
import { FileDown, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SUPPORTED_FRUITS } from "@/lib/scans.types";

export const Route = createFileRoute("/_authenticated/history")({ component: HistoryPage });

function HistoryPage() {
  const list = useServerFn(listScans);
  const del = useServerFn(deleteScan);
  const { data, isLoading, refetch } = useQuery({ queryKey: ["scans"], queryFn: () => list() });
  const [q, setQ] = useState("");
  const [fruit, setFruit] = useState<string>("all");

  const rows = useMemo(() => {
    const all = data ?? [];
    return all.filter((r) =>
      (fruit === "all" || r.fruit_name === fruit) &&
      (q === "" || r.fruit_name.toLowerCase().includes(q.toLowerCase()) || r.freshness_category.toLowerCase().includes(q.toLowerCase())),
    );
  }, [data, q, fruit]);

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="font-display text-4xl">Scan history</h1>
      <p className="mt-2 text-muted-foreground">Review and export your previous fruit analyses.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={fruit} onValueChange={setFruit}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Fruit" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All fruits</SelectItem>
            {SUPPORTED_FRUITS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-accent" /></div>
      ) : rows.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">No scans yet — analyze your first fruit!</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((s) => (
            <Card key={s.id} className="overflow-hidden">
              <img src={s.image_url} alt={s.fruit_name} className="h-44 w-full object-cover" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg">{s.fruit_name}</h3>
                  <Badge variant="outline">{s.freshness_category}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div><div className="font-semibold">{s.freshness_score}</div><div className="text-muted-foreground">Fresh</div></div>
                  <div><div className="font-semibold">{s.quality_score}</div><div className="text-muted-foreground">Quality</div></div>
                  <div><div className="font-semibold">{s.damage_score}</div><div className="text-muted-foreground">Damage</div></div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => downloadScanReport(s)}>
                    <FileDown className="mr-2 h-4 w-4" /> PDF
                  </Button>
                  <Button variant="ghost" size="sm" onClick={async () => {
                    await del({ data: { id: s.id } }); toast.success("Deleted"); refetch();
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
