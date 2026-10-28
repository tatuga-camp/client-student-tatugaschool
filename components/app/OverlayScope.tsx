import React, { createContext, useState } from "react";

/**
 * The overlay container sheets portal into. `undefined` = no OverlayScope
 * above: use the global #app-overlay-root. `null` = in a scope whose
 * container hasn't mounted yet: wait for it.
 */
export const OverlayRootContext = createContext<HTMLElement | null | undefined>(
  undefined,
);

/**
 * Gives its children their own overlay container, layered over them and
 * moving with them. A detail panel uses one so its sheets slide in, follow
 * the edge-back drag and leave with the page.
 */
export function OverlayScope({ children }: { children: React.ReactNode }) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  return (
    <OverlayRootContext.Provider value={container}>
      {children}
      <div ref={setContainer} data-overlay-root="" />
    </OverlayRootContext.Provider>
  );
}
