import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: ReturnType<typeof import("@supabase/supabase-js").createClient>, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  if (!roles.includes("admin")) throw new Error("Forbidden: admin only");
}

export const giftPoints = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    userId: z.string().uuid(),
    amount: z.number().int().min(-1_000_000).max(1_000_000),
    reason: z.string().max(120).default("owner_gift"),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase as never, userId!);
    const { error } = await supabase.rpc("owner_gift_points", {
      _user_id: data.userId, _amount: data.amount, _reason: data.reason,
    });
    if (error) throw error;
    return { ok: true };
  });

export const setPremium = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    userId: z.string().uuid(), isPremium: z.boolean(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase as never, userId!);
    const { error } = await supabase.rpc("owner_set_premium", {
      _user_id: data.userId, _is_premium: data.isPremium,
    });
    if (error) throw error;
    return { ok: true };
  });

export const setBanned = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(), banned: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase as never, userId!);
    const { error } = await supabase.from("profiles").update({ banned: data.banned }).eq("id", data.userId);
    if (error) throw error;
    return { ok: true };
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(), role: z.enum(["user", "admin"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase as never, userId!);

    const { error: deleteError } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", "admin");
    if (deleteError) throw deleteError;

    if (data.role === "admin") {
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({ user_id: data.userId, role: "admin" });
      if (insertError) throw insertError;
    }

    return { ok: true };
  });
