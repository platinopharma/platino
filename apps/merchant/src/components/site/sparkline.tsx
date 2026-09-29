interface Props {
  data: number[];
  className?: string;
  stroke?: string;
  fill?: string;
  height?: number;
}

export function Sparkline({ data, className, stroke = "currentColor", fill, height = 60 }: Props) {
  const w = 300;
  const h = height;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 8) - 4] as const);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className}>
      {fill && <path d={area} fill={fill} />}
      <path d={path} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BarChart({ data, className, height = 120 }: { data: number[]; className?: string; height?: number }) {
  const max = Math.max(...data);
  return (
    <div className={className} style={{ height }}>
      <div className="flex h-full items-end gap-1.5">
        {data.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-ink/85 transition-all hover:bg-brand"
            style={{ height: `${(v / max) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}