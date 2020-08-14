const core = require("@actions/core");
const github = require("@actions/github");
const Handlebars = require("handlebars");
const { App } = require("@slack/bolt");
const exec = require("@actions/exec");
const hbh = require("./handlebars-helpers");
const parseEvalStrings = require("./lib/parse-eval-strings");

hbh(Handlebars);

const hbOptions = {
  data: false,
  noEscape: true,
};

// most @actions toolkit packages have async methods
async function run() {
  try {
    const token = core.getInput("token");
    const signingSecret = core.getInput("secret");
    const channel = core.getInput("channel");
    const outputRawMessage = core.getInput("raw") === "true";
    const dryRun = core.getInput("dry-run") === "true";
    const dumpContext = core.getInput("dump") === "true";
    const message = core.getInput("message");
    const evalStrings = core.getInput("evals") || "";
    const context = github.context;

    core.setSecret(channel);
    core.setSecret(token);
    core.setSecret(signingSecret);

    // turn our eval strings into actionable commands
    const evals = parseEvalStrings(evalStrings);

    const data = {
      inputs: {
        channel,
        raw: outputRawMessage,
        message,
      },
      context,
      env: process.env,
      evals: {},
    };

    for (const key of Object.keys(evals)) {
      // from https://github.com/actions/toolkit/tree/master/packages/exec
      const command = Handlebars.compile(evals[key], hbOptions)(data);
      const results = { out: "", err: "" };
      core.debug("Evaluating " + command);
      await exec.exec(command, [], {
        listeners: {
          stdout: (data) => {
            results.out += data.toString();
          },
          stderr: (data) => {
            results.err += data.toString();
          },
        },
      });

      core.debug("result");
      core.debug(JSON.stringify(results));

      if (results.err) {
        throw new Error(results.err);
      } else {
        data.evals[key] = results.out;
      }
    }

    core.debug("Final message data");
    core.debug(JSON.stringify(data));

    let formattedMessage = message;
    if (outputRawMessage === false) {
      core.debug("formatting message:");
      core.debug(message);
      formattedMessage = Handlebars.compile(message, hbOptions)(data);
    }

    core.debug("Message to send:");
    core.debug(formattedMessage);

    if (dumpContext === true) {
      console.log("--- DUMPED CONTEXT ---");
      console.log(JSON.stringify(data, null, 2));
    }

    if (dryRun === true) {
      console.log("--- DRY RUN ---");
      console.log(formattedMessage);
      console.log("--- NO SLACK MESSAGES SENT ---");
    } else {
      // actually perform slack notification via bolt
      const app = new App({
        token,
        signingSecret,
      });

      const result = await app.client.chat.postMessage({
        token,
        channel,
        text: formattedMessage,
      });

      core.debug("Slack result", result);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
