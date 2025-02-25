import * as cloudinary from "cloudinary";

// Cargar variables de entorno
require("dotenv").config();

// Configurar Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Exportar la instancia configurada
export default cloudinary;
