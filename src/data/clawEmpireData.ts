import type { Agent, Task, Department } from "./mockData";
import { agents, tasks } from "./mockData";

// ── SubTask System ──
export type SubTaskStatus = "todo" | "in-progress" | "done" | "blocked";

export interface SubTask {
  id: string;
  parentTaskId: string;
  title: string;
  assigneeId: string;
  status: SubTaskStatus;
  blockedReason?: string;
  delegatedFrom?: string;
  delegatedTo?: string;
  xpReward: number;
}

export const subTasks: SubTask[] = [
  { id: "st1", parentTaskId: "t6", title: "Setup OAuth providers config", assigneeId: "h3", status: "done", xpReward: 30 },
  { id: "st2", parentTaskId: "t6", title: "Token refresh logic", assigneeId: "a1", status: "in-progress", xpReward: 50, delegatedFrom: "h3", delegatedTo: "a1" },
  { id: "st3", parentTaskId: "t6", title: "Session persistence layer", assigneeId: "a6", status: "todo", xpReward: 40 },
  { id: "st4", parentTaskId: "t2", title: "Button component variants", assigneeId: "a2", status: "done", xpReward: 25 },
  { id: "st5", parentTaskId: "t2", title: "Form input components", assigneeId: "a10", status: "in-progress", xpReward: 35 },
  { id: "st6", parentTaskId: "t2", title: "Modal/Dialog system", assigneeId: "h2", status: "blocked", blockedReason: "Waiting for design tokens from LayoutAI", xpReward: 45 },
  { id: "st7", parentTaskId: "t3", title: "Core module unit tests", assigneeId: "a3", status: "done", xpReward: 40 },
  { id: "st8", parentTaskId: "t3", title: "Integration test setup", assigneeId: "a12", status: "in-progress", xpReward: 35, delegatedFrom: "a3", delegatedTo: "a12" },
  { id: "st9", parentTaskId: "t13", title: "Namespace & RBAC config", assigneeId: "a14", status: "done", xpReward: 50 },
  { id: "st10", parentTaskId: "t13", title: "Helm charts for services", assigneeId: "h14", status: "in-progress", xpReward: 45 },
  { id: "st11", parentTaskId: "t15", title: "Feature prioritization matrix", assigneeId: "a16", status: "done", xpReward: 30 },
  { id: "st12", parentTaskId: "t15", title: "Stakeholder review doc", assigneeId: "h15", status: "blocked", blockedReason: "Pending budget approval from governance", xpReward: 25 },
  { id: "st13", parentTaskId: "t12", title: "Playwright config & fixtures", assigneeId: "h13", status: "done", xpReward: 35 },
  { id: "st14", parentTaskId: "t12", title: "Critical path test scenarios", assigneeId: "a12", status: "todo", xpReward: 50 },
  { id: "st15", parentTaskId: "t11", title: "Color token definitions", assigneeId: "a10", status: "done", xpReward: 20 },
  { id: "st16", parentTaskId: "t11", title: "Spacing & typography scale", assigneeId: "a11", status: "in-progress", xpReward: 30, delegatedFrom: "a10", delegatedTo: "a11" },
];

// ── Agent XP & Ranking ──
export interface AgentXP {
  agentId: string;
  xp: number;
  tasksDone: number;
  rank: "Intern" | "Junior" | "Mid" | "Senior" | "Lead" | "Architect";
  streak: number;
  lastActive: string;
}

function getRank(xp: number): AgentXP["rank"] {
  if (xp >= 500) return "Architect";
  if (xp >= 350) return "Lead";
  if (xp >= 200) return "Senior";
  if (xp >= 100) return "Mid";
  if (xp >= 40) return "Junior";
  return "Intern";
}

