"use strict";

const core = require("@actions/core");
const logger = {
  debug(...args) {
    core.debug.apply(core, args);
  },
  error(...args) {
    core.error.apply(core, args);
  },
  info(...args) {
    core.info.apply(core, args);
  },
};

module.exports = logger;
