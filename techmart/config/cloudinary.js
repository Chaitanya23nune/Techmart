const cloudinary = require("cloudinary").v2;
const multerStorageCloudinary = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new multerStorageCloudinary.CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "techmart_products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"]
  }
});

module.exports = {
  cloudinary,
  storage
};