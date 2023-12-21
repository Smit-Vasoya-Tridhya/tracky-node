const {
  createClient,
  clientList,
  getClientByID,
  deleteClientByID,
} = require("../controllers/pastClientController");
const { upload } = require("../helpers/multer");
const { protect } = require("../middlewares/authMiddleware");
const pastClientRoute = require("express").Router();
pastClientRoute.use(protect);
pastClientRoute.post("/add", upload.single("client_image"), createClient);
pastClientRoute.post("/list", clientList);
pastClientRoute.get("/fetch/:id", getClientByID);
pastClientRoute.put("/delete/:id", deleteClientByID);
module.exports = pastClientRoute;
