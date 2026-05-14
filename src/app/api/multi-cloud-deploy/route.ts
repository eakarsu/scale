import { NextResponse } from "next/server";

// Multi-Cloud Orchestration — deploy a model spec to AWS SageMaker / Azure ML / GCP Vertex / Lambda.
// TODO: configure credentials — AWS_ACCESS_KEY_ID, AZURE_ML_TENANT_ID, GCP_SERVICE_ACCOUNT_KEY.

type Cloud = 'aws-sagemaker' | 'azure-ml' | 'gcp-vertex' | 'aws-lambda';

interface DeploymentSpec {
  modelId: string;
  cloud: Cloud;
  region?: string;
  instanceType?: string;
}

interface Deployment extends DeploymentSpec {
  id: string;
  status: 'queued' | 'deploying' | 'live' | 'failed' | 'auth_required';
  startedAt: string;
  errorMessage?: string;
  endpoint?: string;
}

const deployments = new Map<string, Deployment>();

function credsAvailable(cloud: Cloud): boolean {
  if (cloud === 'aws-sagemaker' || cloud === 'aws-lambda') {
    return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
  }
  if (cloud === 'azure-ml') {
    return !!(process.env.AZURE_ML_TENANT_ID && process.env.AZURE_ML_CLIENT_ID && process.env.AZURE_ML_CLIENT_SECRET);
  }
  if (cloud === 'gcp-vertex') {
    return !!process.env.GCP_SERVICE_ACCOUNT_KEY;
  }
  return false;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as DeploymentSpec & { autoSelect?: boolean; costTarget?: number };
  if (!body.modelId) return NextResponse.json({ error: "modelId required" }, { status: 400 });

  // Auto-select cheapest available cloud if requested
  let cloud: Cloud = body.cloud;
  if (body.autoSelect) {
    const order: Cloud[] = ['aws-lambda', 'gcp-vertex', 'azure-ml', 'aws-sagemaker'];
    cloud = order.find(credsAvailable) || body.cloud || 'aws-lambda';
  }
  if (!cloud) return NextResponse.json({ error: "cloud required (or pass autoSelect)" }, { status: 400 });

  const id = `dep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const ready = credsAvailable(cloud);

  const dep: Deployment = {
    id,
    modelId: body.modelId,
    cloud,
    region: body.region,
    instanceType: body.instanceType,
    status: ready ? 'deploying' : 'auth_required',
    startedAt: new Date().toISOString(),
    errorMessage: ready ? undefined : `Missing credentials for ${cloud}. TODO: configure credentials.`,
  };
  deployments.set(id, dep);

  // Lean v0: simulate deployment success after small delay.
  if (ready) {
    setTimeout(() => {
      const d = deployments.get(id);
      if (d) {
        d.status = 'live';
        d.endpoint = `https://${cloud}.example.com/inference/${id}`;
      }
    }, 200);
  }

  return NextResponse.json({ deployment: dep });
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (id) {
    const d = deployments.get(id);
    if (!d) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ deployment: d });
  }
  return NextResponse.json({ deployments: Array.from(deployments.values()) });
}
