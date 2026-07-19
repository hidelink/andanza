"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { regenerateShareTokenAction } from "@/lib/actions";

export function ShareTokenCard({ initialToken }: { initialToken: string }) {
  const [token, setToken] = useState(initialToken);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [shareEndpoint, setShareEndpoint] = useState("https://andanza.vercel.app/api/share");

  useEffect(() => {
    setShareEndpoint(`${window.location.origin}/api/share`);
  }, []);

  async function copyToken() {
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function regenerate() {
    if (!confirm("Esto invalida el link/token actual. Vas a tener que actualizar tu Shortcut. ¿Continuar?")) {
      return;
    }
    setRegenerating(true);
    const next = await regenerateShareTokenAction();
    setToken(next);
    setRevealed(true);
    setRegenerating(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="mb-1 text-sm font-medium">Tu token personal</p>
        <p className="mb-3 text-sm text-text-secondary">
          Este token identifica tu cuenta cuando compartís un reel desde el Shortcut de iOS,
          sin necesidad de iniciar sesión ahí. No lo compartas con nadie.
        </p>
        <div className="mb-2 flex gap-2">
          <input
            readOnly
            type={revealed ? "text" : "password"}
            value={token}
            onClick={(event) => event.currentTarget.select()}
            className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none"
          />
          <Button onClick={() => setRevealed((value) => !value)}>
            {revealed ? "Ocultar" : "Mostrar"}
          </Button>
          <Button onClick={copyToken}>{copied ? "Copiado" : "Copiar"}</Button>
        </div>
        <button
          onClick={regenerate}
          disabled={regenerating}
          className="text-sm text-text-secondary underline decoration-dotted underline-offset-4 hover:text-text-primary"
        >
          {regenerating ? "Generando…" : "Regenerar token (invalida el anterior)"}
        </button>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="mb-3 text-sm font-medium">Cómo armar el Shortcut en iOS</p>
        <ol className="flex list-decimal flex-col gap-2 pl-4 text-sm text-text-secondary">
          <li>Abrí la app <strong>Atajos</strong> (Shortcuts) en tu iPhone y creá un nuevo atajo.</li>
          <li>
            Tocá el ícono de información (ⓘ) del atajo → activá <strong>&quot;Usar con la hoja de
            compartir&quot;</strong> → en tipos de contenido, marcá <strong>URLs</strong> y{" "}
            <strong>Texto</strong>.
          </li>
          <li>Agregá la acción <strong>&quot;Obtener texto de entrada&quot;</strong> (Get Text from Input).</li>
          <li>
            Agregá la acción <strong>&quot;Obtener contenido de URL&quot;</strong> (Get Contents of URL) y
            configurala así:
            <ul className="mt-1 flex list-disc flex-col gap-1 pl-4">
              <li>
                URL: <code className="rounded bg-surface-2 px-1 py-0.5">{shareEndpoint}</code>
              </li>
              <li>Método: POST</li>
              <li>
                Encabezados: <code className="rounded bg-surface-2 px-1 py-0.5">Authorization</code> ={" "}
                <code className="rounded bg-surface-2 px-1 py-0.5">Bearer {revealed ? token : "•••• (mostrá el token arriba)"}</code>
              </li>
              <li>
                Cuerpo de la petición: tipo JSON, con un campo <code className="rounded bg-surface-2 px-1 py-0.5">text</code>{" "}
                cuyo valor sea el resultado de &quot;Obtener texto de entrada&quot; del paso anterior.
              </li>
            </ul>
          </li>
          <li>Agregá la acción <strong>&quot;Mostrar resultado&quot;</strong> (Show Result) para ver la respuesta.</li>
          <li>
            Nombralo &quot;Agregar a Andanza&quot; y guardalo. Ya debería aparecer en el menú Compartir de
            Instagram.
          </li>
        </ol>
      </div>
    </div>
  );
}
