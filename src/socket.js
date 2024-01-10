let io;
const { Server } = require("socket.io");
const logger = require("./logger");

exports.socket_connection = (http_server) => {
  io = new Server(http_server, {
    cors: {
      origin: [
        "http://172.16.1.49:3000",
        "http://172.16.1.49",
        "http://137.184.19.129",
        "http://137.184.19.129:4014",
        "http://localhost:3000",
        "http://localhost",
        "http://192.168.97.212:3000",
        "http://104.248.10.11:4014",
      ],
    },
  });

  io.on("connection", (socket) => {
    logger.info(`Socket connected ${socket.id}`);
    socket.on("disconnect", () => {
      logger.info(`Socket ${socket.id} has disconnected.`);
    });

    socket.on("ROOM", (obj) => {
      logger.info(obj.id, 15);
      socket.join(obj.id);
    });

    socket.on("CONFIRMATION", (payload) => {
      logger.info(`Event Confirmation : ${payload}`);
    });
  });
};

exports.eventEmitter = (event_name, payload, user_id) => {
  try {
    console.log("Inside", event_name, payload, user_id);
    io.to(user_id.toString()).emit(event_name, payload);
  } catch (error) {
    logger.info("Error while emitting socket error", error);
  }
};
