import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { analyzeFruit } from "@/lib/fruit.functions";
import { UploadZone } from "@/components/upload-zone";
import { ScanResults } from "@/components/scan-results";
import { downloadScanReport } from "@/lib/pdf-report";
import type { Database } from "@/integrations/supabase/types";

type Scan = Database["public"]["Tables"]["scans"]["Row"];

export const Route = createFileRoute("/_authenticated/app")({ component: AppPage });

function AppPage() {
  const { user } = useAuth();
  const analyze = useServerFn(analyzeFruit);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [scan, setScan] = useState<Scan | null>(null);

  const handleFile = async (file: File) => {
    if (!user) return;
    setBusy(true);
    setScan(null);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("fruit-images").upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("fruit-images").getPublicUrl(path);
      const result = await analyze({ data: { imageUrl: pub.publicUrl } });
      setScan(result as Scan);
      toast.success("Analysis complete!");
      router.invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-4xl">Analyze a fruit</h1>
        <p className="mt-2 text-muted-foreground">Upload or capture a clear photo of a Mango, Banana, Apple, Orange, or Guava.</p>
      </div>
      <UploadZone onFile={handleFile} busy={busy} />
      {scan && (
        <div className="mt-10">
          <ScanResults scan={scan} onDownload={() => downloadScanReport(scan)} />
        </div>
      )}
    </main>
  );
}
