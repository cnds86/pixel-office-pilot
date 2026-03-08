import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TaskBoard from "./pages/TaskBoard";
import DepartmentStats from "./pages/DepartmentStats";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import ChatHub from "./pages/ChatHub";
import Projects from "./pages/Projects";
import MeetingDebate from "./pages/MeetingDebate";
import OrgChart from "./pages/OrgChart";
import BudgetControl from "./pages/BudgetControl";
import Governance from "./pages/Governance";
import GoalAlignment from "./pages/GoalAlignment";
import HeartbeatMonitor from "./pages/HeartbeatMonitor";
import TicketSystem from "./pages/TicketSystem";
import AgentCoordination from "./pages/AgentCoordination";
import ActivityFeed from "./pages/ActivityFeed";
import GatewayManagement from "./pages/GatewayManagement";
import SkillsMarketplace from "./pages/SkillsMarketplace";
import TagsCustomFields from "./pages/TagsCustomFields";
import SubTasksXP from "./pages/SubTasksXP";
import WorkflowPacks from "./pages/WorkflowPacks";
import TaskReports from "./pages/TaskReports";
import CompanySettings from "./pages/CompanySettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tasks" element={<TaskBoard />} />
          <Route path="/stats" element={<DepartmentStats />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/chat" element={<ChatHub />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/meetings" element={<MeetingDebate />} />
          <Route path="/org-chart" element={<OrgChart />} />
          <Route path="/budget" element={<BudgetControl />} />
          <Route path="/governance" element={<Governance />} />
          <Route path="/goals" element={<GoalAlignment />} />
          <Route path="/heartbeat" element={<HeartbeatMonitor />} />
          <Route path="/tickets" element={<TicketSystem />} />
          <Route path="/coordination" element={<AgentCoordination />} />
          <Route path="/activity" element={<ActivityFeed />} />
          <Route path="/gateways" element={<GatewayManagement />} />
          <Route path="/skills" element={<SkillsMarketplace />} />
          <Route path="/tags" element={<TagsCustomFields />} />
          <Route path="/subtasks" element={<SubTasksXP />} />
          <Route path="/workflows" element={<WorkflowPacks />} />
          <Route path="/reports" element={<TaskReports />} />
          <Route path="/settings" element={<CompanySettings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
