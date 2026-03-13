import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { tasks as initialTasks, type Task, type Department } from "@/data/mockData";
import { projects as initialProjects, type Project, type ProjectStatus } from "@/data/projectData";
import { subTasks as initialSubTasks, agentXPData as initialXP, workflowPacks as initialPacks, type SubTask, type AgentXP, type WorkflowPack, type SubTaskStatus } from "@/data/clawEmpireData";
import { useAgents } from "./AgentContext";
import { useGlobalNotifications } from "./NotificationContext";

// ── Scheduled Workflow ──
export interface ScheduledWorkflow {
  id: string;
  packId: string;
  intervalMinutes: number;
  lastRun: string | null;
  nextRun: string;
  isActive: boolean;
  runsCompleted: number;
}

// ── Workflow Run Log ──
export interface WorkflowRun {
  id: string;
  packId: string;
  packName: string;
  projectId: string;
  status: "running" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  tasksCreated: number;
  xpAwarded: number;
  assignedAgents: string[];
}

interface WorkflowContextType {
  // Tasks
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;

  // Projects
  projects: Project[];
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;

  // SubTasks
  subTasks: SubTask[];
  addSubTask: (sub: SubTask) => void;
  updateSubTask: (id: string, updates: Partial<SubTask>) => void;
  completeSubTask: (id: string) => void;

  // XP
  xpData: AgentXP[];
  awardXP: (agentId: string, xp: number) => void;

  // Workflow Packs
  packs: WorkflowPack[];
  addPack: (pack: WorkflowPack) => void;
  togglePack: (id: string) => void;

  // Workflow Engine
  runWorkflow: (packId: string) => WorkflowRun | null;
  workflowRuns: WorkflowRun[];

  // Scheduled Workflows
  scheduledWorkflows: ScheduledWorkflow[];
  scheduleWorkflow: (packId: string, intervalMinutes: number) => void;
  unscheduleWorkflow: (scheduleId: string) => void;
  toggleSchedule: (scheduleId: string) => void;
}

const WorkflowContext = createContext<WorkflowContextType | null>(null);

// XP rank calculator
function getRank(xp: number): AgentXP["rank"] {
  if (xp >= 500) return "Architect";
  if (xp >= 350) return "Lead";
  if (xp >= 200) return "Senior";
  if (xp >= 100) return "Mid";
  if (xp >= 40) return "Junior";
  return "Intern";
}

