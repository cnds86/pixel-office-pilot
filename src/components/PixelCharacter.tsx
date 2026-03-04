import type { Department, MemberRole } from "@/data/mockData";

// Color palettes per department - inspired by the chunky robot reference images
const deptColors: Record<Department, { body: string; accent: string; highlight: string }> = {
  engineering: { body: "#5B8DEF", accent: "#3A6CD4", highlight: "#8BB4FF" },  // Blue robot
  design:      { body: "#C97BDB", accent: "#A35DB8", highlight: "#E0A8EF" },  // Purple robot
  qa:          { body: "#F2A0A0", accent: "#D47878", highlight: "#FFCACA" },  // Pink robot
  devops:      { body: "#F7C948", accent: "#D4A830", highlight: "#FFE17A" },  // Yellow robot
  product:     { body: "#7BCFA0", accent: "#5AAF7E", highlight: "#A8E8C4" },  // Green robot
  support:     { body: "#F4A261", accent: "#D4884A", highlight: "#FFD0A0" },  // Orange robot
};

const roleAccessory: Record<MemberRole, string> = {
  lead: "crown",
  dev: "headphones",
  agent: "antenna",
};

interface PixelCharacterProps {
  department: Department;
  role: MemberRole;
  isMoving: boolean;
  walkFrame: number;
  status: "online" | "busy" | "offline";
  action: string;
  size?: number;
}

