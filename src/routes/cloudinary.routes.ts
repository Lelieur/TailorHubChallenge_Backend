import { Router } from "express";
import signature from "../controllers/cloudinary.controllers";
import cloudinary from "../config/cloudinary.config";

const router = Router();

const cloudName = cloudinary.v2.config().cloud_name;
const apiKey = cloudinary.v2.config().api_key;

// using this API should require authentication
router.get("/signuploadform", (req, res, next) => {
  const sig = signature.signuploadform();
  res.json({
    signature: sig.signature,
    timestamp: sig.timestamp,
    cloudname: cloudName,
    apikey: apiKey,
  });
});

export default router;
