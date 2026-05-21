import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listScans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("scans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row, error } = await supabase
      .from("scans")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Not found");
    return row;
  });

export const deleteScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("scans").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    const isAdmin = !!roleRow;
    if (!isAdmin) throw new Error("Forbidden");

    const { data: all, error } = await supabase
      .from("scans")
      .select("fruit_name, freshness_category, created_at, quality_score, freshness_score")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) throw new Error(error.message);

    const rows = all ?? [];
    const total = rows.length;
    const fresh = rows.filter((r) => ["Fresh", "Ripe"].includes(r.freshness_category)).length;
    const rotten = rows.filter((r) => ["Rotten", "Damaged"].includes(r.freshness_category)).length;

    const fruitCounts: Record<string, number> = {};
    for (const r of rows) fruitCounts[r.fruit_name] = (fruitCounts[r.fruit_name] ?? 0) + 1;
    const top = Object.entries(fruitCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    // last 14 days bucket
    const days: { date: string; count: number }[] = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, count: 0 });
    }
    const byDate = new Map(days.map((d) => [d.date, d]));
    for (const r of rows) {
      const key = r.created_at.slice(0, 10);
      const b = byDate.get(key);
      if (b) b.count += 1;
    }

    const avgQuality = total ? Math.round(rows.reduce((s, r) => s + r.quality_score, 0) / total) : 0;
    const avgFreshness = total ? Math.round(rows.reduce((s, r) => s + r.freshness_score, 0) / total) : 0;

    return {
      total,
      fresh,
      rotten,
      top,
      avgQuality,
      avgFreshness,
      days,
      fruitCounts,
    };
  });

export const makeMeAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Bootstrap helper: first user calling this becomes admin if no admin exists
    const { supabase, userId } = context;
    const { data: existing } = await supabase.from("user_roles").select("user_id").eq("role", "admin").limit(1);
    if (existing && existing.length > 0) throw new Error("An admin already exists.");
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
