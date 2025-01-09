const multer = require('multer');
const path = require('path');
const constant = require('../config/constant');
const maxSize = 5 * 1024 * 1024; // 5MB translated to bytes 5242880

const msgAllowedImg = `Only images are allowed (${constant.ALLOWED_IMAGE.join(',')})`;
const msgFileSizeExceed = `File size exceeds the allowed limit of ${maxSize} bytes`;

let processFile = multer({
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, callback) {
    const ext = path.extname(file.originalname);
    if (!constant.ALLOWED_IMAGE.includes(ext.replace('.', ''))) {
      return callback(new Error(msgAllowedImg), false);
    }
    return callback(null, true);
  },
  limits: {
    fileSize: maxSize,
  },
});

const singlePhoto = processFile.single('photo');

const avatarUpload = async (req, res) => {
  return new Promise((resolve, reject) => {
    singlePhoto(req, res, (err) => {
      if (err) {
        if (err.message === 'File too large') {
          return reject(new Error(msgFileSizeExceed));
        }
        return reject(err);
      }
      resolve();
    });
  });
};

module.exports = {
  avatarUpload,
  msgAllowedImg,
  msgFileSizeExceed,
};
