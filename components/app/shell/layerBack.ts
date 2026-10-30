import Router, { useRouter } from "next/router";
import { useEffect } from "react";
import { topLayer } from "../modalLayers";
import { layerPop, settleRestore } from "../../../utils/popGuard";
import { onPopSettled, popInfo, trackHistory } from "./useShellRoute";

// The key of the entry a restore from a layer-closing back is heading to.
let restoringKey: string | null = null;
// Its landing may never reach beforePopState (see settleRestore).
onPopSettled((key) => {
  restoringKey = settleRestore(restoringKey, key);
});

/**
 * While a modal layer is open (a sheet, the image or PDF viewer), on a detail
 * page or a tab pane, a browser/Android back closes the topmost layer instead
 * of leaving the page: the pop is cancelled, history is put back with
 * history.go(), and the layer's own close runs (which may ask first, like a
 * dirty note).
 *
 * Returns true when it took the pop (the caller cancels it). A layer that
 * handles back itself (the leave-guard sheet) is left to the guard.
 */
export function interceptLayerPop(): boolean {
  const top = topLayer();
  const decision = layerPop({
    top: top === null ? "none" : top.ownsBack ? "ownsBack" : "closes",
    restoringKey,
    ...popInfo(),
  });
  restoringKey = decision.restoringKey;
  if (decision.go !== null) window.history.go(decision.go);
  if (decision.close) top?.close();
  return decision.take;
}

/**
 * The same back handling on a page outside the shell (the sign-in page): a
 * back with one of its sheets open closes the sheet and stays. Installed
 * while the page is mounted; Next's default comes back on unmount, before the
 * shell's DetailStack installs its own.
 */
export function useLayerBack(): void {
  const { isReady } = useRouter();
  useEffect(() => {
    if (!isReady) return;
    // The restore needs the entries numbered, as in the shell.
    trackHistory();
    Router.beforePopState(() => !interceptLayerPop());
    return () => Router.beforePopState(() => true);
  }, [isReady]);
}
