"use strict";

const logger = require("./logger");
const defaultTemplater = require("./templater");

module.exports = function renderMessage({
  messageTemplate,
  templateData,
  log = logger,
  templater = defaultTemplater,
} = {}) {
  const template = templater.compile(messageTemplate);

  log.debug("Formatting message:");
  log.debug(messageTemplate);
  const renderedMessage = template(templateData);

  return renderedMessage;
};
