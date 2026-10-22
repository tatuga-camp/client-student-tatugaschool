import { test } from "node:test";
import assert from "node:assert/strict";
import { installDomTranslationGuard } from "./domTranslationGuard";

// Tiny DOM stand-in that enforces the browser's strict removeChild /
// insertBefore rules, so the guard can run without a real document.
class FakeNode {
  parentNode: FakeNode | null = null;
  childNodes: FakeNode[] = [];

  constructor(readonly name: string) {}

  contains(node: FakeNode | null): boolean {
    for (let n = node; n; n = n.parentNode) if (n === this) return true;
    return false;
  }

  removeChild(child: FakeNode): FakeNode {
    if (child.parentNode !== this) throw new Error("NotFoundError: removeChild");
    this.childNodes.splice(this.childNodes.indexOf(child), 1);
    child.parentNode = null;
    return child;
  }

  insertBefore(node: FakeNode, ref: FakeNode | null): FakeNode {
    if (ref && ref.parentNode !== this) {
      throw new Error("NotFoundError: insertBefore");
    }
    node.parentNode?.removeChild(node);
    const index = ref ? this.childNodes.indexOf(ref) : this.childNodes.length;
    this.childNodes.splice(index, 0, node);
    node.parentNode = this;
    return node;
  }

  appendChild(node: FakeNode): FakeNode {
    return this.insertBefore(node, null);
  }
}

(globalThis as any).Node = FakeNode;

// A button React rendered as <button>"Go"</button>.
function renderButton() {
  const button = new FakeNode("button");
  const text = new FakeNode("#text Go");
  button.appendChild(text);
  return { button, text };
}

// Google Translate: put a <font> where the text node was and detach it.
function translateByReplacing(text: FakeNode) {
  const parent = text.parentNode!;
  const font = new FakeNode("font");
  parent.insertBefore(font, text);
  parent.removeChild(text);
  return font;
}

// Other translators: move the text node inside a <font> wrapper.
function translateByWrapping(text: FakeNode) {
  const parent = text.parentNode!;
  const font = new FakeNode("font");
  parent.insertBefore(font, text);
  font.appendChild(text);
  return font;
}

// Runs first: proves the stand-in reproduces the crash students hit.
test("without the guard, removing a translated text node throws NotFoundError", () => {
  const { button, text } = renderButton();
  translateByReplacing(text);
  assert.throws(() => button.removeChild(text), /NotFoundError/);
});

test("removeChild tolerates a text node the translator detached", () => {
  installDomTranslationGuard();
  const { button, text } = renderButton();
  translateByReplacing(text);
  assert.equal(button.removeChild(text), text);
});

test("removeChild still removes a text node the translator wrapped", () => {
  installDomTranslationGuard();
  const { button, text } = renderButton();
  const font = translateByWrapping(text);
  button.removeChild(text);
  assert.equal(text.parentNode, null);
  assert.equal(font.childNodes.length, 0);
});

test("insertBefore lands before the wrapper when the reference was wrapped", () => {
  installDomTranslationGuard();
  const { button, text } = renderButton();
  const font = translateByWrapping(text);
  const spinner = new FakeNode("spinner");
  button.insertBefore(spinner, text);
  assert.deepEqual(button.childNodes, [spinner, font]);
});

test("insertBefore appends when the reference was detached", () => {
  installDomTranslationGuard();
  const { button, text } = renderButton();
  const font = translateByReplacing(text);
  const spinner = new FakeNode("spinner");
  button.insertBefore(spinner, text);
  assert.deepEqual(button.childNodes, [font, spinner]);
});

test("untranslated removeChild and insertBefore behave as before", () => {
  installDomTranslationGuard();
  const { button, text } = renderButton();
  const spinner = new FakeNode("spinner");
  button.insertBefore(spinner, text);
  assert.deepEqual(button.childNodes, [spinner, text]);
  button.removeChild(text);
  assert.deepEqual(button.childNodes, [spinner]);
});
