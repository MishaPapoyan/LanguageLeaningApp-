"use client";

/**
 * Lightweight SVG chart components — replaces recharts (~390 kB).
 * Each component is a thin wrapper around inline SVG, totaling < 5 kB.
 */

import { useState } from "react";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Shared tooltip                                                           */
/* ────────────────────────────────────────────────────────────────────────── */

function Tip({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y - 44,
        transform: "translateX(-50%)",
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: "4px 10px",
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
        pointerEvents: "none",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        zIndex: 10,
      }}
    >
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Bar Chart                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  barColor?: string;
  highlightMax?: boolean;
  formatValue?: (v: number) => string;
}

export function SimpleBarChart({
  data,
  height = 200,
  barColor = "#3b82f6",
  highlightMax = false,
  formatValue = (v) => String(v),
}: BarChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const maxIdx = data.findIndex((d) => d.value === maxVal);
  const W = 100;
  const gap = 2;
  const barW = Math.max((W - gap * data.length) / data.length, 2);
  const chartTop = 10;
  const chartH = height - 40;

  return (
    <div style={{ position: "relative", width: "100%", height }}>
      {hover !== null && (
        <Tip
          x={(hover * (barW + gap) + barW / 2) * (100 / W) * 0.01 * (typeof window !== "undefined" ? 300 : 300)}
          y={chartTop + chartH - (data[hover].value / maxVal) * chartH}
        >
          {data[hover].label}: {formatValue(data[hover].value)}
        </Tip>
      )}
      <svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none">
        {data.map((d, i) => {
          const barH = maxVal > 0 ? (d.value / maxVal) * chartH : 0;
          const x = i * (barW + gap) + gap / 2;
          const y = chartTop + chartH - barH;
          const fill =
            d.color ?? (highlightMax && i === maxIdx ? "#7c3aed" : barColor);
          const isActive = hover === i;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(barH, 0.5)}
                rx={Math.min(barW / 3, 3)}
                fill={isActive ? fill : fill}
                opacity={isActive ? 1 : 0.85}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "default", transition: "opacity 0.15s" }}
              />
              {/* X label */}
              <text
                x={x + barW / 2}
                y={height - 4}
                textAnchor="middle"
                fontSize={Math.min(barW * 0.7, 4.5)}
                fill="#94a3b8"
              >
                {d.label}
              </text>
            </g>
          );
        })}
        {/* Y zero line */}
        <line x1="0" y1={chartTop + chartH} x2={W} y2={chartTop + chartH} stroke="#e2e8f0" strokeWidth="0.3" />
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Stacked Bar Chart                                                        */
/* ────────────────────────────────────────────────────────────────────────── */

interface StackedBarProps {
  data: { label: string; values: { key: string; value: number; color: string }[] }[];
  height?: number;
  legend?: { key: string; label: string; color: string }[];
}

