import { useRef } from "react";
import type { PointerEvent } from "react";
import {
  WEDGE_ORDER,
  WEDGE_LABELS,
  pointToMissDirection,
  wedgeBounds,
  polarToPoint,
  angleFromCenter,
} from "./compassMath";
import type { MissDirection } from "./compassMath";

export interface MissCompassProps {
  value: MissDirection;
  onChange: (value: MissDirection) => void;
  size?: number;
  disabled?: boolean;
  onDebugTap?: (info: { x: number; y: number; angle: number; dist: number }) => void;
}

const CENTER_RADIUS_RATIO = 0.28;

function describeWedge(cx: number, cy: number, radius: number, innerRadius: number, startDeg: number, endDeg: number) {
  const outerStart = polarToPoint(cx, cy, radius, startDeg);
  const outerEnd = polarToPoint(cx, cy, radius, endDeg);
  const innerStart = polarToPoint(cx, cy, innerRadius, startDeg);
  const innerEnd = polarToPoint(cx, cy, innerRadius, endDeg);
  return [
    `M ${innerStart.x} ${innerStart.y}`,
    `L ${outerStart.x} ${outerStart.y}`,
    `A ${radius} ${radius} 0 0 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 0 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

export function MissCompass({ value, onChange, size = 220, disabled, onDebugTap }: MissCompassProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 4;
  const innerRadius = radius * CENTER_RADIUS_RATIO;

  function handlePointerUp(e: PointerEvent<SVGSVGElement>) {
    if (disabled || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * size;
    const y = ((e.clientY - rect.top) / rect.height) * size;
    const direction = pointToMissDirection(x, y, cx, cy, radius, CENTER_RADIUS_RATIO);
    const dist = Math.hypot(x - cx, y - cy);
    onDebugTap?.({ x, y, angle: angleFromCenter(x - cx, y - cy), dist });
    onChange(direction);
  }

  return (
    <div className="miss-compass" style={{ width: size, touchAction: "none" }}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        onPointerUp={handlePointerUp}
        style={{ cursor: disabled ? "default" : "pointer" }}
        role="presentation"
      >
        {WEDGE_ORDER.map((direction) => {
          const [start, end] = wedgeBounds(direction);
          const labelPos = polarToPoint(cx, cy, (radius + innerRadius) / 2, (start + end) / 2);
          const active = value === direction;
          return (
            <g key={direction}>
              <path
                d={describeWedge(cx, cy, radius, innerRadius, start, end)}
                fill={active ? "var(--compass-active, #2f8f4e)" : "var(--compass-wedge, #e4e4e4)"}
                stroke="var(--compass-bg, #fff)"
                strokeWidth={2}
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={size * 0.045}
                fontWeight={600}
                fill={active ? "#fff" : "#333"}
                pointerEvents="none"
              >
                {WEDGE_LABELS[direction]}
              </text>
            </g>
          );
        })}
        <circle
          cx={cx}
          cy={cy}
          r={innerRadius}
          fill={value === "straight" ? "var(--compass-active, #2f8f4e)" : "var(--compass-center, #fafafa)"}
          stroke="var(--compass-bg, #fff)"
          strokeWidth={2}
        />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.04}
          fontWeight={600}
          fill={value === "straight" ? "#fff" : "#333"}
          pointerEvents="none"
        >
          STRAIGHT
        </text>
      </svg>

      <div className="miss-compass-a11y" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        <button type="button" disabled={disabled} aria-label="Straight" onClick={() => onChange("straight")}>
          Straight
        </button>
        {WEDGE_ORDER.map((direction) => (
          <button
            key={direction}
            type="button"
            disabled={disabled}
            aria-label={WEDGE_LABELS[direction]}
            onClick={() => onChange(direction)}
          >
            {WEDGE_LABELS[direction]}
          </button>
        ))}
      </div>
    </div>
  );
}
