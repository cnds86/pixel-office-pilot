export type AgentStatus = "online" | "busy" | "offline";
export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "todo" | "in-progress" | "done";
export type MemberRole = "lead" | "dev" | "agent";

export interface Agent {
  id: string;
  name: string;
  role: MemberRole;
  avatar: string; // emoji pixel avatar
  status: AgentStatus;
  specialty: string;
}

export interface Task {
  id: string;
  title: string;
  assigneeId: string;
  priority: TaskPriority;
  status: TaskStatus;
  description: string;
  tags: string[];
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  description: string;
}

export interface ActivityLog {
  id: string;
  agentId: string;
  action: string;
  timestamp: string;
  type: "commit" | "review" | "deploy" | "test" | "fix";
}

export const agents: Agent[] = [
  { id: "a1", name: "ClawBot-α", role: "agent", avatar: "🤖", status: "online", specialty: "Code Generation" },
  { id: "a2", name: "PixelForge", role: "agent", avatar: "⚙️", status: "busy", specialty: "UI/UX Design" },
  { id: "a3", name: "TestRunner", role: "agent", avatar: "🧪", status: "online", specialty: "Testing & QA" },
  { id: "a4", name: "DocWriter", role: "agent", avatar: "📝", status: "offline", specialty: "Documentation" },
  { id: "a5", name: "DeployBot", role: "agent", avatar: "🚀", status: "online", specialty: "CI/CD Pipeline" },
  { id: "h1", name: "Alex Chen", role: "lead", avatar: "👾", status: "online", specialty: "Project Lead" },
  { id: "h2", name: "Mika Tanaka", role: "dev", avatar: "🎮", status: "online", specialty: "Frontend Dev" },
  { id: "h3", name: "Sam Rivera", role: "dev", avatar: "🕹️", status: "busy", specialty: "Backend Dev" },
];

export const tasks: Task[] = [
  { id: "t1", title: "Setup monorepo structure", assigneeId: "a1", priority: "high", status: "done", description: "Initialize workspace with turborepo", tags: ["infra"] },
  { id: "t2", title: "Design component library", assigneeId: "a2", priority: "high", status: "in-progress", description: "Create reusable UI components", tags: ["ui", "design"] },
  { id: "t3", title: "Write unit tests for core", assigneeId: "a3", priority: "medium", status: "in-progress", description: "Add test coverage for core modules", tags: ["testing"] },
  { id: "t4", title: "API documentation", assigneeId: "a4", priority: "low", status: "todo", description: "Document all public APIs", tags: ["docs"] },
  { id: "t5", title: "Setup CI pipeline", assigneeId: "a5", priority: "high", status: "done", description: "Configure GitHub Actions", tags: ["infra", "ci"] },
  { id: "t6", title: "Auth module", assigneeId: "h3", priority: "high", status: "in-progress", description: "Implement OAuth2 flow", tags: ["backend", "auth"] },
  { id: "t7", title: "Landing page design", assigneeId: "h2", priority: "medium", status: "todo", description: "Design hero section and features", tags: ["ui", "frontend"] },
  { id: "t8", title: "Database schema design", assigneeId: "a1", priority: "high", status: "done", description: "Design PostgreSQL schema", tags: ["backend", "db"] },
  { id: "t9", title: "Error handling middleware", assigneeId: "h3", priority: "medium", status: "todo", description: "Global error handler", tags: ["backend"] },
  { id: "t10", title: "Performance audit", assigneeId: "a3", priority: "low", status: "todo", description: "Lighthouse & bundle analysis", tags: ["testing", "perf"] },
];

export const milestones: Milestone[] = [
  { id: "m1", title: "Project Kickoff", date: "2026-01-15", completed: true, description: "Team assembled, repo created" },
  { id: "m2", title: "Core Architecture", date: "2026-02-01", completed: true, description: "Monorepo + CI/CD ready" },
  { id: "m3", title: "Alpha Release", date: "2026-03-01", completed: true, description: "Core features functional" },
  { id: "m4", title: "Beta Release", date: "2026-04-15", completed: false, description: "Public beta with docs" },
  { id: "m5", title: "v1.0 Launch", date: "2026-06-01", completed: false, description: "Stable release" },
];

export const activityLogs: ActivityLog[] = [
  { id: "l1", agentId: "a1", action: "Pushed 12 commits to main", timestamp: "2 min ago", type: "commit" },
  { id: "l2", agentId: "a3", action: "Completed test suite: 47/47 passed ✓", timestamp: "5 min ago", type: "test" },
  { id: "l3", agentId: "a5", action: "Deployed staging v0.3.2", timestamp: "12 min ago", type: "deploy" },
  { id: "l4", agentId: "a2", action: "Updated Button component variants", timestamp: "18 min ago", type: "review" },
  { id: "l5", agentId: "a1", action: "Fixed memory leak in event handler", timestamp: "25 min ago", type: "fix" },
  { id: "l6", agentId: "h2", action: "Reviewed PR #42: nav redesign", timestamp: "30 min ago", type: "review" },
  { id: "l7", agentId: "a3", action: "Running integration tests...", timestamp: "32 min ago", type: "test" },
  { id: "l8", agentId: "h3", action: "Merged auth-module branch", timestamp: "45 min ago", type: "commit" },
];

export function getAgentById(id: string): Agent | undefined {
  return agents.find(a => a.id === id);
}
