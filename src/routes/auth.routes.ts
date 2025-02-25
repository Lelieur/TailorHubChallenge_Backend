import { Router } from "express";
import {
  signupUser,
  loginUser,
  verifyUser,
} from "../controllers/auth.controllers";

import verifyToken from "../middlewares/verifyToken";

const router = Router();

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.get("/verify", verifyToken, verifyUser);

export default router;
