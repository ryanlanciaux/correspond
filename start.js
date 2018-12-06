var shell = require("shelljs");

shell.exec("node packages/example-server/index.js", { async: true });
shell.exec("cd packages/example-client && npm start", { async: true });

console.log("Started both apps");
