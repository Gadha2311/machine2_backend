import { login, signUp } from "../controller/authController";
import { Router } from "express";

const router = Router();

router.post("/signUp", signUp);
router.post("/login", login);

export default router;
