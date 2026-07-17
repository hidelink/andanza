"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { ItineraryMap } from "@/components/ItineraryMap";
import { generateItineraryAction } from "@/lib/actions";
import type { ItineraryPlan } from "@/lib/data";

type Tab = "mapa" | "lista";
type DayAccent = "teal" | "coral" | "amber";

const DAY_ACCENTS: DayAccent[] = ["teal", "coral", "amber"];

const ACCENT_STYLES: Record<DayAccent, { dot: string }> = {
  teal: { dot: "bg-brand-teal-100" },
  coral: { dot: "bg-brand-coral-100" },
  amber: { dot: "bg-brand-amber-100" },
};

function dayAccent(day: number): DayAccent {
  return DAY_ACCENTS[(day - 1) % DAY_ACCENTS.length];
}

export function ItineraryView({
  collectionId,
  collectionName,
  placesCount,
  initialPlan,
}: {
  collectionId: string;
  collectionName: string;
  placesCount: number;
  initialPlan: ItineraryPlan | null;
}) {
  const [plan, setPlan] = useState<ItineraryPlan | null>(initialPlan);
  const [days, setDays] = useState(initialPlan?.daysRequested ?? Math.min(3, Math.max(1, placesCount)));
  const [generating, setGenerating] = useState(false);
  const [tab, setTab] = useState<Tab>("mapa");

  async function generate() {
    setGenerating(true);
    const result = await generateItineraryAction(collectionId, days);
    setPlan(result);
    setGenerating(false);
  }

  const mapStops =
    plan?.days.flatMap((day) =>
      day.stops.map((stop, index) => ({
        id: stop.placeId,
        lat: stop.lat,
        lng: stop.lng,
        name: stop.name,
        day: day.day,
        order: index + 1,
      })),
    ) ?? [];

  return (
    <div>
      <Link
        href={`/colecciones/${collectionId}`}
        className="mb-3 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 19-7-7 7-7M5 12h14" />
        </svg>
        {collectionName}
      </Link>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-base font-medium">
          Plan de viaje{plan ? ` · ${plan.days.length} días` : ""}
        </p>
        {placesCount > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-secondary" htmlFor="days-input">
              Días
            </label>
            <input
              id="days-input"
              type="number"
              min={1}
              max={Math.max(1, placesCount)}
              value={days}
              onChange={(event) => setDays(Math.max(1, Number(event.target.value) || 1))}
              className="w-16 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm outline-none focus:border-border-strong"
            />
            <Button onClick={generate} disabled={generating}>
              {generating ? "Generando…" : plan ? "Regenerar plan" : "Generar plan"}
            </Button>
          </div>
        )}
      </div>

      {placesCount === 0 && (
        <p className="rounded-xl border border-border bg-surface p-4 text-sm text-text-secondary">
          Agrega lugares a esta colección antes de generar un plan de viaje.
        </p>
      )}

      {placesCount > 0 && !plan && !generating && (
        <p className="rounded-xl border border-border bg-surface p-4 text-sm text-text-secondary">
          Elige cuántos días dura tu viaje y genera el plan: agrupamos tus lugares por cercanía,
          sugerimos un orden de visita y estimamos tiempos de traslado.
        </p>
      )}

      {generating && (
        <p className="rounded-xl border border-border bg-surface p-4 text-sm text-text-secondary">
          Agrupando lugares por zona y calculando el plan…
        </p>
      )}

      {plan && !generating && (
        <div>
          <div className="mb-4 flex gap-1.5">
            <button
              onClick={() => setTab("mapa")}
              className={`rounded-lg border px-3.5 py-1.5 text-sm ${
                tab === "mapa"
                  ? "border-border-strong bg-surface-2 font-medium"
                  : "border-border text-text-secondary"
              }`}
            >
              Mapa
            </button>
            <button
              onClick={() => setTab("lista")}
              className={`rounded-lg border px-3.5 py-1.5 text-sm ${
                tab === "lista"
                  ? "border-border-strong bg-surface-2 font-medium"
                  : "border-border text-text-secondary"
              }`}
            >
              Lista
            </button>
          </div>

          {plan.days.length === 0 ? (
            <p className="rounded-xl border border-border bg-surface p-4 text-sm text-text-secondary">
              Ninguno de tus lugares tiene coordenadas todavía, así que no se pudo armar un plan.
            </p>
          ) : tab === "mapa" ? (
            <div>
              <ItineraryMap stops={mapStops} />
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                {plan.days.map((day) => (
                  <span key={day.day} className="flex items-center gap-1.5">
                    <span
                      className={`h-2.5 w-2.5 rounded-full border border-border ${ACCENT_STYLES[dayAccent(day.day)].dot}`}
                    />
                    Día {day.day} · {day.title}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {plan.days.map((day) => (
                <div key={day.day} className="rounded-xl border border-border bg-surface p-4">
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                    <span
                      className={`h-2 w-2 rounded-full border border-border ${ACCENT_STYLES[dayAccent(day.day)].dot}`}
                    />
                    Día {day.day} · {day.title}
                  </p>
                  <ol className="flex flex-col gap-1.5">
                    {day.stops.map((stop, index) => (
                      <li key={stop.placeId} className="text-sm text-text-secondary">
                        {index + 1}. {stop.name}
                        {stop.locationStatus === "inferred" && (
                          <span className="text-text-muted"> (ubicación aproximada)</span>
                        )}
                        {stop.travelToNextMinutes != null && (
                          <span className="text-text-muted"> → {stop.travelToNextMinutes} min →</span>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}

          {plan.unplaced.length > 0 && (
            <p className="mt-3 text-sm text-text-muted">
              {plan.unplaced.length} {plan.unplaced.length === 1 ? "lugar" : "lugares"} sin
              ubicación todavía, no incluido{plan.unplaced.length === 1 ? "" : "s"} en el plan:{" "}
              {plan.unplaced.map((p) => p.name).join(", ")}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
