import type { Department, MemberRole } from "@/data/mockData";

// Color palettes per department
const deptColors: Record<Department, { body: string; accent: string; highlight: string }> = {
  engineering: { body: "#5B8DEF", accent: "#3A6CD4", highlight: "#8BB4FF" },
  design:      { body: "#C97BDB", accent: "#A35DB8", highlight: "#E0A8EF" },
  qa:          { body: "#F2A0A0", accent: "#D47878", highlight: "#FFCACA" },
  devops:      { body: "#F7C948", accent: "#D4A830", highlight: "#FFE17A" },
  product:     { body: "#7BCFA0", accent: "#5AAF7E", highlight: "#A8E8C4" },
  support:     { body: "#F4A261", accent: "#D4884A", highlight: "#FFD0A0" },
};

const roleAccessory: Record<MemberRole, string> = {
  lead: "crown",
  dev: "headphones",
  agent: "antenna",
};

// Body shapes
type BodyShape = "round" | "square" | "triangle" | "hexagon" | "capsule";
const bodyShapes: BodyShape[] = ["round", "square", "triangle", "hexagon", "capsule"];

// Hats
type HatType = "none" | "tophat" | "cap" | "beanie" | "hardhat" | "wizard" | "beret";
const hatTypes: HatType[] = ["none", "tophat", "cap", "beanie", "hardhat", "wizard", "beret"];

// Glasses
type GlassesType = "none" | "round" | "square" | "visor" | "monocle";
const glassesTypes: GlassesType[] = ["none", "round", "square", "visor", "monocle"];

// Extra accessories
type ExtraAccessory = "none" | "scarf" | "bowtie" | "badge" | "backpack" | "toolbelt";
const extraAccessories: ExtraAccessory[] = ["none", "scarf", "bowtie", "badge", "backpack", "toolbelt"];

// Accent tints for variety
const accentTints = ["#FF6B6B", "#6BCB77", "#4D96FF", "#FFD93D", "#C084FC", "#FB923C", "#67E8F9", "#F472B6"];

// Deterministic hash from agent id
function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function getTraits(agentId: string) {
  const h = hashId(agentId);
  return {
    bodyShape: bodyShapes[h % bodyShapes.length],
    hat: hatTypes[(h >> 3) % hatTypes.length],
    glasses: glassesTypes[(h >> 6) % glassesTypes.length],
    extra: extraAccessories[(h >> 9) % extraAccessories.length],
    tint: accentTints[(h >> 12) % accentTints.length],
    eyeSize: 2.5 + (h % 3) * 0.5, // 2.5 - 3.5
    height: 28 + (h % 5) * 2, // 28-36
  };
}

interface PixelCharacterProps {
  department: Department;
  role: MemberRole;
  isMoving: boolean;
  walkFrame: number;
  status: "online" | "busy" | "offline";
  action: string;
  size?: number;
  agentId?: string;
}

