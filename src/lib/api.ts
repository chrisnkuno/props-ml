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
  report_data: string | null;
  source_identity: string;
  policy_id: string;
  contribution_receipt: string;
  model_version: string;
  processing_mode: string;
  verification_bundle: VerificationBundle;
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

export interface VerifyPayload {
  quote?: string | null;
  report_data: string;
  policy_id: string;
  model_version: string;
  source_identity: string;
  file_hash: string;
  result_hash: string;
  signature?: string | null;
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
  reason: string | null;
  warnings: string[];
  checks: {
    report_data_matches_binding: boolean | null;
    report_data_format_valid: boolean | null;
    quote_provided: boolean;
    quote_format_valid: boolean;
    hardware_quote_verified: boolean | null;
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
  const response = await fetch(`${getApiUrl()}${path}`, init);
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

export async function uploadDocument(file: File): Promise<InferenceResult> {
  const formData = new FormData();
  formData.append("file", file);

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
