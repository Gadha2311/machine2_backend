"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authController_1 = require("../controller/authController");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post("/signUp", authController_1.signUp);
router.post("/login", authController_1.login);
exports.default = router;
