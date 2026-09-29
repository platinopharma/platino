import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import type { Pharmacy } from "@/lib/types";
import { INDIA_COUNTRY_PATH, INDIA_STATE_PATHS } from "@/lib/india-geo";

// Geo bounds of mainland India for projecting lat/lng -> SVG coords.
// MUST stay in sync with the bounds used to generate src/lib/india-geo.ts.
const BOUNDS = { minLng: 68, maxLng: 97.5, minLat: 6.5, maxLat: 37.5 };
const W = 440;
const H = 500;

function project(lat: number, lng: number) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * W;
  const y = H - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * H;
  return { x, y };
}

const MARKER_COLOR: Record<string, string> = {
  verified: "var(--color-success)",
  active: "var(--color-success)",
  pending: "var(--color-warning)",
  docs_requested: "var(--color-info)",
  offline: "var(--color-muted-foreground)",
  rejected: "var(--color-destructive)",
  suspended: "var(--color-destructive)",
  blacklisted: "var(--color-foreground)",
};

const LEGEND = [
  { label: "Verified / Active", color: "var(--color-success)" },
  { label: "Pending review", color: "var(--color-warning)" },
  { label: "Docs requested", color: "var(--color-info)" },
  { label: "Rejected / Suspended", color: "var(--color-destructive)" },
];

type TooltipState =
  | { kind: "pharmacy"; data: Pharmacy; x: number; y: number }
  | { kind: "state"; name: string; count: number; x: number; y: number }
  | null;

