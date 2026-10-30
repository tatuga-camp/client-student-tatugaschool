import { createContext, useContext } from "react";

/**
 * Whether a detail page is the live one. DetailStack turns it off for a page
 * that is on its way out (another detail took its place), so it can stop
 * polling and other background work.
 */
export const DetailActiveContext = createContext(true);

export const useDetailActive = () => useContext(DetailActiveContext);
