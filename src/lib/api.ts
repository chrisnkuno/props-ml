const CONFIGURED_API_URL = process.env.NEXT_PUBLIC_API_URL;

function getApiUrl(): string {
  if (typeof window === "undefined") {
    return CONFIGURED_API_URL || "http://localhost:8000";
  }

  const fallbackUrl = `${window.location.protocol}//${window.location.hostname}:8000`;
  if (!CONFIGURED_API_URL) {
    return fallbackUrl;
  }

  try {
    const parsed = new URL(CONFIGURED_API_URL, window.location.origin);
    if (parsed.hostname === "backend") {
      return `${window.location.protocol}//${window.location.hostname}:${parsed.port || "8000"}`;
    }
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return CONFIGURED_API_URL;
  }
}

export interface InferenceResult {
  result: string;
  attestation: string | null;
  attestation_bundle: AttestationBundle | null;
  report_data: string | null;
  document_kind: string;
  document_kind_label: string;
  document_profile: string;
  detector_confidence: string;
  detected_terms: string[];
  detector_summary: string;
  source_identity: string;
  policy_id: string;
  contribution_receipt: string;
  model_version: string;
  processing_mode: string;
  verification_bundle: VerificationBundle;
}

export interface AttestationBundle {
  quote: string | null;
  event_log: string | null;
  report_data: string | null;
  vm_config: string | null;
  app_id: string | null;
  instance_id: string | null;
  device_id: string | null;
  compose_hash: string | null;
}

export interface VerificationBundle {
  model_version: string;
  processing_mode: string;
  file_hash: string;
  result_hash: string;
  compose_hash: string;
  compose_images_pinned: boolean;
  signature: string | null;
}

export interface AppInfo {
  app: string;
  version: string;
  tee_enabled: boolean;
  tee_sdk_loaded: boolean;
  dstack_socket: string;
  dstack_socket_present: boolean;
  compose_hash: string;
  compose_images_pinned: boolean;
}

export interface TrainingPipeline {
  pipeline_id: string;
  pipeline_name: string;
  status: string;
  created_at: string;
  objective: string;
  document_kind: string;
  source_identity: string;
  policy_id: string;
  private_ocr: boolean;
  attested_training: boolean;
  training_enabled: boolean;
  deployment_target: string;
  steps: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
  }>;
}

export interface TrainingPipelineRequest {
  pipeline_name: string;
  objective: string;
  document_kind: string;
  source_identity: string;
  policy_id: string;
  private_ocr: boolean;
  attested_training: boolean;
  training_enabled: boolean;
  deployment_target: string;
}

export interface DeployWalkthrough {
  target: string;
  summary: string;
  modes: Array<{
    id: string;
    title: string;
    status: string;
    description: string;
  }>;
  steps: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  commands: Array<{
    title: string;
    command: string;
  }>;
  environment: {
    backend: string[];
    frontend: string[];
  };
  vercel: {
    root_directory: string;
    framework: string;
    required_env: string[];
    notes: string[];
  };
  privacy_notes: string[];
  references: string[];
  compose_hash: string;
  compose_images_pinned: boolean;
}

export interface VerifyPayload {
  quote?: string | null;
  report_data: string;
  policy_id: string;
  model_version: string;
  source_identity: string;
  file_hash: string;
  result_hash: string;
  event_log?: string | null;
  vm_config?: string | null;
  compose_hash?: string | null;
  compose_images_pinned?: boolean | null;
  signature?: string | null;
}

export interface UploadMetadata {
  source_identity?: string;
  policy_id?: string;
}

export interface VerifyResponse {
  status: "verified" | "partial" | "failed";
  success: boolean;
  quote_valid: boolean;
  quote_length: number;
  tee_type: string | null;
  app_id: string | null;
  compose_hash: string;
  expected_report_data: string;
  quote_report_data: string | null;
  report_data_matches: boolean | null;
  compose_hash_matches: boolean | null;
  quote_checksum: string | null;
  reason: string | null;
  warnings: string[];
  checks: {
    report_data_matches_binding: boolean | null;
    report_data_format_valid: boolean | null;
    quote_provided: boolean;
    quote_format_valid: boolean;
    hardware_quote_verified: boolean | null;
    quote_report_data_matches: boolean | null;
    event_log_provided: boolean;
    event_log_compose_hash_matches: boolean | null;
    event_log_rtmr3_matches: boolean | null;
    vm_config_provided: boolean;
    claimed_compose_hash: string | null;
    claimed_compose_images_pinned: boolean | null;
    compose_hash_matches: boolean | null;
    compose_images_pinned_matches: boolean | null;
    signature_present: boolean;
    signature_format_valid: boolean | null;
    signature_verified: boolean | null;
    signing_key_configured: boolean;
    compose_images_pinned: boolean;
    compose_hash: string;
  };
  source_manifest: string | null;
}

async function readResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { detail: text } : null;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const apiUrl = `${getApiUrl()}${path}`;
  let response: Response;

  try {
    response = await fetch(apiUrl, init);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Network request failed";
    throw new Error(`Backend unreachable at ${apiUrl}. ${reason}`);
  }

  const body = await readResponse(response);

  if (!response.ok) {
    const detail =
      typeof body === "object" && body !== null && "detail" in body
        ? String(body.detail)
        : `Request failed with status ${response.status}`;
    throw new Error(detail);
  }

  return body as T;
}

export async function uploadDocument(
  file: File,
  metadata?: UploadMetadata,
): Promise<InferenceResult> {
  const formData = new FormData();
  formData.append("file", file);
  if (metadata?.source_identity?.trim()) {
    formData.append("source_identity", metadata.source_identity.trim());
  }
  if (metadata?.policy_id?.trim()) {
    formData.append("policy_id", metadata.policy_id.trim());
  }

  return requestJson<InferenceResult>("/upload", {
    method: "POST",
    body: formData,
  });
}

export async function getInfo(): Promise<AppInfo> {
  return requestJson<AppInfo>("/info");
}

export async function verifyAttestation(payload: VerifyPayload): Promise<VerifyResponse> {
  return requestJson<VerifyResponse>("/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function createTrainingPipeline(
  payload: TrainingPipelineRequest,
): Promise<TrainingPipeline> {
  return requestJson<TrainingPipeline>("/training/pipelines", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function listTrainingPipelines(): Promise<{ pipelines: TrainingPipeline[] }> {
  return requestJson<{ pipelines: TrainingPipeline[] }>("/training/pipelines");
}

export async function getDeployWalkthrough(): Promise<DeployWalkthrough> {
  return requestJson<DeployWalkthrough>("/deploy/walkthrough");
}
