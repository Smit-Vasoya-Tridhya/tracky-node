// const storage = multer.memoryStorage()
// const upload = multer({ storage: storage })
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.memoryStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.includes("csv")) {
      // Use memoryStorage for CSV files
      return cb(null, null);
    }

    let dir;
    if (file.mimetype.includes("image")) {
      dir = "public/images";
    } else {
      // Handle other file types or throw an error
      return cb(new Error("Unsupported file type"));
    }

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const fileName = Date.now() + "-" + file.originalname;
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
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".csv"];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      const error = new Error(
        `Only ${allowedExtensions.toString()} files are allowed.`
      );
      error.status = 400;
      error.code = "FILE_FORMAT_NOT_MATCH";
      return cb(error);
    }

    cb(null, true);
  },
});

module.exports = { upload };
