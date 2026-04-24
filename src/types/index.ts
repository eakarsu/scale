export interface Project {
  id: string;
  name: string;
  type: "rlhf" | "alignment" | "image_annotation" | "text_classification" | "evaluation";
  status: "active" | "completed" | "paused";
  tasks: number;
  completed: number;
  accuracy: number;
  client: string;
  priority: "critical" | "high" | "medium" | "low";
  createdAt: string;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  type: "chat" | "reasoning" | "code" | "embedding";
  contextWindow: string;
  pricing: string;
  rating: number;
  latency: string;
  status: "available" | "unavailable" | "deprecated";
}

export interface Evaluation {
  id: string;
  name: string;
  model: string;
  score: number;
  category: string;
  samples: number;
  status: "completed" | "running" | "queued";
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  model: string;
  status: "deployed" | "testing" | "disabled";
  requests: number;
  avgLatency: string;
  successRate: number;
  tools: number;
  createdAt: string;
}

export interface Dataset {
  id: string;
  name: string;
  type: string;
  records: number;
  size: string;
  format: string;
  quality: number;
  tags: string[];
  createdAt: string;
}

export interface Labeler {
  id: string;
  name: string;
  expertise: string;
  rating: number;
  tasksCompleted: number;
  accuracy: number;
  status: "active" | "on_break" | "inactive";
  region: string;
  hourlyRate: number;
}

export interface FineTune {
  id: string;
  name: string;
  baseModel: string;
  dataset: string;
  status: "queued" | "running" | "completed" | "failed";
  epochs: number;
  loss: number | null;
  evalScore: number | null;
  createdAt: string;
}

export interface ApiLog {
  id: string;
  endpoint: string;
  model: string;
  status: number;
  latency: number;
  tokens: number;
  ip: string;
  createdAt: string;
}

export interface ChatMessage {
  id?: string;
  role: "system" | "user" | "assistant";
  content: string;
  model?: string;
}

export type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: string;
};
