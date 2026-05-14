// === Batch 11 Gaps & Frontend Mounts ===
'use client';
import GapFeaturePage from '@/components/GapFeaturePage';
export default function GapAbTestOrchestratorPage() {
  return (
    <GapFeaturePage
      title="A/B Test Orchestrator on Evaluations"
      description="A/B Test Orchestrator on Evaluations"
      slug="ab-test-orchestrator"
      aiResultKey="plan"
      fields={[{"name":"variants","label":"Variants","type":"array"},{"name":"successMetric","label":"Success Metric","required":false,"placeholder":""}]}
    />
  );
}
