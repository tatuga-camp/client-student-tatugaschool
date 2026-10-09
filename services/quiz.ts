import type { AxiosRequestConfig } from "axios";
import { IntegrityEvent, QuizAnswerDraft, StudentQuizView } from "../interfaces";
import { getAccessToken } from "../utils/cookie";
import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

async function call<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await axiosInstance(config);
    return response.data as T;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

const base = (soaId: string) => `v1/student/quiz/${soaId}`;

export function GetStudentQuizService(soaId: string) {
  return call<StudentQuizView>({ method: "GET", url: base(soaId) });
}

export function StartQuizService(soaId: string) {
  return call<StudentQuizView>({ method: "POST", url: `${base(soaId)}/start` });
}

export function SaveQuizAnswerService(soaId: string, questionId: string, answer: QuizAnswerDraft) {
  return call<{ questionId: string; savedAt: string }>({
    method: "PUT",
    url: `${base(soaId)}/answers/${questionId}`,
    data: answer,
  });
}

export function SubmitQuizService(soaId: string) {
  return call<StudentQuizView>({ method: "POST", url: `${base(soaId)}/submit` });
}

export type IntegrityBatch = { events: IntegrityEvent[]; heartbeat: boolean };

export function SendIntegrityBatchService(soaId: string, batch: IntegrityBatch) {
  return call<{ ok: true }>({ method: "POST", url: `${base(soaId)}/integrity`, data: batch });
}

/**
 * Used on page hide. It survives the page freezing or closing, and unlike
 * sendBeacon it can send the Bearer header the API requires.
 */
export function sendIntegrityKeepalive(soaId: string, batch: IntegrityBatch): void {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "";
  const { access_token } = getAccessToken();
  if (!serverUrl || !access_token || batch.events.length === 0) return;
  const url = new URL(`${base(soaId)}/integrity`, serverUrl.endsWith("/") ? serverUrl : `${serverUrl}/`);
  fetch(url.toString(), {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${access_token}` },
    body: JSON.stringify(batch),
  }).catch(() => undefined);
}