// Generate subtask titles per workflow step
function generateSubTasksForStep(step: string, parentTaskId: string, agentIds: string[]): SubTask[] {
  return agentIds.slice(0, 2).map((agentId, i) => ({
    id: `st-${Date.now()}-${parentTaskId}-${i}`,
    parentTaskId,
    title: `${step} — phase ${i + 1}`,
    assigneeId: agentId,
    status: "todo" as SubTaskStatus,
    xpReward: Math.floor(Math.random() * 30 + 20),
  }));
}

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const { agents } = useAgents();
  const { push: pushNotif } = useGlobalNotifications();

  // Core state
  const [tasks, setTasks] = useState<Task[]>([...initialTasks]);
  const [projects, setProjects] = useState<Project[]>([...initialProjects]);
  const [subTasks, setSubTasks] = useState<SubTask[]>([...initialSubTasks]);
  const [xpData, setXpData] = useState<AgentXP[]>([...initialXP]);
  const [packs, setPacks] = useState<WorkflowPack[]>([...initialPacks]);
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>([]);
  const [scheduledWorkflows, setScheduledWorkflows] = useState<ScheduledWorkflow[]>([]);

  // ── Task CRUD ──
  const addTask = useCallback((task: Task) => setTasks(p => [...p, task]), []);
  const updateTask = useCallback((id: string, updates: Partial<Task>) =>
    setTasks(p => p.map(t => t.id === id ? { ...t, ...updates } : t)), []);
  const removeTask = useCallback((id: string) => setTasks(p => p.filter(t => t.id !== id)), []);

  // ── Project CRUD ──
  const addProject = useCallback((project: Project) => setProjects(p => [...p, project]), []);
  const updateProject = useCallback((id: string, updates: Partial<Project>) =>
    setProjects(p => p.map(pr => pr.id === id ? { ...pr, ...updates } : pr)), []);
  const removeProject = useCallback((id: string) => setProjects(p => p.filter(pr => pr.id !== id)), []);

  // ── SubTask CRUD ──
  const addSubTask = useCallback((sub: SubTask) => setSubTasks(p => [...p, sub]), []);
  const updateSubTask = useCallback((id: string, updates: Partial<SubTask>) =>
    setSubTasks(p => p.map(s => s.id === id ? { ...s, ...updates } : s)), []);

  // ── XP System ──
  const awardXP = useCallback((agentId: string, xp: number) => {
    setXpData(prev => {
      const existing = prev.find(x => x.agentId === agentId);
      if (existing) {
        return prev.map(x => x.agentId === agentId ? {
          ...x,
          xp: x.xp + xp,
          tasksDone: x.tasksDone + 1,
          rank: getRank(x.xp + xp),
          streak: x.streak + 1,
          lastActive: "just now",
        } : x);
      }
      return [...prev, {
        agentId,
        xp,
        tasksDone: 1,
        rank: getRank(xp),
        streak: 1,
        lastActive: "just now",
      }];
    });
  }, []);

  // ── Complete SubTask (award XP) ──
  const completeSubTask = useCallback((id: string) => {
    setSubTasks(prev => {
      const sub = prev.find(s => s.id === id);
      if (sub && sub.status !== "done") {
        awardXP(sub.assigneeId, sub.xpReward);
        return prev.map(s => s.id === id ? { ...s, status: "done" as SubTaskStatus } : s);
      }
      return prev;
    });
  }, [awardXP]);

  // ── Add Pack ──
  const addPack = useCallback((pack: WorkflowPack) => setPacks(p => [...p, pack]), []);

  // ── Toggle Pack ──
  const togglePack = useCallback((id: string) => {
    setPacks(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  }, []);

  // ── Run Workflow (Core Engine) ──
  const runWorkflow = useCallback((packId: string): WorkflowRun | null => {
    const pack = packs.find(p => p.id === packId);
    if (!pack) return null;

    const now = new Date().toISOString();
    const runId = `run-${Date.now()}`;

    // Find agents in the pack's department
    const deptAgents = agents.filter(a => a.department === pack.defaultDepartment);
    const selectedAgents = deptAgents.length > 0 ? deptAgents.slice(0, pack.agentRoles.length) : agents.slice(0, pack.agentRoles.length);
    const agentIds = selectedAgents.map(a => a.id);

    // Parse steps
    const steps = pack.steps[0].split(" → ").map(s => s.trim());

    // Create tasks for each step
    const newTasks: Task[] = steps.map((step, i) => ({
      id: `wt-${runId}-${i}`,
      title: `[${pack.name}] ${step}`,
      assigneeId: agentIds[i % agentIds.length],
      priority: i === 0 ? "high" as const : "medium" as const,
      status: "todo" as const,
      description: `Auto-generated from workflow: ${pack.name}`,
      tags: [pack.type, "workflow"],
    }));

    // Create subtasks for each task
    const newSubTasks: SubTask[] = newTasks.flatMap(t =>
      generateSubTasksForStep(t.title.replace(`[${pack.name}] `, ""), t.id, agentIds)
    );

    // Create project
    const projectId = `wp-${runId}`;
    const newProject: Project = {
      id: projectId,
      name: `${pack.icon} ${pack.name} — Run #${workflowRuns.filter(r => r.packId === packId).length + 1}`,
      description: `Auto-generated project from workflow: ${pack.description}`,
      status: "active" as ProjectStatus,
      department: pack.defaultDepartment,
      icon: pack.icon,
      color: `hsl(${Math.floor(Math.random() * 360)} 70% 50%)`,
      taskIds: newTasks.map(t => t.id),
      agentIds,
      createdAt: now.slice(0, 10),
      deadline: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    };

    // Commit all state updates
    setTasks(prev => [...prev, ...newTasks]);
    setSubTasks(prev => [...prev, ...newSubTasks]);
    setProjects(prev => [...prev, newProject]);

    // Create run log
    const run: WorkflowRun = {
      id: runId,
      packId,
      packName: pack.name,
      projectId,
      status: "running",
      startedAt: now,
      tasksCreated: newTasks.length,
      xpAwarded: 0,
      assignedAgents: agentIds,
    };
    setWorkflowRuns(prev => [run, ...prev]);

    // Simulate completion after delay
    setTimeout(() => {
      // Complete some tasks
      newTasks.forEach((t, i) => {
        setTimeout(() => {
          setTasks(prev => prev.map(pt => pt.id === t.id ? { ...pt, status: "in-progress" as const } : pt));
          // Complete subtasks for this task
          const taskSubs = newSubTasks.filter(s => s.parentTaskId === t.id);
          taskSubs.forEach((sub, j) => {
            setTimeout(() => {
              completeSubTask(sub.id);
            }, (j + 1) * 2000);
          });
          // Mark task done after subtasks
          setTimeout(() => {
            setTasks(prev => prev.map(pt => pt.id === t.id ? { ...pt, status: "done" as const } : pt));
          }, (taskSubs.length + 1) * 2000);
        }, (i + 1) * 3000);
      });

      // Mark run completed
      const totalXP = newSubTasks.reduce((sum, s) => sum + s.xpReward, 0);
      setTimeout(() => {
        setWorkflowRuns(prev => prev.map(r => r.id === runId ? {
          ...r,
          status: "completed" as const,
          completedAt: new Date().toISOString(),
          xpAwarded: totalXP,
        } : r));
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: "completed" as ProjectStatus } : p));
        pushNotif({
          agentId: agentIds[0] || "a1",
          message: `✅ Workflow Complete: ${pack.name} — ${newTasks.length} tasks done, ${totalXP} XP awarded`,
          type: "task-done",
        });
      }, (newTasks.length + 1) * 3000 + 2000);
    }, 1000);

    pushNotif({
      agentId: agentIds[0] || "a1",
      message: `🚀 Workflow Started: ${pack.name} — ${newTasks.length} tasks, ${agentIds.length} agents`,
      type: "delegation",
    });

    return run;
  }, [packs, agents, workflowRuns, completeSubTask, pushNotif]);

  // ── Schedule Workflow ──
  const scheduleWorkflow = useCallback((packId: string, intervalMinutes: number) => {
    const id = `sched-${Date.now()}`;
    const nextRun = new Date(Date.now() + intervalMinutes * 60000).toISOString();
    setScheduledWorkflows(prev => [...prev, {
      id,
      packId,
      intervalMinutes,
      lastRun: null,
      nextRun,
      isActive: true,
      runsCompleted: 0,
    }]);
  }, []);

  const unscheduleWorkflow = useCallback((scheduleId: string) => {
    setScheduledWorkflows(prev => prev.filter(s => s.id !== scheduleId));
  }, []);

  const toggleSchedule = useCallback((scheduleId: string) => {
    setScheduledWorkflows(prev => prev.map(s =>
      s.id === scheduleId ? { ...s, isActive: !s.isActive } : s
    ));
  }, []);

  // ── Scheduler Timer ──
  const schedulerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    schedulerRef.current = setInterval(() => {
      setScheduledWorkflows(prev => {
        const now = Date.now();
        return prev.map(sched => {
          if (!sched.isActive) return sched;
          if (new Date(sched.nextRun).getTime() <= now) {
            // Time to run!
            runWorkflow(sched.packId);
            return {
              ...sched,
              lastRun: new Date().toISOString(),
              nextRun: new Date(now + sched.intervalMinutes * 60000).toISOString(),
              runsCompleted: sched.runsCompleted + 1,
            };
          }
          return sched;
        });
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(schedulerRef.current);
  }, [runWorkflow]);

  return (
    <WorkflowContext.Provider value={{
      tasks, addTask, updateTask, removeTask,
      projects, addProject, updateProject, removeProject,
      subTasks, addSubTask, updateSubTask, completeSubTask,
      xpData, awardXP,
      packs, togglePack,
      runWorkflow, workflowRuns,
      scheduledWorkflows, scheduleWorkflow, unscheduleWorkflow, toggleSchedule,
    }}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error("useWorkflow must be used within WorkflowProvider");
  return ctx;
}
