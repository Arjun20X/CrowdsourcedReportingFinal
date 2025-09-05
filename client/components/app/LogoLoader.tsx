import React from "react";

export function LogoLoader({ size = 200 }: { size?: number }) {
  const saffron = "#ff9933";
  const green = "#138808";
  const handBlue = "#1e40af"; // tailwind blue-800
  const chakraBlue = "#0a3b8f";

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Loading"
        className="[animation-delay:0ms]"
      >
        {/* Orange arc (draw clockwise) */}
        <path
          d="M30,100 A70,70 0 0 1 100,30"
          fill="none"
          stroke={saffron}
          strokeWidth={10}
          strokeLinecap="round"
          className="cp-arc cp-arc-1"
        />
        {/* Green arc (draw clockwise) */}
        <path
          d="M100,30 A70,70 0 0 1 170,100"
          fill="none"
          stroke={green}
          strokeWidth={10}
          strokeLinecap="round"
          className="cp-arc cp-arc-2"
        />

        {/* Cupped hand rises in */}
        <g className="cp-rise">
          <path
            d="M40 140 C 70 150, 130 150, 160 140 C 155 152, 140 160, 120 165 C 95 172, 65 170, 48 160 C 43 157, 40 150, 40 140 Z"
            fill={handBlue}
            opacity="0.95"
          />
          {/* Thumb */}
          <path d="M55 145 C 58 138, 70 135, 80 138 C 74 145, 65 148, 58 148 Z" fill={handBlue} />
        </g>

        {/* Ashok Chakra appears and spins */}
        <g className="cp-chakra cp-fade" transform="translate(100 120)">
          <circle r="15" fill="none" stroke={chakraBlue} strokeWidth="3" />
          <circle r="2" fill={chakraBlue} />
          {Array.from({ length: 24 }).map((_, i) => (
            <line
              key={i}
              x1="0"
              y1="3"
              x2="0"
              y2="14"
              stroke={chakraBlue}
              strokeWidth="2"
              transform={`rotate(${(360 / 24) * i})`}
            />
          ))}
        </g>

        {/* Subtle pulse for whole assembled mark */}
        <g className="cp-pulse" />
      </svg>

      <div className="cp-text-fade text-lg font-semibold tracking-wide">Sahaayak</div>

      <style>{`
        @keyframes cp-draw { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
        @keyframes cp-rise { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes cp-fade { from { opacity: 0; transform: translate(100px, 120px) scale(0.9); } to { opacity: 1; transform: translate(100px, 120px) scale(1); } }
        @keyframes cp-spin { from { transform: translate(100px,120px) rotate(0deg); } to { transform: translate(100px,120px) rotate(360deg); } }
        @keyframes cp-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
        @keyframes cp-text { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        .cp-arc { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: cp-draw 1s ease forwards; }
        .cp-arc-2 { animation-delay: .3s; }
        .cp-rise { animation: cp-rise .7s ease .9s forwards; opacity: 0; }
        .cp-chakra { animation: cp-spin 6s linear infinite 1.4s; }
        .cp-fade { animation-name: cp-fade, cp-spin; animation-duration: .6s, 6s; animation-timing-function: ease, linear; animation-delay: 1.3s, 1.4s; animation-fill-mode: forwards, none; }
        .cp-pulse { animation: cp-pulse 2.4s ease-in-out 2.2s infinite; transform-origin: 50% 60%; }
        .cp-text-fade { opacity: 0; animation: cp-text .8s ease 1.8s forwards; }
      `}</style>
    </div>
  );
}
