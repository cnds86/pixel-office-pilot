// Sprite mapping for agents - maps agent IDs to sprite images
import charDevMale from "@/assets/sprites/char-dev-male.png";
import charDesignFemale from "@/assets/sprites/char-design-female.png";
import charRobotBlue from "@/assets/sprites/char-robot-blue.png";
import charDevopsMale from "@/assets/sprites/char-devops-male.png";
import charQaFemale from "@/assets/sprites/char-qa-female.png";
import charPmFemale from "@/assets/sprites/char-pm-female.png";
import charRobotGreen from "@/assets/sprites/char-robot-green.png";
import charSupportMale from "@/assets/sprites/char-support-male.png";
import charLeadMale from "@/assets/sprites/char-lead-male.png";
import charRobotOrange from "@/assets/sprites/char-robot-orange.png";

// Map each agent ID to a sprite
export const agentSpriteMap: Record<string, string> = {
  // Engineering
  "a1": charRobotBlue,      // ClawBot-α (AI agent)
  "a6": charRobotGreen,     // SyntaxAI (AI agent)
  "a7": charRobotOrange,    // ByteCrunch (AI agent)
  "a8": charRobotBlue,      // LogicFlow (AI agent)
  "h1": charLeadMale,       // Alex Chen (lead)
  "h2": charDesignFemale,   // Mika Tanaka (dev)
  "h3": charDevMale,        // Sam Rivera (dev)
  "h9": charDevMale,        // Jordan Lee (dev)

  // Design
  "a2": charRobotOrange,    // PixelForge (AI agent)
  "a10": charRobotGreen,    // ColorBot (AI agent)
  "a11": charRobotBlue,     // LayoutAI (AI agent)
  "h10": charDesignFemale,  // Luna Park (dev)
  "h11": charDevMale,       // Kai Nomura (dev)

  // QA
  "a3": charRobotGreen,     // TestRunner (AI agent)
  "a12": charRobotOrange,   // BugHunter (AI agent)
  "a13": charRobotBlue,     // StressBot (AI agent)
  "h12": charQaFemale,      // Pat Quinn (dev)
  "h13": charQaFemale,      // Riley Fox (dev)

  // DevOps
  "a5": charRobotBlue,      // DeployBot (AI agent)
  "a14": charRobotGreen,    // CloudGuard (AI agent)
  "a15": charRobotOrange,   // MonitorAI (AI agent)
  "h14": charDevopsMale,    // Ash Kumar (dev)

  // Product
  "a4": charRobotGreen,     // DocWriter (AI agent)
  "a16": charRobotBlue,     // PlannerAI (AI agent)
  "h15": charLeadMale,      // Morgan Cho (lead)
  "h16": charPmFemale,      // Suki Patel (dev)

  // Support
  "a17": charRobotOrange,   // HelpBot (AI agent)
  "a18": charRobotGreen,    // TicketAI (AI agent)
  "h17": charSupportMale,   // Drew Song (dev)
  "h18": charPmFemale,      // Noa Berg (dev)
};

// Fallback sprite by department
export const deptFallbackSprite: Record<string, string> = {
  engineering: charDevMale,
  design: charDesignFemale,
  qa: charQaFemale,
  devops: charDevopsMale,
  product: charPmFemale,
  support: charSupportMale,
};

export function getAgentSprite(agentId: string, department?: string): string {
  return agentSpriteMap[agentId] || (department ? deptFallbackSprite[department] : charDevMale) || charDevMale;
}