export const agentXPData: AgentXP[] = [
  { agentId: "a1", xp: 420, tasksDone: 28, rank: "Lead", streak: 12, lastActive: "2 min ago" },
  { agentId: "a6", xp: 310, tasksDone: 22, rank: "Senior", streak: 8, lastActive: "5 min ago" },
  { agentId: "a3", xp: 380, tasksDone: 25, rank: "Lead", streak: 15, lastActive: "1 min ago" },
  { agentId: "a2", xp: 275, tasksDone: 18, rank: "Senior", streak: 6, lastActive: "10 min ago" },
  { agentId: "a5", xp: 350, tasksDone: 23, rank: "Lead", streak: 10, lastActive: "3 min ago" },
  { agentId: "h1", xp: 520, tasksDone: 35, rank: "Architect", streak: 20, lastActive: "1 min ago" },
  { agentId: "h3", xp: 290, tasksDone: 19, rank: "Senior", streak: 7, lastActive: "8 min ago" },
  { agentId: "a14", xp: 240, tasksDone: 16, rank: "Senior", streak: 5, lastActive: "12 min ago" },
  { agentId: "a10", xp: 195, tasksDone: 14, rank: "Mid", streak: 4, lastActive: "15 min ago" },
  { agentId: "h2", xp: 160, tasksDone: 11, rank: "Mid", streak: 3, lastActive: "20 min ago" },
  { agentId: "a12", xp: 145, tasksDone: 10, rank: "Mid", streak: 4, lastActive: "7 min ago" },
  { agentId: "a16", xp: 130, tasksDone: 9, rank: "Mid", streak: 2, lastActive: "25 min ago" },
  { agentId: "h15", xp: 180, tasksDone: 13, rank: "Mid", streak: 6, lastActive: "18 min ago" },
  { agentId: "a17", xp: 90, tasksDone: 7, rank: "Junior", streak: 3, lastActive: "30 min ago" },
  { agentId: "a11", xp: 85, tasksDone: 6, rank: "Junior", streak: 2, lastActive: "22 min ago" },
  { agentId: "h14", xp: 210, tasksDone: 15, rank: "Senior", streak: 5, lastActive: "14 min ago" },
  { agentId: "a13", xp: 75, tasksDone: 5, rank: "Junior", streak: 1, lastActive: "35 min ago" },
  { agentId: "h12", xp: 110, tasksDone: 8, rank: "Mid", streak: 3, lastActive: "28 min ago" },
];

// ── Workflow Pack Profiles ──
export type WorkflowPackType = "dev" | "report" | "novel" | "video" | "research" | "roleplay";

export interface WorkflowPack {
  id: string;
  type: WorkflowPackType;
  name: string;
  description: string;
  icon: string;
  agentRoles: string[];
  defaultDepartment: Department;
  steps: string[];
  isActive: boolean;
}

export const workflowPacks: WorkflowPack[] = [
  {
    id: "wp1", type: "dev", name: "Development Pipeline",
    description: "Full software development workflow with code review and CI/CD",
    icon: "⚡", agentRoles: ["Architect", "Developer", "Reviewer", "Deployer"],
    defaultDepartment: "engineering",
    steps: ["Plan → Code → Review → Test → Deploy"],
    isActive: true,
  },
  {
    id: "wp2", type: "report", name: "Report Generator",
    description: "Automated report creation with data gathering and formatting",
    icon: "📊", agentRoles: ["Analyst", "Writer", "Reviewer"],
    defaultDepartment: "product",
    steps: ["Gather Data → Analyze → Draft → Review → Publish"],
    isActive: true,
  },
  {
    id: "wp3", type: "novel", name: "Content Creator",
    description: "Long-form content creation with research and editing",
    icon: "✍️", agentRoles: ["Researcher", "Writer", "Editor", "Publisher"],
    defaultDepartment: "product",
    steps: ["Research → Outline → Draft → Edit → Publish"],
    isActive: false,
  },
  {
    id: "wp4", type: "video", name: "Video Pipeline",
    description: "Video content workflow from scripting to post-production",
    icon: "🎬", agentRoles: ["Scriptwriter", "Director", "Editor", "Reviewer"],
    defaultDepartment: "design",
    steps: ["Script → Storyboard → Record → Edit → Review"],
    isActive: false,
  },
  {
    id: "wp5", type: "research", name: "Research Lab",
    description: "Deep research workflow with hypothesis testing and documentation",
    icon: "🔬", agentRoles: ["Researcher", "Analyst", "Peer Reviewer", "Documenter"],
    defaultDepartment: "qa",
    steps: ["Hypothesize → Research → Analyze → Peer Review → Document"],
    isActive: true,
  },
  {
    id: "wp6", type: "roleplay", name: "Simulation Mode",
    description: "Role-based scenario simulation for testing and training",
    icon: "🎭", agentRoles: ["Scenario Designer", "Actor", "Evaluator"],
    defaultDepartment: "support",
    steps: ["Design Scenario → Assign Roles → Execute → Evaluate → Report"],
    isActive: false,
  },
];

