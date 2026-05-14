// === Batch 11 Gaps & Frontend Mounts ===
'use client';
import GapFeaturePage from '@/components/GapFeaturePage';
export default function GapHfRegistryPage() {
  return (
    <GapFeaturePage
      title="HuggingFace/TFHub Integration"
      description="HuggingFace/TFHub Integration"
      slug="hf-registry"
      aiResultKey="job"
      fields={[{"name":"modelId","label":"Model ID","required":true,"placeholder":""},{"name":"source","label":"Source","required":false,"placeholder":""}]}
    />
  );
}