export function StackedBarChart({ data, height = 220, legend }: StackedBarProps) {
  const maxTotal = Math.max(...data.map((d) => d.values.reduce((s, v) => s + v.value, 0)), 1);
  const W = 100;
  const gap = 2;
  const barW = Math.max((W - gap * data.length) / data.length, 2);
  const chartTop = 10;
  const chartH = height - 40;

  return (
    <div style={{ width: "100%" }}>
      <svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none">
        {data.map((d, i) => {
          const x = i * (barW + gap) + gap / 2;
          let accH = 0;
          return (
            <g key={i}>
              {d.values.map((v, vi) => {
                const segH = (v.value / maxTotal) * chartH;
                accH += segH;
                const y = chartTop + chartH - accH;
                const isTop = vi === d.values.length - 1;
                return (
                  <rect
                    key={v.key}
                    x={x}
                    y={y}
                    width={barW}
                    height={Math.max(segH, 0)}
                    rx={isTop ? Math.min(barW / 3, 3) : 0}
                    fill={v.color}
                    opacity={0.85}
                  />
                );
              })}
              <text
                x={x + barW / 2}
                y={height - 4}
                textAnchor="middle"
                fontSize={Math.min(barW * 0.7, 4.5)}
                fill="#94a3b8"
              >
                {d.label}
              </text>
            </g>
          );
        })}
        <line x1="0" y1={chartTop + chartH} x2={W} y2={chartTop + chartH} stroke="#e2e8f0" strokeWidth="0.3" />
      </svg>
      {legend && (
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 8 }}>
          {legend.map((l) => (
            <div key={l.key} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b" }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Area Chart                                                               */
/* ────────────────────────────────────────────────────────────────────────── */

interface AreaChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  formatValue?: (v: number) => string;
}

export function SimpleAreaChart({
  data,
  height = 200,
  color = "#3b82f6",
  formatValue = (v) => String(v),
}: AreaChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const W = 100;
  const chartTop = 10;
  const chartH = height - 40;
  const pts = data.map((d, i) => ({
    x: data.length > 1 ? (i / (data.length - 1)) * W : W / 2,
    y: chartTop + chartH - (d.value / maxVal) * chartH,
  }));
  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${pts[0]?.x ?? 0},${chartTop + chartH} ${line} ${pts[pts.length - 1]?.x ?? W},${chartTop + chartH}`;

  return (
    <div style={{ position: "relative", width: "100%", height }}>
      {hover !== null && pts[hover] && (
        <Tip x={(pts[hover].x / W) * 100} y={pts[hover].y}>
          {data[hover].label}: {formatValue(data[hover].value)}
        </Tip>
      )}
      <svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#areaFill)" />
        <polyline points={line} fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hover === i ? 2.5 : 1.5}
            fill={color}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: "default" }}
          />
        ))}
        {/* X labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={pts[i].x}
            y={height - 4}
            textAnchor="middle"
            fontSize="4"
            fill="#94a3b8"
          >
            {d.label}
          </text>
        ))}
        <line x1="0" y1={chartTop + chartH} x2={W} y2={chartTop + chartH} stroke="#e2e8f0" strokeWidth="0.3" />
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Line Chart                                                               */
/* ────────────────────────────────────────────────────────────────────────── */

interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  formatValue?: (v: number) => string;
  domain?: [number, number];
}

export function SimpleLineChart({
  data,
  height = 220,
  color = "#ec4899",
  formatValue = (v) => `${v}%`,
  domain,
}: LineChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const minVal = domain?.[0] ?? 0;
  const maxVal = domain?.[1] ?? Math.max(...data.map((d) => d.value), 1);
  const range = maxVal - minVal || 1;
  const W = 100;
  const chartTop = 10;
  const chartH = height - 40;
  const pts = data.map((d, i) => ({
    x: data.length > 1 ? (i / (data.length - 1)) * W : W / 2,
    y: chartTop + chartH - ((d.value - minVal) / range) * chartH,
  }));
  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div style={{ position: "relative", width: "100%", height }}>
      {hover !== null && pts[hover] && (
        <Tip x={(pts[hover].x / W) * 100} y={pts[hover].y}>
          {data[hover].label}: {formatValue(data[hover].value)}
        </Tip>
      )}
      <svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none">
        <polyline points={line} fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hover === i ? 2.5 : 1.8}
            fill={color}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: "default" }}
          />
        ))}
        {data.map((d, i) => (
          <text key={i} x={pts[i].x} y={height - 4} textAnchor="middle" fontSize="4" fill="#94a3b8">
            {d.label}
          </text>
        ))}
        <line x1="0" y1={chartTop + chartH} x2={W} y2={chartTop + chartH} stroke="#e2e8f0" strokeWidth="0.3" />
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Donut / Pie Chart                                                        */
/* ────────────────────────────────────────────────────────────────────────── */

interface PieChartProps {
  data: { name: string; value: number; color: string }[];
  size?: number;
  innerRadius?: number;
}

export function SimplePieChart({ data, size = 160, innerRadius = 50 }: PieChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const innerR = innerRadius;
  let acc = 0;

  function arcPath(start: number, end: number, outer: number, inner: number) {
    const s1 = (start - 0.25) * 2 * Math.PI;
    const e1 = (end - 0.25) * 2 * Math.PI;
    const largeArc = end - start > 0.5 ? 1 : 0;
    const x1 = cx + outer * Math.cos(s1);
    const y1 = cy + outer * Math.sin(s1);
    const x2 = cx + outer * Math.cos(e1);
    const y2 = cy + outer * Math.sin(e1);
    const x3 = cx + inner * Math.cos(e1);
    const y3 = cy + inner * Math.sin(e1);
    const x4 = cx + inner * Math.cos(s1);
    const y4 = cy + inner * Math.sin(s1);
    return `M${x1},${y1} A${outer},${outer} 0 ${largeArc} 1 ${x2},${y2} L${x3},${y3} A${inner},${inner} 0 ${largeArc} 0 ${x4},${y4} Z`;
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((d) => {
        const start = acc;
        const slice = d.value / total;
        acc += slice;
        // Skip tiny slices
        if (slice < 0.005) return null;
        return (
          <path
            key={d.name}
            d={arcPath(start, start + slice - 0.003, outerR, innerR)}
            fill={d.color}
          >
            <title>{d.name}: {d.value}</title>
          </path>
        );
      })}
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Radar Chart                                                              */
/* ────────────────────────────────────────────────────────────────────────── */

interface RadarChartProps {
  data: { label: string; value: number; max: number }[];
  size?: number;
  color?: string;
}

export function SimpleRadarChart({ data, size = 220, color = "#3b82f6" }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 30;
  const n = data.length;

  function getPoint(i: number, r: number) {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  const rings = [0.25, 0.5, 0.75, 1];
  const valuePoints = data.map((d, i) => getPoint(i, (d.value / (d.max || 100)) * R));
  const polygon = valuePoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg width="100%" height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid rings */}
      {rings.map((r) => (
        <polygon
          key={r}
          points={data.map((_, i) => {
            const p = getPoint(i, r * R);
            return `${p.x},${p.y}`;
          }).join(" ")}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="0.8"
        />
      ))}
      {/* Axis lines */}
      {data.map((_, i) => {
        const p = getPoint(i, R);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="0.5" />;
      })}
      {/* Value area */}
      <polygon points={polygon} fill={color} fillOpacity={0.2} stroke={color} strokeWidth="1.5" />
      {/* Value dots */}
      {valuePoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
      ))}
      {/* Labels */}
      {data.map((d, i) => {
        const p = getPoint(i, R + 16);
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#64748b">
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