export function IndiaMap({ pharmacies }: { pharmacies: Pharmacy[] }) {
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const [activeState, setActiveState] = useState<string | null>(null);
  const router = useRouter();

  // Pharmacy density per state for the choropleth shading.
  const { countByState, maxCount } = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of pharmacies) counts[p.state] = (counts[p.state] ?? 0) + 1;
    const max = Math.max(1, ...Object.values(counts));
    return { countByState: counts, maxCount: max };
  }, [pharmacies]);

  const stateFill = (name: string) => {
    const c = countByState[name] ?? 0;
    if (c === 0) return "var(--color-muted)";
    // 0.10 -> 0.42 opacity ramp by relative density
    const t = 0.1 + (c / maxCount) * 0.32;
    return `color-mix(in oklab, var(--color-primary) ${Math.round(t * 100)}%, transparent)`;
  };

  return (
    <div className="relative w-full min-w-0">
      <div className="relative w-full min-w-0 overflow-hidden">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="mx-auto h-auto w-full min-w-0 max-w-[440px]"
          role="group"
          aria-label="Map of India showing pharmacy distribution by state"
          onMouseLeave={() => {
            setTooltip(null);
            setActiveState(null);
          }}
        >
          <defs>
            <radialGradient id="india-glow" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </radialGradient>
            <filter id="marker-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="var(--color-foreground)" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Ambient glow behind the country */}
          <rect x="0" y="0" width={W} height={H} fill="url(#india-glow)" />

          {/* Choropleth: states shaded by pharmacy density */}
          <g strokeLinejoin="round">
            {INDIA_STATE_PATHS.map((s) => {
              const isActive = activeState === s.name;
              return (
                <path
                  key={s.name}
                  d={s.d}
                  fill={isActive ? "color-mix(in oklab, var(--color-primary) 50%, transparent)" : stateFill(s.name)}
                  stroke="var(--color-primary)"
                  strokeOpacity={isActive ? 0.7 : 0.25}
                  strokeWidth={isActive ? 1 : 0.6}
                  style={{ transition: "fill 0.2s, stroke-opacity 0.2s, stroke-width 0.2s", cursor: "pointer" }}
                  onMouseEnter={(e) => {
                    setActiveState(s.name);
                    const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                    setTooltip({
                      kind: "state",
                      name: s.name,
                      count: countByState[s.name] ?? 0,
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }}
                  onMouseMove={(e) => {
                    const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                    setTooltip((t) =>
                      t && t.kind === "state"
                        ? { ...t, x: e.clientX - rect.left, y: e.clientY - rect.top }
                        : t,
                    );
                  }}
                />
              );
            })}
          </g>

          {/* National outline on top for a crisp border */}
          <path
            d={INDIA_COUNTRY_PATH}
            fill="none"
            stroke="var(--color-primary)"
            strokeOpacity="0.5"
            strokeWidth="1.4"
            strokeLinejoin="round"
            pointerEvents="none"
          />

          {/* Pharmacy markers */}
          {pharmacies.map((p, i) => {
            if (typeof p.lat !== "number" || typeof p.lng !== "number" || isNaN(p.lat) || isNaN(p.lng)) {
              return null;
            }
            const { x, y } = project(p.lat, p.lng);
            const color = MARKER_COLOR[p.verification] ?? MARKER_COLOR[p.status] ?? "var(--color-primary)";
            const live = p.status === "active" || p.verification === "verified";
            const hovered = tooltip?.kind === "pharmacy" && tooltip.data.id === p.id;
            return (
              <motion.g
                key={p.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.012, type: "spring", stiffness: 300 }}
                style={{ cursor: "pointer" }}
                role="button"
                tabIndex={0}
                aria-label={`${p.storeName}, ${p.city}, ${p.state}. Status: ${p.status}. View profile.`}
                className="focus-visible:outline-none [&>circle:last-child]:focus-visible:stroke-ring"
                onFocus={() => setTooltip({ kind: "pharmacy", data: p, x: project(p.lat, p.lng).x, y: project(p.lat, p.lng).y })}
                onBlur={() => setTooltip(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/pharmacies/${p.id}`);
                  }
                }}
                onMouseEnter={(e) => {
                  const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                  setTooltip({ kind: "pharmacy", data: p, x: e.clientX - rect.left, y: e.clientY - rect.top });
                }}
                onMouseMove={(e) => {
                  const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                  setTooltip((t) =>
                    t && t.kind === "pharmacy" ? { ...t, x: e.clientX - rect.left, y: e.clientY - rect.top } : t,
                  );
                }}
                onMouseLeave={() => setTooltip(null)}
                onClick={() => router.push(`/pharmacies/${p.id}`)}
              >

                {live && (
                  <circle cx={x} cy={y} r="8" fill={color} opacity="0.2">
                    <animate attributeName="r" values="4;11;4" dur="2.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.35;0;0.35" dur="2.6s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={hovered ? 6.5 : 4}
                  fill={color}
                  stroke="var(--color-card)"
                  strokeWidth="1.5"
                  filter="url(#marker-shadow)"
                  style={{ transition: "r 0.15s" }}
                />
              </motion.g>
            );
          })}
        </svg>

        {/* Cursor-following tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded-xl border bg-popover px-3 py-2 text-xs shadow-soft"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {tooltip.kind === "pharmacy" ? (
              <>
                <div className="font-medium text-foreground">{tooltip.data.storeName}</div>
                <div className="text-muted-foreground">
                  {tooltip.data.city}, {tooltip.data.state}
                </div>
              </>
            ) : (
              <>
                <div className="font-medium text-foreground">{tooltip.name}</div>
                <div className="text-muted-foreground">
                  {tooltip.count} {tooltip.count === 1 ? "pharmacy" : "pharmacies"}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
        {LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="text-muted-foreground">Density</span>
          <span className="inline-block h-2 w-12 rounded-full" style={{
            background: "linear-gradient(to right, color-mix(in oklab, var(--color-primary) 10%, transparent), var(--color-primary))",
          }} />
        </div>
      </div>

      {/* Screen-reader summary of the same data shown visually on the map */}
      <div className="sr-only">
        <h3>Pharmacy distribution by state</h3>
        <ul>
          {Object.entries(countByState)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => (
              <li key={name}>
                {name}: {count} {count === 1 ? "pharmacy" : "pharmacies"}
              </li>
            ))}
        </ul>
      </div>
    </div>

  );
}
