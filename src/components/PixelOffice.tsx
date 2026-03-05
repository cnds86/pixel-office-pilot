import { useState, useEffect, useRef } from "react";
import { agents, tasks, departmentInfo } from "@/data/mockData";
import type { Agent, Task, Department } from "@/data/mockData";
import { CoffeeSteam, DustInLight, MonitorGlow, AmbientSparkles } from "./OfficeParticles";
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
import { PixelCharacter } from "./PixelCharacter";

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

const CANVAS_W = 1400;
const CANVAS_H = 560;

const rooms: RoomDef[] = [
  // ── F1 - Support + Lobby ──
  {
    department: "support", floor: 1,
    x: 20, y: 40, w: 320, h: 250,
    floorColor: "hsl(50 12% 14%)",
    desks: [
      { x: 60, y: 80 }, { x: 160, y: 80 },
      { x: 60, y: 170 }, { x: 160, y: 170 },
    ],
  },
  // ── F2 - DevOps + Product ──
  {
    department: "devops", floor: 2,
    x: 20, y: 40, w: 340, h: 240,
    floorColor: "hsl(30 15% 13%)",
    desks: [
      { x: 60, y: 80 }, { x: 160, y: 80 }, { x: 260, y: 80 },
      { x: 60, y: 170 },
    ],
  },
  {
    department: "product", floor: 2,
    x: 380, y: 40, w: 340, h: 240,
    floorColor: "hsl(270 12% 13%)",
    desks: [
      { x: 60, y: 80 }, { x: 160, y: 80 }, { x: 260, y: 80 },
      { x: 60, y: 170 },
    ],
  },
  // ── F3 - Design + QA ──
  {
    department: "design", floor: 3,
    x: 20, y: 40, w: 380, h: 240,
    floorColor: "hsl(320 15% 13%)",
    desks: [
      { x: 60, y: 80 }, { x: 160, y: 80 }, { x: 280, y: 80 },
      { x: 60, y: 170 }, { x: 160, y: 170 },
    ],
  },
  {
    department: "qa", floor: 3,
    x: 420, y: 40, w: 340, h: 240,
    floorColor: "hsl(140 12% 13%)",
    desks: [
      { x: 60, y: 80 }, { x: 160, y: 80 }, { x: 260, y: 80 },
      { x: 60, y: 170 }, { x: 160, y: 170 },
    ],
  },
  // ── F4 - Engineering (large open floor) ──
  {
    department: "engineering", floor: 4,
    x: 20, y: 40, w: 560, h: 240,
    floorColor: "hsl(220 18% 14%)",
    desks: [
      { x: 60, y: 80 }, { x: 160, y: 80 }, { x: 260, y: 80 }, { x: 380, y: 80 },
      { x: 60, y: 170 }, { x: 160, y: 170 }, { x: 260, y: 170 }, { x: 380, y: 170 },
    ],
  },
];

// Shared spaces per floor — more rooms!
const sharedSpaces: Record<FloorId, { type: string; label: string; icon: string; x: number; y: number; w: number; h: number }[]> = {
  1: [
    { type: "pantry", label: "PANTRY", icon: "🍳", x: 360, y: 40, w: 280, h: 250 },
    { type: "lobby", label: "LOBBY", icon: "🏢", x: 660, y: 40, w: 220, h: 250 },
    { type: "mail-room", label: "MAIL ROOM", icon: "📬", x: 900, y: 40, w: 180, h: 120 },
    { type: "gym", label: "GYM", icon: "🏋️", x: 900, y: 175, w: 180, h: 115 },
    { type: "security", label: "SECURITY", icon: "🛡️", x: 1100, y: 40, w: 140, h: 250 },
  ],
  2: [
    { type: "meeting", label: "MEETING A", icon: "📋", x: 740, y: 40, w: 200, h: 240 },
    { type: "phone-booth", label: "PHONE BOOTHS", icon: "📞", x: 960, y: 40, w: 120, h: 120 },
    { type: "print-room", label: "PRINT ROOM", icon: "🖨️", x: 960, y: 175, w: 120, h: 105 },
    { type: "storage", label: "STORAGE", icon: "📦", x: 1100, y: 40, w: 140, h: 240 },
  ],
  3: [
    { type: "workshop", label: "WORKSHOP", icon: "🔧", x: 780, y: 40, w: 220, h: 240 },
    { type: "library", label: "LIBRARY", icon: "📚", x: 1020, y: 40, w: 200, h: 240 },
  ],
  4: [
    { type: "server-room", label: "SERVER ROOM", icon: "🖧", x: 600, y: 40, w: 200, h: 240 },
    { type: "lab", label: "R&D LAB", icon: "🧬", x: 820, y: 40, w: 240, h: 240 },
    { type: "meeting", label: "MEETING B", icon: "📊", x: 1080, y: 40, w: 160, h: 120 },
    { type: "lounge", label: "DEV LOUNGE", icon: "🎮", x: 1080, y: 175, w: 160, h: 105 },
  ],
};

const floorLabels: Record<FloorId, { label: string; departments: string }> = {
  1: { label: "LOBBY & SUPPORT", departments: "Support • Pantry • Break Room" },
  2: { label: "OPERATIONS", departments: "DevOps • Product • Meeting Room" },
  3: { label: "CREATIVE & QA", departments: "Design • QA & Testing" },
  4: { label: "ENGINEERING", departments: "Engineering • Server Room" },
};

type AgentAction = "working" | "walking" | "coffee" | "meeting" | "idle" | "printing" | "chatting" | "snacking" | "calling" | "gone-home" | "panicking" | "celebrating" | "gym" | "library" | "workshop" | "lounge" | "mailing" | "security-check";

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
  // Elevator transit
  pendingFloor?: FloorId;
  pendingTargetX?: number;
  pendingTargetY?: number;
  pendingAction?: string;
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
  gym: ["💪 one more rep!", "🏋️ leg day!", "🏃 cardio time!", "💦 feeling the burn!", "🧘 stretching..."],
  library: ["📖 reading docs...", "📚 studying...", "🤓 interesting...", "📕 good book!", "🔍 researching..."],
  workshop: ["🔧 fixing stuff...", "🔨 building!", "⚙️ tinkering...", "🛠️ repairing...", "🔩 assembling..."],
  lounge: ["🎮 gaming break!", "☕ chilling...", "🛋️ relaxing...", "📺 watching...", "😎 vibing..."],
  mailing: ["📬 checking mail...", "📦 got a package!", "✉️ sending letter..."],
  "security-check": ["🛡️ badge check!", "🔒 scanning...", "🪪 verified!"],
};

