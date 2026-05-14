// === Batch 11 Gaps & Frontend Mounts ===
'use client';
import GapFeaturePage from '@/components/GapFeaturePage';
export default function GapDriftDetectionPage() {
  return (
    <GapFeaturePage
      title="Drift/Regression Detection"
      description="Drift/Regression Detection"
      slug="drift-detection"
      aiResultKey="flags"
      fields={[{"name":"runs","label":"Eval Runs (JSON)","type":"json"}]}
    />
  );
}
