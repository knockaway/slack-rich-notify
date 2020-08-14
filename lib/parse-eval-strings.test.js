"use strict";

const { test } = require("tap");
const parseEvalStrings = require("./parse-eval-strings");

const fixture1 = `foo = echo "foo"
bar = echo "bar"`;

test("returns empty object for non-string input", async (t) => {
  const evals = parseEvalStrings(["foo"]);
  t.deepEqual(evals, {});
});

test("returns empty object for no input", async (t) => {
  const evals = parseEvalStrings();
  t.deepEqual(evals, {});
});

test("returns evals for fixture1", async (t) => {
  const evals = parseEvalStrings(fixture1);
  t.deepEqual(evals, { foo: 'echo "foo"', bar: 'echo "bar"' });
});