export function PixelCharacter({
  department,
  role,
  isMoving,
  walkFrame,
  status,
  action,
  size = 40,
  agentId = "default",
}: PixelCharacterProps) {
  const colors = deptColors[department];
  const accessory = roleAccessory[role];
  const traits = getTraits(agentId);

  const isSleeping = action === "gone-home";
  const isPanicking = action === "panicking";
  const isCoffee = action === "coffee" || action === "snacking";

  const legOffset = isMoving ? (walkFrame === 0 ? 2 : -2) : 0;
  const bodyBob = isMoving ? (walkFrame === 0 ? -1 : 1) : 0;

  const bodyH = traits.height;
  const bodyW = 32;

  // Body shape renderer
  const renderBody = () => {
    const x = 4, y = 6;
    switch (traits.bodyShape) {
      case "round":
        return <ellipse cx={x + bodyW/2} cy={y + bodyH/2} rx={bodyW/2} ry={bodyH/2} fill={colors.body} stroke="#222" strokeWidth="2.5" />;
      case "triangle":
        return <polygon points={`${x + bodyW/2},${y} ${x},${y + bodyH} ${x + bodyW},${y + bodyH}`} fill={colors.body} stroke="#222" strokeWidth="2.5" strokeLinejoin="round" />;
      case "hexagon":
        return <polygon points={`${x+8},${y} ${x+bodyW-8},${y} ${x+bodyW},${y+bodyH/2} ${x+bodyW-8},${y+bodyH} ${x+8},${y+bodyH} ${x},${y+bodyH/2}`} fill={colors.body} stroke="#222" strokeWidth="2.5" strokeLinejoin="round" />;
      case "capsule":
        return <rect x={x+4} y={y} width={bodyW-8} height={bodyH} rx={12} ry={12} fill={colors.body} stroke="#222" strokeWidth="2.5" />;
      default: // square
        return <rect x={x} y={y} width={bodyW} height={bodyH} rx={6} ry={6} fill={colors.body} stroke="#222" strokeWidth="2.5" />;
    }
  };

  // Hat renderer
  const renderHat = () => {
    const hatY = -4 + bodyBob;
    switch (traits.hat) {
      case "tophat":
        return <g transform={`translate(10, ${hatY - 8})`}>
          <rect x="0" y="6" width="20" height="3" rx="1" fill="#222" />
          <rect x="3" y="-2" width="14" height="9" rx="2" fill="#222" />
          <rect x="5" y="0" width="4" height="2" rx="1" fill={traits.tint} opacity="0.6" />
        </g>;
      case "cap":
        return <g transform={`translate(6, ${hatY - 2})`}>
          <ellipse cx="14" cy="4" rx="16" ry="4" fill={traits.tint} stroke="#222" strokeWidth="1.5" />
          <rect x="4" y="-3" width="20" height="7" rx="3" fill={traits.tint} stroke="#222" strokeWidth="1.5" />
        </g>;
      case "beanie":
        return <g transform={`translate(8, ${hatY - 4})`}>
          <ellipse cx="12" cy="6" rx="13" ry="7" fill={traits.tint} stroke="#222" strokeWidth="1.5" />
          <circle cx="12" cy="-1" r="3" fill={traits.tint} stroke="#222" strokeWidth="1" />
        </g>;
      case "hardhat":
        return <g transform={`translate(6, ${hatY - 4})`}>
          <ellipse cx="14" cy="6" rx="16" ry="5" fill="#FFD700" stroke="#222" strokeWidth="1.5" />
          <rect x="4" y="-2" width="20" height="8" rx="4" fill="#FFD700" stroke="#222" strokeWidth="1.5" />
          <line x1="14" y1="-1" x2="14" y2="4" stroke="#222" strokeWidth="1.5" />
        </g>;
      case "wizard":
        return <g transform={`translate(8, ${hatY - 14})`}>
          <polygon points="12,-2 0,16 24,16" fill="#7C3AED" stroke="#222" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="12" cy="-1" r="2" fill="#FFD700" />
          <circle cx="6" cy="10" r="1.5" fill="#FFD700" opacity="0.7" />
          <circle cx="16" cy="7" r="1" fill="#FFD700" opacity="0.5" />
        </g>;
      case "beret":
        return <g transform={`translate(6, ${hatY - 2})`}>
          <ellipse cx="14" cy="4" rx="14" ry="5" fill={traits.tint} stroke="#222" strokeWidth="1.5" />
          <circle cx="14" cy="0" r="2" fill={traits.tint} stroke="#222" strokeWidth="1" />
        </g>;
      default: return null;
    }
  };

  // Glasses renderer
  const renderGlasses = () => {
    const gy = 14 + bodyBob;
    switch (traits.glasses) {
      case "round":
        return <g>
          <circle cx="14" cy={gy} r="4.5" fill="none" stroke="#333" strokeWidth="1.8" />
          <circle cx="26" cy={gy} r="4.5" fill="none" stroke="#333" strokeWidth="1.8" />
          <line x1="18.5" y1={gy} x2="21.5" y2={gy} stroke="#333" strokeWidth="1.5" />
          <circle cx="14" cy={gy} r="4.5" fill="white" opacity="0.15" />
          <circle cx="26" cy={gy} r="4.5" fill="white" opacity="0.15" />
        </g>;
      case "square":
        return <g>
          <rect x="9" y={gy-3.5} width="9" height="7" rx="1" fill="none" stroke="#333" strokeWidth="1.8" />
          <rect x="22" y={gy-3.5} width="9" height="7" rx="1" fill="none" stroke="#333" strokeWidth="1.8" />
          <line x1="18" y1={gy} x2="22" y2={gy} stroke="#333" strokeWidth="1.5" />
          <rect x="9" y={gy-3.5} width="9" height="7" rx="1" fill="white" opacity="0.1" />
        </g>;
      case "visor":
        return <g>
          <rect x="8" y={gy-3} width="24" height="6" rx="3" fill={traits.tint} opacity="0.4" stroke="#333" strokeWidth="1.5" />
          <rect x="10" y={gy-2} width="8" height="2" rx="1" fill="white" opacity="0.3" />
        </g>;
      case "monocle":
        return <g>
          <circle cx="26" cy={gy} r="5" fill="none" stroke="#C9A84C" strokeWidth="1.8" />
          <line x1="26" y1={gy+5} x2="28" y2={gy+14} stroke="#C9A84C" strokeWidth="1" />
          <circle cx="26" cy={gy} r="5" fill="white" opacity="0.12" />
        </g>;
      default: return null;
    }
  };

  // Extra accessory renderer
  const renderExtra = () => {
    switch (traits.extra) {
      case "scarf":
        return <g transform={`translate(4, ${28 + bodyBob})`}>
          <rect x="0" y="0" width="32" height="5" rx="2" fill={traits.tint} stroke="#222" strokeWidth="1" />
          <rect x="26" y="3" width="5" height="8" rx="2" fill={traits.tint} stroke="#222" strokeWidth="1" />
        </g>;
      case "bowtie":
        return <g transform={`translate(15, ${30 + bodyBob})`}>
          <polygon points="0,3 5,0 5,6" fill={traits.tint} stroke="#222" strokeWidth="1" />
          <polygon points="10,3 5,0 5,6" fill={traits.tint} stroke="#222" strokeWidth="1" />
          <circle cx="5" cy="3" r="1.5" fill="#222" />
        </g>;
      case "badge":
        return <g transform={`translate(26, ${20 + bodyBob})`}>
          <circle cx="4" cy="4" r="4" fill={traits.tint} stroke="#222" strokeWidth="1.5" />
          <text x="4" y="6" textAnchor="middle" fontSize="5" fill="#222" fontWeight="bold">★</text>
        </g>;
      case "backpack":
        return <g transform={`translate(-6, ${12 + bodyBob})`}>
          <rect x="0" y="0" width="8" height="16" rx="3" fill={traits.tint} stroke="#222" strokeWidth="1.5" />
          <rect x="2" y="2" width="4" height="4" rx="1" fill="white" opacity="0.2" />
        </g>;
      case "toolbelt":
        return <g transform={`translate(4, ${30 + bodyBob})`}>
          <rect x="0" y="0" width="32" height="4" rx="1" fill="#8B6914" stroke="#222" strokeWidth="1" />
          <rect x="4" y="2" width="4" height="5" rx="1" fill="#666" stroke="#222" strokeWidth="0.8" />
          <rect x="14" y="2" width="3" height="6" rx="1" fill="#888" stroke="#222" strokeWidth="0.8" />
          <rect x="24" y="2" width="4" height="4" rx="1" fill="#666" stroke="#222" strokeWidth="0.8" />
        </g>;
      default: return null;
    }
  };

  const eyeY = traits.bodyShape === "triangle" ? 18 : 16;
  const eyeR = traits.eyeSize;

  return (
    <svg
      width={size}
      height={size + 8}
      viewBox="-8 -16 56 64"
      style={{ overflow: "visible", imageRendering: "pixelated" }}
    >
      {/* Shadow */}
      <ellipse cx="20" cy="44" rx="10" ry="3" fill="rgba(0,0,0,0.25)" />

      {/* Hat (behind role accessory) */}
      {renderHat()}

      {/* Role Accessory: Crown */}
      {accessory === "crown" && traits.hat === "none" && (
        <g transform={`translate(10, ${-4 + bodyBob})`}>
          <polygon points="0,6 3,0 6,4 9,0 12,4 15,0 18,4 20,0 20,6" fill="#FFD700" stroke="#222" strokeWidth="1.5" />
        </g>
      )}

      {/* Antenna */}
      {accessory === "antenna" && (
        <g transform={`translate(17, ${-6 + bodyBob + (traits.hat !== "none" ? -8 : 0)})`}>
          <line x1="3" y1="8" x2="3" y2="2" stroke="#222" strokeWidth="2" />
          <circle cx="3" cy="1" r="2.5" fill={isPanicking ? "#FF4444" : traits.tint} stroke="#222" strokeWidth="1.5">
            {isPanicking && <animate attributeName="fill" values={`${traits.tint};#FF4444;${traits.tint}`} dur="0.3s" repeatCount="indefinite" />}
          </circle>
        </g>
      )}

      {/* Headphones */}
      {accessory === "headphones" && traits.hat === "none" && (
        <g transform={`translate(6, ${2 + bodyBob})`}>
          <path d="M0,10 Q0,2 14,2 Q28,2 28,10" fill="none" stroke="#333" strokeWidth="2.5" />
          <rect x="-2" y="8" width="5" height="7" rx="1" fill="#555" stroke="#222" strokeWidth="1" />
          <rect x="25" y="8" width="5" height="7" rx="1" fill="#555" stroke="#222" strokeWidth="1" />
        </g>
      )}

      {/* Body */}
      <g transform={`translate(0, ${bodyBob})`}>
        {renderBody()}

        {/* Body highlight */}
        <rect x="8" y="9" width="14" height="5" rx="3" fill={colors.highlight} opacity="0.4" />

        {/* Belly screen */}
        <rect x="12" y="22" width="16" height="8" rx="3" fill={colors.accent} stroke="#222" strokeWidth="1.5" opacity="0.7" />

        {role === "agent" && (
          <>
            <circle cx="17" cy="26" r="1.5" fill={colors.highlight} opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="23" cy="26" r="1.5" fill={colors.highlight} opacity="0.6">
              <animate attributeName="opacity" values="0.6;0.9;0.6" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </>
        )}

        {/* Eyes */}
        {isSleeping ? (
          <>
            <line x1="12" y1={eyeY} x2="16" y2={eyeY} stroke="#222" strokeWidth="2" strokeLinecap="round" />
            <line x1="24" y1={eyeY} x2="28" y2={eyeY} stroke="#222" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : isPanicking ? (
          <>
            <g transform={`translate(11, ${eyeY-3})`}>
              <line x1="0" y1="0" x2="5" y2="5" stroke="#222" strokeWidth="2" />
              <line x1="5" y1="0" x2="0" y2="5" stroke="#222" strokeWidth="2" />
            </g>
            <g transform={`translate(24, ${eyeY-3})`}>
              <line x1="0" y1="0" x2="5" y2="5" stroke="#222" strokeWidth="2" />
              <line x1="5" y1="0" x2="0" y2="5" stroke="#222" strokeWidth="2" />
            </g>
          </>
        ) : (
          <>
            <ellipse cx="14" cy={eyeY} rx={eyeR} ry={isCoffee ? eyeR+0.5 : eyeR} fill="#222" />
            <ellipse cx="26" cy={eyeY} rx={eyeR} ry={isCoffee ? eyeR+0.5 : eyeR} fill="#222" />
            <circle cx="15" cy={eyeY-1} r="1" fill="white" opacity="0.8" />
            <circle cx="27" cy={eyeY-1} r="1" fill="white" opacity="0.8" />
          </>
        )}

        {/* Glasses (over eyes) */}
        {renderGlasses()}

        {/* Mouth */}
        {isPanicking ? (
          <ellipse cx="20" cy="20" rx="3" ry="2" fill="#222" />
        ) : isCoffee ? (
          <path d="M16,20 Q20,23 24,20" fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round" />
        ) : action === "celebrating" ? (
          <path d="M15,19 Q20,24 25,19" fill="#222" stroke="#222" strokeWidth="1" />
        ) : (
          <line x1="16" y1="20" x2="24" y2="20" stroke="#222" strokeWidth="1.5" strokeLinecap="round" />
        )}

        {/* Arms */}
        <rect x="-2" y="14" width="7" height="10" rx="3"
          fill={colors.body} stroke="#222" strokeWidth="2"
          transform={isMoving ? `rotate(${legOffset * 3}, 2, 14)` : ""} />
        <rect x="35" y="14" width="7" height="10" rx="3"
          fill={colors.body} stroke="#222" strokeWidth="2"
          transform={isMoving ? `rotate(${-legOffset * 3}, 38, 14)` : ""} />

        {/* Coffee */}
        {isCoffee && (
          <g transform="translate(36, 18)">
            <rect x="0" y="0" width="6" height="7" rx="1" fill="#8B6914" stroke="#222" strokeWidth="1" />
            <rect x="1" y="-1" width="4" height="2" rx="1" fill="#A07818" />
          </g>
        )}

        {/* Extra accessory */}
        {renderExtra()}
      </g>

      {/* Legs */}
      <rect x={10 + legOffset} y="33" width="7" height="9" rx="2"
        fill={colors.accent} stroke="#222" strokeWidth="2" />
      <rect x={23 - legOffset} y="33" width="7" height="9" rx="2"
        fill={colors.accent} stroke="#222" strokeWidth="2" />

      {/* Status indicator */}
      <circle cx="36" cy="8" r="3"
        fill={status === "online" ? "#4ADE80" : status === "busy" ? "#FACC15" : "#888"}
        stroke="#222" strokeWidth="1.5" />
    </svg>
  );
}
