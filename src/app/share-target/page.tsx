import { Suspense } from "react";
import { ShareTargetClient } from "@/components/ShareTargetClient";

export default function ShareTargetPage() {
  return (
    <div>
      <p className="mb-4 text-base font-medium">Reel compartido a Andanza</p>
      <Suspense fallback={<p className="text-sm text-text-secondary">Cargando…</p>}>
        <ShareTargetClient />
      </Suspense>
    </div>
  );
}