// ── Task Reports ──
export type ReportStatus = "pending" | "submitted" | "reviewed";

export interface TaskReport {
  id: string;
  taskId: string;
  agentId: string;
  summary: string;
  status: ReportStatus;
  completedAt: string;
  timeSpent: string;
  xpEarned: number;
  blockers?: string;
  nextSteps?: string;
}

export const taskReports: TaskReport[] = [
  { id: "tr1", taskId: "t1", agentId: "a1", summary: "Monorepo initialized with Turborepo. All packages configured with shared tsconfig.", status: "reviewed", completedAt: "2026-01-20", timeSpent: "4h 30m", xpEarned: 80, nextSteps: "Setup CI pipeline" },
  { id: "tr2", taskId: "t5", agentId: "a5", summary: "GitHub Actions configured with matrix builds. Docker multi-stage builds optimized.", status: "reviewed", completedAt: "2026-02-05", timeSpent: "6h 15m", xpEarned: 90, nextSteps: "Add staging deployment" },
  { id: "tr3", taskId: "t8", agentId: "a1", summary: "PostgreSQL schema designed with 12 tables. Migration scripts generated.", status: "reviewed", completedAt: "2026-02-15", timeSpent: "5h 00m", xpEarned: 70 },
  { id: "tr4", taskId: "t2", agentId: "a2", summary: "Button, Input, Card components built. Still working on Modal system.", status: "submitted", completedAt: "2026-03-01", timeSpent: "8h 45m", xpEarned: 60, blockers: "Design tokens not finalized", nextSteps: "Complete Modal + Dropdown" },
  { id: "tr5", taskId: "t3", agentId: "a3", summary: "47 unit tests passing. Coverage at 78% for core modules.", status: "submitted", completedAt: "2026-03-05", timeSpent: "7h 20m", xpEarned: 75, nextSteps: "Add edge case tests" },
  { id: "tr6", taskId: "t13", agentId: "a14", summary: "K8s staging cluster running. RBAC and namespaces configured.", status: "pending", completedAt: "2026-03-07", timeSpent: "9h 10m", xpEarned: 85, blockers: "Waiting for DNS records" },
];

// ── Company Settings ──
export type ProviderModel = "claude-4" | "gemini-2" | "gpt-5" | "opencode" | "local-llm";
export type MessengerType = "telegram" | "discord" | "slack" | "none";

export interface CompanySettings {
  companyName: string;
  ceoName: string;
  ceoAvatar: string;
  autoAssign: boolean;
  yoloMode: boolean;
  theme: "dark" | "light" | "pixel";
  primaryProvider: ProviderModel;
  fallbackProvider: ProviderModel;
  messenger: MessengerType;
  messengerSessionId?: string;
  maxConcurrentAgents: number;
  dailyBudgetLimit: number;
  autoReportFrequency: "hourly" | "daily" | "weekly" | "manual";
}

export const defaultSettings: CompanySettings = {
  companyName: "OpenClaw Corp",
  ceoName: "Alex Chen",
  ceoAvatar: "👾",
  autoAssign: true,
  yoloMode: false,
  theme: "pixel",
  primaryProvider: "claude-4",
  fallbackProvider: "gemini-2",
  messenger: "discord",
  messengerSessionId: "openclaw-hq",
  maxConcurrentAgents: 10,
  dailyBudgetLimit: 500,
  autoReportFrequency: "daily",
};

// ── Helpers ──
export function getSubTasksByParent(taskId: string): SubTask[] {
  return subTasks.filter(st => st.parentTaskId === taskId);
}

export function getAgentXP(agentId: string): AgentXP | undefined {
  return agentXPData.find(a => a.agentId === agentId);
}

export function getReportsByAgent(agentId: string): TaskReport[] {
  return taskReports.filter(r => r.agentId === agentId);
}
