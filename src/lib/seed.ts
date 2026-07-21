import { PrismaClient } from "@prisma/client";

if (process.env.NODE_ENV === "test" && process.env.DB_PATH) {
  process.env.DATABASE_URL = `file:${process.env.DB_PATH}`;
}

const prisma = new PrismaClient();

async function main() {
  if (process.env.ALLOW_DISPOSABLE_SEED !== "YES") {
    throw new Error("Seeding is disabled; set ALLOW_DISPOSABLE_SEED=YES only for a disposable demo database");
  }
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.apiLog.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.fineTune.deleteMany();
  await prisma.labeler.deleteMany();
  await prisma.dataset.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.model.deleteMany();
  await prisma.project.deleteMany();

  // === PROJECTS (16) ===
  const projects = [
    { name: "GPT-5 RLHF Training", type: "rlhf", status: "active", tasks: 12450, completed: 9830, accuracy: 94.2, client: "OpenAI", priority: "critical" },
    { name: "Llama 4 Safety Alignment", type: "alignment", status: "active", tasks: 8900, completed: 6200, accuracy: 91.8, client: "Meta", priority: "high" },
    { name: "Autonomous Driving v3.2", type: "image_annotation", status: "active", tasks: 45000, completed: 38200, accuracy: 97.1, client: "Waymo", priority: "critical" },
    { name: "Medical Image Segmentation", type: "image_annotation", status: "active", tasks: 22000, completed: 15400, accuracy: 96.5, client: "Mayo Clinic", priority: "high" },
    { name: "Legal Doc Classification", type: "text_classification", status: "completed", tasks: 5600, completed: 5600, accuracy: 93.7, client: "DLA Piper", priority: "medium" },
    { name: "Satellite Imagery Analysis", type: "image_annotation", status: "active", tasks: 18500, completed: 11200, accuracy: 95.3, client: "NGA", priority: "critical" },
    { name: "Conversational AI Eval", type: "evaluation", status: "active", tasks: 3200, completed: 1800, accuracy: 89.4, client: "Anthropic", priority: "high" },
    { name: "Code Generation RLHF", type: "rlhf", status: "active", tasks: 7800, completed: 4500, accuracy: 92.1, client: "Cursor", priority: "high" },
    { name: "Multilingual NER", type: "text_classification", status: "paused", tasks: 14200, completed: 8900, accuracy: 90.6, client: "Cohere", priority: "medium" },
    { name: "Retail Product Tagging", type: "image_annotation", status: "completed", tasks: 32000, completed: 32000, accuracy: 98.2, client: "Amazon", priority: "low" },
    { name: "Speech-to-Text QA", type: "evaluation", status: "active", tasks: 6100, completed: 3400, accuracy: 88.9, client: "Deepgram", priority: "medium" },
    { name: "Document Extraction Pipeline", type: "text_classification", status: "active", tasks: 9800, completed: 7200, accuracy: 94.8, client: "DocuSign", priority: "high" },
    { name: "Robot Navigation Labels", type: "image_annotation", status: "active", tasks: 28000, completed: 19600, accuracy: 96.8, client: "Boston Dynamics", priority: "critical" },
    { name: "Toxicity Detection v2", type: "alignment", status: "active", tasks: 11500, completed: 8700, accuracy: 93.1, client: "Discord", priority: "high" },
    { name: "Financial Report Parsing", type: "text_classification", status: "active", tasks: 4300, completed: 2100, accuracy: 91.5, client: "Bloomberg", priority: "medium" },
    { name: "Drone Surveillance Annotation", type: "image_annotation", status: "active", tasks: 16700, completed: 10300, accuracy: 95.9, client: "US Air Force", priority: "critical" },
  ];
  for (const p of projects) await prisma.project.create({ data: p });
  console.log(`  ✅ ${projects.length} projects`);

  // === MODELS (16) ===
  const models = [
    { name: "claude-sonnet-4-5-20250929", provider: "anthropic", type: "chat", contextWindow: "200K", pricing: "$3/$15", rating: 4.9, latency: "1.2s", status: "available" },
    { name: "gpt-4o-2025-08-06", provider: "openai", type: "chat", contextWindow: "128K", pricing: "$2.50/$10", rating: 4.8, latency: "0.9s", status: "available" },
    { name: "claude-opus-4-6", provider: "anthropic", type: "chat", contextWindow: "200K", pricing: "$15/$75", rating: 5.0, latency: "2.1s", status: "available" },
    { name: "gemini-2.5-pro", provider: "google", type: "chat", contextWindow: "1M", pricing: "$1.25/$5", rating: 4.7, latency: "1.5s", status: "available" },
    { name: "llama-4-maverick", provider: "meta", type: "chat", contextWindow: "128K", pricing: "$0.20/$0.60", rating: 4.5, latency: "0.7s", status: "available" },
    { name: "deepseek-r1", provider: "deepseek", type: "reasoning", contextWindow: "128K", pricing: "$0.55/$2.19", rating: 4.6, latency: "3.2s", status: "available" },
    { name: "mistral-large-2", provider: "mistral", type: "chat", contextWindow: "128K", pricing: "$2/$6", rating: 4.4, latency: "0.8s", status: "available" },
    { name: "command-r-plus", provider: "cohere", type: "chat", contextWindow: "128K", pricing: "$2.50/$10", rating: 4.3, latency: "1.1s", status: "available" },
    { name: "qwen-2.5-72b", provider: "alibaba", type: "chat", contextWindow: "128K", pricing: "$0.40/$0.40", rating: 4.2, latency: "0.6s", status: "available" },
    { name: "claude-haiku-4-5", provider: "anthropic", type: "chat", contextWindow: "200K", pricing: "$0.80/$4", rating: 4.6, latency: "0.4s", status: "available" },
    { name: "gpt-4o-mini", provider: "openai", type: "chat", contextWindow: "128K", pricing: "$0.15/$0.60", rating: 4.3, latency: "0.3s", status: "available" },
    { name: "gemini-2.5-flash", provider: "google", type: "chat", contextWindow: "1M", pricing: "$0.15/$0.60", rating: 4.4, latency: "0.2s", status: "available" },
    { name: "nova-pro-v2", provider: "amazon", type: "chat", contextWindow: "300K", pricing: "$0.80/$3.20", rating: 4.1, latency: "0.9s", status: "available" },
    { name: "phi-4", provider: "microsoft", type: "chat", contextWindow: "16K", pricing: "$0.07/$0.14", rating: 4.0, latency: "0.2s", status: "available" },
    { name: "grok-3", provider: "xai", type: "chat", contextWindow: "128K", pricing: "$3/$15", rating: 4.5, latency: "1.8s", status: "available" },
    { name: "devstral-small", provider: "mistral", type: "code", contextWindow: "128K", pricing: "$0.10/$0.30", rating: 4.2, latency: "0.5s", status: "available" },
  ];
  for (const m of models) await prisma.model.create({ data: m });
  console.log(`  ✅ ${models.length} models`);

  // === EVALUATIONS (16) ===
  const evaluations = [
    { name: "MMLU-Pro Benchmark", model: "claude-opus-4-6", score: 92.4, category: "knowledge", samples: 12000, status: "completed" },
    { name: "HumanEval+ Code Gen", model: "gpt-4o-2025-08-06", score: 89.7, category: "coding", samples: 820, status: "completed" },
    { name: "MT-Bench Conversation", model: "claude-sonnet-4-5", score: 9.4, category: "conversation", samples: 3200, status: "completed" },
    { name: "TruthfulQA v2", model: "gemini-2.5-pro", score: 78.3, category: "safety", samples: 5400, status: "completed" },
    { name: "MATH-500 Reasoning", model: "deepseek-r1", score: 96.1, category: "reasoning", samples: 500, status: "completed" },
    { name: "SWE-Bench Verified", model: "claude-opus-4-6", score: 72.8, category: "coding", samples: 500, status: "completed" },
    { name: "Safety Redteaming v3", model: "llama-4-maverick", score: 84.2, category: "safety", samples: 8000, status: "running" },
    { name: "Multilingual BLEU", model: "command-r-plus", score: 45.6, category: "translation", samples: 4200, status: "completed" },
    { name: "Visual QA Benchmark", model: "gemini-2.5-pro", score: 88.9, category: "multimodal", samples: 6800, status: "completed" },
    { name: "Legal Reasoning Test", model: "claude-sonnet-4-5", score: 91.2, category: "domain", samples: 1500, status: "completed" },
    { name: "Agentic Task Completion", model: "claude-opus-4-6", score: 85.4, category: "agentic", samples: 200, status: "running" },
    { name: "Instruction Following", model: "gpt-4o-2025-08-06", score: 93.8, category: "conversation", samples: 2500, status: "completed" },
    { name: "Bias Detection Suite", model: "mistral-large-2", score: 76.5, category: "safety", samples: 10000, status: "completed" },
    { name: "RAG Faithfulness", model: "command-r-plus", score: 87.3, category: "retrieval", samples: 3000, status: "completed" },
    { name: "Long Context Recall", model: "gemini-2.5-pro", score: 94.7, category: "retrieval", samples: 800, status: "completed" },
    { name: "Creative Writing ELO", model: "claude-opus-4-6", score: 1347, category: "creative", samples: 5000, status: "completed" },
  ];
  for (const e of evaluations) await prisma.evaluation.create({ data: e });
  console.log(`  ✅ ${evaluations.length} evaluations`);

  // === AGENTS (16) ===
  const agents = [
    { name: "Customer Support Agent", model: "claude-sonnet-4-5", status: "deployed", requests: 145200, avgLatency: "1.8s", successRate: 94.2, tools: 8 },
    { name: "Code Review Bot", model: "claude-opus-4-6", status: "deployed", requests: 32400, avgLatency: "3.2s", successRate: 91.7, tools: 12 },
    { name: "Data Extraction Pipeline", model: "gpt-4o-2025-08-06", status: "deployed", requests: 89600, avgLatency: "2.1s", successRate: 96.8, tools: 6 },
    { name: "Legal Contract Analyzer", model: "claude-sonnet-4-5", status: "deployed", requests: 18700, avgLatency: "4.5s", successRate: 93.1, tools: 5 },
    { name: "Sales Lead Qualifier", model: "gpt-4o-mini", status: "deployed", requests: 267000, avgLatency: "0.8s", successRate: 88.4, tools: 10 },
    { name: "Document Summarizer", model: "gemini-2.5-flash", status: "deployed", requests: 412000, avgLatency: "0.5s", successRate: 97.2, tools: 3 },
    { name: "Threat Intelligence Agent", model: "claude-opus-4-6", status: "deployed", requests: 8900, avgLatency: "5.8s", successRate: 89.6, tools: 15 },
    { name: "HR Onboarding Assistant", model: "claude-haiku-4-5", status: "testing", requests: 1200, avgLatency: "0.6s", successRate: 92.3, tools: 7 },
    { name: "Financial Report Generator", model: "claude-sonnet-4-5", status: "deployed", requests: 24500, avgLatency: "6.2s", successRate: 95.4, tools: 9 },
    { name: "Medical Triage Bot", model: "claude-opus-4-6", status: "testing", requests: 3400, avgLatency: "2.4s", successRate: 97.8, tools: 11 },
    { name: "Content Moderation Agent", model: "llama-4-maverick", status: "deployed", requests: 1890000, avgLatency: "0.3s", successRate: 96.1, tools: 4 },
    { name: "Research Assistant", model: "gemini-2.5-pro", status: "deployed", requests: 56700, avgLatency: "8.1s", successRate: 90.2, tools: 18 },
    { name: "Email Draft Agent", model: "gpt-4o-mini", status: "deployed", requests: 345000, avgLatency: "0.4s", successRate: 94.7, tools: 5 },
    { name: "Inventory Forecaster", model: "claude-sonnet-4-5", status: "deployed", requests: 12300, avgLatency: "3.7s", successRate: 91.9, tools: 8 },
    { name: "Security Audit Agent", model: "claude-opus-4-6", status: "testing", requests: 890, avgLatency: "12.3s", successRate: 88.1, tools: 22 },
    { name: "Translation Pipeline", model: "command-r-plus", status: "deployed", requests: 78900, avgLatency: "1.1s", successRate: 93.5, tools: 4 },
  ];
  for (const a of agents) await prisma.agent.create({ data: a });
  console.log(`  ✅ ${agents.length} agents`);

  // === DATASETS (16) ===
  const datasets = [
    { name: "ImageNet-2026-Extended", type: "Image", records: 15400000, size: "2.3 TB", format: "Parquet", quality: 98.1, tags: "vision,classification" },
    { name: "RLHF-Conversations-v4", type: "Text", records: 2800000, size: "45 GB", format: "JSONL", quality: 94.7, tags: "rlhf,chat" },
    { name: "CodeContests-Pro", type: "Code", records: 890000, size: "12 GB", format: "JSONL", quality: 96.3, tags: "coding,evaluation" },
    { name: "MedicalQA-Expert", type: "Text", records: 340000, size: "5.2 GB", format: "Parquet", quality: 99.2, tags: "medical,qa" },
    { name: "AutonomousDriving-Lidar-v3", type: "Point Cloud", records: 8700000, size: "18 TB", format: "Custom", quality: 97.8, tags: "lidar,3d" },
    { name: "Multilingual-NER-120lang", type: "Text", records: 5600000, size: "28 GB", format: "CoNLL", quality: 93.4, tags: "ner,multilingual" },
    { name: "SafetyRedTeam-v3", type: "Text", records: 450000, size: "3.1 GB", format: "JSONL", quality: 91.8, tags: "safety,redteam" },
    { name: "SatelliteImagery-Global", type: "Image", records: 3200000, size: "8.5 TB", format: "GeoTIFF", quality: 96.9, tags: "satellite,geospatial" },
    { name: "LegalDocuments-US-v2", type: "Document", records: 1200000, size: "67 GB", format: "PDF+JSON", quality: 95.1, tags: "legal,extraction" },
    { name: "SpeechCorpus-EN-v5", type: "Audio", records: 9800000, size: "4.2 TB", format: "WAV+JSON", quality: 97.4, tags: "speech,transcription" },
    { name: "ProductCatalog-Retail", type: "Multimodal", records: 22000000, size: "1.8 TB", format: "Parquet", quality: 94.5, tags: "retail,product" },
    { name: "FinancialTimeSeries-2026", type: "Tabular", records: 45000000, size: "120 GB", format: "Parquet", quality: 99.7, tags: "finance,timeseries" },
    { name: "ChatPreference-Pairs-v6", type: "Text", records: 1500000, size: "18 GB", format: "JSONL", quality: 92.8, tags: "preference,rlhf" },
    { name: "VideoAction-Recognition", type: "Video", records: 780000, size: "12 TB", format: "MP4+JSON", quality: 95.6, tags: "video,action" },
    { name: "SemanticSeg-Cityscapes+", type: "Image", records: 4500000, size: "3.8 TB", format: "PNG+Mask", quality: 98.4, tags: "segmentation,urban" },
    { name: "InstructionTuning-v8", type: "Text", records: 6200000, size: "52 GB", format: "JSONL", quality: 93.9, tags: "instruction,sft" },
  ];
  for (const d of datasets) await prisma.dataset.create({ data: d });
  console.log(`  ✅ ${datasets.length} datasets`);

  // === LABELERS (16) ===
  const labelers = [
    { name: "Sarah Chen", expertise: "NLP / RLHF", rating: 4.9, tasksCompleted: 12400, accuracy: 97.2, status: "active", region: "US-West", hourlyRate: 42 },
    { name: "Raj Patel", expertise: "Computer Vision", rating: 4.8, tasksCompleted: 18900, accuracy: 96.8, status: "active", region: "India", hourlyRate: 28 },
    { name: "Maria Rodriguez", expertise: "Medical Annotation", rating: 5.0, tasksCompleted: 8200, accuracy: 99.1, status: "active", region: "US-East", hourlyRate: 65 },
    { name: "James Wright", expertise: "Legal Documents", rating: 4.7, tasksCompleted: 6500, accuracy: 95.4, status: "active", region: "UK", hourlyRate: 55 },
    { name: "Yuki Tanaka", expertise: "Multilingual NLP", rating: 4.8, tasksCompleted: 14200, accuracy: 96.1, status: "active", region: "Japan", hourlyRate: 38 },
    { name: "Ahmed Hassan", expertise: "Arabic NLP", rating: 4.6, tasksCompleted: 9800, accuracy: 94.7, status: "active", region: "Egypt", hourlyRate: 22 },
    { name: "Emily Davis", expertise: "Safety / Alignment", rating: 4.9, tasksCompleted: 11300, accuracy: 97.8, status: "active", region: "US-East", hourlyRate: 48 },
    { name: "Chen Wei", expertise: "3D Point Cloud", rating: 4.7, tasksCompleted: 7600, accuracy: 96.5, status: "on_break", region: "China", hourlyRate: 32 },
    { name: "Anna Kowalski", expertise: "Satellite Imagery", rating: 4.8, tasksCompleted: 5400, accuracy: 98.3, status: "active", region: "Poland", hourlyRate: 30 },
    { name: "David Kim", expertise: "Code Review", rating: 4.9, tasksCompleted: 4800, accuracy: 95.9, status: "active", region: "South Korea", hourlyRate: 45 },
    { name: "Fatima Al-Said", expertise: "Medical Imaging", rating: 5.0, tasksCompleted: 3200, accuracy: 99.4, status: "active", region: "UAE", hourlyRate: 70 },
    { name: "Tom Brown", expertise: "General Labeling", rating: 4.3, tasksCompleted: 22100, accuracy: 92.1, status: "active", region: "US-Central", hourlyRate: 20 },
    { name: "Priya Sharma", expertise: "Audio Transcription", rating: 4.6, tasksCompleted: 16700, accuracy: 95.2, status: "active", region: "India", hourlyRate: 18 },
    { name: "Lucas Martin", expertise: "Video Annotation", rating: 4.5, tasksCompleted: 8900, accuracy: 94.8, status: "active", region: "France", hourlyRate: 35 },
    { name: "Olivia Johnson", expertise: "RLHF / Preference", rating: 4.8, tasksCompleted: 10600, accuracy: 96.7, status: "active", region: "Canada", hourlyRate: 40 },
    { name: "Mikhail Volkov", expertise: "Geospatial", rating: 4.7, tasksCompleted: 6100, accuracy: 97.0, status: "active", region: "Russia", hourlyRate: 25 },
  ];
  for (const l of labelers) await prisma.labeler.create({ data: l });
  console.log(`  ✅ ${labelers.length} labelers`);

  // === FINE-TUNES (16) ===
  const finetunes = [
    { name: "customer-support-sonnet", baseModel: "claude-sonnet-4-5", status: "completed", epochs: 3, loss: 0.42, evalScore: 94.1, dataset: "RLHF-Conversations-v4" },
    { name: "legal-analyst-gpt4o", baseModel: "gpt-4o-2025-08-06", status: "completed", epochs: 5, loss: 0.38, evalScore: 92.7, dataset: "LegalDocuments-US-v2" },
    { name: "code-reviewer-opus", baseModel: "claude-opus-4-6", status: "running", epochs: 2, loss: 0.51, evalScore: null, dataset: "CodeContests-Pro" },
    { name: "medical-qa-gemini", baseModel: "gemini-2.5-pro", status: "completed", epochs: 4, loss: 0.35, evalScore: 96.8, dataset: "MedicalQA-Expert" },
    { name: "safety-classifier-llama", baseModel: "llama-4-maverick", status: "completed", epochs: 6, loss: 0.29, evalScore: 91.3, dataset: "SafetyRedTeam-v3" },
    { name: "financial-analyst-sonnet", baseModel: "claude-sonnet-4-5", status: "completed", epochs: 3, loss: 0.44, evalScore: 93.5, dataset: "FinancialTimeSeries-2026" },
    { name: "multilingual-ner-command", baseModel: "command-r-plus", status: "failed", epochs: 1, loss: 1.23, evalScore: null, dataset: "Multilingual-NER-120lang" },
    { name: "product-tagger-haiku", baseModel: "claude-haiku-4-5", status: "completed", epochs: 8, loss: 0.22, evalScore: 97.4, dataset: "ProductCatalog-Retail" },
    { name: "instruction-tuned-qwen", baseModel: "qwen-2.5-72b", status: "completed", epochs: 2, loss: 0.48, evalScore: 89.6, dataset: "InstructionTuning-v8" },
    { name: "speech-qa-nova", baseModel: "nova-pro-v2", status: "queued", epochs: 0, loss: null, evalScore: null, dataset: "SpeechCorpus-EN-v5" },
    { name: "satellite-detector-gpt4o", baseModel: "gpt-4o-2025-08-06", status: "completed", epochs: 4, loss: 0.31, evalScore: 95.8, dataset: "SatelliteImagery-Global" },
    { name: "chat-preference-mistral", baseModel: "mistral-large-2", status: "completed", epochs: 3, loss: 0.39, evalScore: 90.4, dataset: "ChatPreference-Pairs-v6" },
    { name: "retail-assistant-haiku", baseModel: "claude-haiku-4-5", status: "running", epochs: 1, loss: 0.67, evalScore: null, dataset: "ProductCatalog-Retail" },
    { name: "driving-classifier-llama", baseModel: "llama-4-maverick", status: "completed", epochs: 5, loss: 0.27, evalScore: 96.2, dataset: "AutonomousDriving-Lidar-v3" },
    { name: "video-captioner-gemini", baseModel: "gemini-2.5-pro", status: "completed", epochs: 3, loss: 0.41, evalScore: 88.9, dataset: "VideoAction-Recognition" },
    { name: "doc-extractor-phi4", baseModel: "phi-4", status: "completed", epochs: 10, loss: 0.19, evalScore: 94.3, dataset: "LegalDocuments-US-v2" },
  ];
  for (const ft of finetunes) await prisma.fineTune.create({ data: ft });
  console.log(`  ✅ ${finetunes.length} fine-tunes`);

  // === API LOGS (16) ===
  const logs = [
    { endpoint: "/v1/chat/completions", model: "claude-sonnet-4-5", status: 200, latency: 1243, tokens: 2840, ip: "192.168.1.42" },
    { endpoint: "/v1/chat/completions", model: "gpt-4o-2025-08-06", status: 200, latency: 892, tokens: 1560, ip: "10.0.0.15" },
    { endpoint: "/v1/embeddings", model: "text-embedding-3-large", status: 200, latency: 134, tokens: 8000, ip: "172.16.0.8" },
    { endpoint: "/v1/chat/completions", model: "claude-opus-4-6", status: 200, latency: 3421, tokens: 5200, ip: "192.168.1.42" },
    { endpoint: "/v1/chat/completions", model: "gemini-2.5-pro", status: 429, latency: 12, tokens: 0, ip: "10.0.0.22" },
    { endpoint: "/v1/fine-tuning/jobs", model: "claude-sonnet-4-5", status: 201, latency: 2100, tokens: 0, ip: "192.168.1.42" },
    { endpoint: "/v1/chat/completions", model: "llama-4-maverick", status: 200, latency: 456, tokens: 920, ip: "172.16.0.8" },
    { endpoint: "/v1/chat/completions", model: "deepseek-r1", status: 200, latency: 4567, tokens: 8400, ip: "10.0.0.15" },
    { endpoint: "/v1/agents/run", model: "claude-sonnet-4-5", status: 200, latency: 8934, tokens: 12300, ip: "192.168.1.42" },
    { endpoint: "/v1/chat/completions", model: "mistral-large-2", status: 500, latency: 5000, tokens: 0, ip: "10.0.0.22" },
    { endpoint: "/v1/evaluations/run", model: "claude-opus-4-6", status: 200, latency: 15200, tokens: 24000, ip: "192.168.1.42" },
    { endpoint: "/v1/chat/completions", model: "gpt-4o-mini", status: 200, latency: 234, tokens: 680, ip: "172.16.0.8" },
    { endpoint: "/v1/data/upload", model: "N/A", status: 200, latency: 45000, tokens: 0, ip: "192.168.1.42" },
    { endpoint: "/v1/chat/completions", model: "qwen-2.5-72b", status: 200, latency: 678, tokens: 1100, ip: "10.0.0.15" },
    { endpoint: "/v1/chat/completions", model: "claude-haiku-4-5", status: 200, latency: 312, tokens: 450, ip: "172.16.0.8" },
    { endpoint: "/v1/agents/deploy", model: "claude-sonnet-4-5", status: 200, latency: 3200, tokens: 0, ip: "192.168.1.42" },
  ];
  for (const log of logs) await prisma.apiLog.create({ data: log });
  console.log(`  ✅ ${logs.length} API logs`);

  console.log("\n🎉 Seeding complete!");
  console.log(`   Total: ${projects.length + models.length + evaluations.length + agents.length + datasets.length + labelers.length + finetunes.length + logs.length} records across 8 tables`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
