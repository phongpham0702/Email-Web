const multer = require("multer");
const fs = require("fs");
const home = __dirname.replace("middlewares","") + "uploads";

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
      let userUID = req.user.UID;
      let userUploadPath = home + `/${userUID}`
      
      if(!fs.existsSync(userUploadPath))
      {
        fs.mkdirSync(userUploadPath, {recursive: true})
      }
      callback(null, userUploadPath)
    },
    filename: function (req, file, callback) {
      let acceptMimeType = ["image/png", "image/jpeg","image/jpg","image/tiff"]
      
      if(acceptMimeType.indexOf(file.mimetype) === -1)
      {
        let errorContent = "This file type is not supported."
        callback(errorContent, null)
      }
      let filename = "avatar.png"
      callback(null, filename)
    }
  });


  const uploadAvatar = multer({ storage: diskStorage,overwrite: true, limits:{fileSize: 3*1024*1024}}).single("userAvatar");

  module.exports = uploadAvatar