import ErrorPage from "next/error";
import { useRouter } from "next/router";
import type { ParsedUrlQuery } from "querystring";
import React from "react";
import LoadingSpinner from "./LoadingSpinner";

/** First value of a query param, or undefined when absent/empty. */
export function queryString(
  value: string | string[] | undefined,
): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  return first ? first : undefined;
}

type Props<P> = {
  /** Pick the page's params out of router.query; return null to render a 404. */
  read: (query: ParsedUrlQuery) => P | null;
  children: (params: P) => React.ReactNode;
};

/**
 * Lets a page drop a pass-through getServerSideProps so Next can serve it as
 * static HTML (no Netlify function invocation per load or client navigation).
 *
 * On a statically optimized page router.query is empty until hydration, so
 * children only render once the router is ready — data hooks never see
 * undefined ids and React Query keys stay the same as with server props.
 */
function RouteParamsGate<P>({ read, children }: Props<P>) {
  const router = useRouter();

  if (!router.isReady) {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        <LoadingSpinner width="40px" />
      </div>
    );
  }

  const params = read(router.query);
  if (!params) {
    return <ErrorPage statusCode={404} />;
  }

  return <>{children(params)}</>;
}

export default RouteParamsGate;
