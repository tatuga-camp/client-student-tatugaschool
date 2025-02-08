import { GetServerSidePropsContext } from "next";
import { destroyCookie, parseCookies, setCookie } from "nookies";

export function getRefetchtoken(ctx?: GetServerSidePropsContext): {
  refresh_token: string | null;
} {
  const cookies = parseCookies(ctx);
  const refresh_token = cookies.student_refresh_token;
  return { refresh_token };
}

export function getAccessToken(): { access_token: string | null } {
  const cookies = parseCookies();
  const access_token = cookies.student_access_token;
  return { access_token };
}

export function setAccessToken({ access_token }: { access_token: string }) {
  setCookie(null, "student_access_token", access_token, {
    path: "/",
    maxAge: 5 * 24 * 60 * 60,
  });
  return { access_token };
}

export function setRefreshToken({ refresh_token }: { refresh_token: string }) {
  setCookie(null, "student_refresh_token", refresh_token, {
    path: "/",
    maxAge: 5 * 24 * 60 * 60,
  });

  return { refresh_token };
}

export function removeAccessToken() {
  destroyCookie(null, "student_access_token");
}

export function removeRefreshToken() {
  destroyCookie(null, "student_refresh_token");
}
