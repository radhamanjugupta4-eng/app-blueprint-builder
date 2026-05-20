import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/backup")({
  component: BackupPage,
});

const TABLES = ["characters", "story_realms", "syndicates", "abilities", "app_config"] as const;

function BackupPage() {
  const [busy, setBusy] = useState(false);

  const exportBackup = async () => {
    setBusy(true);
    try {
      const out: Record<string, unknown> = { exportedAt: new Date().toISOString() };
      for (const t of TABLES) {
        const { data, error } = await supabase.from(t).select("*");
        if (error) throw error;
        out[t] = data;
      }
      const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `orion-backup-${Date.now()}.json`; a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup downloaded");
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  const importBackup = async (file: File) => {
    setBusy(true);
    try {
      const json = JSON.parse(await file.text()) as Record<string, unknown>;
      for (const t of TABLES) {
        const rows = json[t] as unknown[] | undefined;
        if (!rows || !rows.length) continue;
        const { error } = await supabase.from(t).upsert(rows as never);
        if (error) throw error;
      }
      toast.success("Backup restored");
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl glass p-5">
        <h3 className="text-lg font-semibold">Export catalog & config</h3>
        <p className="mt-1 text-sm text-muted-foreground">Downloads characters, story realms, syndicates, abilities, and app_config as JSON.</p>
        <button disabled={busy} onClick={exportBackup} className="mt-4 inline-flex items-center gap-2 rounded-full cosmic-bg px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          <Download className="h-4 w-4" /> Download backup
        </button>
      </div>

      <div className="rounded-xl glass p-5">
        <h3 className="text-lg font-semibold">Restore from backup</h3>
        <p className="mt-1 text-sm text-muted-foreground">Upserts rows from a previous export. Existing rows with the same id are overwritten.</p>
        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full glass px-5 py-2 text-sm font-semibold">
          <Upload className="h-4 w-4" /> Choose file
          <input type="file" accept="application/json" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) importBackup(f); }} />
        </label>
      </div>
    </div>
  );
}
