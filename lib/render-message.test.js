"use strict";

const { test } = require("tap");
const renderMessage = require("./render-message");

test("renders a message", async (t) => {
  const message = "foo {{bar}}";
  const rendered = renderMessage({
    messageTemplate: message,
    templateData: { bar: "bar" },
    log: { debug() {} },
  });
  t.is(rendered, "foo bar");
});
