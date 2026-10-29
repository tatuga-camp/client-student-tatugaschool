import { topLayer } from "../modalLayers";
import { decidePop } from "../../../utils/popGuard";
import { popInfo } from "./useShellRoute";

// The key of the entry a restore from a layer-closing back is heading to.
let restoringKey: string | null = null;

/**
 * While a detail page has a modal layer open (a sheet, the image or PDF
 * viewer), a browser/Android back closes the topmost layer instead of leaving
 * the page: the pop is cancelled, history is put back with history.go(), and
 * the layer's own close runs (which may ask first, like a dirty note).
 *
 * Returns true when it took the pop (the caller cancels it). A layer that
 * handles back itself (the leave-guard sheet) is left to the guard.
 */
export function interceptLayerPop(): boolean {
  const top = topLayer();
  const active = top !== null && !top.ownsBack;
  if (!active && restoringKey === null) return false;
  const info = popInfo();
  const { action, restoringKey: next } = decidePop({
    restoringKey,
    poppedKey: info.poppedKey,
    currentKey: info.currentKey,
    pending: active,
    needsAnswer: active,
    delta: info.delta,
    awayBy: 0,
  });
  restoringKey = next;
  if (action.kind === "swallow") return true;
  if (action.kind === "stay" && top) {
    if (action.go !== null && action.go !== 0) {
      restoringKey = info.currentKey;
      window.history.go(action.go);
    }
    top.close();
    return true;
  }
  return false;
}
