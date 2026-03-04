import { useState, useEffect, useCallback } from "react";
import { agents } from "@/data/mockData";
import type { Agent } from "@/data/mockData";

// Office furniture positions (x%, y%)
const desks = [
  { x: 12, y: 30, label: "Desk 1" },
  { x: 38, y: 30, label: "Desk 2" },
  { x: 64, y: 30, label: "Desk 3" },
  { x: 12, y: 65, label: "Desk 4" },
  { x: 38, y: 65, label: "Desk 5" },
  { x: 64, y: 65, label: "Desk 6" },
];

const coffeeMachine = { x: 88, y: 20 };
const whiteboard = { x: 88, y: 55 };
const door = { x: 88, y: 85 };

type AgentAction = "working" | "walking" | "coffee" | "meeting" | "idle";

interface OfficeAgent {
  agent: Agent;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  action: AgentAction;
  deskIdx: number | null;
  speechBubble: string | null;
  direction: "left" | "right";
}

const speechOptions: Record<AgentAction, string[]> = {
  working: ["💻 coding...", "🔧 fixing bug", "📝 writing docs", "🧪 testing...", "⚙️ building..."],
  coffee: ["☕ need caffeine!", "☕ brb coffee"],
  meeting: ["📊 reviewing PR", "🗣️ standup time"],
  walking: [],
  idle: ["🤔 thinking...", "💭 ..."],
};

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function PixelOffice() {
  const [officeAgents, setOfficeAgents] = useState<OfficeAgent[]>([]);

  // Initialize agents at desks
  useEffect(() => {
    const onlineAgents = agents.filter(a => a.status !== "offline");
    const initial: OfficeAgent[] = onlineAgents.map((agent, i) => {
      const deskIdx = i < desks.length ? i : null;
      const pos = deskIdx !== null ? desks[deskIdx] : { x: randomBetween(20, 80), y: randomBetween(25, 80) };
      return {
        agent,
        x: pos.x,
        y: pos.y,
        targetX: pos.x,
        targetY: pos.y,
        action: deskIdx !== null ? "working" : "idle",
        deskIdx,
        speechBubble: deskIdx !== null ? pickRandom(speechOptions.working) : null,
        direction: "right",
      };
    });
    setOfficeAgents(initial);
  }, []);

  // Agent AI - decide next action periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setOfficeAgents(prev => prev.map(oa => {
        // If walking, don't change action
        if (oa.action === "walking") return oa;

        const roll = Math.random();

        if (roll < 0.3) {
          // Stay working
          if (oa.deskIdx !== null) {
            return { ...oa, action: "working", speechBubble: pickRandom(speechOptions.working) };
          }
        }

        if (roll < 0.45) {
          // Go get coffee
          return {
            ...oa,
            action: "walking",
            targetX: coffeeMachine.x,
            targetY: coffeeMachine.y,
            speechBubble: pickRandom(speechOptions.coffee),
            direction: coffeeMachine.x > oa.x ? "right" : "left",
          };
        }

        if (roll < 0.55) {
          // Go to whiteboard meeting
          return {
            ...oa,
            action: "walking",
            targetX: whiteboard.x + randomBetween(-5, 5),
            targetY: whiteboard.y + randomBetween(-3, 3),
            speechBubble: pickRandom(speechOptions.meeting),
            direction: whiteboard.x > oa.x ? "right" : "left",
          };
        }

        if (roll < 0.7 && oa.deskIdx !== null) {
          // Return to desk
          const desk = desks[oa.deskIdx];
          return {
            ...oa,
            action: "walking",
            targetX: desk.x,
            targetY: desk.y,
            speechBubble: null,
            direction: desk.x > oa.x ? "right" : "left",
          };
        }

        // Random walk
        if (roll < 0.8) {
          const tx = randomBetween(8, 90);
          const ty = randomBetween(20, 85);
          return {
            ...oa,
            action: "walking",
            targetX: tx,
            targetY: ty,
            speechBubble: null,
            direction: tx > oa.x ? "right" : "left",
          };
        }

        // Stay put
        return { ...oa, speechBubble: oa.action === "working" ? pickRandom(speechOptions.working) : pickRandom(speechOptions.idle) };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Movement animation tick
  useEffect(() => {
    const tick = setInterval(() => {
      setOfficeAgents(prev => prev.map(oa => {
        if (oa.action !== "walking") return oa;
        const dx = oa.targetX - oa.x;
        const dy = oa.targetY - oa.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 1.5) {
          // Arrived
          const atDesk = oa.deskIdx !== null && desks[oa.deskIdx] &&
            Math.abs(oa.targetX - desks[oa.deskIdx].x) < 3 &&
            Math.abs(oa.targetY - desks[oa.deskIdx].y) < 3;
          const atCoffee = Math.abs(oa.targetX - coffeeMachine.x) < 5 && Math.abs(oa.targetY - coffeeMachine.y) < 5;
          const atBoard = Math.abs(oa.targetX - whiteboard.x) < 8 && Math.abs(oa.targetY - whiteboard.y) < 8;

          let newAction: AgentAction = "idle";
          let bubble: string | null = null;
          if (atDesk) { newAction = "working"; bubble = pickRandom(speechOptions.working); }
          else if (atCoffee) { newAction = "coffee"; bubble = "☕ sipping..."; }
          else if (atBoard) { newAction = "meeting"; bubble = pickRandom(speechOptions.meeting); }

          return { ...oa, x: oa.targetX, y: oa.targetY, action: newAction, speechBubble: bubble };
        }

        const speed = 1.2;
        const nx = oa.x + (dx / dist) * speed;
        const ny = oa.y + (dy / dist) * speed;
        return { ...oa, x: nx, y: ny, direction: dx > 0 ? "right" : "left" };
      }));
    }, 60);
    return () => clearInterval(tick);
  }, []);

  return (
    <div className="pixel-border bg-card relative overflow-hidden select-none" style={{ height: 320 }}>
      {/* Floor grid */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />

      {/* Room Label */}
      <div className="absolute top-2 left-3 font-pixel text-[8px] text-accent z-10">
        🏢 OPENCLAW OFFICE
      </div>

      {/* Desks */}
      {desks.map((desk, i) => (
        <div
          key={i}
          className="absolute flex flex-col items-center"
          style={{ left: `${desk.x}%`, top: `${desk.y}%`, transform: "translate(-50%, -50%)" }}
        >
          <div className="w-14 h-8 bg-muted pixel-border flex items-center justify-center">
            <span className="text-xs">🖥️</span>
          </div>
          <div className="w-10 h-1 bg-muted-foreground/30 mt-0.5" />
        </div>
      ))}

      {/* Coffee Machine */}
      <div
        className="absolute flex flex-col items-center"
        style={{ left: `${coffeeMachine.x}%`, top: `${coffeeMachine.y}%`, transform: "translate(-50%, -50%)" }}
      >
        <div className="w-8 h-10 bg-muted pixel-border flex items-center justify-center">
          <span className="text-lg">☕</span>
        </div>
        <span className="font-pixel text-[6px] text-muted-foreground mt-1">COFFEE</span>
      </div>

      {/* Whiteboard */}
      <div
        className="absolute flex flex-col items-center"
        style={{ left: `${whiteboard.x}%`, top: `${whiteboard.y}%`, transform: "translate(-50%, -50%)" }}
      >
        <div className="w-12 h-9 bg-foreground/10 pixel-border flex items-center justify-center">
          <span className="text-sm">📋</span>
        </div>
        <span className="font-pixel text-[6px] text-muted-foreground mt-1">BOARD</span>
      </div>

      {/* Door */}
      <div
        className="absolute flex flex-col items-center"
        style={{ left: `${door.x}%`, top: `${door.y}%`, transform: "translate(-50%, -50%)" }}
      >
        <div className="w-7 h-10 bg-muted pixel-border flex items-center justify-center">
          <span className="text-sm">🚪</span>
        </div>
      </div>

      {/* Plants */}
      <div className="absolute" style={{ left: "3%", top: "18%", transform: "translate(-50%, -50%)" }}>
        <span className="text-xl">🌿</span>
      </div>
      <div className="absolute" style={{ left: "3%", top: "85%", transform: "translate(-50%, -50%)" }}>
        <span className="text-xl">🪴</span>
      </div>

      {/* Agents */}
      {officeAgents.map((oa) => (
        <div
          key={oa.agent.id}
          className="absolute z-20 flex flex-col items-center transition-none"
          style={{
            left: `${oa.x}%`,
            top: `${oa.y}%`,
            transform: `translate(-50%, -50%) scaleX(${oa.direction === "left" ? -1 : 1})`,
          }}
        >
          {/* Speech bubble */}
          {oa.speechBubble && (
            <div
              className="absolute -top-8 left-1/2 whitespace-nowrap px-1.5 py-0.5 bg-card pixel-border font-pixel text-[6px] text-foreground z-30"
              style={{ transform: `translateX(-50%) scaleX(${oa.direction === "left" ? -1 : 1})` }}
            >
              {oa.speechBubble}
            </div>
          )}

          {/* Character body */}
          <div className={`relative flex flex-col items-center ${oa.action === "walking" ? "animate-bounce" : ""}`}
            style={{ animationDuration: "0.4s" }}
          >
            {/* Head */}
            <span className="text-2xl leading-none" style={{ filter: oa.agent.status === "busy" ? "saturate(0.7)" : "none" }}>
              {oa.agent.avatar}
            </span>
            {/* Status dot */}
            <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 ${
              oa.agent.status === "online" ? "bg-primary" : oa.agent.status === "busy" ? "bg-accent" : "bg-muted-foreground"
            } ${oa.agent.status === "online" ? "animate-pixel-pulse" : ""}`} />
          </div>

          {/* Name tag */}
          <span
            className="font-pixel text-[5px] text-primary mt-0.5 whitespace-nowrap"
            style={{ transform: `scaleX(${oa.direction === "left" ? -1 : 1})` }}
          >
            {oa.agent.name}
          </span>
        </div>
      ))}

      {/* Offline agents shown as "away" near door */}
      {agents.filter(a => a.status === "offline").map((agent, i) => (
        <div
          key={agent.id}
          className="absolute z-10 flex flex-col items-center opacity-30"
          style={{ left: `${door.x - 6}%`, top: `${door.y + i * 5}%`, transform: "translate(-50%, -50%)" }}
        >
          <span className="text-lg grayscale">{agent.avatar}</span>
          <span className="font-pixel text-[5px] text-muted-foreground">{agent.name}</span>
        </div>
      ))}
    </div>
  );
}
