type Props = {
  isPlaying: boolean;
  labelColor: string;
  coverImage?: string;
  size?: number;
};

export default function VinylDisc({ isPlaying, labelColor, coverImage, size = 260 }: Props) {
  const c = size / 2;
  const grooves = [0.82, 0.72, 0.62, 0.52, 0.44, 0.37, 0.31].map((r) => Math.round(r * c));
  const labelR = Math.round(0.26 * c);
  const imgR = Math.round(0.25 * c);
  const holeR = Math.round(0.04 * c);
  const clipId = `vinyl-cover-${size}`;

  return (
    <div
      className={`rounded-full ${isPlaying ? "animate-vinyl" : ""}`}
      style={{ width: size, height: size, willChange: "transform" }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        style={{ display: "block" }}
      >
        <defs>
          <clipPath id={clipId}>
            <circle cx={c} cy={c} r={imgR} />
          </clipPath>
        </defs>
        {/* Disc body */}
        <circle cx={c} cy={c} r={c - 1} fill="#111111" />

        {/* Groove rings */}
        {grooves.map((r) => (
          <circle
            key={r}
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.035)"
            strokeWidth="1"
          />
        ))}

        {/* Radial sheen */}
        <circle
          cx={c}
          cy={c}
          r={c - 1}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={Math.round(c * 0.55)}
          strokeDasharray={`${Math.round(c * 0.6)} ${Math.round(c * 0.8)}`}
        />

        {/* Center label base */}
        <circle cx={c} cy={c} r={labelR} fill={labelColor} />

        {/* Cover art image clipped to center circle */}
        {coverImage ? (
          <image
            href={coverImage}
            x={c - imgR}
            y={c - imgR}
            width={imgR * 2}
            height={imgR * 2}
            clipPath={`url(#${clipId})`}
            preserveAspectRatio="xMidYMid slice"
          />
        ) : (
          <circle cx={c} cy={c} r={imgR} fill={labelColor} />
        )}

        {/* Cover ring border */}
        <circle
          cx={c}
          cy={c}
          r={labelR}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1.5"
        />

        {/* Subtle inner shadow ring */}
        <circle cx={c} cy={c} r={labelR - 3} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="3" />

        {/* Center hole */}
        <circle cx={c} cy={c} r={holeR} fill="#0d0d0d" />
        <circle cx={c} cy={c} r={holeR} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />

        {/* Highlight glint */}
        <ellipse
          cx={c - Math.round(c * 0.25)}
          cy={c - Math.round(c * 0.3)}
          rx={Math.round(c * 0.12)}
          ry={Math.round(c * 0.06)}
          fill="rgba(255,255,255,0.06)"
          transform={`rotate(-35 ${c - Math.round(c * 0.25)} ${c - Math.round(c * 0.3)})`}
        />
        <ellipse
          cx={c + Math.round(c * 0.3)}
          cy={c + Math.round(c * 0.2)}
          rx={Math.round(c * 0.07)}
          ry={Math.round(c * 0.035)}
          fill="rgba(255,255,255,0.03)"
          transform={`rotate(20 ${c + Math.round(c * 0.3)} ${c + Math.round(c * 0.2)})`}
        />
      </svg>
    </div>
  );
}
