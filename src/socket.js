let io;
const { Server } = require("socket.io");
const logger = require("./logger");

exports.socket_connection = (http_server) => {
  io = new Server(http_server);

  io.on("connection", (socket) => {
    logger.info(`Socket connected ${socket.id}`);
    socket.on("disconnect", () => {
      logger.info(`Socket ${socket.id} has disconnected.`);
    });

    socket.on("ROOM", (obj) => {
      logger.info(obj, 15);
      socket.join(obj.id);
    });
  });
};

exports.eventEmitter = (event_name, payload, userId) => {
  try {
    io.to(userId).emit(event_name, payload);
  } catch (error) {
    logger.info("Error while emitting socket error", error);
  }
};
