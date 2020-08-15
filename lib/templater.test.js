"use strict";

const { test } = require("tap");
const templater = require("./templater");

test("renders templates", async (t) => {
  const templateString = "{{foo}}";
  const template = templater.compile(templateString);
  const rendered = template({ foo: "FOO" });
  t.is(rendered, "FOO");
});

test("cut helper works", async (t) => {
  const templateString = "{{cut foo 1}}";
  const template = templater.compile(templateString);
  const rendered = template({ foo: "FOO" });
  t.is(rendered, "F");
});

test("githubToSlack helper works", async (t) => {
  const templateString = "{{githubToSlack foo}}";
  const template = templater.compile(templateString);
  const rendered = template({ foo: "[foo bar](http://example.com)" });
  t.is(rendered, "<http://example.com|foo bar>");
});
