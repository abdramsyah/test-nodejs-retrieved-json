const moment = require('moment');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const { avatarUpload, msgAllowedImg, msgFileSizeExceed } = require('./multer');
const { outputParser } = require('../utils/outputParser');
const constant = require('../config/constant');
const maxSize = 5 * 1024 * 1024; // 5MB tran  slated to bytes 5242880
const { Log } = require('../utils/customLog');

const gc = new Storage({
  // credentials: require('./../keys/' + process.env.GCS_KEYFILE),
  keyFilename: path.join('./keys', `${process.env.GCS_KEYFILE}`),
  projectId: process.env.GCP_PROJECT,
});

const gcbucket = gc.bucket(process.env.GCS_BUCKET);

const getPublicUrl = (filename) => {
  return `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${filename}`;
};

const uploadSingleImageStream = async (req, res, next) => {
  try {
    // await avatarUpload(req, res);

    // protect file not found (penting)
    if (!req.file) {
      return outputParser.error(req, res, 'Error uploading, image not found', null);
    }
  } catch (err) {
    return outputParser.error(req, res, err.message, null);
  }

  const unixTimestamp = moment().format('x');
  const fileName = `photo_profile_${unixTimestamp}${path.extname(req.file.originalname)}`;

  const file = gcbucket.file(fileName);
  const stream = file.createWriteStream();

  stream.on('error', (err) => {
    console.log('error upload to GCP storage', err);
    return res.status(500).json({
      status: false,
      message: 'Gagal mengunggah gambar',
    });
  });

  stream.on('finish', async () => {
    console.log('Done uploading to GCP storage...');
    let publicUrl = getPublicUrl(fileName);
    try {
      // Make the file public (tidak bisa make public, sementara dikomen dlu)
      // await gcbucket.file(req.file.originalname).makePublic();
      req.image = publicUrl;
      return next();
    } catch (err) {
      // return res.status(500).send({
      // message: `Uploaded the file successfully: ${fileName}, but public access is denied!`
      // url: publicUrl,
      // });
      return outputParser.error(req, res, err.message, null);
    }
  });

  stream.end(req.file.buffer);
};

// upload image tapi string base64
const base64MimeType = (strbase) => {
  let result = null;
  if (typeof strbase !== 'string') {
    return result;
  }

  let mime = strbase.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
  if (mime && mime.length) {
    result = mime[1];
  }
  return result;
};

const uploadGambarBase64 = async (req, res, next) => {
  /**
   * 1. kalau tidak ada param image = ga ngapa2in // req.image adalah kosong (default gambar)
   * 2. kalau ada param image isi base64 = insert // req.image adalah string
   * 3. kalau ada param image isi 0 (number) = delete // req.image adalah number
   *
   * Base64image adalah string yang di post melalui body *note
   */
  if (!req.body.image) {
    return next();
  }
  if (typeof req.body.image === 'number') {
    req.image = null;
    return next();
  }

  const stringBase64 = req.body.image;
  const buffer = Buffer.from(stringBase64.replace(/^data:\w+\/\w+;base64,/, ''), 'base64');
  const fileSizeInBytes = buffer.length;
  const fileSizeInKilobytes = fileSizeInBytes / 1024;

  // Sekarang Anda memiliki ukuran file dalam bytes dan kilobytes
  if (fileSizeInBytes > maxSize) {
    // return outputParser.error(req, res, msgFileSizeExceed, null); // 413 Payload Too Large
    return outputParser.PayloadTooLarge(req, res, 'File Maksimal 5MB', null); // 413 Payload Too Large
  }

  // const stringBase64 = req.body.image;
  const getToday = moment().format('x');
  // base64image only can filter extension here!!
  const extension = stringBase64.substring('data:image/'.length, stringBase64.indexOf(';base64'));
  if (!constant.ALLOWED_IMAGE.includes(extension)) {
    // return res.status(422).json({ status: false, message: msgAllowedImg });
    return outputParser.errorCustom(req, res, msgAllowedImg, 'null');
  }

  const fileName = `image_${getToday}.${extension}`;
  const fileOptions = {
    // public: true,
    resumable: false,
    metadata: { contentType: base64MimeType(req.body.image) },
  };

  try {
    const base64EncodedString = req.body.image.replace(/^data:\w+\/\w+;base64,/, '');
    const fileBuffer = Buffer.from(base64EncodedString, 'base64');
    const file = gcbucket.file(fileName);
    await file.save(fileBuffer, fileOptions);
    // await gcbucket.file(fileName).makePublic();
    req.image = getPublicUrl(fileName);
    return next();
  } catch (errs) {
    console.log('error stream base64: ', errs.message);
    req.image = null;
    // return next();
    // return outputParser.errorCustom(req, res, msgAllowedImg, 'TEST');
    return outputParser.error(req, res, errs.message, null);
  }
};

module.exports = {
  uploadSingleImageStream,
  uploadGambarBase64,
};
