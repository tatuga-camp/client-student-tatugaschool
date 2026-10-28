/** Decide whether a released bottom-sheet drag closes it (past 30% of its height, or a fast flick down). */
export function sheetDragOutcome(input: {
  dy: number;
  vy: number;
  height: number;
}): "close" | "stay" {
  const { dy, vy, height } = input;
  if (dy > height * 0.3) return "close";
  if (vy > 0.5 && dy > 0) return "close";
  return "stay";
}
