"use strict";

const { test } = require("tap");
const renderEvals = require("./render-evals");

test("renders set of evals", async (t) => {
  const evals = {
    foo: 'echo "{{foo}}"',
  };
  const renderedEvals = await renderEvals({
    evals,
    templateData: { foo: "FOO" },
    log: { debug() {} },
  });
  t.deepEqual(renderedEvals, { foo: "FOO\n" });
});
