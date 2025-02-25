import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import signature from "../controllers/cloudinary.controllers";
import cloudinary from "../config/cloudinary.config";

const router = Router();

const cloudName = cloudinary.v2.config().cloud_name;
const apiKey = cloudinary.v2.config().api_key;
const folderName = cloudinary.v2.config().folder_name;

router.get(
  "/signuploadform",
  (req: Request, res: Response, next: NextFunction) => {
    const sig = signature.signuploadform();
    res.json({
      signature: sig.signature,
      timestamp: sig.timestamp,
      cloudname: cloudName,
      folder: folderName,
      apikey: apiKey,
    });
  }
);

export default router;
