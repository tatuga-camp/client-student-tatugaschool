import type { AxiosRequestConfig } from "axios";
import {
  IntegrityEvent,
  QuizAnswerDraft,
  StudentQuizView,
} from "../interfaces";
import { getAccessToken } from "../utils/cookie";
import { isPermanentIntegrityRejection } from "../utils/quizIntegrity";
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

// The shared axios instance waits up to 10 minutes. Quiz writes must fail fast on
// flaky Wi-Fi so autosave and the integrity sender retry instead of hanging.
const QUIZ_WRITE_TIMEOUT_MS = 15_000;

export function GetStudentQuizService(soaId: string) {
  return call<StudentQuizView>({ method: "GET", url: base(soaId) });
}

export function StartQuizService(soaId: string) {
  return call<StudentQuizView>({ method: "POST", url: `${base(soaId)}/start` });
}

export function SaveQuizAnswerService(
  soaId: string,
  questionId: string,
  answer: QuizAnswerDraft,
) {
  return call<{ questionId: string; savedAt: string }>({
    method: "PUT",
    url: `${base(soaId)}/answers/${questionId}`,
    data: answer,
    timeout: QUIZ_WRITE_TIMEOUT_MS,
  });
}

export function SubmitQuizService(soaId: string) {
  return call<StudentQuizView>({
    method: "POST",
    url: `${base(soaId)}/submit`,
  });
}

export type IntegrityBatch = { events: IntegrityEvent[]; heartbeat: boolean };

export function SendIntegrityBatchService(
  soaId: string,
  batch: IntegrityBatch,
) {
  return call<{ ok: true }>({
    method: "POST",
    url: `${base(soaId)}/integrity`,
    data: batch,
    timeout: QUIZ_WRITE_TIMEOUT_MS,
  });
}

/**
 * Used on page hide. It survives the page freezing or closing, and unlike
 * sendBeacon it can send the Bearer header the API requires. Resolves true
 * when the batch was delivered, was empty or was rejected for good, false
 * when it could not be sent, so the caller can keep the events queued.
 */
export function sendIntegrityKeepalive(
  soaId: string,
  batch: IntegrityBatch,
): Promise<boolean> {
  if (batch.events.length === 0) return Promise.resolve(true);
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "";
  const { access_token } = getAccessToken();
  if (!serverUrl || !access_token) return Promise.resolve(false);
  const url = new URL(
    `${base(soaId)}/integrity`,
    serverUrl.endsWith("/") ? serverUrl : `${serverUrl}/`,
  );
  return (
    fetch(url.toString(), {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(batch),
    })
      // A permanent rejection counts as handled so the batch is not re-queued forever.
      .then((res) => res.ok || isPermanentIntegrityRejection(res.status))
      .catch(() => false)
  );
}
