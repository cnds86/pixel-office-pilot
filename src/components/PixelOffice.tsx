import { useState, useEffect, useRef } from "react";
import { agents, tasks, departmentInfo } from "@/data/mockData";
import type { Agent, Task, Department } from "@/data/mockData";
import { AmbientSparkles } from "./OfficeParticles";
import { getAgentSprite } from "@/data/agentSprites";
import floorF1 from "@/assets/floor-f1-lobby.png";
import floorF2 from "@/assets/floor-f2-operations.png";
import floorF3 from "@/assets/floor-f3-creative.png";
import floorF4 from "@/assets/floor-f4-engineering.png";
import skyBg from "@/assets/sky-bg.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AgentChat } from "./AgentChat";

// ─── Floor & Room Layout ───
// 4 floors, each floor is a separate view
// F4 (top): Engineering
// F3: Design + QA
// F2: DevOps + Product + Meeting Room
// F1 (ground): Support + Pantry/Lobby

type FloorId = 1 | 2 | 3 | 4;

interface RoomDef {
  department: Department;
  floor: FloorId;
  x: number; y: number; w: number; h: number;
  floorColor: string;
  desks: { x: number; y: number }[];
}

const CANVAS_W = 800;
const CANVAS_H = 420;

const rooms: RoomDef[] = [
  // F1 - Support + Pantry
  {
    department: "support", floor: 1,
    x: 20, y: 40, w: 360, h: 340,
    floorColor: "hsl(50 12% 14%)",
    desks: [
      { x: 60, y: 100 }, { x: 160, y: 100 },
      { x: 60, y: 210 }, { x: 160, y: 210 },
    ],
  },
  // F2 - DevOps + Product
  {
    department: "devops", floor: 2,
    x: 20, y: 40, w: 340, h: 340,
    floorColor: "hsl(30 15% 13%)",
    desks: [
      { x: 60, y: 100 }, { x: 160, y: 100 },
      { x: 60, y: 210 }, { x: 160, y: 210 },
    ],
  },
  {
    department: "product", floor: 2,
    x: 380, y: 40, w: 300, h: 340,
    floorColor: "hsl(270 12% 13%)",
    desks: [
      { x: 60, y: 100 }, { x: 160, y: 100 },
      { x: 60, y: 210 }, { x: 160, y: 210 },
    ],
  },
  // F3 - Design + QA
  {
    department: "design", floor: 3,
    x: 20, y: 40, w: 360, h: 340,
    floorColor: "hsl(320 15% 13%)",
    desks: [
      { x: 60, y: 90 }, { x: 160, y: 90 }, { x: 260, y: 90 },
      { x: 60, y: 200 }, { x: 160, y: 200 },
    ],
  },
  {
    department: "qa", floor: 3,
    x: 400, y: 40, w: 300, h: 340,
    floorColor: "hsl(140 12% 13%)",
    desks: [
      { x: 60, y: 90 }, { x: 160, y: 90 },
      { x: 60, y: 200 }, { x: 160, y: 200 }, { x: 240, y: 200 },
    ],
  },
  // F4 - Engineering (big room, top floor)
  {
    department: "engineering", floor: 4,
    x: 20, y: 40, w: 660, h: 340,
    floorColor: "hsl(220 18% 14%)",
    desks: [
      { x: 60, y: 90 }, { x: 160, y: 90 }, { x: 260, y: 90 }, { x: 360, y: 90 },
      { x: 60, y: 200 }, { x: 160, y: 200 }, { x: 260, y: 200 }, { x: 360, y: 200 },
    ],
  },
];

// Shared spaces per floor
const sharedSpaces: Record<FloorId, { type: string; x: number; y: number; w: number; h: number }[]> = {
  1: [
    { type: "pantry", x: 400, y: 40, w: 280, h: 340 },
  ],
  2: [
    { type: "meeting", x: 700, y: 40, w: 80, h: 340 },
  ],
  3: [],
  4: [
    { type: "server-room", x: 700, y: 40, w: 80, h: 200 },
  ],
};

const floorLabels: Record<FloorId, { label: string; departments: string }> = {
  1: { label: "LOBBY & SUPPORT", departments: "Support • Pantry • Break Room" },
  2: { label: "OPERATIONS", departments: "DevOps • Product • Meeting Room" },
  3: { label: "CREATIVE & QA", departments: "Design • QA & Testing" },
  4: { label: "ENGINEERING", departments: "Engineering • Server Room" },
};

const floorBgImages: Record<FloorId, string> = {
  1: floorF1,
  2: floorF2,
  3: floorF3,
  4: floorF4,
};

type AgentAction = "working" | "walking" | "coffee" | "meeting" | "idle" | "printing" | "chatting" | "snacking" | "calling" | "gone-home" | "panicking" | "celebrating";

type OfficeEventType = "fire-drill" | "pizza-party" | "server-down" | "birthday" | "surprise-meeting" | "power-outage";

interface OfficeEvent {
  type: OfficeEventType;
  label: string;
  icon: string;
  color: string;
  duration: number;
  description: string;
  affectedDept?: Department;
}

