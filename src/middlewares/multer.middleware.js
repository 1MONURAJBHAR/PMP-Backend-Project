import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `./public/images`);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 1 * 1000 * 1000,
  },
});



/**storage
1. storage is the storage engine you define earlier.
It tells multer where and how to save the uploaded file.
Two common choices
DiskStorage → saves file to disk (e.g., /uploads folder).
MemoryStorage → keeps file in memory as buffer (useful for cloud upload like S3/Cloudinary)

2. This sets a maximum file size allowed per file.
1 * 1000 * 1000 = 1000000 bytes = 1 MB.
If a file is larger than this → multer throws an error:
MulterError: File too large

3. upload
Now upload is your configured multer instance.
You can use it as middleware in your routes.*/