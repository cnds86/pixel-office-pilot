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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
