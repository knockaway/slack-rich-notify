"use strict";

const Handlebars = require("handlebars");

Handlebars.registerHelper("cut", (s, len) => {
  return new Handlebars.SafeString(`${s}`.substring(0, len));
});

module.exports = {
  compile(template) {
    return Handlebars.compile(template, { data: false, noEscape: true });
  },
};