const officeEvents: OfficeEvent[] = [
  { type: "fire-drill", label: "🔥 FIRE DRILL!", icon: "🚨", color: "hsl(0 85% 55%)", duration: 20, description: "Everyone evacuate!" },
  { type: "pizza-party", label: "🍕 PIZZA PARTY!", icon: "🎉", color: "hsl(45 100% 60%)", duration: 25, description: "Free pizza in the pantry!" },
  { type: "server-down", label: "💥 SERVER DOWN!", icon: "🔴", color: "hsl(0 80% 45%)", duration: 18, description: "Production servers are down!", affectedDept: "devops" },
  { type: "birthday", label: "🎂 BIRTHDAY!", icon: "🎈", color: "hsl(320 70% 55%)", duration: 22, description: "Happy birthday! Cake time!" },
  { type: "surprise-meeting", label: "📢 ALL-HANDS!", icon: "📋", color: "hsl(270 60% 55%)", duration: 15, description: "Everyone to the meeting room!" },
  { type: "power-outage", label: "⚡ POWER OUT!", icon: "🔌", color: "hsl(240 20% 30%)", duration: 12, description: "Backup power in 10 seconds..." },
];

type TimePhase = "morning" | "day" | "evening" | "night";

function getTimePhase(hour: number): TimePhase {
  if (hour >= 6 && hour < 9) return "morning";
  if (hour >= 9 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "evening";
  return "night";
}

const phaseOverlay: Record<TimePhase, { bg: string; opacity: number; skyIcon: string; lightIntensity: number }> = {
  morning: { bg: "hsl(30 60% 50%)", opacity: 0.05, skyIcon: "🌅", lightIntensity: 0.04 },
  day: { bg: "transparent", opacity: 0, skyIcon: "☀️", lightIntensity: 0.03 },
  evening: { bg: "hsl(25 80% 30%)", opacity: 0.12, skyIcon: "🌇", lightIntensity: 0.08 },
  night: { bg: "hsl(230 60% 10%)", opacity: 0.25, skyIcon: "🌙", lightIntensity: 0.15 },
};

interface OfficeAgent {
  agent: Agent;
  floor: FloorId;
  x: number; y: number;
  targetX: number; targetY: number;
  action: AgentAction;
  deskX: number; deskY: number;
  deskFloor: FloorId;
  speechBubble: string | null;
  direction: "left" | "right";
  frame: number;
}

const speechOptions: Record<AgentAction, string[]> = {
  working: ["💻 coding...", "🔧 fixing bug", "📝 writing docs", "🧪 testing...", "⚙️ building...", "📊 analyzing...", "🎯 focusing..."],
  coffee: ["☕ need caffeine!", "☕ brb coffee", "☕ espresso time"],
  meeting: ["📊 reviewing PR", "🗣️ standup!", "📋 sprint planning", "💡 brainstorming"],
  walking: [],
  idle: ["🤔 thinking...", "💭 ...", "📱 checking slack"],
  printing: ["🖨️ printing...", "📄 grabbing docs"],
  chatting: ["😄 haha nice!", "👋 hey!", "🍕 lunch plans?"],
  snacking: ["🍪 cookie time!", "🥤 slurp...", "🌮 taco break"],
  calling: ["📞 on a call...", "🎙️ presenting..."],
  "gone-home": ["🏠 left for today", "👋 bye!"],
  panicking: ["😱 RUN!!", "🚨 EVACUATE!", "😰 oh no!!"],
  celebrating: ["🎉 woohoo!", "🥳 party!", "🍕 yummy!"],
};

const actionLabel: Record<AgentAction, string> = {
  working: "Working", walking: "Walking", coffee: "Coffee break", meeting: "In meeting",
  idle: "Idle", printing: "Printing", chatting: "Chatting", snacking: "Snacking", calling: "On a call",
  "gone-home": "Gone home", panicking: "Panicking!", celebrating: "Celebrating!",
};

const priorityColor: Record<string, string> = {
  high: "bg-destructive text-destructive-foreground",
  medium: "bg-accent text-accent-foreground",
  low: "bg-muted text-muted-foreground",
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

// Get the floor a department is on
function getDeptFloor(dept: Department): FloorId {
  const room = rooms.find(r => r.department === dept);
  return room?.floor ?? 1;
}

// Get pantry location (always F1)
const pantrySpace = sharedSpaces[1][0];

export function PixelOffice() {
  const [officeAgents, setOfficeAgents] = useState<OfficeAgent[]>([]);
  const [clock, setClock] = useState("09:00");
  const clockHour = parseInt(clock.split(":")[0]);
  const timePhase = getTimePhase(clockHour);
  const phaseInfo = phaseOverlay[timePhase];
  const [selectedAgent, setSelectedAgent] = useState<OfficeAgent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [taskList, setTaskList] = useState<Task[]>(tasks);
  const [assignTaskId, setAssignTaskId] = useState<string>("");
  const [currentFloor, setCurrentFloor] = useState<FloorId>(4);
  const [viewMode, setViewMode] = useState<"single" | "stacked">("stacked");
  const [activeEvent, setActiveEvent] = useState<OfficeEvent | null>(null);
  const [eventTimer, setEventTimer] = useState(0);
  const [eventParticles, setEventParticles] = useState<{ id: number; x: number; y: number; emoji: string; delay: number }[]>([]);
  const [chatAgent, setChatAgent] = useState<Agent | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize agents on their department floors
  useEffect(() => {
    const initial: OfficeAgent[] = [];
    const deptAgents: Record<string, Agent[]> = {};
    agents.forEach(a => {
      if (a.status === "offline") return;
      if (!deptAgents[a.department]) deptAgents[a.department] = [];
      deptAgents[a.department].push(a);
    });

    for (const room of rooms) {
      const da = deptAgents[room.department] || [];
      da.forEach((agent, i) => {
        const desk = room.desks[i % room.desks.length];
        const ax = room.x + desk.x;
        const ay = room.y + desk.y;
        initial.push({
          agent, floor: room.floor, x: ax, y: ay, targetX: ax, targetY: ay,
          action: "working", deskX: ax, deskY: ay, deskFloor: room.floor,
          speechBubble: pickRandom(speechOptions.working),
          direction: "right", frame: 0,
        });
      });
    }
    setOfficeAgents(initial);
  }, []);

  // Random Event Trigger
  useEffect(() => {
    if (timePhase === "night") return;
    const interval = setInterval(() => {
      if (activeEvent) return;
      if (Math.random() < 0.08) {
        triggerEvent(pickRandom(officeEvents));
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [activeEvent, timePhase]);

  // Event countdown
  useEffect(() => {
    if (!activeEvent) return;
    setEventTimer(activeEvent.duration);
    const countdown = setInterval(() => {
      setEventTimer(prev => {
        if (prev <= 1) { clearInterval(countdown); endEvent(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [activeEvent?.type]);

  function triggerEvent(event: OfficeEvent) {
    setActiveEvent(event);
    const particleEmojis: Record<OfficeEventType, string[]> = {
      "fire-drill": ["🔥", "🚨", "💨", "🧯"],
      "pizza-party": ["🍕", "🎉", "🍕", "🥤"],
      "server-down": ["💥", "⚠️", "🔴", "💻"],
      "birthday": ["🎈", "🎂", "🎊", "🎁"],
      "surprise-meeting": ["📢", "📋", "💼", "📊"],
      "power-outage": ["⚡", "🔌", "💡", "🕯️"],
    };
    setEventParticles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i, x: Math.random() * CANVAS_W, y: Math.random() * CANVAS_H,
        emoji: pickRandom(particleEmojis[event.type]), delay: Math.random() * 3,
      }))
    );

    setOfficeAgents(prev => prev.map(oa => {
      if (oa.action === "gone-home") return oa;
      switch (event.type) {
        case "fire-drill": {
          const tx = randomBetween(20, 100);
          const ty = randomBetween(CANVAS_H - 60, CANVAS_H - 20);
          return { ...oa, action: "panicking" as AgentAction, targetX: tx, targetY: ty, floor: 1, speechBubble: pickRandom(speechOptions.panicking), direction: tx > oa.x ? "right" : "left" };
        }
        case "pizza-party":
        case "birthday": {
          const tx = pantrySpace.x + randomBetween(20, pantrySpace.w - 20);
          const ty = pantrySpace.y + randomBetween(40, pantrySpace.h - 20);
          return { ...oa, action: "celebrating" as AgentAction, targetX: tx, targetY: ty, floor: 1, speechBubble: pickRandom(speechOptions.celebrating), direction: tx > oa.x ? "right" : "left" };
        }
        case "server-down": {
          if (oa.agent.department === "devops") {
            return { ...oa, action: "panicking" as AgentAction, speechBubble: "🔥 FIXING SERVERS!", direction: "right" };
          }
          return { ...oa, speechBubble: "😰 servers down?!", action: "idle" as AgentAction };
        }
        case "surprise-meeting": {
          const tx = randomBetween(720, 760);
          const ty = randomBetween(100, 300);
          return { ...oa, action: "walking" as AgentAction, targetX: tx, targetY: ty, floor: 2, speechBubble: "📢 all-hands!", direction: tx > oa.x ? "right" : "left" };
        }
        case "power-outage":
          return { ...oa, action: "panicking" as AgentAction, speechBubble: pickRandom(["😱 lights out!", "🕯️ so dark!", "⚡ what happened?"]) };
        default:
          return oa;
      }
    }));
  }

  function endEvent() {
    setActiveEvent(null);
    setEventParticles([]);
    setOfficeAgents(prev => prev.map(oa => {
      if (oa.action === "gone-home") return oa;
      return { ...oa, action: "walking" as AgentAction, targetX: oa.deskX, targetY: oa.deskY, floor: oa.deskFloor, speechBubble: "😮‍💨 back to work!", direction: oa.deskX > oa.x ? "right" : "left" };
    }));
  }

  // Clock
  useEffect(() => {
    let h = 9, m = 0;
    const interval = setInterval(() => {
      m += 5;
      if (m >= 60) { m = 0; h++; }
      if (h >= 24) { h = 6; m = 0; }
      setClock(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Agent AI
  useEffect(() => {
    const interval = setInterval(() => {
      const h = parseInt(clock.split(":")[0]);
      const phase = getTimePhase(h);

      setOfficeAgents(prev => prev.map(oa => {
        if (oa.action === "walking") return oa;
        if (activeEvent && (oa.action === "panicking" || oa.action === "celebrating")) return oa;

        if (phase === "night") {
          if (oa.action !== "gone-home") return { ...oa, action: "gone-home", speechBubble: pickRandom(speechOptions["gone-home"]) };
          return oa;
        }
        if (phase === "morning" && oa.action === "gone-home") {
          return { ...oa, action: "walking", targetX: oa.deskX, targetY: oa.deskY, floor: oa.deskFloor, speechBubble: "☕ good morning!", direction: "right" };
        }
        if (phase === "evening" && oa.action !== "gone-home" && Math.random() < 0.08) {
          return { ...oa, action: "gone-home", speechBubble: pickRandom(speechOptions["gone-home"]) };
        }

        const roll = Math.random();
        const room = rooms.find(r => r.department === oa.agent.department);
        if (!room) return oa;

        if (roll < 0.25) {
          return { ...oa, action: "working", speechBubble: pickRandom(speechOptions.working) };
        }
        // Go to pantry (F1)
        if (roll < 0.35) {
          const tx = pantrySpace.x + randomBetween(30, pantrySpace.w - 30);
          const ty = pantrySpace.y + randomBetween(60, pantrySpace.h - 40);
          return { ...oa, action: "walking", targetX: tx, targetY: ty, floor: 1, speechBubble: pickRandom(speechOptions.coffee), direction: tx > oa.x ? "right" : "left" };
        }
        // Walk within own room
        if (roll < 0.50) {
          const tx = room.x + randomBetween(20, room.w - 20);
          const ty = room.y + randomBetween(40, room.h - 20);
          return { ...oa, action: "walking", targetX: tx, targetY: ty, floor: room.floor, speechBubble: pickRandom(speechOptions.chatting), direction: tx > oa.x ? "right" : "left" };
        }
        // Return to desk
        if (roll < 0.75) {
          return { ...oa, action: "walking", targetX: oa.deskX, targetY: oa.deskY, floor: oa.deskFloor, speechBubble: null, direction: oa.deskX > oa.x ? "right" : "left" };
        }
        return { ...oa, speechBubble: pickRandom(speechOptions.idle) };
      }));
    }, 3500);
    return () => clearInterval(interval);
  }, [clock]);

  // Movement
  useEffect(() => {
    const tick = setInterval(() => {
      setOfficeAgents(prev => prev.map(oa => {
        const isMoving = oa.action === "walking" || oa.action === "panicking" || oa.action === "celebrating";
        if (!isMoving) return { ...oa, frame: oa.frame + 1 };
        const dx = oa.targetX - oa.x;
        const dy = oa.targetY - oa.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 3) {
          const atDesk = Math.abs(oa.targetX - oa.deskX) < 10 && Math.abs(oa.targetY - oa.deskY) < 10;
          const atPantry = oa.floor === 1 && oa.targetX >= pantrySpace.x;

          let newAction: AgentAction = "idle";
          let bubble: string | null = null;
          if (atDesk) { newAction = "working"; bubble = pickRandom(speechOptions.working); }
          else if (atPantry) { newAction = "coffee"; bubble = pickRandom(speechOptions.snacking); }
          else { newAction = "chatting"; bubble = pickRandom(speechOptions.chatting); }
          return { ...oa, x: oa.targetX, y: oa.targetY, action: newAction, speechBubble: bubble, frame: 0 };
        }

        const speed = oa.action === "panicking" ? 3.5 : oa.action === "celebrating" ? 2.5 : 1.8;
        return { ...oa, x: oa.x + (dx / dist) * speed, y: oa.y + (dy / dist) * speed, direction: dx > 0 ? "right" : "left", frame: oa.frame + 1 };
      }));
    }, 50);
    return () => clearInterval(tick);
  }, []);

  const handleAgentClick = (oa: OfficeAgent) => {
    setSelectedAgent(oa);
    setAssignTaskId("");
    setDialogOpen(true);
  };

  const handleAssignTask = () => {
    if (!assignTaskId || !selectedAgent) return;
    setTaskList(prev =>
      prev.map(t => t.id === assignTaskId ? { ...t, assigneeId: selectedAgent.agent.id, status: "in-progress" as const } : t)
    );
    setAssignTaskId("");
  };

  const sendTo = (tx: number, ty: number, bubble: string, floor?: FloorId) => {
    if (!selectedAgent) return;
    setOfficeAgents(prev => prev.map(oa =>
      oa.agent.id === selectedAgent.agent.id
        ? { ...oa, action: "walking" as const, targetX: tx, targetY: ty, floor: floor ?? oa.floor, speechBubble: bubble, direction: tx > oa.x ? "right" : "left" }
        : oa
    ));
    setDialogOpen(false);
  };

  const agentTasks = selectedAgent ? taskList.filter(t => t.assigneeId === selectedAgent.agent.id) : [];
  const unassignedTasks = taskList.filter(t => t.status === "todo");

  // Get rooms and agents for current floor
  const floorRooms = rooms.filter(r => r.floor === currentFloor);
  const floorAgents = officeAgents.filter(oa => oa.floor === currentFloor && oa.action !== "gone-home");
  const floorSpaces = sharedSpaces[currentFloor] || [];

  // Count agents per floor
  const floorAgentCount = (f: FloorId) => officeAgents.filter(oa => oa.floor === f && oa.action !== "gone-home").length;

  // Helper to render agents for a given floor
  const renderFloorAgents = (floor: FloorId, containerW: number, containerH: number) => {
    const fAgents = officeAgents.filter(oa => oa.floor === floor && oa.action !== "gone-home");
    return fAgents.map((oa) => {
      const isMoving = oa.action === "walking" || oa.action === "panicking" || oa.action === "celebrating";
      const walkFrame = isMoving ? Math.floor(oa.frame / (oa.action === "panicking" ? 2 : 4)) % 2 : 0;
      const pctX = (oa.x / CANVAS_W) * 100;
      const pctY = (oa.y / CANVAS_H) * 100;
      const spriteSize = viewMode === "stacked" ? "w-7 h-7" : "w-10 h-10";
      const nameSize = viewMode === "stacked" ? "text-[3px]" : "text-[5px]";
      const bubbleSize = viewMode === "stacked" ? "text-[4px] -top-6 px-1 py-0.5" : "text-[6px] -top-9 px-2 py-1";
      return (
        <div
          key={oa.agent.id}
          className="absolute z-20 flex flex-col items-center cursor-pointer group"
          style={{
            left: `${pctX}%`, top: `${pctY}%`,
            transform: `translate(-50%, -50%) scaleX(${oa.direction === "left" ? -1 : 1})`,
            transition: isMoving ? "none" : "left 0.05s, top 0.05s",
          }}
          onClick={() => handleAgentClick(oa)}
        >
          <div className="absolute bottom-0 w-4 h-1 rounded-full" style={{ transform: "translateY(6px)", backgroundColor: "hsl(0 0% 0% / 0.3)" }} />
          <div className="absolute inset-0 -m-1 rounded-full border border-primary/0 group-hover:border-primary/60 transition-colors" style={{ transform: `scaleX(${oa.direction === "left" ? -1 : 1})` }} />
          {oa.speechBubble && (
            <div className={`absolute left-1/2 whitespace-nowrap bg-white text-gray-800 rounded-md font-pixel z-30 shadow-md ${bubbleSize}`}
              style={{ transform: `translateX(-50%) scaleX(${oa.direction === "left" ? -1 : 1})` }}>
              {oa.speechBubble}
              <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rotate-45" />
            </div>
          )}
          <div className="relative flex flex-col items-center" style={{ transform: isMoving ? `translateY(${walkFrame * -2}px)` : "none" }}>
            <img src={getAgentSprite(oa.agent.id, oa.agent.department)} alt={oa.agent.name}
              className={`${spriteSize} object-contain group-hover:scale-110 transition-transform drop-shadow-md`}
              style={{ imageRendering: "auto" }} draggable={false} />
            <div className={`absolute top-0 -right-0.5 w-1.5 h-1.5 rounded-full border border-white ${
              oa.agent.status === "online" ? "bg-primary" : oa.agent.status === "busy" ? "bg-accent" : "bg-muted-foreground"
            }`} />
          </div>
          <span className={`font-pixel ${nameSize} text-white mt-0.5 whitespace-nowrap bg-black/60 px-0.5 py-px rounded-sm`}
            style={{ transform: `scaleX(${oa.direction === "left" ? -1 : 1})` }}>
            {oa.agent.name}
          </span>
        </div>
      );
    });
  };

  return (
    <>
      {/* Office Header */}
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="pixel-border bg-primary px-3 py-1.5">
            <span className="font-pixel text-sm text-primary-foreground tracking-wider">2AM</span>
          </div>
          <div>
            <span className="font-pixel text-[8px] text-muted-foreground">OFFICE</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex gap-0">
            <button onClick={() => setViewMode("stacked")}
              className={`px-2 py-1 font-pixel text-[6px] border-2 transition-colors ${viewMode === "stacked" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted"}`}>
              🏢 ALL
            </button>
            <button onClick={() => setViewMode("single")}
              className={`px-2 py-1 font-pixel text-[6px] border-2 transition-colors ${viewMode === "single" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted"}`}>
              🔍 FLOOR
            </button>
          </div>
          <span className="font-pixel text-[8px] text-primary/80">{phaseInfo.skyIcon} {clock}</span>
          <span className="font-pixel text-[6px] text-muted-foreground">
            👥 {officeAgents.filter(a => a.action !== "gone-home").length}/{agents.length}
          </span>
          {!activeEvent && timePhase !== "night" && (
            <button onClick={() => triggerEvent(pickRandom(officeEvents))}
              className="px-2 py-1 font-pixel text-[6px] pixel-border bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors">
              🎲 EVENT
            </button>
          )}
        </div>
      </div>

      {/* Floor Selector (single mode) */}
      {viewMode === "single" && (
        <div className="flex items-stretch gap-0 mb-2">
          {([4, 3, 2, 1] as FloorId[]).map((f) => {
            const isActive = currentFloor === f;
            const count = floorAgentCount(f);
            return (
              <button key={f} onClick={() => setCurrentFloor(f)}
                className={`relative px-3 py-1.5 font-pixel text-[10px] transition-all border-2 ${
                  isActive ? "bg-primary text-primary-foreground border-primary z-10" : "bg-card text-muted-foreground border-border hover:bg-muted"
                }`}>
                <span className="font-bold">{f}F</span>
                {count > 0 && (
                  <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 flex items-center justify-center font-pixel text-[5px] rounded-full ${
                    isActive ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                  }`}>{count}</span>
                )}
              </button>
            );
          })}
          <div className="flex-1 border-b-2 border-border" />
          <div className="px-2 py-1.5 bg-card border-2 border-border font-pixel text-[7px] text-accent flex items-center">
            {floorLabels[currentFloor].label}
          </div>
        </div>
      )}

      {/* Event Banner */}
      {activeEvent && (
        <div className="pixel-border p-2 mb-2 flex items-center justify-between animate-pixel-pulse"
          style={{ backgroundColor: activeEvent.color, borderColor: activeEvent.color }}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{activeEvent.icon}</span>
            <div>
              <span className="font-pixel text-[9px] text-primary-foreground">{activeEvent.label}</span>
              <p className="font-pixel text-[6px] text-primary-foreground/80">{activeEvent.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[8px] text-primary-foreground">{eventTimer}s</span>
            <button onClick={endEvent} className="font-pixel text-[6px] px-2 py-1 bg-primary-foreground/20 text-primary-foreground pixel-border" style={{ borderWidth: 1 }}>
              DISMISS
            </button>
          </div>
        </div>
      )}

      {/* ===== STACKED VIEW - All floors visible ===== */}
      {viewMode === "stacked" && (
        <div className="relative pixel-border overflow-auto" style={{ height: 600, borderWidth: 4 }}>
          {/* Sky background */}
          <div className="absolute inset-0" style={{
            backgroundImage: `url(${skyBg})`,
            backgroundSize: "cover",
            backgroundPosition: "top center",
          }} />

          {/* Scrollable content with all floors stacked */}
          <div className="relative" style={{ width: "100%", minHeight: 580, padding: "10px 0" }}>
            {/* Floors stacked from top (F4) to bottom (F1) */}
            {([4, 3, 2, 1] as FloorId[]).map((floor, idx) => {
              const floorInfo = floorLabels[floor];
              const fRooms = rooms.filter(r => r.floor === floor);
              return (
                <div key={floor} className="relative mx-auto cursor-pointer"
                  style={{ width: "92%", height: 130, marginBottom: idx < 3 ? 8 : 0 }}
                  onClick={() => { setCurrentFloor(floor); setViewMode("single"); }}
                >
                  {/* Floor background image */}
                  <div className="absolute inset-0 rounded-sm overflow-hidden" style={{
                    border: "3px solid hsl(210 30% 40% / 0.6)",
                    boxShadow: "0 4px 12px hsl(0 0% 0% / 0.3), inset 0 0 0 1px hsl(0 0% 100% / 0.1)",
                  }}>
                    <img src={floorBgImages[floor]} alt={`${floor}F`}
                      className="w-full h-full object-cover" style={{ imageRendering: "auto" }} draggable={false} />

                    {/* Slight 3D wall effect - top */}
                    <div className="absolute top-0 left-0 right-0 h-3" style={{
                      background: "linear-gradient(180deg, hsl(210 20% 50% / 0.4) 0%, transparent 100%)",
                    }} />
                    {/* Left wall edge */}
                    <div className="absolute top-0 left-0 w-2 h-full" style={{
                      background: "linear-gradient(90deg, hsl(210 20% 60% / 0.3) 0%, transparent 100%)",
                    }} />

                    {/* Floor label */}
                    <div className="absolute top-1.5 left-2 z-10">
                      <div className="bg-accent/90 px-2 py-0.5 shadow-md">
                        <span className="font-pixel text-[10px] text-accent-foreground font-bold">{floor}F</span>
                      </div>
                    </div>

                    {/* Department labels */}
                    <div className="absolute top-1.5 right-2 z-10 flex gap-1">
                      {fRooms.map(room => {
                        const info = departmentInfo[room.department];
                        return (
                          <div key={room.department} className="bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded-sm">
                            <span className="text-[8px]">{info.icon}</span>
                            <span className="font-pixel text-[5px] ml-0.5 text-white">{info.label.toUpperCase()}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Agents on this floor */}
                    {renderFloorAgents(floor, 100, 130)}

                    {/* Day/Night overlay */}
                    {phaseInfo.opacity > 0 && (
                      <div className="absolute inset-0 pointer-events-none" style={{
                        backgroundColor: phaseInfo.bg, opacity: phaseInfo.opacity * 0.7,
                        mixBlendMode: "multiply",
                      }} />
                    )}
                  </div>

                  {/* Blue glass side panel - isometric effect */}
                  <div className="absolute -right-1 top-2 bottom-0 w-3" style={{
                    background: "linear-gradient(180deg, hsl(210 60% 55% / 0.7) 0%, hsl(210 50% 40% / 0.5) 100%)",
                    transform: "skewY(-2deg)",
                    borderRight: "2px solid hsl(210 40% 30% / 0.5)",
                  }} />
                  {/* Bottom edge - floor thickness */}
                  <div className="absolute -bottom-1 left-0 right-0 h-2" style={{
                    background: "linear-gradient(180deg, hsl(210 20% 35% / 0.6) 0%, hsl(210 20% 25% / 0.8) 100%)",
                    borderBottom: "2px solid hsl(210 30% 20% / 0.5)",
                  }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== SINGLE FLOOR VIEW ===== */}
      {viewMode === "single" && (
        <div className="relative" style={{ height: 480 }}>
          <div ref={containerRef} className="pixel-border relative overflow-hidden select-none h-full" style={{ borderWidth: 4 }}>
            <div className="relative w-full h-full">
              <img src={floorBgImages[currentFloor]} alt={`Floor ${currentFloor}`}
                className="absolute inset-0 w-full h-full object-cover" style={{ imageRendering: "auto" }} draggable={false} />

              <div className="absolute top-3 left-3 z-30">
                <div className="bg-accent px-2.5 py-1 shadow-[2px_2px_0_0_hsl(0_0%_0%/0.5)]">
                  <span className="font-pixel text-[12px] text-accent-foreground font-bold">{currentFloor}F</span>
                </div>
              </div>

              {floorRooms.map(room => {
                const info = departmentInfo[room.department];
                const labelPositions: Record<string, { x: string; y: string }> = {
                  support: { x: "5%", y: "8%" }, devops: { x: "5%", y: "8%" },
                  product: { x: "55%", y: "8%" }, design: { x: "5%", y: "8%" },
                  qa: { x: "55%", y: "8%" }, engineering: { x: "5%", y: "8%" },
                };
                const pos = labelPositions[room.department] || { x: "10%", y: "10%" };
                return (
                  <div key={room.department} className="absolute z-10" style={{ left: pos.x, top: pos.y }}>
                    <div className="bg-card/80 backdrop-blur-sm px-2 py-0.5 pixel-border" style={{ borderWidth: 2 }}>
                      <span className="text-xs">{info.icon}</span>
                      <span className="font-pixel text-[7px] ml-1" style={{ color: info.color }}>{info.label.toUpperCase()}</span>
                      <span className="font-pixel text-[5px] text-muted-foreground ml-1">
                        ({agents.filter(a => a.department === room.department && a.status !== "offline").length})
                      </span>
                    </div>
                  </div>
                );
              })}

              {floorSpaces.map((space, si) => (
                <div key={si} className="absolute z-10" style={{ left: "75%", top: "8%" }}>
                  <div className="bg-card/80 backdrop-blur-sm px-2 py-0.5 pixel-border" style={{ borderWidth: 2 }}>
                    <span className="text-xs">{space.type === "pantry" ? "🍳" : space.type === "meeting" ? "📋" : "🖧"}</span>
                    <span className="font-pixel text-[6px] text-accent/80 ml-1">{space.type.toUpperCase().replace("-", " ")}</span>
                  </div>
                </div>
              ))}

              <AmbientSparkles canvasW={CANVAS_W} canvasH={CANVAS_H} />

              {eventParticles.map(p => (
                <div key={p.id} className="absolute pointer-events-none z-30 animate-sparkle"
                  style={{ left: `${(p.x / CANVAS_W) * 100}%`, top: `${(p.y / CANVAS_H) * 100}%`, fontSize: 16, animationDelay: `${p.delay}s`, animationDuration: "3s" }}>
                  {p.emoji}
                </div>
              ))}

              {activeEvent?.type === "power-outage" && (
                <div className="absolute inset-0 pointer-events-none z-35 animate-monitor-flicker" style={{ backgroundColor: "hsl(0 0% 0% / 0.5)" }} />
              )}
              {activeEvent?.type === "fire-drill" && (
                <div className="absolute inset-0 pointer-events-none z-35 animate-pixel-pulse" style={{ border: "4px solid hsl(0 85% 55% / 0.6)" }} />
              )}

              {renderFloorAgents(currentFloor, CANVAS_W, CANVAS_H)}

              {agents.filter(a => a.status === "offline" && getDeptFloor(a.department) === currentFloor).map((agent, i) => {
                const room = rooms.find(r => r.department === agent.department);
                if (!room) return null;
                const offX = ((room.x + room.w - 30) / CANVAS_W) * 100;
                const offY = ((room.y + room.h - 40 - i * 30) / CANVAS_H) * 100;
                return (
                  <div key={agent.id} className="absolute z-10 flex flex-col items-center opacity-20 cursor-pointer hover:opacity-40 transition-opacity"
                    style={{ left: `${offX}%`, top: `${offY}%` }}
                    onClick={() => {
                      setSelectedAgent({ agent, floor: room.floor, x: room.x + room.w - 30, y: room.y + room.h - 40,
                        targetX: room.x + room.w - 30, targetY: room.y + room.h - 40,
                        action: "idle", deskX: room.x + 50, deskY: room.y + 80, deskFloor: room.floor,
                        speechBubble: null, direction: "right", frame: 0 });
                      setAssignTaskId(""); setDialogOpen(true);
                    }}>
                    <img src={getAgentSprite(agent.id, agent.department)} alt={agent.name} className="w-8 h-8 object-contain grayscale" draggable={false} />
                    <span className="font-pixel text-[5px] text-muted-foreground">{agent.name}</span>
                  </div>
                );
              })}

              {phaseInfo.opacity > 0 && (
                <div className="absolute inset-0 pointer-events-none z-40" style={{
                  backgroundColor: phaseInfo.bg, opacity: phaseInfo.opacity,
                  transition: "background-color 2s, opacity 2s", mixBlendMode: "multiply",
                }} />
              )}

              {timePhase === "night" && (
                <div className="absolute inset-0 pointer-events-none z-35">
                  {Array.from({ length: 15 }, (_, i) => (
                    <div key={i} className="absolute rounded-full animate-sparkle" style={{
                      left: `${5 + (i * 47) % 90}%`, top: `${3 + (i * 31) % 15}%`,
                      width: 2, height: 2, backgroundColor: "hsl(45 80% 90% / 0.4)",
                      animationDelay: `${i * 0.4}s`,
                    }} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Floor minimap */}
          <div className="absolute bottom-3 right-3 z-50 pixel-border bg-card/90 backdrop-blur-sm p-2 flex flex-col gap-1" style={{ width: 50 }}>
            <div className="font-pixel text-[4px] text-muted-foreground text-center mb-1">FLOORS</div>
            {([4, 3, 2, 1] as FloorId[]).map(f => {
              const count = floorAgentCount(f);
              return (
                <button key={f} onClick={() => setCurrentFloor(f)}
                  className={`w-full h-7 flex items-center justify-center gap-1 font-pixel text-[6px] transition-colors border ${
                    currentFloor === f ? "bg-primary/20 border-primary text-primary" : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/60"
                  }`}>
                  {f}F {count > 0 && <span className="text-[5px] opacity-60">·{count}</span>}
                </button>
              );
            })}
            <button onClick={() => setViewMode("stacked")}
              className="w-full h-6 flex items-center justify-center font-pixel text-[5px] border border-accent text-accent hover:bg-accent/20 transition-colors mt-1">
              🏢 ALL
            </button>
          </div>
        </div>
      )}

      {/* Agent Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="pixel-border max-w-md bg-card border-border">
          {selectedAgent && (
            <>
              <DialogHeader>
                <DialogTitle className="font-pixel text-sm text-primary flex items-center gap-3">
                  <img src={getAgentSprite(selectedAgent.agent.id, selectedAgent.agent.department)} alt={selectedAgent.agent.name} className="w-12 h-12 object-contain" draggable={false} />
                  <div>
                    <div>{selectedAgent.agent.name}</div>
                    <div className="font-pixel-body text-xs text-muted-foreground font-normal mt-0.5">
                      {selectedAgent.agent.specialty} • {departmentInfo[selectedAgent.agent.department].icon} {departmentInfo[selectedAgent.agent.department].label}
                    </div>
                  </div>
                </DialogTitle>
                <DialogDescription className="sr-only">Agent details and task management</DialogDescription>
              </DialogHeader>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className="font-pixel text-[7px] gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedAgent.agent.status === "online" ? "bg-primary" :
                    selectedAgent.agent.status === "busy" ? "bg-accent" : "bg-muted-foreground"
                  }`} />
                  {selectedAgent.agent.status.toUpperCase()}
                </Badge>
                <Badge variant="secondary" className="font-pixel text-[7px]">{actionLabel[selectedAgent.action]}</Badge>
                <Badge variant="outline" className="font-pixel text-[7px]">{selectedAgent.agent.role.toUpperCase()}</Badge>
                <Badge variant="outline" className="font-pixel text-[7px]">📍 {selectedAgent.floor}F</Badge>
              </div>

              <div className="mt-3">
                <h3 className="font-pixel text-[7px] text-accent mb-2">⚡ QUICK COMMANDS</h3>
                <div className="flex flex-wrap gap-1.5">
                  <Button size="sm" variant="outline" className="font-pixel text-[7px] h-6"
                    onClick={() => sendTo(selectedAgent.deskX, selectedAgent.deskY, "🫡 on it!", selectedAgent.deskFloor)}>
                    🖥️ Desk
                  </Button>
                  <Button size="sm" variant="outline" className="font-pixel text-[7px] h-6"
                    onClick={() => sendTo(pantrySpace.x + randomBetween(30, 150), pantrySpace.y + randomBetween(60, 200), "☕ coffee time!", 1)}>
                    ☕ Pantry
                  </Button>
                  <Button size="sm" variant="default" className="font-pixel text-[7px] h-6"
                    onClick={() => { setChatAgent(selectedAgent.agent); setDialogOpen(false); }}>
                    💬 Chat
                  </Button>
                </div>
              </div>

              <div className="mt-3">
                <h3 className="font-pixel text-[7px] text-accent mb-2">📋 TASKS ({agentTasks.length})</h3>
                <ScrollArea className="max-h-[120px]">
                  {agentTasks.length === 0 ? (
                    <p className="font-pixel-body text-xs text-muted-foreground">No tasks assigned</p>
                  ) : (
                    <div className="space-y-1">
                      {agentTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-2 p-1.5 bg-muted/50 pixel-border" style={{ borderWidth: 2 }}>
                          <Badge className={`font-pixel text-[5px] ${priorityColor[task.priority]}`}>{task.priority.toUpperCase()}</Badge>
                          <div className="flex-1 min-w-0">
                            <p className="font-pixel text-[6px] text-foreground truncate">{task.title}</p>
                            <p className="font-pixel text-[5px] text-muted-foreground">{task.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {unassignedTasks.length > 0 && (
                <div className="mt-3">
                  <h3 className="font-pixel text-[7px] text-accent mb-1">📌 ASSIGN TASK</h3>
                  <div className="flex gap-2">
                    <Select value={assignTaskId} onValueChange={setAssignTaskId}>
                      <SelectTrigger className="font-pixel text-[7px] h-7 flex-1">
                        <SelectValue placeholder="Select task..." />
                      </SelectTrigger>
                      <SelectContent>
                        {unassignedTasks.map(t => (
                          <SelectItem key={t.id} value={t.id} className="font-pixel text-[7px]">{t.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" className="font-pixel text-[7px] h-7" disabled={!assignTaskId} onClick={handleAssignTask}>
                      ASSIGN
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Agent Chat Panel */}
      <Dialog open={!!chatAgent} onOpenChange={(open) => { if (!open) setChatAgent(null); }}>
        <DialogContent className="pixel-border max-w-sm bg-card border-border p-0 h-[480px] flex flex-col overflow-hidden">
          <DialogTitle className="sr-only">Chat with {chatAgent?.name}</DialogTitle>
          <DialogDescription className="sr-only">Chat conversation with agent</DialogDescription>
          {chatAgent && (
            <AgentChat agent={chatAgent} onClose={() => setChatAgent(null)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
