"use strict";

const Handlebars = require("handlebars");
const { githubToSlack } = require("@atomist/slack-messages");

Handlebars.registerHelper("cut", (s, len) => {
  return new Handlebars.SafeString(`${s}`.substring(0, len));
});

Handlebars.registerHelper("githubToSlack", (input) => {
  return githubToSlack(input);
});

module.exports = {
  compile(template) {
    return Handlebars.compile(template, { data: false, noEscape: true });
  },
};
