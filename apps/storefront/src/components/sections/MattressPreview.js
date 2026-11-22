import { useId } from "react";
import { mattressGeometry } from "@/lib/mattress-preview";

const coords = (points) => points.map((p) => `${p.x},${p.y}`).join(" ");

function Measurement({ start, end, offset, value, unit }) {
  const a = { x: start.x + offset.x, y: start.y + offset.y };
  const b = { x: end.x + offset.x, y: end.y + offset.y };
  const norm = Math.hypot(offset.x, offset.y);
  const nx = offset.x / norm;
  const ny = offset.y / norm;
  return (
    <g stroke="currentColor" strokeWidth="0.8">
      <path
        d={`M${start.x},${start.y} L${a.x + nx * 5},${a.y + ny * 5} M${end.x},${end.y} L${b.x + nx * 5},${b.y + ny * 5}`}
        opacity=".3"
      />
      <path d={`M${a.x},${a.y} L${b.x},${b.y}`} opacity=".8" />
      {[a, b].map((p, i) => (
        <path
          key={i}
          d={`M${p.x - nx * 3},${p.y - ny * 3} l${nx * 6},${ny * 6}`}
        />
      ))}
      <text
        x={(a.x + b.x) / 2 + nx * 12}
        y={(a.y + b.y) / 2 + ny * 12}
        dominantBaseline="middle"
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
        fontSize="11"
        direction="ltr"
      >
        {value} {unit}
      </text>
    </g>
  );
}

export default function MattressPreview({ size, unit }) {
  const id = useId().replace(/:/g, "");
  const geometry = mattressGeometry(size);
  if (!geometry) return null;
  const {
    width,
    length,
    dx,
    dy,
    origin,
    point,
    corners: [a, b, c, d],
  } = geometry;
  // Illustrative side depth is fixed, independent of the selected footprint.
  const depth = 13;
  return (
    <svg
      aria-hidden="true"
      data-mattress-preview={size}
      viewBox="0 0 360 240"
      fill="none"
      className="h-auto w-full text-blue-100"
    >
      <defs>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#dbe5f7" />
        </linearGradient>
        <linearGradient id={`${id}-side`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#b7b7b4" />
          <stop offset="1" stopColor="#777f8e" />
        </linearGradient>
        <pattern
          id={`${id}-quilt`}
          width="25"
          height="25"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M12.5 0Q12.5 12.5 25 12.5Q12.5 12.5 12.5 25Q12.5 12.5 0 12.5Q12.5 12.5 12.5 0Z"
            stroke="#9eacc2"
            strokeOpacity=".45"
            strokeWidth=".6"
          />
          <circle cx="12.5" cy="12.5" r="1" fill="#9eacc2" fillOpacity=".35" />
        </pattern>
      </defs>
      <polygon
        points={coords([
          point(0, 0, depth + 6),
          point(width, 0, depth + 6),
          point(width, length, depth + 6),
          point(0, length, depth + 6),
        ])}
        fill="#000"
        opacity=".18"
      />
      <polygon
        points={coords([
          d,
          c,
          point(width, length, depth),
          point(0, length, depth),
        ])}
        fill={`url(#${id}-side)`}
        stroke="#aebdd6"
        strokeWidth=".7"
        strokeLinejoin="round"
      />
      <polygon
        points={coords([
          b,
          c,
          point(width, length, depth),
          point(width, 0, depth),
        ])}
        fill="#8d949e"
        stroke="#aebdd6"
        strokeWidth=".7"
        strokeLinejoin="round"
      />
      <path
        d={`M${coords([point(0, length, depth - 3)])} L${coords([point(width, length, depth - 3)])} L${coords([point(width, 0, depth - 3)])}`}
        stroke="#dbe5f7"
        strokeWidth=".8"
        opacity=".7"
      />
      <g transform={`matrix(${dx} ${dy} ${-dx} ${dy} ${origin.x} ${origin.y})`}>
        <rect
          width={width}
          height={length}
          rx="5"
          fill={`url(#${id}-top)`}
          stroke="#e6edf9"
          strokeWidth="1.4"
        />
        <rect
          x="4"
          y="4"
          width={width - 8}
          height={length - 8}
          rx="4"
          fill={`url(#${id}-quilt)`}
          stroke="#aebdd6"
          strokeWidth=".8"
        />
      </g>
      <Measurement
        start={a}
        end={d}
        offset={{ x: -14, y: -24 }}
        value={length}
        unit={unit}
      />
      <Measurement
        start={a}
        end={b}
        offset={{ x: 14, y: -24 }}
        value={width}
        unit={unit}
      />
    </svg>
  );
}
