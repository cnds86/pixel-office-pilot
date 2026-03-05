import type { Task, Agent, Department } from "./mockData";

export type ProjectStatus = "active" | "completed" | "archived";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  department: Department;
  icon: string;
  color: string;
  taskIds: string[];
  agentIds: string[];
  createdAt: string;
  deadline?: string;
}

export const projects: Project[] = [
  {
    id: "p1",
    name: "Auth Module",
    description: "Implement OAuth2 flow with token refresh and session management",
    status: "active",
    department: "engineering",
    icon: "🔐",
    color: "hsl(200 80% 50%)",
    taskIds: ["t6", "t8", "t9"],
    agentIds: ["h3", "a1", "h1", "a6"],
    createdAt: "2026-02-01",
    deadline: "2026-04-01",
  },
  {
    id: "p2",
    name: "Component Library",
    description: "Design and build reusable UI components with design tokens",
    status: "active",
    department: "design",
    icon: "🧩",
    color: "hsl(320 70% 55%)",
    taskIds: ["t2", "t7", "t11"],
    agentIds: ["a2", "a10", "a11", "h2", "h10"],
    createdAt: "2026-01-20",
    deadline: "2026-03-30",
  },
  {
    id: "p3",
    name: "CI/CD Pipeline",
    description: "Configure GitHub Actions, Docker builds, and staging deployments",
    status: "completed",
    department: "devops",
    icon: "🚀",
    color: "hsl(30 80% 55%)",
    taskIds: ["t1", "t5"],
    agentIds: ["a5", "a14", "h14"],
    createdAt: "2026-01-15",
  },
  {
    id: "p4",
    name: "Testing Suite",
    description: "Unit tests, E2E with Playwright, and load testing setup",
    status: "active",
    department: "qa",
    icon: "🧪",
    color: "hsl(140 60% 45%)",
    taskIds: ["t3", "t10", "t12"],
    agentIds: ["a3", "a12", "a13", "h12", "h13"],
    createdAt: "2026-02-10",
    deadline: "2026-04-15",
  },
  {
    id: "p5",
    name: "Q2 Roadmap",
    description: "Plan Q2 features, documentation updates, and user feedback system",
    status: "active",
    department: "product",
    icon: "📋",
    color: "hsl(270 60% 55%)",
    taskIds: ["t4", "t14", "t15"],
    agentIds: ["a4", "a16", "a17", "h15", "h16"],
    createdAt: "2026-02-20",
    deadline: "2026-06-01",
  },
  {
    id: "p6",
    name: "K8s Infrastructure",
    description: "Kubernetes cluster setup for staging and production environments",
    status: "active",
    department: "devops",
    icon: "☁️",
    color: "hsl(200 70% 50%)",
    taskIds: ["t13"],
    agentIds: ["a14", "a15", "h14"],
    createdAt: "2026-02-15",
    deadline: "2026-04-30",
  },
];

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}
