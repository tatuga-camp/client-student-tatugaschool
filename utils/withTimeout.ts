/** Resolves `{ ok: true, value }`, or `{ ok: false }` if it takes longer than `ms`. */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
): Promise<{ ok: true; value: T } | { ok: false }> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<{ ok: false }>((resolve) => {
    timer = setTimeout(() => resolve({ ok: false }), ms);
  });
  try {
    return await Promise.race([
      promise.then((value) => ({ ok: true as const, value })),
      timeout,
    ]);
  } finally {
    clearTimeout(timer);
  }
}
