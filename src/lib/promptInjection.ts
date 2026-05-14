// Lightweight regex-based prompt-injection scanner.
// PRODUCT-DECISION: Heavy ML-based detectors are TOO-RISKY here (no embeddings,
// no extra deps allowed). This is a fast first-pass classifier intended for
// surfacing obvious attacks. Real defense should layer additional controls.

export interface InjectionFinding {
  rule: string;
  severity: "info" | "warning" | "critical";
  matched: string;
}

export interface InjectionScanResult {
  isFlagged: boolean;
  score: number; // 0..1
  findings: InjectionFinding[];
}

interface Rule {
  id: string;
  pattern: RegExp;
  severity: "info" | "warning" | "critical";
}

const RULES: Rule[] = [
  { id: "ignore-previous-instructions", pattern: /\b(ignore|disregard|forget)\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|context)\b/i, severity: "critical" },
  { id: "system-prompt-leak", pattern: /\b(reveal|show|print|repeat|output)\s+(your\s+)?(system\s+prompt|hidden\s+instructions?|initial\s+prompt|base\s+prompt)/i, severity: "critical" },
  { id: "role-jailbreak", pattern: /\byou\s+are\s+now\s+(an?|the)\s+\w+/i, severity: "warning" },
  { id: "dan-mode", pattern: /\b(DAN|do\s+anything\s+now|jailbreak\s+mode|developer\s+mode)\b/i, severity: "critical" },
  { id: "sudo-prefix", pattern: /^\s*(sudo|admin|root)[:\s]/im, severity: "warning" },
  { id: "encoded-payload", pattern: /\b(base64|rot13|hex)\s*[:(]/i, severity: "info" },
  { id: "exfiltration-url", pattern: /\b(send|post|leak|exfiltrate).{0,40}(http|webhook|to\s+the\s+url)/i, severity: "critical" },
  { id: "delimiter-escape", pattern: /(<\|im_(start|end)\|>|<\|endoftext\|>|\[\/?(SYS|INST)\])/i, severity: "warning" },
  { id: "suppress-safety", pattern: /\b(no\s+(more\s+)?(censorship|guard\s*rails|safety|filters)|unfiltered|bypass\s+(safety|policy|guidelines))\b/i, severity: "warning" },
  { id: "extract-credentials", pattern: /\b(api[_\s-]?key|password|secret|token|credential)s?\b.*\b(reveal|share|tell|give)\b/i, severity: "critical" },
];

const SEVERITY_WEIGHT = { info: 0.1, warning: 0.4, critical: 1.0 } as const;

export function scanForInjection(text: string): InjectionScanResult {
  const findings: InjectionFinding[] = [];
  let weightedSum = 0;
  for (const rule of RULES) {
    const m = text.match(rule.pattern);
    if (m) {
      findings.push({ rule: rule.id, severity: rule.severity, matched: m[0].slice(0, 200) });
      weightedSum += SEVERITY_WEIGHT[rule.severity];
    }
  }
  const score = Math.min(1, weightedSum);
  // PRODUCT-DECISION: flag if score >= 0.4 (one critical OR one warning).
  const isFlagged = score >= 0.4;
  return { isFlagged, score: +score.toFixed(2), findings };
}
