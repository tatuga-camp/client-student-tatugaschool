import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_SNAPSHOT_BYTES,
  UnreadableFileError,
  UploadHttpError,
  UploadNetworkError,
  snapshotFileForUpload,
  uploadFileToSignURL,
} from "./uploadWithRetry";

class FakeXhr {
  upload: { onprogress: ((event: ProgressEvent) => void) | null } = {
    onprogress: null,
  };
  status = 0;
  responseText = "";
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  ontimeout: (() => void) | null = null;
  openArgs: unknown[] = [];
  headers: Record<string, string> = {};
  body: unknown;

  constructor(private script: (xhr: FakeXhr) => void) {}

  open(...args: unknown[]) {
    this.openArgs = args;
  }
  setRequestHeader(key: string, value: string) {
    this.headers[key] = value;
  }
  send(body: unknown) {
    this.body = body;
    queueMicrotask(() => this.script(this));
  }
}

const noDelay = () => Promise.resolve();

test("resolves on a 2xx response and sends the right request", async () => {
  const created: FakeXhr[] = [];
  const result = await uploadFileToSignURL({
    signURL: "https://r2.example.com/bucket/key?sig=abc",
    contentType: "application/pdf",
    file: new Blob(["pdf-bytes"], { type: "application/pdf" }),
    createXhr: () => {
      const xhr = new FakeXhr((self) => {
        self.status = 200;
        self.onload?.();
      });
      created.push(xhr);
      return xhr as unknown as XMLHttpRequest;
    },
    delay: noDelay,
  });

  assert.deepEqual(result, { message: "success" });
  assert.equal(created.length, 1);
  assert.deepEqual(created[0].openArgs, [
    "PUT",
    "https://r2.example.com/bucket/key?sig=abc",
    true,
  ]);
  assert.equal(created[0].headers["Content-Type"], "application/pdf");
});

test("rejects with UploadHttpError on a non-2xx response without retrying", async () => {
  let attempts = 0;
  await assert.rejects(
    uploadFileToSignURL({
      signURL: "https://r2.example.com/x",
      contentType: "application/pdf",
      file: new Blob(["x"]),
      createXhr: () => {
        attempts += 1;
        return new FakeXhr((self) => {
          self.status = 403;
          self.responseText = "<Error><Code>SignatureDoesNotMatch</Code></Error>";
          self.onload?.();
        }) as unknown as XMLHttpRequest;
      },
      delay: noDelay,
    }),
    (error: unknown) => {
      assert.ok(error instanceof UploadHttpError);
      assert.equal(error.status, 403);
      assert.match(error.message, /403/);
      return true;
    },
  );
  assert.equal(attempts, 1);
});

test("retries network errors and succeeds when a later attempt works", async () => {
  let attempts = 0;
  const delays: number[] = [];
  const result = await uploadFileToSignURL({
    signURL: "https://r2.example.com/x",
    contentType: "application/pdf",
    file: new Blob(["x"]),
    createXhr: () => {
      attempts += 1;
      const failing = attempts < 3;
      return new FakeXhr((self) => {
        if (failing) {
          self.onerror?.();
        } else {
          self.status = 200;
          self.onload?.();
        }
      }) as unknown as XMLHttpRequest;
    },
    delay: (ms) => {
      delays.push(ms);
      return Promise.resolve();
    },
  });

  assert.deepEqual(result, { message: "success" });
  assert.equal(attempts, 3);
  assert.deepEqual(delays, [1000, 2000]);
});

test("rejects with UploadNetworkError after exhausting attempts", async () => {
  let attempts = 0;
  await assert.rejects(
    uploadFileToSignURL({
      signURL: "https://r2.example.com/x",
      contentType: "application/pdf",
      file: new Blob(["x"]),
      createXhr: () => {
        attempts += 1;
        return new FakeXhr((self) => {
          self.onerror?.();
        }) as unknown as XMLHttpRequest;
      },
      delay: noDelay,
    }),
    (error: unknown) => {
      assert.ok(error instanceof UploadNetworkError);
      assert.equal(error.attempts, 3);
      return true;
    },
  );
  assert.equal(attempts, 3);
});

test("snapshotFileForUpload copies the bytes and type into memory", async () => {
  const original = new Blob(["hello-pdf"], { type: "application/pdf" });
  const snapshot = await snapshotFileForUpload(original);

  assert.notEqual(snapshot, original);
  assert.equal(snapshot.size, original.size);
  assert.equal(snapshot.type, "application/pdf");
  assert.equal(await snapshot.text(), "hello-pdf");
});

test("snapshotFileForUpload leaves oversized files untouched", async () => {
  const huge = {
    size: MAX_SNAPSHOT_BYTES + 1,
    type: "video/mp4",
  } as Blob;
  const snapshot = await snapshotFileForUpload(huge);
  assert.equal(snapshot, huge);
});

test("snapshotFileForUpload throws UnreadableFileError when the file cannot be read", async () => {
  const stale = {
    size: 10,
    type: "application/pdf",
    name: "work.pdf",
    arrayBuffer: () => Promise.reject(new Error("boom")),
  } as unknown as File;

  await assert.rejects(
    snapshotFileForUpload(stale),
    (error: unknown) => error instanceof UnreadableFileError,
  );
});
