var WebSocketServer = require("ws").Server;
var cuid = require("cuid");

const TIMEOUT = 4 * 60000;

function getRandom() {
  return Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase();
}

function startSignalingServer(
  port,
  timeout = TIMEOUT,
  generateKey = getRandom
) {
  if (!port || !Number.isInteger(port)) {
    console.log("Port must be present and valid!");
  }

  // Start websocket server
  var server = new WebSocketServer({ port: port });

  var socketList = [];
  var socketLookup = [];

  var sockets = {};
  var hosts = {};
  var clients = {};

  const registerHost = hostInfo => {
    let code = generateKey();

    while (hosts[code]) {
      code = generateKey();
    }

    hosts[code] = hostInfo;

    setTimeout(() => {
      delete hosts[code];
    }, TIMEOUT);

    return code;
  };

  server.on("connection", function(socket) {
    const socketId = cuid();

    sockets[socketId] = socket;

    socketList.push(socket);
    socketLookup.push(socketId);

    socket.send(JSON.stringify({ clientName: socketId }));

    socket.on("close", function() {
      const index = socketList.indexOf(socket);
      const key = socketLookup.splice(index, 1);
      socketList.splice(index, 1);

      if (clients[key]) {
        delete client[key];
      }
    });

    socket.on("message", function(message) {
      const parsedMessage = JSON.parse(message);

      if (parsedMessage.type && parsedMessage.type === "HOST") {
        const code = registerHost(parsedMessage.socketName);
        this.send(JSON.stringify({ type: "HOST_KEY", accessCode: code }));
      }

      if (parsedMessage.type && parsedMessage.type === "CLIENT") {
        const code = parsedMessage.code;
        const hostInfo = hosts[code];

        // TODO: Ensure host is there
        this.send(
          JSON.stringify({ type: "HOST_CONNECTION_INFO", host: hostInfo })
        );
      }

      if (parsedMessage.action) {
        const { to, from, action, data } = parsedMessage;

        const hostSocket = sockets[to];

        if (!hostSocket) {
          return;
        }

        hostSocket.send(JSON.stringify({ type: action, data, from }));
      }
    });
  });
}

module.exports = startSignalingServer;
