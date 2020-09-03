"use strict";

const path = require("path");
const core = require("@actions/core");
const github = require("@actions/github");
const { App } = require("@slack/bolt");
const log = require("./lib/logger");
const parseEvalStrings = require("./lib/parse-eval-strings");
const renderEvals = require("./lib/render-evals");
const renderMessage = require("./lib/render-message");

const messageTemplate = `
New deployment triggered 🚀

*Service:* {{locals.serviceName}}
*PR:* <{{context.payload.pull_request.html_url}}|#{{context.payload.number}}>
*Title:* {{githubToSlack context.payload.pull_request.title}}
{{#if context.payload.pull_request.body}}
*Body:*
{{githubToSlack context.payload.pull_request.body}}
{{/if}}
`;

const actionInputs = {
  workDir: core.getInput("workDir"),
  token: core.getInput("token"),
  signingSecret: core.getInput("secret"),
  channel: core.getInput("channel"),
  outputRawMessage: core.getInput("raw") === "true",
  dryRun: core.getInput("dry-run") === "true",
  dumpContext: core.getInput("dump") === "true",
  message: core.getInput("message"),
  evalStrings: core.getInput("evals") || "",
};
core.setSecret(actionInputs.channel);
core.setSecret(actionInputs.token);
core.setSecret(actionInputs.signingSecret);

main()
  .then(() => {})
  .catch((error) => {
    core.setFailed(error.message);
  });

// most @actions toolkit packages have async methods
async function main() {
  const templateData = {
    inputs: {
      channel: actionInputs.channel,
      raw: actionInputs.outputRawMessage,
      message: actionInputs.message,
    },
    context: github.context,
    env: process.env,
    evals: {},
    locals: {},
  };

  try {
    const pkgPath = path.join(actionInputs.workDir, "package.json");
    const repoPKG = require(pkgPath);
    templateData.locals.serviceName = repoPKG.name;
  } catch (e) {
    log.error(e.message);
  }

  const evals = parseEvalStrings(actionInputs.evalStrings);
  templateData.evals = await renderEvals({ evals, templateData });

  log.debug("Final message data");
  log.debug(JSON.stringify(templateData));

  let formattedMessage =
    actionInputs.message !== "" ? actionInputs.message : messageTemplate;
  if (actionInputs.outputRawMessage === false) {
    formattedMessage = renderMessage({
      messageTemplate: formattedMessage,
      templateData,
    });
  }

  log.debug("Message to send:");
  log.debug(formattedMessage);

  if (actionInputs.dumpContext === true) {
    log.info("--- DUMPED CONTEXT ---");
    log.info(JSON.stringify(templateData, null, 2));
  }

  if (actionInputs.dryRun === true) {
    log.info("--- DRY RUN ---");
    log.info(formattedMessage);
    log.info("--- NO SLACK MESSAGES SENT ---");
    return;
  }

  // actually perform slack notification via bolt
  const app = new App({
    token: actionInputs.token,
    signingSecret: actionInputs.signingSecret,
  });

  const result = await app.client.chat.postMessage({
    token: actionInputs.token,
    channel: actionInputs.channel,
    mrkdwn: true,
    text: formattedMessage,
  });

  log.debug("Slack result", result);
}
