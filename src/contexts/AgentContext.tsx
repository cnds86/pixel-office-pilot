import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { agents as initialAgents } from "@/data/mockData";
import type { Agent } from "@/data/mockData";

interface AgentContextType {
  agents: Agent[];
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  removeAgent: (id: string) => void;
  getAgentById: (id: string) => Agent | undefined;
}

const AgentContext = createContext<AgentContextType | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([...initialAgents]);

  const addAgent = useCallback((agent: Agent) => {
    setAgents(prev => [agent, ...prev]);
  }, []);

  const updateAgent = useCallback((id: string, updates: Partial<Agent>) => {
    setAgents(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)));
  }, []);

  const removeAgent = useCallback((id: string) => {
    setAgents(prev => prev.filter(a => a.id !== id));
  }, []);

  const getAgentById = useCallback(
    (id: string) => agents.find(a => a.id === id),
    [agents]
  );

  return (
    <AgentContext.Provider value={{ agents, addAgent, updateAgent, removeAgent, getAgentById }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgents() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error("useAgents must be used within AgentProvider");
  return ctx;
}
