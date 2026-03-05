import { agents, type Agent } from "./mockData";

export type ChannelType = "dm" | "group" | "topic";

export interface ChatChannel {
  id: string;
  type: ChannelType;
  name: string;
  icon: string;
  description?: string;
  memberIds: string[];
  lastMessage?: string;
  lastTimestamp?: string;
  unread: number;
}

export interface ChatMsg {
  id: string;
  channelId: string;
  senderId: string | "user";
  content: string;
  timestamp: Date;
  isTask?: boolean;
  taskTitle?: string;
}

// DM channels — generated from ALL agents
export function generateDmChannels(): ChatChannel[] {
  return agents.map((a) => ({
    id: `dm-${a.id}`,
    type: "dm" as ChannelType,
    name: a.name,
    icon: a.avatar,
    memberIds: [a.id],
    lastMessage: undefined,
    lastTimestamp: undefined,
    unread: 0,
  }));
}

// Initial group channels
export const initialGroupChannels: ChatChannel[] = [
  { id: "grp-eng", type: "group", name: "🔧 Engineering Team", icon: "⚡", description: "All engineering discussions", memberIds: ["a1", "a6", "a7", "a8", "h1", "h2", "h3", "h9"], lastMessage: "ByteCrunch: Optimization done!", lastTimestamp: "5m ago", unread: 3 },
  { id: "grp-design", type: "group", name: "🎨 Design Crew", icon: "🎨", description: "Design reviews and feedback", memberIds: ["a2", "a10", "a11", "h10", "h11"], lastMessage: "LayoutAI: New grid system ready", lastTimestamp: "12m ago", unread: 1 },
  { id: "grp-devops", type: "group", name: "🚀 DevOps Squad", icon: "🚀", description: "Deployments, infra, monitoring", memberIds: ["a5", "a14", "a15", "h14"], lastMessage: "CloudGuard: SSL renewed ✓", lastTimestamp: "30m ago", unread: 0 },
  { id: "grp-all", type: "group", name: "📢 All Hands", icon: "📢", description: "Company-wide announcements", memberIds: agents.map(a => a.id), lastMessage: "Morgan Cho: Q2 roadmap published!", lastTimestamp: "1h ago", unread: 5 },
];

// Initial topic channels
export const initialTopicChannels: ChatChannel[] = [
  { id: "top-auth", type: "topic", name: "# auth-module", icon: "🔐", description: "OAuth2 implementation discussion", memberIds: ["h3", "a1", "h1", "a6"], lastMessage: "Sam: Token refresh logic is tricky", lastTimestamp: "8m ago", unread: 2 },
  { id: "top-ui", type: "topic", name: "# ui-components", icon: "🧩", description: "Component library & design system", memberIds: ["a2", "a10", "h10", "h2"], lastMessage: "PixelForge: Button variants done", lastTimestamp: "20m ago", unread: 0 },
  { id: "top-perf", type: "topic", name: "# performance", icon: "⚡", description: "Performance audits & optimization", memberIds: ["a7", "a3", "h9", "a12"], lastMessage: "ByteCrunch: Bundle size -40%!", lastTimestamp: "45m ago", unread: 1 },
  { id: "top-deploy", type: "topic", name: "# deployments", icon: "📦", description: "Release tracking & deployment logs", memberIds: ["a5", "a14", "h14", "h1"], lastMessage: "DeployBot: v0.3.2 is live 🎉", lastTimestamp: "1h ago", unread: 0 },
  { id: "top-bugs", type: "topic", name: "# bug-reports", icon: "🐛", description: "Bug tracking and triage", memberIds: ["a12", "a3", "h12", "h13"], lastMessage: "BugHunter: Found race condition", lastTimestamp: "2h ago", unread: 4 },
];

// Keep for backward compat
export const dmChannels = generateDmChannels();
export const groupChannels = initialGroupChannels;
export const topicChannels = initialTopicChannels;
export const allChannels: ChatChannel[] = [...dmChannels, ...groupChannels, ...topicChannels];