const actionLabel: Record<AgentAction, string> = {
  working: "Working", walking: "Walking", coffee: "Coffee break", meeting: "In meeting",
  idle: "Idle", printing: "Printing", chatting: "Chatting", snacking: "Snacking", calling: "On a call",
  "gone-home": "Gone home", panicking: "Panicking!", celebrating: "Celebrating!",
  gym: "At the Gym", library: "In Library", workshop: "In Workshop", lounge: "In Lounge",
  mailing: "Checking Mail", "security-check": "Security Check",
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
const pantrySpace = sharedSpaces[1].find(s => s.type === "pantry")!;

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
  const [activeEvent, setActiveEvent] = useState<OfficeEvent | null>(null);
  const [eventTimer, setEventTimer] = useState(0);
  const [eventParticles, setEventParticles] = useState<{ id: number; x: number; y: number; emoji: string; delay: number }[]>([]);
  const [chatAgent, setChatAgent] = useState<Agent | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [floorTransition, setFloorTransition] = useState<'idle' | 'exit' | 'enter'>('idle');
  const [transitionDirection, setTransitionDirection] = useState<'up' | 'down'>('up');
  const [elevatorAgentIds, setElevatorAgentIds] = useState<Set<string>>(new Set());
  const [elevatorDoorOpen, setElevatorDoorOpen] = useState(true);
  const [elevatorFloorIndicator, setElevatorFloorIndicator] = useState<FloorId>(4);

  const ELEVATOR_X = 1306;
  const ELEVATOR_Y = 336;

  const switchFloor = (newFloor: FloorId) => {
    if (newFloor === currentFloor || floorTransition !== 'idle') return;
    const dir = newFloor > currentFloor ? 'up' : 'down';
    setTransitionDirection(dir);
    setFloorTransition('exit');
    setElevatorDoorOpen(false);
    setElevatorFloorIndicator(currentFloor);
    setTimeout(() => {
      setCurrentFloor(newFloor);
      setFloorTransition('enter');
      setElevatorFloorIndicator(newFloor);
      setTimeout(() => {
        setFloorTransition('idle');
        setElevatorDoorOpen(true);
      }, 400);
    }, 350);
  };

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
          return { ...oa, action: "panicking" as AgentAction, targetX: tx, targetY: ty, floor: 1 as FloorId, speechBubble: pickRandom(speechOptions.panicking), direction: (tx > oa.x ? "right" : "left") as "left" | "right" };
        }
        case "pizza-party":
        case "birthday": {
          const tx = pantrySpace.x + randomBetween(20, pantrySpace.w - 20);
          const ty = pantrySpace.y + randomBetween(40, pantrySpace.h - 20);
          return { ...oa, action: "celebrating" as AgentAction, targetX: tx, targetY: ty, floor: 1 as FloorId, speechBubble: pickRandom(speechOptions.celebrating), direction: (tx > oa.x ? "right" : "left") as "left" | "right" };
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
          return { ...oa, action: "walking" as AgentAction, targetX: tx, targetY: ty, floor: 2 as FloorId, speechBubble: "📢 all-hands!", direction: (tx > oa.x ? "right" : "left") as "left" | "right" };
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
      return { ...oa, action: "walking" as AgentAction, targetX: oa.deskX, targetY: oa.deskY, floor: oa.deskFloor, speechBubble: "😮‍💨 back to work!", direction: (oa.deskX > oa.x ? "right" : "left") as "left" | "right" };
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

      // Helper: route cross-floor moves through elevator
      const crossFloorMove = (oa: OfficeAgent, targetFloor: FloorId, tx: number, ty: number, bubble: string): OfficeAgent => {
        if (targetFloor === oa.floor) {
          return { ...oa, action: "walking" as AgentAction, targetX: tx, targetY: ty, floor: targetFloor, speechBubble: bubble, direction: (tx > oa.x ? "right" : "left") as "left" | "right" };
        }
        // Walk to elevator on current floor first
        return {
          ...oa,
          action: "walking" as AgentAction,
          targetX: ELEVATOR_X,
          targetY: ELEVATOR_Y,
          speechBubble: "🛗 elevator...",
          direction: (ELEVATOR_X > oa.x ? "right" : "left") as "left" | "right",
          pendingFloor: targetFloor,
          pendingTargetX: tx,
          pendingTargetY: ty,
          pendingAction: bubble,
        };
      };

      setOfficeAgents(prev => prev.map(oa => {
        if (oa.action === "walking") return oa;
        if (activeEvent && (oa.action === "panicking" || oa.action === "celebrating")) return oa;

        if (phase === "night") {
          if (oa.action !== "gone-home") return { ...oa, action: "gone-home", speechBubble: pickRandom(speechOptions["gone-home"]) };
          return oa;
        }
        if (phase === "morning" && oa.action === "gone-home") {
          return crossFloorMove(oa, oa.deskFloor, oa.deskX, oa.deskY, "☕ good morning!");
        }
        if (phase === "evening" && oa.action !== "gone-home" && Math.random() < 0.08) {
          return { ...oa, action: "gone-home", speechBubble: pickRandom(speechOptions["gone-home"]) };
        }

        const roll = Math.random();
        const room = rooms.find(r => r.department === oa.agent.department);
        if (!room) return oa;

        if (roll < 0.20) {
          return { ...oa, action: "working", speechBubble: pickRandom(speechOptions.working) };
        }
        // Go to pantry (F1) for coffee/snack
        if (roll < 0.28) {
          const tx = pantrySpace.x + randomBetween(30, pantrySpace.w - 30);
          const ty = pantrySpace.y + randomBetween(60, pantrySpace.h - 40);
          return crossFloorMove(oa, 1, tx, ty, pickRandom(speechOptions.coffee));
        }
        // Go to Gym (F1)
        if (roll < 0.34) {
          const gymSpace = sharedSpaces[1].find(s => s.type === "gym");
          if (gymSpace) {
            const tx = gymSpace.x + randomBetween(20, gymSpace.w - 20);
            const ty = gymSpace.y + randomBetween(20, gymSpace.h - 20);
            return crossFloorMove(oa, 1, tx, ty, "💪 gym time!");
          }
        }
        // Go to Library (F3)
        if (roll < 0.40) {
          const libSpace = sharedSpaces[3].find(s => s.type === "library");
          if (libSpace) {
            const tx = libSpace.x + randomBetween(20, libSpace.w - 20);
            const ty = libSpace.y + randomBetween(40, libSpace.h - 20);
            return crossFloorMove(oa, 3, tx, ty, "📚 reading time!");
          }
        }
        // Go to Workshop (F3)
        if (roll < 0.45) {
          const workshopSpace = sharedSpaces[3].find(s => s.type === "workshop");
          if (workshopSpace) {
            const tx = workshopSpace.x + randomBetween(20, workshopSpace.w - 20);
            const ty = workshopSpace.y + randomBetween(40, workshopSpace.h - 20);
            return crossFloorMove(oa, 3, tx, ty, "🔧 fixing stuff!");
          }
        }
        // Go to Lounge (F4)
        if (roll < 0.50) {
          const loungeSpace = sharedSpaces[4].find(s => s.type === "lounge");
          if (loungeSpace) {
            const tx = loungeSpace.x + randomBetween(20, loungeSpace.w - 20);
            const ty = loungeSpace.y + randomBetween(20, loungeSpace.h - 20);
            return crossFloorMove(oa, 4, tx, ty, "🎮 break time!");
          }
        }
        // Go to Meeting room
        if (roll < 0.55) {
          const meetingSpaces = [...(sharedSpaces[2] || []), ...(sharedSpaces[4] || [])].filter(s => s.type === "meeting");
          const meetRoom = pickRandom(meetingSpaces);
          if (meetRoom) {
            const mFloor = (sharedSpaces[2]?.includes(meetRoom) ? 2 : 4) as FloorId;
            const tx = meetRoom.x + randomBetween(20, meetRoom.w - 20);
            const ty = meetRoom.y + randomBetween(40, meetRoom.h - 20);
            return crossFloorMove(oa, mFloor, tx, ty, pickRandom(speechOptions.meeting));
          }
        }
        // Go to Mail Room (F1)
        if (roll < 0.58) {
          const mailSpace = sharedSpaces[1].find(s => s.type === "mail-room");
          if (mailSpace) {
            const tx = mailSpace.x + randomBetween(20, mailSpace.w - 20);
            const ty = mailSpace.y + randomBetween(20, mailSpace.h - 20);
            return crossFloorMove(oa, 1, tx, ty, "📬 checking mail!");
          }
        }
        // Go to R&D Lab (F4)
        if (roll < 0.62) {
          const labSpace = sharedSpaces[4].find(s => s.type === "lab");
          if (labSpace) {
            const tx = labSpace.x + randomBetween(20, labSpace.w - 20);
            const ty = labSpace.y + randomBetween(40, labSpace.h - 20);
            return crossFloorMove(oa, 4, tx, ty, "🧬 experimenting!");
          }
        }
        // Walk within own room
        if (roll < 0.72) {
          const tx = room.x + randomBetween(20, room.w - 20);
          const ty = room.y + randomBetween(40, room.h - 20);
          return { ...oa, action: "walking" as AgentAction, targetX: tx, targetY: ty, floor: room.floor, speechBubble: pickRandom(speechOptions.chatting), direction: (tx > oa.x ? "right" : "left") as "left" | "right" };
        }
        // Return to desk
        if (roll < 0.85) {
          return crossFloorMove(oa, oa.deskFloor, oa.deskX, oa.deskY, "🫡 back to work!");
        }
        return { ...oa, speechBubble: pickRandom(speechOptions.idle) };
      }));
    }, 3500);
    return () => clearInterval(interval);
  }, [clock]);

  // Movement
  useEffect(() => {
    const tick = setInterval(() => {
      setOfficeAgents(prev => {
        const newElevatorIds = new Set<string>();
        const result = prev.map(oa => {
          const isMoving = oa.action === "walking" || oa.action === "panicking" || oa.action === "celebrating";
          if (!isMoving) return { ...oa, frame: oa.frame + 1 };
          const dx = oa.targetX - oa.x;
          const dy = oa.targetY - oa.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 3) {
            // Check if agent arrived at elevator with pending floor
            if (oa.pendingFloor && Math.abs(oa.targetX - ELEVATOR_X) < 15 && Math.abs(oa.targetY - ELEVATOR_Y) < 15) {
              newElevatorIds.add(oa.agent.id);
              // Agent enters elevator - will be "hidden" briefly then appear on new floor
              return {
                ...oa,
                x: ELEVATOR_X, y: ELEVATOR_Y,
                action: "walking" as AgentAction,
                floor: oa.pendingFloor,
                targetX: oa.pendingTargetX!,
                targetY: oa.pendingTargetY!,
                speechBubble: oa.pendingAction || "🛗 ding!",
                direction: (oa.pendingTargetX! > ELEVATOR_X ? "right" : "left") as "left" | "right",
                pendingFloor: undefined,
                pendingTargetX: undefined,
                pendingTargetY: undefined,
                pendingAction: undefined,
                frame: 0,
              };
            }

            const atDesk = Math.abs(oa.targetX - oa.deskX) < 10 && Math.abs(oa.targetY - oa.deskY) < 10;
            
            // Detect which shared space the agent arrived at
            const findSpace = (floor: FloorId) => {
              return (sharedSpaces[floor] || []).find(s =>
                oa.targetX >= s.x && oa.targetX <= s.x + s.w &&
                oa.targetY >= s.y && oa.targetY <= s.y + s.h
              );
            };
            const arrivedSpace = findSpace(oa.floor);

            let newAction: AgentAction = "idle";
            let bubble: string | null = null;

            if (atDesk) {
              newAction = "working"; bubble = pickRandom(speechOptions.working);
            } else if (arrivedSpace) {
              const spaceActionMap: Record<string, AgentAction> = {
                "pantry": "coffee", "gym": "gym", "library": "library",
                "workshop": "workshop", "lounge": "lounge", "meeting": "meeting",
                "mail-room": "mailing", "security": "security-check",
                "phone-booth": "calling", "print-room": "printing",
                "lab": "working", "server-room": "working", "lobby": "idle",
                "storage": "idle",
              };
              newAction = spaceActionMap[arrivedSpace.type] || "idle";
              bubble = pickRandom(speechOptions[newAction] || speechOptions.idle);
            } else {
              newAction = "chatting"; bubble = pickRandom(speechOptions.chatting);
            }
            return { ...oa, x: oa.targetX, y: oa.targetY, action: newAction, speechBubble: bubble, frame: 0 };
          }

          // Track agents walking to elevator
          if (oa.pendingFloor) {
            newElevatorIds.add(oa.agent.id);
          }

          const speed = oa.action === "panicking" ? 3.5 : oa.action === "celebrating" ? 2.5 : 1.8;
          const dir: "left" | "right" = dx > 0 ? "right" : "left";
          return { ...oa, x: oa.x + (dx / dist) * speed, y: oa.y + (dy / dist) * speed, direction: dir, frame: oa.frame + 1 };
        });
        // Update elevator agent tracking
        if (newElevatorIds.size !== elevatorAgentIds.size || [...newElevatorIds].some(id => !elevatorAgentIds.has(id))) {
          setTimeout(() => setElevatorAgentIds(newElevatorIds), 0);
        }
        return result;
      });
    }, 50);
    return () => clearInterval(tick);
  }, [elevatorAgentIds]);

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
        ? { ...oa, action: "walking" as const, targetX: tx, targetY: ty, floor: floor ?? oa.floor, speechBubble: bubble, direction: (tx > oa.x ? "right" : "left") as "left" | "right" }
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

  return (
    <>
      {/* Office Header with Floor Nav */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        {/* Office Name */}
        <div className="flex items-center gap-3">
          <div className="pixel-border bg-primary px-3 py-1.5">
            <span className="font-pixel text-sm text-primary-foreground tracking-wider">2AM</span>
          </div>
          <div>
            <span className="font-pixel text-[8px] text-muted-foreground">OFFICE</span>
            <span className="font-pixel text-[7px] text-muted-foreground/60 ml-2">
              {floorLabels[currentFloor].departments}
            </span>
          </div>
        </div>

        {/* Clock & Status */}
        <div className="flex items-center gap-3">
          <span className="font-pixel text-[8px] text-primary/80">{phaseInfo.skyIcon} {clock}</span>
          <span className="font-pixel text-[6px] text-muted-foreground">
            👥 {officeAgents.filter(a => a.action !== "gone-home").length}/{agents.length}
          </span>
          {!activeEvent && timePhase !== "night" && (
            <button
              onClick={() => triggerEvent(pickRandom(officeEvents))}
              className="px-2 py-1 font-pixel text-[6px] pixel-border bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
            >
              🎲 EVENT
            </button>
          )}
        </div>
      </div>

      {/* Floor Selector - styled like the reference "1F" indicator */}
      <div className="flex items-stretch gap-0 mb-3">
        {([4, 3, 2, 1] as FloorId[]).map((f) => {
          const isActive = currentFloor === f;
          const count = floorAgentCount(f);
          return (
            <button
              key={f}
              onClick={() => switchFloor(f)}
              className={`relative px-4 py-2 font-pixel text-[10px] transition-all border-2 ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary z-10 shadow-[3px_3px_0_0_hsl(var(--primary)/0.4)]"
                  : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              <span className="text-sm font-bold">{f}F</span>
              {count > 0 && (
                <span className={`absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center font-pixel text-[5px] rounded-full ${
                  isActive ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
        <div className="flex-1 border-b-2 border-border" />
        <div className="px-3 py-2 bg-card border-2 border-border font-pixel text-[7px] text-accent flex items-center gap-1">
          {floorLabels[currentFloor].label}
        </div>
      </div>

      {/* Event Banner */}
      {activeEvent && (
        <div
          className="pixel-border p-2 mb-2 flex items-center justify-between animate-pixel-pulse"
          style={{ backgroundColor: activeEvent.color, borderColor: activeEvent.color }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{activeEvent.icon}</span>
            <div>
              <span className="font-pixel text-[9px] text-primary-foreground">{activeEvent.label}</span>
              <p className="font-pixel text-[6px] text-primary-foreground/80">{activeEvent.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[8px] text-primary-foreground">{eventTimer}s</span>
            <button onClick={endEvent} className="font-pixel text-[6px] px-2 py-1 bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 pixel-border" style={{ borderWidth: 1 }}>
              DISMISS
            </button>
          </div>
        </div>
      )}

      {/* Office Canvas */}
      <div className="relative" style={{ height: 620 }}>
        <div
          ref={containerRef}
          className="pixel-border bg-card relative overflow-x-auto overflow-y-hidden select-none h-full"
        >
          <div className="relative" style={{
            width: CANVAS_W, height: CANVAS_H, minWidth: CANVAS_W,
            transition: floorTransition !== 'idle' ? 'transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease' : 'none',
            transform: floorTransition === 'exit'
              ? `translateY(${transitionDirection === 'up' ? '40px' : '-40px'})` 
              : floorTransition === 'enter'
              ? 'translateY(0)'
              : 'none',
            opacity: floorTransition === 'exit' ? 0 : 1,
          }}>
            {/* Background - isometric style floor */}
            <div className="absolute inset-0" style={{
              backgroundColor: "hsl(220 15% 10%)",
              backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 39px, hsl(0 0% 100% / 0.015) 39px, hsl(0 0% 100% / 0.015) 40px), repeating-linear-gradient(0deg, transparent, transparent 39px, hsl(0 0% 100% / 0.015) 39px, hsl(0 0% 100% / 0.015) 40px)",
            }} />

            {/* Isometric wall top effect */}
            <div className="absolute top-0 left-0 right-0 h-10 z-0" style={{
              background: "linear-gradient(180deg, hsl(220 18% 18%) 0%, hsl(220 15% 12%) 60%, transparent 100%)",
            }} />

            {/* Side walls */}
            <div className="absolute top-0 left-0 w-5 h-full" style={{
              background: "linear-gradient(90deg, hsl(220 18% 16%), transparent)",
            }} />
            <div className="absolute top-0 right-0 w-5 h-full" style={{
              background: "linear-gradient(270deg, hsl(220 18% 16%), transparent)",
            }} />

            {/* Floor label */}
            <div className="absolute top-2 left-3 z-30 flex items-center gap-1.5">
              <div className="bg-accent px-2 py-0.5">
                <span className="font-pixel text-[11px] text-accent-foreground font-bold">{currentFloor}F</span>
              </div>
            </div>

            {/* Outdoor view (right side) - sky & cityscape like reference */}
            {currentFloor >= 3 && (
              <div className="absolute top-0 right-0 w-20 h-full z-0 overflow-hidden" style={{
                background: timePhase === "night"
                  ? "linear-gradient(180deg, hsl(230 40% 15%) 0%, hsl(230 30% 20%) 100%)"
                  : timePhase === "evening"
                  ? "linear-gradient(180deg, hsl(25 60% 40%) 0%, hsl(30 50% 50%) 100%)"
                  : "linear-gradient(180deg, hsl(200 60% 70%) 0%, hsl(200 50% 80%) 100%)",
              }}>
                {/* Simplified city silhouette */}
                <div className="absolute bottom-0 left-0 right-0" style={{ height: 60 }}>
                  {[10, 25, 40, 55].map((x, i) => (
                    <div key={i} className="absolute bottom-0" style={{
                      left: x, width: 10, height: 20 + i * 8,
                      backgroundColor: timePhase === "night" ? "hsl(230 20% 12%)" : "hsl(220 10% 60% / 0.5)",
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Department Rooms */}
            {floorRooms.map(room => {
              const info = departmentInfo[room.department];
              return (
                <div key={room.department}>
                  {/* Floor tiles */}
                  <div className="absolute" style={{
                    left: room.x, top: room.y, width: room.w, height: room.h,
                    backgroundColor: room.floorColor,
                    backgroundImage: `repeating-conic-gradient(hsl(0 0% 100% / 0.02) 0% 25%, transparent 0% 50%) 0 0 / 40px 40px`,
                  }} />

                  {/* Room border walls */}
                  <div className="absolute" style={{ left: room.x, top: room.y, width: room.w, height: 3, backgroundColor: "hsl(var(--border))" }} />
                  <div className="absolute" style={{ left: room.x, top: room.y, width: 3, height: room.h, backgroundColor: "hsl(var(--border))" }} />
                  <div className="absolute" style={{ left: room.x + room.w - 3, top: room.y, width: 3, height: room.h, backgroundColor: "hsl(var(--border))" }} />
                  <div className="absolute" style={{ left: room.x, top: room.y + room.h - 3, width: room.w, height: 3, backgroundColor: "hsl(var(--border))" }} />

                  {/* Door */}
                  <div className="absolute" style={{
                    left: room.x + room.w - 3, top: room.y + room.h / 2 - 20, width: 6, height: 40,
                    backgroundColor: room.floorColor,
                  }} />

                  {/* Room label */}
                  <div className="absolute z-10 flex items-center gap-1.5" style={{ left: room.x + 10, top: room.y + 10 }}>
                    <span className="text-sm">{info.icon}</span>
                    <span className="font-pixel text-[7px]" style={{ color: info.color }}>{info.label.toUpperCase()}</span>
                    <span className="font-pixel text-[6px] text-muted-foreground">
                      ({agents.filter(a => a.department === room.department && a.status !== "offline").length})
                    </span>
                  </div>

                  {/* Ceiling lights */}
                  {[0.3, 0.7].map((pct, li) => {
                    const isLightOn = timePhase === "evening" || timePhase === "night";
                    return (
                      <div key={li} className="absolute" style={{ left: room.x + room.w * pct - 16, top: room.y + 4, width: 32, height: 6 }}>
                        <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: isLightOn ? "hsl(45 80% 70% / 0.6)" : "hsl(0 0% 40% / 0.3)" }} />
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-40 h-48 rounded-full" style={{ opacity: isLightOn ? phaseInfo.lightIntensity : 0.03, background: "radial-gradient(ellipse, hsl(45 100% 85%), transparent)", transition: "opacity 1s" }} />
                      </div>
                    );
                  })}

                  {/* Desks */}
                  {room.desks.map((desk, di) => (
                    <div key={di} className="absolute" style={{ left: room.x + desk.x - 22, top: room.y + desk.y - 14 }}>
                      <div className="w-[44px] h-[28px] bg-muted pixel-border flex items-center justify-center relative" style={{ borderWidth: 2 }}>
                        <span className="text-[10px]">🖥️</span>
                        <div className="absolute -top-1 w-8 h-5 opacity-[0.06] rounded-full" style={{ background: "radial-gradient(ellipse, hsl(200 80% 70%), transparent)" }} />
                      </div>
                      <div className="w-[44px] h-[10px] bg-muted/50 pixel-border mt-0.5" style={{ borderWidth: 1 }} />
                    </div>
                  ))}

                  {/* Whiteboard */}
                  <div className="absolute" style={{ left: room.x + room.w - 65, top: room.y + 35 }}>
                    <div className="w-[50px] h-[30px] bg-foreground/5 pixel-border flex flex-col items-center justify-center gap-px p-1" style={{ borderWidth: 2 }}>
                      <div className="w-8 h-px" style={{ backgroundColor: info.color, opacity: 0.4 }} />
                      <div className="w-6 h-px bg-muted-foreground/20" />
                      <div className="w-9 h-px" style={{ backgroundColor: info.color, opacity: 0.3 }} />
                    </div>
                  </div>

                  {/* Plant */}
                  <div className="absolute" style={{ left: room.x + 10, top: room.y + room.h - 35 }}>
                    <span className="text-lg">🪴</span>
                  </div>
                </div>
              );
            })}

            {/* Shared Spaces */}
            {floorSpaces.map((space, si) => (
              <div key={si}>
                <div className="absolute" style={{
                  left: space.x, top: space.y, width: space.w, height: space.h,
                  backgroundColor:
                    space.type === "pantry" ? "hsl(25 15% 12%)" :
                    space.type === "meeting" ? "hsl(210 20% 14%)" :
                    space.type === "lobby" ? "hsl(40 10% 15%)" :
                    space.type === "gym" ? "hsl(140 15% 12%)" :
                    space.type === "library" ? "hsl(35 20% 14%)" :
                    space.type === "workshop" ? "hsl(20 18% 13%)" :
                    space.type === "lab" ? "hsl(180 15% 12%)" :
                    space.type === "lounge" ? "hsl(260 15% 14%)" :
                    space.type === "server-room" ? "hsl(200 15% 10%)" :
                    "hsl(220 12% 13%)",
                  backgroundImage: "repeating-conic-gradient(hsl(0 0% 100% / 0.015) 0% 25%, transparent 0% 50%) 0 0 / 24px 24px",
                }} />
                {/* Walls */}
                <div className="absolute" style={{ left: space.x, top: space.y, width: space.w, height: 3, backgroundColor: "hsl(var(--border))" }} />
                <div className="absolute" style={{ left: space.x, top: space.y, width: 3, height: space.h, backgroundColor: "hsl(var(--border))" }} />
                <div className="absolute" style={{ left: space.x + space.w - 3, top: space.y, width: 3, height: space.h, backgroundColor: "hsl(var(--border))" }} />
                <div className="absolute" style={{ left: space.x, top: space.y + space.h - 3, width: space.w, height: 3, backgroundColor: "hsl(var(--border))" }} />
                {/* Door */}
                <div className="absolute" style={{ left: space.x, top: space.y + space.h / 2 - 18, width: 6, height: 36, backgroundColor: "hsl(25 15% 12%)" }} />
                {/* Label */}
                <div className="absolute z-10 flex items-center gap-1" style={{ left: space.x + 8, top: space.y + 8 }}>
                  <span className="text-sm">{space.icon}</span>
                  <span className="font-pixel text-[6px] text-accent/70">{space.label}</span>
                </div>

                {/* Pantry furniture */}
                {space.type === "pantry" && (
                  <>
                    <div className="absolute flex flex-col items-center" style={{ left: space.x + 30, top: space.y + 50 }}>
                      <div className="w-[30px] h-[36px] bg-muted pixel-border flex flex-col items-center justify-center" style={{ borderWidth: 2 }}>
                        <span className="text-sm">☕</span>
                        <div className="w-4 h-px bg-accent/40 animate-pixel-pulse" />
                      </div>
                      <span className="font-pixel text-[5px] text-muted-foreground mt-0.5">COFFEE</span>
                    </div>
                    <div className="absolute flex flex-col items-center" style={{ left: space.x + 90, top: space.y + 50 }}>
                      <div className="w-[34px] h-[44px] bg-muted pixel-border flex flex-col items-center justify-center gap-0.5" style={{ borderWidth: 2 }}>
                        <div className="flex gap-px">
                          <div className="w-2 h-2 bg-destructive/20 rounded-sm" />
                          <div className="w-2 h-2 bg-accent/20 rounded-sm" />
                          <div className="w-2 h-2 bg-primary/20 rounded-sm" />
                        </div>
                        <div className="w-5 h-2 bg-card/30 rounded-sm" />
                      </div>
                      <span className="font-pixel text-[5px] text-muted-foreground mt-0.5">SNACKS</span>
                    </div>
                    <div className="absolute flex flex-col items-center" style={{ left: space.x + 160, top: space.y + 50 }}>
                      <div className="w-[28px] h-[40px] bg-muted pixel-border flex items-center justify-center" style={{ borderWidth: 2 }}>
                        <span className="text-[8px]">🧊</span>
                      </div>
                      <span className="font-pixel text-[5px] text-muted-foreground mt-0.5">FRIDGE</span>
                    </div>
                    <div className="absolute" style={{ left: space.x + 50, top: space.y + 150 }}>
                      <div className="w-[120px] h-[28px] bg-secondary/15 pixel-border flex items-center justify-center gap-1" style={{ borderWidth: 2 }}>
                        <div className="w-3 h-5 bg-secondary/10 rounded-sm" />
                        <div className="w-5 h-3 bg-secondary/8 rounded-sm" />
                        <div className="w-3 h-5 bg-secondary/10 rounded-sm" />
                      </div>
                      <span className="font-pixel text-[5px] text-muted-foreground mt-0.5 block text-center">LOUNGE</span>
                    </div>
                    <CoffeeSteam originX={space.x + 45} originY={space.y + 45} />
                  </>
                )}

                {/* Meeting room */}
                {space.type === "meeting" && (
                  <div className="absolute" style={{ left: space.x + space.w / 2 - 40, top: space.y + 50 }}>
                    <div className="w-[80px] h-[50px] bg-muted/30 pixel-border flex items-center justify-center" style={{ borderWidth: 2 }}>
                      <span className="text-lg">📊</span>
                    </div>
                    <div className="flex justify-between mt-2 px-1">
                      {[0, 1, 2, 3].map(i => (<div key={i} className="w-3 h-3 bg-muted/40 rounded-sm" />))}
                    </div>
                  </div>
                )}

                {/* Server room */}
                {space.type === "server-room" && (
                  <div className="absolute flex gap-3" style={{ left: space.x + 20, top: space.y + 50 }}>
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className="w-[30px] h-[130px] bg-muted pixel-border flex flex-col items-center justify-center gap-1" style={{ borderWidth: 2 }}>
                        {[0, 1, 2, 3].map(j => (
                          <div key={j} className="flex gap-0.5">
                            <div className="w-1 h-1 bg-primary rounded-full animate-pixel-pulse" style={{ animationDelay: `${j * 0.3}s` }} />
                            <div className="w-1 h-1 bg-accent rounded-full animate-pixel-pulse" style={{ animationDelay: `${j * 0.5}s` }} />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* Lobby */}
                {space.type === "lobby" && (
                  <>
                    <div className="absolute" style={{ left: space.x + 40, top: space.y + 50 }}>
                      <div className="w-[60px] h-[20px] bg-muted/30 pixel-border" style={{ borderWidth: 2 }} />
                      <span className="font-pixel text-[5px] text-muted-foreground mt-0.5 block text-center">RECEPTION</span>
                    </div>
                    <div className="absolute" style={{ left: space.x + 30, top: space.y + 130 }}>
                      <div className="w-[100px] h-[24px] bg-secondary/10 pixel-border flex items-center justify-center" style={{ borderWidth: 2 }}>
                        <span className="text-[8px]">🛋️</span>
                      </div>
                    </div>
                    <div className="absolute" style={{ left: space.x + space.w / 2 - 10, top: space.y + 25 }}>
                      <span className="text-lg">🪴</span>
                    </div>
                  </>
                )}

                {/* Gym */}
                {space.type === "gym" && (
                  <div className="absolute flex gap-3" style={{ left: space.x + 20, top: space.y + 30 }}>
                    {["🏃", "🚴", "🏋️"].map((e, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className="text-sm">{e}</span>
                        <div className="w-[20px] h-[25px] bg-muted/30 pixel-border mt-1" style={{ borderWidth: 1 }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Library */}
                {space.type === "library" && (
                  <>
                    <div className="absolute flex gap-2" style={{ left: space.x + 15, top: space.y + 40 }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-[40px] h-[80px] bg-muted/30 pixel-border flex flex-col items-center justify-center gap-px p-1" style={{ borderWidth: 2 }}>
                          {[0, 1, 2, 3, 4].map(j => (
                            <div key={j} className="w-full h-1.5 rounded-sm" style={{ backgroundColor: `hsl(${30 + j * 15} 30% ${20 + j * 3}%)` }} />
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="absolute" style={{ left: space.x + 50, top: space.y + 150 }}>
                      <div className="w-[80px] h-[22px] bg-muted/20 pixel-border flex items-center justify-center" style={{ borderWidth: 2 }}>
                        <span className="font-pixel text-[5px] text-muted-foreground">READING</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Workshop */}
                {space.type === "workshop" && (
                  <div className="absolute flex flex-wrap gap-3" style={{ left: space.x + 20, top: space.y + 50 }}>
                    {["🔩", "⚙️", "🔧", "🛠️"].map((e, i) => (
                      <div key={i} className="w-[60px] h-[40px] bg-muted/20 pixel-border flex items-center justify-center" style={{ borderWidth: 2 }}>
                        <span className="text-sm">{e}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Lab */}
                {space.type === "lab" && (
                  <div className="absolute flex gap-3" style={{ left: space.x + 20, top: space.y + 50 }}>
                    {["🧬", "🔬", "🧪"].map((e, i) => (
                      <div key={i} className="w-[50px] h-[60px] bg-muted/20 pixel-border flex flex-col items-center justify-center gap-1" style={{ borderWidth: 2 }}>
                        <span className="text-sm">{e}</span>
                        <div className="w-4 h-px bg-primary/30 animate-pixel-pulse" style={{ animationDelay: `${i * 0.4}s` }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Lounge */}
                {space.type === "lounge" && (
                  <div className="absolute flex gap-2" style={{ left: space.x + 15, top: space.y + 35 }}>
                    {["🎮", "🛋️", "📺"].map((e, i) => (
                      <div key={i} className="w-[35px] h-[30px] bg-muted/20 pixel-border flex items-center justify-center" style={{ borderWidth: 2 }}>
                        <span className="text-sm">{e}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Phone booths */}
                {space.type === "phone-booth" && (
                  <div className="absolute flex gap-2" style={{ left: space.x + 15, top: space.y + 40 }}>
                    {[0, 1].map(i => (
                      <div key={i} className="w-[35px] h-[50px] bg-muted/20 pixel-border flex flex-col items-center justify-center" style={{ borderWidth: 2 }}>
                        <span className="text-sm">📞</span>
                        <div className="w-2 h-2 bg-primary/20 rounded-full mt-1" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Print room */}
                {space.type === "print-room" && (
                  <div className="absolute flex gap-2" style={{ left: space.x + 15, top: space.y + 30 }}>
                    <div className="w-[40px] h-[35px] bg-muted/20 pixel-border flex items-center justify-center" style={{ borderWidth: 2 }}>
                      <span className="text-sm">🖨️</span>
                    </div>
                    <div className="w-[30px] h-[35px] bg-muted/20 pixel-border flex items-center justify-center" style={{ borderWidth: 2 }}>
                      <span className="text-sm">📄</span>
                    </div>
                  </div>
                )}

                {/* Storage */}
                {space.type === "storage" && (
                  <div className="absolute flex flex-col gap-2" style={{ left: space.x + 20, top: space.y + 40 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-[80px] h-[30px] bg-muted/15 pixel-border flex items-center justify-center" style={{ borderWidth: 2 }}>
                        <span className="text-sm">📦</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Security */}
                {space.type === "security" && (
                  <div className="absolute flex flex-col items-center gap-2" style={{ left: space.x + 25, top: space.y + 50 }}>
                    <div className="w-[60px] h-[40px] bg-muted/20 pixel-border flex items-center justify-center gap-1" style={{ borderWidth: 2 }}>
                      <span className="text-[8px]">📹</span><span className="text-[8px]">📹</span>
                    </div>
                    <div className="w-[50px] h-[25px] bg-muted/15 pixel-border flex items-center justify-center" style={{ borderWidth: 2 }}>
                      <span className="text-sm">🖥️</span>
                    </div>
                    <span className="font-pixel text-[5px] text-muted-foreground">MONITORS</span>
                  </div>
                )}

                {/* Mail room */}
                {space.type === "mail-room" && (
                  <div className="absolute flex gap-2" style={{ left: space.x + 15, top: space.y + 35 }}>
                    <div className="w-[50px] h-[40px] bg-muted/15 pixel-border flex flex-col items-center justify-center" style={{ borderWidth: 2 }}>
                      <span className="text-sm">📬</span>
                      <span className="font-pixel text-[4px] text-muted-foreground">IN</span>
                    </div>
                    <div className="w-[50px] h-[40px] bg-muted/15 pixel-border flex flex-col items-center justify-center" style={{ borderWidth: 2 }}>
                      <span className="text-sm">📮</span>
                      <span className="font-pixel text-[4px] text-muted-foreground">OUT</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* F1 lobby area with entrance */}
            {currentFloor === 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                <span className="text-lg">🚪</span>
                <span className="font-pixel text-[6px] text-muted-foreground">ENTRANCE</span>
              </div>
            )}

            {/* Hallway / Corridor at bottom */}
            <div className="absolute" style={{
              left: 20, top: 300, width: CANVAS_W - 40, height: 240,
              backgroundColor: "hsl(220 12% 11%)",
              backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 59px, hsl(0 0% 100% / 0.01) 59px, hsl(0 0% 100% / 0.01) 60px)",
            }}>
              {/* Corridor label */}
              <div className="absolute top-2 left-4 z-10">
                <span className="font-pixel text-[5px] text-muted-foreground/40">CORRIDOR • {currentFloor}F</span>
              </div>
              {/* Floor markers */}
              {[0, 200, 400, 600, 800, 1000].map((x, i) => (
                <div key={i} className="absolute bottom-2" style={{ left: x + 20 }}>
                  <div className="w-1 h-3 bg-muted-foreground/10" />
                </div>
              ))}
              {/* Elevator */}
              <div className="absolute right-4 top-4 flex flex-col items-center">
                {/* Floor indicator */}
                <div className="w-[50px] h-[14px] bg-card/80 pixel-border flex items-center justify-center gap-0.5 mb-0.5" style={{ borderWidth: 1 }}>
                  {([1,2,3,4] as FloorId[]).map(f => (
                    <div key={f} className="font-pixel text-[4px]" style={{
                      color: f === elevatorFloorIndicator ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.3)',
                      textShadow: f === elevatorFloorIndicator ? '0 0 4px hsl(var(--primary) / 0.5)' : 'none',
                    }}>{f}</div>
                  ))}
                </div>
                {/* Elevator shaft */}
                <div className="w-[50px] h-[60px] bg-muted/10 pixel-border relative overflow-hidden" style={{ borderWidth: 2 }}>
                  {/* Doors */}
                  <div className="absolute inset-0 flex">
                    <div className="h-full bg-muted/40" style={{
                      width: elevatorDoorOpen ? '4px' : '50%',
                      transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
                      borderRight: '1px solid hsl(var(--border))',
                    }} />
                    <div className="flex-1" />
                    <div className="h-full bg-muted/40" style={{
                      width: elevatorDoorOpen ? '4px' : '50%',
                      transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
                      borderLeft: '1px solid hsl(var(--border))',
                    }} />
                  </div>
                  {/* Interior when open */}
                  {elevatorDoorOpen && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                      <span className="text-lg">🛗</span>
                    </div>
                  )}
                  {/* Agents in elevator indicator */}
                  {elevatorAgentIds.size > 0 && !elevatorDoorOpen && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex gap-0.5">
                        {Array.from(elevatorAgentIds).slice(0, 3).map((_, i) => (
                          <div key={i} className="w-2 h-3 rounded-sm animate-pixel-pulse" style={{
                            backgroundColor: 'hsl(var(--primary) / 0.6)',
                            animationDelay: `${i * 0.2}s`,
                          }} />
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Ding light */}
                  {floorTransition === 'enter' && (
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary animate-ping" />
                  )}
                </div>
                <span className="font-pixel text-[5px] text-muted-foreground mt-0.5">ELEVATOR</span>
              </div>
              {/* Stairs */}
              <div className="absolute left-8 top-4 flex flex-col items-center">
                <div className="w-[40px] h-[50px] bg-muted/15 pixel-border flex flex-col items-center justify-center" style={{ borderWidth: 2 }}>
                  <span className="text-sm">🪜</span>
                  <span className="font-pixel text-[4px] text-muted-foreground">STAIRS</span>
                </div>
              </div>
              {/* Water coolers */}
              <div className="absolute" style={{ left: 300, top: 10 }}>
                <span className="text-sm">🚰</span>
              </div>
              <div className="absolute" style={{ left: 700, top: 10 }}>
                <span className="text-sm">🚰</span>
              </div>
              {/* Fire extinguisher */}
              <div className="absolute" style={{ left: 500, top: 8 }}>
                <span className="text-xs">🧯</span>
              </div>
            </div>

            {/* Ambient particles */}
            {floorRooms.map((room, ri) =>
              [0.3, 0.7].map((pct, li) => (
                <DustInLight key={`dust-${ri}-${li}`} originX={room.x + room.w * pct - 20} originY={room.y + 12} width={40} height={80} />
              ))
            )}
            {floorRooms.map(room => {
              const info = departmentInfo[room.department];
              return room.desks.map((desk, di) => (
                <MonitorGlow key={`glow-${room.department}-${di}`} originX={room.x + desk.x} originY={room.y + desk.y - 6} color={info.color} />
              ));
            })}
            <AmbientSparkles canvasW={CANVAS_W} canvasH={CANVAS_H} />

            {/* Event Particles */}
            {eventParticles.map(p => (
              <div key={p.id} className="absolute pointer-events-none z-30 animate-sparkle" style={{ left: p.x, top: p.y, fontSize: 16, animationDelay: `${p.delay}s`, animationDuration: "3s" }}>
                {p.emoji}
              </div>
            ))}

            {/* Power outage overlay */}
            {activeEvent?.type === "power-outage" && (
              <div className="absolute inset-0 pointer-events-none z-35 animate-monitor-flicker" style={{ backgroundColor: "hsl(0 0% 0% / 0.5)" }} />
            )}
            {activeEvent?.type === "fire-drill" && (
              <div className="absolute inset-0 pointer-events-none z-35 animate-pixel-pulse" style={{ border: "4px solid hsl(0 85% 55% / 0.6)", boxShadow: "inset 0 0 40px hsl(0 85% 55% / 0.15)" }} />
            )}

            {/* Agents on current floor */}
            {floorAgents.map((oa) => {
              const isMoving = oa.action === "walking" || oa.action === "panicking" || oa.action === "celebrating";
              const walkFrame = isMoving ? Math.floor(oa.frame / (oa.action === "panicking" ? 2 : 4)) % 2 : 0;
              return (
                <div
                  key={oa.agent.id}
                  className="absolute z-20 flex flex-col items-center cursor-pointer group"
                  style={{
                    left: oa.x, top: oa.y,
                    transform: `translate(-50%, -50%) scaleX(${oa.direction === "left" ? -1 : 1})`,
                    transition: isMoving ? "none" : "left 0.05s, top 0.05s",
                  }}
                  onClick={() => handleAgentClick(oa)}
                >
                  {/* Shadow */}
                  <div className="absolute bottom-0 w-5 h-1 rounded-full" style={{ transform: "translateY(8px)", backgroundColor: "hsl(0 0% 0% / 0.3)" }} />
                  {/* Hover ring */}
                  <div className="absolute inset-0 -m-2 rounded-full border-2 border-primary/0 group-hover:border-primary/50 transition-colors" style={{ transform: `scaleX(${oa.direction === "left" ? -1 : 1})` }} />

                  {/* Speech bubble */}
                  {oa.speechBubble && (
                    <div className="absolute -top-8 left-1/2 whitespace-nowrap px-1.5 py-0.5 bg-card pixel-border font-pixel text-[5px] text-foreground z-30" style={{ transform: `translateX(-50%) scaleX(${oa.direction === "left" ? -1 : 1})`, borderWidth: 2 }}>
                      {oa.speechBubble}
                    </div>
                  )}

                  {/* Character */}
                  <div className="relative flex flex-col items-center group-hover:scale-110 transition-transform">
                    <PixelCharacter
                      department={oa.agent.department}
                      role={oa.agent.role}
                      isMoving={isMoving}
                      walkFrame={walkFrame}
                      status={oa.agent.status}
                      action={oa.action}
                      size={36}
                      agentId={oa.agent.id}
                    />
                  </div>

                  {/* Name tag */}
                  <span className="font-pixel text-[4px] text-primary/70 mt-0.5 whitespace-nowrap bg-card/80 px-0.5 rounded-sm" style={{ transform: `scaleX(${oa.direction === "left" ? -1 : 1})` }}>
                    {oa.agent.name}
                  </span>
                </div>
              );
            })}

            {/* Offline agents on this floor */}
            {agents.filter(a => a.status === "offline" && getDeptFloor(a.department) === currentFloor).map((agent, i) => {
              const room = rooms.find(r => r.department === agent.department);
              if (!room) return null;
              return (
                <div
                  key={agent.id}
                  className="absolute z-10 flex flex-col items-center opacity-20 cursor-pointer hover:opacity-40 transition-opacity"
                  style={{ left: room.x + room.w - 30, top: room.y + room.h - 40 - i * 30 }}
                  onClick={() => {
                    setSelectedAgent({
                      agent, floor: room.floor, x: room.x + room.w - 30, y: room.y + room.h - 40,
                      targetX: room.x + room.w - 30, targetY: room.y + room.h - 40,
                      action: "idle", deskX: room.x + 50, deskY: room.y + 80, deskFloor: room.floor,
                      speechBubble: null, direction: "right", frame: 0,
                    });
                    setAssignTaskId("");
                    setDialogOpen(true);
                  }}
                >
                  <PixelCharacter
                    department={agent.department}
                    role={agent.role}
                    isMoving={false}
                    walkFrame={0}
                    status="offline"
                    action="idle"
                    size={28}
                    agentId={agent.id}
                  />
                  <span className="font-pixel text-[4px] text-muted-foreground">{agent.name}</span>
                </div>
              );
            })}

            {/* Day/Night overlay */}
            {phaseInfo.opacity > 0 && (
              <div className="absolute inset-0 pointer-events-none z-40" style={{
                backgroundColor: phaseInfo.bg, opacity: phaseInfo.opacity,
                transition: "background-color 2s, opacity 2s", mixBlendMode: "multiply",
              }} />
            )}

            {/* Stars at night */}
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

        {/* Floor minimap - vertical floor indicator */}
        <div className="absolute bottom-3 right-3 z-50 pixel-border bg-card/90 backdrop-blur-sm p-2 flex flex-col gap-1" style={{ width: 50 }}>
          <div className="font-pixel text-[4px] text-muted-foreground text-center mb-1">FLOORS</div>
          {([4, 3, 2, 1] as FloorId[]).map(f => {
            const count = floorAgentCount(f);
            return (
              <button
                key={f}
                onClick={() => switchFloor(f)}
                className={`w-full h-7 flex items-center justify-center gap-1 font-pixel text-[6px] transition-colors border ${
                  currentFloor === f
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/60"
                }`}
              >
                {f}F
                {count > 0 && <span className="text-[5px] opacity-60">·{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Agent Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="pixel-border max-w-md bg-card border-border">
          {selectedAgent && (
            <>
              <DialogHeader>
                <DialogTitle className="font-pixel text-sm text-primary flex items-center gap-3">
                  <span className="text-3xl">{selectedAgent.agent.avatar}</span>
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
                  {(() => {
                    const gymSpace = sharedSpaces[1].find(s => s.type === "gym");
                    return gymSpace ? (
                      <Button size="sm" variant="outline" className="font-pixel text-[7px] h-6"
                        onClick={() => sendTo(gymSpace.x + randomBetween(20, gymSpace.w - 20), gymSpace.y + randomBetween(20, gymSpace.h - 20), "💪 gym time!", 1)}>
                        🏋️ Gym
                      </Button>
                    ) : null;
                  })()}
                  {(() => {
                    const libSpace = sharedSpaces[3].find(s => s.type === "library");
                    return libSpace ? (
                      <Button size="sm" variant="outline" className="font-pixel text-[7px] h-6"
                        onClick={() => sendTo(libSpace.x + randomBetween(20, libSpace.w - 20), libSpace.y + randomBetween(40, libSpace.h - 20), "📚 reading!", 3)}>
                        📚 Library
                      </Button>
                    ) : null;
                  })()}
                  {(() => {
                    const wsSpace = sharedSpaces[3].find(s => s.type === "workshop");
                    return wsSpace ? (
                      <Button size="sm" variant="outline" className="font-pixel text-[7px] h-6"
                        onClick={() => sendTo(wsSpace.x + randomBetween(20, wsSpace.w - 20), wsSpace.y + randomBetween(40, wsSpace.h - 20), "🔧 fixing!", 3)}>
                        🔧 Workshop
                      </Button>
                    ) : null;
                  })()}
                  {(() => {
                    const loungeSpace = sharedSpaces[4].find(s => s.type === "lounge");
                    return loungeSpace ? (
                      <Button size="sm" variant="outline" className="font-pixel text-[7px] h-6"
                        onClick={() => sendTo(loungeSpace.x + randomBetween(20, loungeSpace.w - 20), loungeSpace.y + randomBetween(20, loungeSpace.h - 20), "🎮 break!", 4)}>
                        🎮 Lounge
                      </Button>
                    ) : null;
                  })()}
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
