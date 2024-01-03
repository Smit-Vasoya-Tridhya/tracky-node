const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const csv_dir = "src/public/csv";
    const img_dir = "src/public/uploads";
    if (!fs.existsSync(csv_dir)) {
      fs.mkdirSync(csv_dir, { recursive: true });
    }
    if (!fs.existsSync(img_dir)) {
      fs.mkdirSync(img_dir, { recursive: true });
    }

    if (file.mimetype.startsWith("text/csv")) {
      cb(null, csv_dir);
    }
    if (file.mimetype.startsWith("image/")) {
      cb(null, img_dir);
    }
  },

  filename: (req, file, cb) => {
    const extension = file.originalname.split(".").pop() || undefined;
    const fileName = Date.now() + "." + extension;
    req.fileName = fileName;
    cb(null, fileName);
  },
});

// Multer config
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 1, // 1MB
  },
  fileFilter: (req, file, cb) => {
    const imageExtensions = [".jpg", ".jpeg", ".jfif", ".png"];
    const csvExtensions = [".csv"];
    const fileExt = path.extname(file.originalname).toLowerCase();

    if (file.mimetype.startsWith("text/csv")) {
      if (!csvExtensions.includes(fileExt)) {
        const error = new Error("Only CSV files are allowed.");
        error.status = 400;
        error.code = "CSV_FILE_NOT_ALLOWED";
        return cb(error);
      }
    } else if (file.mimetype.startsWith("image/")) {
      if (!imageExtensions.includes(fileExt)) {
        const error = new Error(
          `Only ${imageExtensions.join(", ")} files are allowed.`
        );
        error.status = 400;
        error.code = "IMAGE_FILE_NOT_ALLOWED";
        return cb(error);
      }
    }

    cb(null, true);
  },
});

module.exports = { upload };
