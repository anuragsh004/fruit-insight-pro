import { useMemo } from "react";
import { Apple, Sparkles, ShieldAlert, ShieldCheck, Eye, FileDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";

type Scan = Database["public"]["Tables"]["scans"]["Row"];

const CATEGORY_TONE: Record<string, string> = {
  Fresh: "bg-success text-success-foreground",
  Ripe: "bg-accent text-accent-foreground",
  Overripe: "bg-warning text-warning-foreground",
  Damaged: "bg-destructive/80 text-destructive-foreground",
  Rotten: "bg-destructive text-destructive-foreground",
};

export function ScanResults({ scan, onDownload }: { scan: Scan; onDownload?: () => void }) {
  const obs = (scan.observations as unknown as string[]) ?? [];
  const highlights = (scan.highlights as unknown as Array<{ label: string; x: number; y: number; w: number; h: number }>) ?? [];
  const tone = CATEGORY_TONE[scan.freshness_category] ?? "bg-muted text-foreground";

  const consumable = useMemo(
    () => ["Fresh", "Ripe"].includes(scan.freshness_category),
    [scan.freshness_category],
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="font-display text-2xl">
              {scan.fruit_name} · <span className="text-gradient-fresh">{scan.freshness_category}</span>
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Fruit confidence {scan.fruit_confidence.toFixed(1)}% · Freshness confidence {scan.freshness_confidence.toFixed(1)}%
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={tone}>{scan.freshness_category}</Badge>
            {!scan.is_supported && <Badge variant="outline">Outside trained set</Badge>}
            {onDownload && (
              <Button variant="outline" size="sm" onClick={onDownload}>
                <FileDown className="mr-2 h-4 w-4" /> PDF Report
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Apple className="h-4 w-4 text-accent" />Fruit information</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <ScoreBar label="Detection confidence" value={Math.round(scan.fruit_confidence)} />
          <ScoreBar label="Ripeness score" value={scan.ripeness_score} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-accent" />Quality breakdown</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <ScoreBar label="Freshness score" value={scan.freshness_score} />
          <ScoreBar label="Quality score" value={scan.quality_score} />
          <ScoreBar label="Damage score" value={scan.damage_score} tone="warn" />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            {consumable ? <ShieldCheck className="h-4 w-4 text-success" /> : <ShieldAlert className="h-4 w-4 text-destructive" />}
            Consumption recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={consumable ? "text-success font-medium" : "text-destructive font-medium"}>
            {scan.recommendation}
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Eye className="h-4 w-4 text-accent" />Why did AI give this result?</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
            <div className="relative overflow-hidden rounded-2xl border bg-muted/30">
              <img src={scan.image_url} alt="Analyzed fruit" className="block w-full" />
              {highlights.map((h, i) => (
                <div
                  key={i}
                  className="pointer-events-none absolute border-2 border-warning shadow-[0_0_0_2px_oklch(0.18_0.03_75_/_0.4)]"
                  style={{
                    left: `${h.x * 100}%`,
                    top: `${h.y * 100}%`,
                    width: `${h.w * 100}%`,
                    height: `${h.h * 100}%`,
                  }}
                >
                  <span className="absolute -top-6 left-0 rounded bg-warning px-1.5 py-0.5 text-xs text-warning-foreground">
                    {h.label}
                  </span>
                </div>
              ))}
            </div>
            <ul className="space-y-2 text-sm">
              {obs.length === 0 && <li className="text-muted-foreground">No specific observations were returned.</li>}
              {obs.map((o, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ScoreBar({ label, value, tone }: { label: string; value: number; tone?: "warn" }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}/100</span>
      </div>
      <Progress value={value} className={tone === "warn" ? "[&>div]:bg-warning" : "[&>div]:bg-accent"} />
    </div>
  );
}