// Mock conversation responses per channel type
const groupResponses: Record<string, string[]> = {
  "grp-eng": [
    "Just pushed a fix for the memory leak. PR #58 is up. 🔧",
    "Who's free to review the API refactor? Need fresh eyes. 👀",
    "Build time down to 1.2s with the new caching strategy! ⚡",
    "Found a race condition in the event handler. Working on it.",
    "New linting rules are live. Please update your configs. 📋",
  ],
  "grp-design": [
    "New color tokens are exported. Check Figma for updates. 🎨",
    "The spacing system is finalized. 4px base grid. 📐",
    "Motion specs for page transitions are ready for review. ✨",
    "Dark mode variants look great! Minor contrast fix needed.",
  ],
  "grp-devops": [
    "Staging deployment complete. All health checks green. ✅",
    "Scaled up to 3 replicas for the load test. 📡",
    "SSL certs renewed. Monitoring dashboards updated. 🛡️",
  ],
  "grp-all": [
    "Great work this sprint everyone! 🎉",
    "Q2 priorities are published. Check the roadmap page. 📋",
    "Welcome our new QA agents to the team! 🧪",
    "Friday demo at 4pm. Prepare your updates! 🎯",
  ],
};

const topicResponses: Record<string, string[]> = {
  "top-auth": [
    "Token refresh is working now. Added retry logic for edge cases. 🔐",
    "OAuth2 flow passes all integration tests. Ready for review.",
    "Should we support PKCE? It's recommended for SPAs.",
    "Session management is solid. 15-min refresh, 7-day absolute. ⏱️",
  ],
  "top-ui": [
    "Button variants: primary, secondary, ghost, destructive. All themed. 🎨",
    "The tooltip component needs a pixel-art arrow. Working on it.",
    "Form validation UX is improved. Errors show inline now.",
    "New component: PixelCard with glow effect. Check Storybook. ✨",
  ],
  "top-perf": [
    "Bundle size report: main chunk 120KB (-40%). Tree shaking helped. 📊",
    "Lighthouse score: 95 perf, 100 a11y, 92 best practices. 🏆",
    "Lazy loading for routes cut initial load by 60%. ⚡",
    "Memory profiling shows no leaks in the latest build. ✅",
  ],
  "top-deploy": [
    "v0.3.2 deployed to production. All canary checks passed. 🚀",
    "Rollback procedure tested successfully. We're covered. 🛡️",
    "New deployment pipeline: 4min → 1.5min with caching. ⚡",
  ],
  "top-bugs": [
    "Race condition in WebSocket handler — fix in PR #62. 🐛",
    "Null check missing on line 142. Added guard clause.",
    "Flaky test fixed: was a timing issue in the auth module. ⏱️",
    "New bug: scroll position resets on re-render. Investigating. 🔍",
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getMockResponse(channelId: string, agentId: string): string {
  const agent = agents.find(a => a.id === agentId);
  if (!agent) return "Got it! Working on it. 💪";

  if (channelId.startsWith("grp-")) {
    const pool = groupResponses[channelId] || groupResponses["grp-all"];
    return pickRandom(pool);
  }
  if (channelId.startsWith("top-")) {
    const pool = topicResponses[channelId] || topicResponses["top-bugs"];
    return pickRandom(pool);
  }
  const dmFallback = [
    "Got it! I'll work on that right away. 💪",
    "Interesting idea! Let me prototype something.",
    "Done! Everything looks good on my end. ✅",
    "I'll look into that. Give me a few minutes... 🔍",
    "Already on it! Should have something ready soon. ⚡",
  ];
  return pickRandom(dmFallback);
}

export function getInitialMessages(channelId: string, channelList: ChatChannel[]): ChatMsg[] {
  const channel = channelList.find(c => c.id === channelId);
  if (!channel) return [];

  const now = Date.now();
  const msgs: ChatMsg[] = [];

  if (channel.type === "dm") {
    const agentId = channel.memberIds[0];
    msgs.push({
      id: `init-${channelId}-1`,
      channelId,
      senderId: agentId,
      content: `Hey! I'm ${channel.name}. How can I help you today? 🤖`,
      timestamp: new Date(now - 300000),
    });
  } else if (channel.type === "group") {
    const members = channel.memberIds.slice(0, 3);
    members.forEach((mid, i) => {
      const agent = agents.find(a => a.id === mid);
      if (!agent) return;
      const pool = groupResponses[channelId] || groupResponses["grp-all"];
      msgs.push({
        id: `init-${channelId}-${i}`,
        channelId,
        senderId: mid,
        content: pool[i % pool.length],
        timestamp: new Date(now - (300000 - i * 60000)),
      });
    });
  } else {
    const members = channel.memberIds.slice(0, 2);
    members.forEach((mid, i) => {
      const pool = topicResponses[channelId] || topicResponses["top-bugs"];
      msgs.push({
        id: `init-${channelId}-${i}`,
        channelId,
        senderId: mid,
        content: pool[i % pool.length],
        timestamp: new Date(now - (300000 - i * 60000)),
      });
    });
  }

  return msgs;
}
