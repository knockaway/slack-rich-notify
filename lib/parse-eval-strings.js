"use strict";

module.exports = function parseEvalStrings(input = "") {
  const result = {};

  if (typeof input !== "string" || input === "") {
    return result;
  }

  for (const string of input.split(/\n+/g)) {
    const [varName, ...cmd] = string.split(/=/g);
    result[varName.trim()] = cmd.join("=").trim();
  }

  return result;
};
