const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface InferenceResult {
  result: string;
  attestation: string | null;
  report_data: string | null;
}

export async function uploadDocument(file: File): Promise<InferenceResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to upload document');
  }

  return response.json();
}

export async function getInfo() {
  const response = await fetch(`${API_URL}/info`);
  return response.json();
}
