import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { analyzeFruitPublic } from "@/lib/fruit-public.functions";
import { UploadZone } from "@/components/upload-zone";
import { ScanResults } from "@/components/scan-results";
import { SiteHeader } from "@/components/site-header";
import { downloadScanReport } from "@/lib/pdf-report";
import type { Database } from "@/integrations/supabase/types";
import type { AnalysisResult } from "@/lib/scans.types";

type Scan = Database["public"]["Tables"]["scans"]["Row"];

export const Route = createFileRoute("/app")({ component: AppPage });

function toScan(result: AnalysisResult, imageUrl: string): Scan {
  return {
    id: crypto.randomUUID(),
    user_id: "anonymous",
    image_url: imageUrl,
    fruit_name: result.fruit_name,
    is_supported: result.is_supported,
    fruit_confidence: result.fruit_confidence,
    freshness_category: result.freshness_category,
    freshness_confidence: result.freshness_confidence,
    freshness_score: Math.round(result.freshness_score),
    quality_score: Math.round(result.quality_score),
    damage_score: Math.round(result.damage_score),
    ripeness_score: Math.round(result.ripeness_score),
    recommendation: result.recommendation,
    observations: (result.observations ?? []) as never,
    highlights: (result.highlights ?? []) as never,
    raw_analysis: result as never,
    created_at: new Date().toISOString(),
  };
}

function AppPage() {
  const analyze = useServerFn(analyzeFruitPublic);
  const [busy, setBusy] = useState(false);
  const [scan, setScan] = useState<Scan | null>(null);

  const handleFile = async (file: File) => {
    setBusy(true);
    setScan(null);
    try {
      const mime = (file.type === "image/png" ? "image/png" : "image/jpeg") as "image/png" | "image/jpeg";
      const buf = await file.arrayBuffer();
      let bin = "";
      const bytes = new Uint8Array(buf);
      for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
      const imageBase64 = btoa(bin);
      const { result, previewDataUrl } = await analyze({ data: { imageBase64, mimeType: mime } });
      setScan(toScan(result, previewDataUrl));
      toast.success("Analysis complete!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-display text-4xl">Analyze a fruit</h1>
          <p className="mt-2 text-muted-foreground">
            Upload or capture a clear photo of a Mango, Banana, Apple, Orange, or Guava.
          </p>
        </div>
        <UploadZone onFile={handleFile} busy={busy} />
        {scan && (
          <div className="mt-10">
            <ScanResults scan={scan} onDownload={() => downloadScanReport(scan)} />
          </div>
        )}
      </main>
    </div>
  );
}
