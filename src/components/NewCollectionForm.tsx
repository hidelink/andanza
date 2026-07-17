"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { createCollectionAction } from "@/lib/actions";

export function NewCollectionForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const id = await createCollectionAction(name.trim());
    setSaving(false);
    setOpen(false);
    setName("");
    router.push(`/colecciones/${id}`);
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Nueva colección
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        autoFocus
        type="text"
        placeholder="Nombre de la colección"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-border-strong"
      />
      <Button type="submit" disabled={saving}>
        {saving ? "Creando…" : "Crear"}
      </Button>
    </form>
  );
}
