import { useState, useRef, useEffect, useCallback } from "react";
import type { Agent } from "@/data/mockData";
import { departmentInfo } from "@/data/mockData";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: Date;
}

// Mock responses based on agent specialty/department
const responseTemplates: Record<string, string[]> = {
  "Code Generation": [
    "I've generated the boilerplate. Want me to add error handling too? 🔧",
    "Here's a clean implementation using the latest patterns. Let me know if you need tests.",
    "Done! I refactored it to use async/await for better readability. ⚡",
    "The code is ready. I also added TypeScript types for safety. 💪",
  ],
  "Code Review": [
    "I found 3 potential issues: a memory leak, unused import, and a race condition. 🔍",
    "Overall looks good! One suggestion: extract that logic into a custom hook.",
    "PR approved with minor comments. Great use of memoization! ✅",
    "Found a bug on line 42 — the null check is missing. Want me to fix it?",
  ],
  "UI/UX Design": [
    "I've updated the mockup with better spacing and contrast. Take a look! 🎨",
    "The component library is looking consistent now. Should we add dark mode variants?",
    "Here's the new design system tokens. I matched them to our brand guidelines.",
    "The user flow is simplified — 3 steps instead of 7. Users will love this! ✨",
  ],
  "Testing & QA": [
    "All 47 tests passing! Coverage is at 89%. 🧪",
    "Found a flaky test in the auth module. I've fixed the timing issue.",
    "E2E suite is green. I added edge cases for empty states and errors.",
    "Load test results: 99th percentile at 120ms. We're good to ship! 🚀",
  ],
  "CI/CD Pipeline": [
    "Pipeline deployed successfully! Staging is up and running. 🚀",
    "I've optimized the build — went from 4min to 1.5min with caching.",
    "Rollback mechanism is tested and ready. We're covered if anything goes wrong.",
    "Docker images are built and pushed. Ready to scale up? 🐳",
  ],
  "Documentation": [
    "API docs are updated with the new endpoints. All examples are tested. 📝",
    "I've added JSDoc comments to all public functions.",
    "The README now includes a quickstart guide and architecture diagram.",
    "Changelog for v0.3.2 is drafted. Want to review before publishing?",
  ],
  default: [
    "Got it! I'll work on that right away. 💪",
    "Interesting idea! Let me prototype something and get back to you.",
    "I've made the changes. Want me to walk you through them?",
    "Done! Everything looks good on my end. Ready for review. ✅",
    "I'll look into that. Give me a few minutes... 🔍",
    "Great question! Here's what I think we should do...",
    "Already on it! Should have something ready soon. ⚡",
    "That's a tricky one. Let me analyze the options first. 🤔",
  ],
};

const greetings: Record<string, string[]> = {
  agent: [
    "Hey! How can I help you today? 🤖",
    "Hello! Ready to assist. What do you need? ⚡",
    "Hi there! What are we working on? 💻",
  ],
  lead: [
    "Hey! What's on the agenda? 📋",
    "Good to see you! Any updates? 👋",
  ],
  dev: [
    "Yo! What's up? 🎮",
    "Hey! Need something? I'm free right now. ✌️",
    "Hi! Just finished my current task. What's next? 🎯",
  ],
};

function getResponses(agent: Agent): string[] {
  return responseTemplates[agent.specialty] || responseTemplates.default;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface AgentChatProps {
  agent: Agent;
  onClose: () => void;
}

export function AgentChat({ agent, onClose }: AgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial greeting
  useEffect(() => {
    const greeting = pickRandom(greetings[agent.role] || greetings.agent);
    setMessages([{
      id: "greeting",
      role: "agent",
      content: greeting,
      timestamp: new Date(),
    }]);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [agent.id]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    const delay = 800 + Math.random() * 1500;
    setTimeout(() => {
      const responses = getResponses(agent);
      const response = pickRandom(responses);
      const agentMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "agent",
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, agentMsg]);
      setIsTyping(false);
    }, delay);
  }, [input, isTyping, agent]);

  const deptInfo = departmentInfo[agent.department];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-border bg-muted/30">
        <span className="text-2xl">{agent.avatar}</span>
        <div className="flex-1 min-w-0">
          <div className="font-pixel text-[9px] text-primary truncate">{agent.name}</div>
          <div className="font-pixel text-[6px] text-muted-foreground">
            {deptInfo.icon} {agent.specialty}
          </div>
        </div>
        <Badge
          variant="outline"
          className="font-pixel text-[6px] gap-1"
        >
          <div className={`w-1.5 h-1.5 rounded-full ${
            agent.status === "online" ? "bg-primary" :
            agent.status === "busy" ? "bg-accent" : "bg-muted-foreground"
          }`} />
          {agent.status.toUpperCase()}
        </Badge>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 font-pixel text-[8px]"
          onClick={onClose}
        >
          ✕
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-3 py-2 pixel-border ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`} style={{ borderWidth: 2 }}>
              {msg.role === "agent" && (
                <span className="text-xs mr-1">{agent.avatar}</span>
              )}
              <span className="font-pixel-body text-xs leading-relaxed">{msg.content}</span>
              <div className={`font-pixel text-[5px] mt-1 ${
                msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"
              }`}>
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted px-3 py-2 pixel-border" style={{ borderWidth: 2 }}>
              <span className="text-xs mr-1">{agent.avatar}</span>
              <span className="font-pixel-body text-xs text-muted-foreground animate-pulse">
                typing...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-2 border-t border-border bg-muted/20">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder={`Message ${agent.name}...`}
            className="font-pixel-body text-xs h-8 bg-background"
            disabled={isTyping}
          />
          <Button
            size="sm"
            className="font-pixel text-[7px] h-8 px-3"
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
          >
            SEND
          </Button>
        </div>
      </div>
    </div>
  );
}
