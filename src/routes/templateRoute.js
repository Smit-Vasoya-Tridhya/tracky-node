const {
  createTemplate,
  updateTemplate,
  templateList,
  templateListById,
} = require("../controllers/templateController");
const { protect } = require("../middlewares/authMiddleware");
const templateRoute = require("express").Router();
templateRoute.use(protect);
templateRoute.post("/add", createTemplate);
templateRoute.post("/list", templateList);
templateRoute.post("/listById/:id", templateListById);
templateRoute.put("/update/:id", updateTemplate);
module.exports = templateRoute;
