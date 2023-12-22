const {
  createClient,
  clientList,
  getClientByID,
  deleteClientByID,
  editClient,
} = require("../controllers/pastClientController");
const { upload } = require("../helpers/multer");
const { protect } = require("../middlewares/authMiddleware");
const pastClientRoute = require("express").Router();
pastClientRoute.use(protect);
pastClientRoute.post("/add", upload.single("client_image"), createClient);
pastClientRoute.post("/list", clientList);
pastClientRoute.get("/fetch/:id", getClientByID);
pastClientRoute.delete("/delete/:id", deleteClientByID);
pastClientRoute.put("/edit/:id", upload.single("client_image"), editClient);
module.exports = pastClientRoute;
