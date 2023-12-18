const engMessage = require("../messages/en.json");

export const returnMessage = (msg, language = "en") => {
  return engMessage[msg];
};
