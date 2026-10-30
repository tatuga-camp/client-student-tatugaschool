import axios from "axios";
import { StudentRefetchTokenService } from "./auth";
import {
  getAccessToken,
  getRefetchtoken,
  removeAccessToken,
  removeRefreshToken,
  setAccessToken,
} from "../utils";
import {
  isRateLimitError,
  localRateLimitError,
  reportRateLimit,
  waitForRateLimit,
} from "../utils/rateLimit";

const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    timeout: 1000 * 60 * 10,
    withCredentials: true,
  });

  instance.interceptors.request.use(
    async (config) => {
      const request = config.url;

      // While the server's rate limit is in force, hold the request until
      // the wait is over instead of sending one it would reject. Auth calls
      // still go out: the token refresh below must not be held back.
      if (!request?.startsWith("/v1/auth/")) {
        await waitForRateLimit();
      }

      // Bypass auth service endpoints
      if (request?.startsWith("/v1/auth/")) {
        return config;
      }
      if (request?.startsWith("v1/students/student/get-as-user")) {
        // Skips the session-expired redirect below, but must still send the
        // CURRENT cookie token: without it the request rides on whatever
        // Authorization header was left over, i.e. a previous student's.
        const { access_token } = getAccessToken();
        if (access_token && !isTokenExpired(access_token)) {
          config.headers["Authorization"] = `Bearer ${access_token}`;
        } else {
          delete config.headers["Authorization"];
        }
        return config;
      }

      const { refresh_token } = getRefetchtoken();

      // Check if refresh token is missing or expired
      if (
        !refresh_token ||
        (typeof window !== "undefined" && isTokenExpired(refresh_token))
      ) {
        console.log("Redirect to login: Refresh token missing or expired");
        removeAccessToken();
        removeRefreshToken();
        if (typeof window !== "undefined") {
          window.location.href = "/welcome";
        }
        throw new axios.Cancel("Session expired");
      }

      let { access_token } = getAccessToken();

      // Check if access token is missing or expired
      if (!access_token || isTokenExpired(access_token)) {
        try {
          const { accessToken } = await StudentRefetchTokenService({
            refreshToken: refresh_token,
          });

          // Set the new access token in cookie
          setAccessToken({ access_token: accessToken });
          access_token = accessToken;
        } catch (error) {
          // A rate-limited refresh is not an expired session: keep the
          // student signed in and let the popup explain the wait.
          if (isRateLimitError(error)) {
            throw localRateLimitError((error as any)?.retryAfter ?? 30);
          }
          console.log("Refresh token failed", error);
          removeAccessToken();
          removeRefreshToken();
          if (typeof window !== "undefined") {
            window.location.href = "/welcome";
          }
          throw error;
        }
      }

      // Add access token to the header
      if (access_token) {
        config.headers["Authorization"] = `Bearer ${access_token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 429) {
        reportRateLimit(error.response.data);
        return Promise.reject(error);
      }
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const { refresh_token } = getRefetchtoken();
        if (!refresh_token) {
          throw new Error("Token not found");
        }
        try {
          const { accessToken } = await StudentRefetchTokenService({
            refreshToken: refresh_token,
          });

          setAccessToken({ access_token: accessToken });

          // Only this retry gets the new token. Never write it to
          // instance.defaults: the instance outlives the session, so a later
          // sign-in as another student would keep sending this token.
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

          return instance(originalRequest);
        } catch (refreshError) {
          if (isRateLimitError(refreshError)) {
            return Promise.reject(refreshError);
          }
          console.log("refreshError", refreshError);
          removeAccessToken();
          removeRefreshToken();
          if (typeof window !== "undefined") {
            window.location.href = "/welcome";
          }
        }
      }
      return Promise.reject(error);
    },
  );

  return instance;
};

/** Expired, or expiring within `leewaySeconds`. */
const isTokenExpired = (token: string, leewaySeconds = 0) => {
  if (!token) return true;
  try {
    const [, payload] = token.split(".");
    // Use Buffer for server-side or window.atob for client-side
    const decodedString =
      typeof window !== "undefined"
        ? window.atob(payload)
        : Buffer.from(payload, "base64").toString();

    const decodedPayload = JSON.parse(decodedString);
    const exp = decodedPayload.exp;

    // Optional: Add a 10-second buffer to prevent clock skew issues
    // if you really want to keep the client-side check.
    return Math.floor(Date.now() / 1000) + leewaySeconds >= exp;
  } catch (error) {
    console.log("error decoding token", error);
    return true; // Assume expired if we can't decode
  }
};

/**
 * Refreshes the access token when it has under `seconds` left. For a page
 * that must send on hide: a keepalive request can't refresh first, and the
 * student token lives minutes while a playing video sends nothing.
 */
export const refreshAccessTokenWithin = async (seconds: number) => {
  const { access_token } = getAccessToken();
  if (access_token && !isTokenExpired(access_token, seconds)) return;
  const { refresh_token } = getRefetchtoken();
  if (!refresh_token || isTokenExpired(refresh_token)) return;
  const { accessToken } = await StudentRefetchTokenService({
    refreshToken: refresh_token,
  });
  setAccessToken({ access_token: accessToken });
};
export default createAxiosInstance;
