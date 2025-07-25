import axios from "axios";
import { StudentRefetchTokenService } from "./auth";
import {
  getAccessToken,
  getRefetchtoken,
  removeAccessToken,
  removeRefreshToken,
  setAccessToken,
} from "../utils";

const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    timeout: 10000,
  });
  instance.interceptors.request.use(
    (config) => {
      const { access_token } = getAccessToken();
      const { refresh_token } = getRefetchtoken();
      const request = config.url;
      // Redirect to login if access token is not found and the request is not sign-in
      if (
        (!access_token || !refresh_token) &&
        typeof window !== "undefined" &&
        !request?.startsWith("/v1/auth/")
      ) {
        console.log("redirect to login 1");
        window.location.href = "/welcome";
      }

      // Redirect to login if access token is expired and the request is not sign-in
      if (
        refresh_token &&
        isTokenExpired(refresh_token) &&
        typeof window !== "undefined" &&
        !request?.startsWith("/v1/auth/")
      ) {
        console.log("redirect to login 2");
        window.location.href = "/welcome";
      }

      // Add access token to the header if it is found and not expired
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
      console.log("originalRequest", error);
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const { refresh_token } = getRefetchtoken();

        if (!refresh_token) {
          // redirect to login
          throw new Error("Token not found");
        }
        try {
          const { accessToken } = await StudentRefetchTokenService({
            refreshToken: refresh_token,
          });

          setAccessToken({ access_token: accessToken });
          instance.defaults.headers.common["Authorization"] =
            `Bearer ${accessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
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

const isTokenExpired = (token: string) => {
  try {
    if (!token) return true;
    const [, payload] = token.split(".");
    const decodedPayload = JSON.parse(window.atob(payload));
    const exp = decodedPayload.exp;
    return Math.floor(Date.now() / 1000) >= exp;
  } catch (error) {
    console.log("error", error);
  }
};

export default createAxiosInstance;