export function PixelCharacter({
  department,
  role,
  isMoving,
  walkFrame,
  status,
  action,
  size = 40,
}: PixelCharacterProps) {
  const colors = deptColors[department];
  const accessory = roleAccessory[role];
  const scale = size / 40;
  
  // Eye animation based on action
  const isSleeping = action === "gone-home";
  const isPanicking = action === "panicking";
  const isCoffee = action === "coffee" || action === "snacking";

  // Leg animation
  const legOffset = isMoving ? (walkFrame === 0 ? 2 : -2) : 0;
  const bodyBob = isMoving ? (walkFrame === 0 ? -1 : 1) : 0;

  return (
    <svg
      width={size}
      height={size + 8}
      viewBox="-4 -8 48 56"
      style={{ overflow: "visible", imageRendering: "pixelated" }}
    >
      {/* Shadow */}
      <ellipse cx="20" cy="44" rx="10" ry="3" fill="rgba(0,0,0,0.25)" />

      {/* Accessory: Crown for leads */}
      {accessory === "crown" && (
        <g transform={`translate(10, ${-4 + bodyBob})`}>
          <polygon points="0,6 3,0 6,4 9,0 12,4 15,0 18,4 20,0 20,6" fill="#FFD700" stroke="#222" strokeWidth="1.5" />
        </g>
      )}

      {/* Accessory: Antenna for agents */}
      {accessory === "antenna" && (
        <g transform={`translate(17, ${-6 + bodyBob})`}>
          <line x1="3" y1="8" x2="3" y2="2" stroke="#222" strokeWidth="2" />
          <circle cx="3" cy="1" r="2.5" fill={isPanicking ? "#FF4444" : colors.highlight} stroke="#222" strokeWidth="1.5">
            {isPanicking && (
              <animate attributeName="fill" values={`${colors.highlight};#FF4444;${colors.highlight}`} dur="0.3s" repeatCount="indefinite" />
            )}
          </circle>
        </g>
      )}

      {/* Accessory: Headphones for devs */}
      {accessory === "headphones" && (
        <g transform={`translate(6, ${2 + bodyBob})`}>
          <path d="M0,10 Q0,2 14,2 Q28,2 28,10" fill="none" stroke="#333" strokeWidth="2.5" />
          <rect x="-2" y="8" width="5" height="7" rx="1" fill="#555" stroke="#222" strokeWidth="1" />
          <rect x="25" y="8" width="5" height="7" rx="1" fill="#555" stroke="#222" strokeWidth="1" />
        </g>
      )}

      {/* Body - chunky rounded rectangle like reference */}
      <g transform={`translate(0, ${bodyBob})`}>
        {/* Body main shape */}
        <rect x="4" y="6" width="32" height="28" rx="8" ry="8"
          fill={colors.body} stroke="#222" strokeWidth="2.5" />
        
        {/* Body highlight (top reflection) */}
        <rect x="8" y="9" width="14" height="6" rx="3"
          fill={colors.highlight} opacity="0.5" />

        {/* Belly / screen area */}
        <rect x="12" y="22" width="16" height="8" rx="3"
          fill={colors.accent} stroke="#222" strokeWidth="1.5" opacity="0.7" />
        
        {/* Screen dots on belly - like reference robot details */}
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
            {/* Sleeping ZZZ eyes */}
            <line x1="12" y1="16" x2="16" y2="16" stroke="#222" strokeWidth="2" strokeLinecap="round" />
            <line x1="24" y1="16" x2="28" y2="16" stroke="#222" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : isPanicking ? (
          <>
            {/* X X panic eyes */}
            <g transform="translate(11, 13)">
              <line x1="0" y1="0" x2="5" y2="5" stroke="#222" strokeWidth="2" />
              <line x1="5" y1="0" x2="0" y2="5" stroke="#222" strokeWidth="2" />
            </g>
            <g transform="translate(24, 13)">
              <line x1="0" y1="0" x2="5" y2="5" stroke="#222" strokeWidth="2" />
              <line x1="5" y1="0" x2="0" y2="5" stroke="#222" strokeWidth="2" />
            </g>
          </>
        ) : (
          <>
            {/* Normal dot eyes - big and cute */}
            <ellipse cx="14" cy="16" rx="3" ry={isCoffee ? 3.5 : 3} fill="#222" />
            <ellipse cx="26" cy="16" rx="3" ry={isCoffee ? 3.5 : 3} fill="#222" />
            {/* Eye shine */}
            <circle cx="15" cy="15" r="1" fill="white" opacity="0.8" />
            <circle cx="27" cy="15" r="1" fill="white" opacity="0.8" />
          </>
        )}

        {/* Mouth */}
        {isPanicking ? (
          <ellipse cx="20" cy="20" rx="3" ry="2" fill="#222" />
        ) : isCoffee ? (
          <path d="M16,20 Q20,23 24,20" fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round" />
        ) : action === "celebrating" ? (
          <path d="M15,19 Q20,24 25,19" fill="#222" stroke="#222" strokeWidth="1" />
        ) : (
          /* Default slight smile */
          <line x1="16" y1="20" x2="24" y2="20" stroke="#222" strokeWidth="1.5" strokeLinecap="round" />
        )}

        {/* Arms */}
        {/* Left arm */}
        <rect x="-2" y="14" width="7" height="10" rx="3"
          fill={colors.body} stroke="#222" strokeWidth="2"
          transform={isMoving ? `rotate(${legOffset * 3}, 2, 14)` : ""}
        />
        {/* Right arm */}
        <rect x="35" y="14" width="7" height="10" rx="3"
          fill={colors.body} stroke="#222" strokeWidth="2"
          transform={isMoving ? `rotate(${-legOffset * 3}, 38, 14)` : ""}
        />

        {/* Holding coffee */}
        {isCoffee && (
          <g transform="translate(36, 18)">
            <rect x="0" y="0" width="6" height="7" rx="1" fill="#8B6914" stroke="#222" strokeWidth="1" />
            <rect x="1" y="-1" width="4" height="2" rx="1" fill="#A07818" />
          </g>
        )}
      </g>

      {/* Legs */}
      <rect x={10 + legOffset} y="33" width="7" height="9" rx="2"
        fill={colors.accent} stroke="#222" strokeWidth="2" />
      <rect x={23 - legOffset} y="33" width="7" height="9" rx="2"
        fill={colors.accent} stroke="#222" strokeWidth="2" />

      {/* Status indicator */}
      <circle cx="36" cy="8" r="3"
        fill={status === "online" ? "#4ADE80" : status === "busy" ? "#FACC15" : "#888"}
        stroke="#222" strokeWidth="1.5"
      />
    </svg>
  );
}
