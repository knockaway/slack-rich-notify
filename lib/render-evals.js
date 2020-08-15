"use strict";

const { exec: defaultExec } = require("@actions/exec");
const logger = require("./logger");
const defaultTemplater = require("./templater");

module.exports = async function renderEvals({
  evals = {},
  templateData,
  exec = defaultExec,
  log = logger,
  templater = defaultTemplater,
} = {}) {
  const renderedEvals = {};

  for (const key of evals) {
    const template = templater.compile(evals[key]);
    const command = template(templateData);
    const results = { out: "", err: "" };

    log.debug("Evaluating " + command);
    await exec(command, [], {
      listeners: {
        stdout(data) {
          results.out += data.toString();
        },
        stderr(data) {
          results.err += data.toString();
        },
      },
    });
    log.debug("Result: " + JSON.stringify(results));

    if (results.err) {
      throw Error(results.err);
    }

    renderedEvals[key] = results.out;
  }

  return renderedEvals;
};
