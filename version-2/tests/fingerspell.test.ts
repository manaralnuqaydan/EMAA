// اختبارات وحدة لتقسيم الحروف ونوع السؤال (تشغيل: npm test)
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { questionType, splitLetters } from "../src/lib/fingerspell.ts";

const ar = JSON.parse(
  readFileSync(new URL("../public/data/handshapes_ar.json", import.meta.url), "utf8"),
);

test("Arabic: ال and لا are one handshape, hamza forms are normalised", () => {
  const chars = splitLetters("الأسد لا", ar).map((t) => t.ch);
  assert.deepEqual(chars, ["ال", "ا", "س", "د", " ", "لا"]);
});

test("unsupported letters are kept and flagged, punctuation dropped", () => {
  const tokens = splitLetters("مرحبا hi!", ar);
  assert.ok(tokens.some((t) => t.ch === "h" && !t.ok));
  assert.ok(!tokens.some((t) => t.ch === "!"));
  assert.ok(tokens.filter((t) => t.ch !== " " && t.ok).length === 5);
});

test("no ASL handshapes means every English letter is unsupported", () => {
  assert.ok(splitLetters("hello", {}).every((t) => !t.ok));
});

test("question type", () => {
  assert.equal(questionType("كيف حالك؟"), "wh");
  assert.equal(questionType("هل انت من الرياض؟"), "yesno");
  assert.equal(questionType("where are you?"), "wh");
  assert.equal(questionType("are you ok?"), "yesno");
  assert.equal(questionType("hello"), null);
});
