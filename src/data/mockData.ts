export type AgentStatus = "online" | "busy" | "offline";
export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "todo" | "in-progress" | "done";
export type MemberRole = "lead" | "dev" | "agent";
export type Department = "engineering" | "design" | "qa" | "devops" | "product" | "support";

export interface Agent {
  id: string;
  name: string;
  role: MemberRole;
  avatar: string;
  status: AgentStatus;
  specialty: string;
  department: Department;
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

export const departmentInfo: Record<Department, { label: string; icon: string; color: string }> = {
  engineering: { label: "Engineering", icon: "⚡", color: "hsl(200 80% 50%)" },
  design: { label: "Design", icon: "🎨", color: "hsl(320 70% 55%)" },
  qa: { label: "QA & Testing", icon: "🧪", color: "hsl(140 60% 45%)" },
  devops: { label: "DevOps", icon: "🚀", color: "hsl(30 80% 55%)" },
  product: { label: "Product", icon: "📋", color: "hsl(270 60% 55%)" },
  support: { label: "Support", icon: "🛟", color: "hsl(50 80% 50%)" },
};

export const agents: Agent[] = [
  // Engineering (8)
  { id: "a1", name: "ClawBot-α", role: "agent", avatar: "🤖", status: "online", specialty: "Code Generation", department: "engineering" },
  { id: "a6", name: "SyntaxAI", role: "agent", avatar: "🧠", status: "online", specialty: "Code Review", department: "engineering" },
  { id: "a7", name: "ByteCrunch", role: "agent", avatar: "💾", status: "busy", specialty: "Optimization", department: "engineering" },
  { id: "a8", name: "LogicFlow", role: "agent", avatar: "🔀", status: "online", specialty: "Architecture", department: "engineering" },
  { id: "h1", name: "Alex Chen", role: "lead", avatar: "👾", status: "online", specialty: "Project Lead", department: "engineering" },
  { id: "h2", name: "Mika Tanaka", role: "dev", avatar: "🎮", status: "online", specialty: "Frontend Dev", department: "engineering" },
  { id: "h3", name: "Sam Rivera", role: "dev", avatar: "🕹️", status: "busy", specialty: "Backend Dev", department: "engineering" },
  { id: "h9", name: "Jordan Lee", role: "dev", avatar: "⌨️", status: "online", specialty: "Full Stack", department: "engineering" },

  // Design (5)
  { id: "a2", name: "PixelForge", role: "agent", avatar: "⚙️", status: "busy", specialty: "UI/UX Design", department: "design" },
  { id: "a10", name: "ColorBot", role: "agent", avatar: "🎨", status: "online", specialty: "Visual Design", department: "design" },
  { id: "a11", name: "LayoutAI", role: "agent", avatar: "📐", status: "online", specialty: "Layout Systems", department: "design" },
  { id: "h10", name: "Luna Park", role: "dev", avatar: "🌙", status: "online", specialty: "UX Research", department: "design" },
  { id: "h11", name: "Kai Nomura", role: "dev", avatar: "✨", status: "busy", specialty: "Motion Design", department: "design" },

  // QA (5)
  { id: "a3", name: "TestRunner", role: "agent", avatar: "🧪", status: "online", specialty: "Testing & QA", department: "qa" },
  { id: "a12", name: "BugHunter", role: "agent", avatar: "🐛", status: "online", specialty: "Bug Detection", department: "qa" },
  { id: "a13", name: "StressBot", role: "agent", avatar: "💪", status: "busy", specialty: "Load Testing", department: "qa" },
  { id: "h12", name: "Pat Quinn", role: "dev", avatar: "🔍", status: "online", specialty: "QA Engineer", department: "qa" },
  { id: "h13", name: "Riley Fox", role: "dev", avatar: "🦊", status: "online", specialty: "Automation", department: "qa" },

  // DevOps (4)
  { id: "a5", name: "DeployBot", role: "agent", avatar: "🚀", status: "online", specialty: "CI/CD Pipeline", department: "devops" },
  { id: "a14", name: "CloudGuard", role: "agent", avatar: "☁️", status: "online", specialty: "Cloud Infra", department: "devops" },
  { id: "a15", name: "MonitorAI", role: "agent", avatar: "📡", status: "busy", specialty: "Monitoring", department: "devops" },
  { id: "h14", name: "Ash Kumar", role: "dev", avatar: "🛠️", status: "online", specialty: "SRE", department: "devops" },

  // Product (4)
  { id: "a4", name: "DocWriter", role: "agent", avatar: "📝", status: "offline", specialty: "Documentation", department: "product" },
  { id: "a16", name: "PlannerAI", role: "agent", avatar: "🗺️", status: "online", specialty: "Roadmap", department: "product" },
  { id: "h15", name: "Morgan Cho", role: "lead", avatar: "📊", status: "online", specialty: "Product Manager", department: "product" },
  { id: "h16", name: "Suki Patel", role: "dev", avatar: "💬", status: "online", specialty: "Technical Writer", department: "product" },

  // Support (4)
  { id: "a17", name: "HelpBot", role: "agent", avatar: "🤝", status: "online", specialty: "User Support", department: "support" },
  { id: "a18", name: "TicketAI", role: "agent", avatar: "🎫", status: "online", specialty: "Ticket Triage", department: "support" },
  { id: "h17", name: "Drew Song", role: "dev", avatar: "🎧", status: "busy", specialty: "Support Lead", department: "support" },
  { id: "h18", name: "Noa Berg", role: "dev", avatar: "💡", status: "online", specialty: "Customer Success", department: "support" },
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
  { id: "t11", title: "Design system tokens", assigneeId: "a10", priority: "high", status: "in-progress", description: "Define color & spacing tokens", tags: ["design"] },
  { id: "t12", title: "E2E test suite", assigneeId: "a12", priority: "high", status: "todo", description: "Setup Playwright tests", tags: ["testing", "e2e"] },
  { id: "t13", title: "K8s cluster config", assigneeId: "a14", priority: "medium", status: "in-progress", description: "Setup staging cluster", tags: ["devops", "k8s"] },
  { id: "t14", title: "User feedback system", assigneeId: "a17", priority: "medium", status: "todo", description: "In-app feedback widget", tags: ["support", "ux"] },
  { id: "t15", title: "Roadmap update Q2", assigneeId: "a16", priority: "high", status: "in-progress", description: "Plan Q2 features", tags: ["product"] },
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
  { id: "l9", agentId: "a14", action: "Scaled up staging nodes", timestamp: "50 min ago", type: "deploy" },
  { id: "l10", agentId: "a10", action: "Exported design tokens v2", timestamp: "55 min ago", type: "review" },
];

export function getAgentById(id: string): Agent | undefined {
  return agents.find(a => a.id === id);
}
