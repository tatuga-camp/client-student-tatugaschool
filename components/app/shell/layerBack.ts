import { topLayer } from "../modalLayers";
import { layerPop, settleRestore } from "../../../utils/popGuard";
import { onPopSettled, popInfo } from "./useShellRoute";

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
