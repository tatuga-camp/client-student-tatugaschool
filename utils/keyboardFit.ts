/**
 * How a bottom sheet fits above the on-screen keyboard. The keyboard only
 * shrinks the visual viewport (window.visualViewport: offsetTop, height);
 * the layout, and the sheet's root (rect from getBoundingClientRect), stay
 * put. `lift`: how far the sheet's bottom rises off the root's bottom.
 * `room`: the root's visible height, the most the sheet may use.
 */
export function keyboardFit(input: {
  rootTop: number;
  rootBottom: number;
  viewTop: number;
  viewHeight: number;
}): { lift: number; room: number } {
  const viewBottom = input.viewTop + input.viewHeight;
  const lift = Math.max(0, input.rootBottom - viewBottom);
  const top = Math.max(input.rootTop, input.viewTop);
  const room = Math.max(0, Math.min(input.rootBottom, viewBottom) - top);
  return { lift: Math.round(lift), room: Math.round(room) };
}
