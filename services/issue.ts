import axios from "axios";

export type RequestCreateIssueReportService = {
  errorName: string;
  message: string;
  stack: string;
  componentStack: string;
  pageUrl: string;
  userAgent: string;
  capturedAt: string;
};

export type ResponseCreateIssueReportService = {
  reportId: string;
  groupId: string;
};

/**
 * Sent from the crash screen. Deliberately NOT the shared axios instance:
 * that one redirects to /welcome when no refresh token exists and tries to
 * refresh tokens, neither of which we want while the app is broken.
 * Always anonymous: the server only attributes reports to teacher accounts,
 * and a student token would just be rejected there.
 */
export async function CreateIssueReportService(
  input: RequestCreateIssueReportService,
): Promise<ResponseCreateIssueReportService> {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/issues/reports`,
      input,
      { timeout: 15000 },
    );
    return response.data;
  } catch (error: any) {
    throw error?.response?.data ?? error;
  }
}
