"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signUp = void 0;
const express_validator_1 = require("express-validator");
const userModel_1 = require("../models/userModel");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.signUp = [
    (0, express_validator_1.body)("username").notEmpty().withMessage("username is required"),
    (0, express_validator_1.body)("email").isEmail().withMessage("valid email is required"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("password must be at least 6 chars long"),
    (0, express_validator_1.body)("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Passwords do not match");
        }
        return true;
    }),
    (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            console.log("Request Body:", req.body);
            const existingEmailUser = yield userModel_1.UserModel.findOne({
                email: req.body.email,
            });
            if (existingEmailUser) {
                return res
                    .status(400)
                    .json({ message: "Email already exists" });
            }
            const hashedPassword = yield bcryptjs_1.default.hash(req.body.password, 12);
            const newUser = yield userModel_1.UserModel.create(Object.assign(Object.assign({}, req.body), { username: req.body.username, email: req.body.email, password: hashedPassword }));
            res.status(201).json({
                Stats: "status",
                message: "user registered successfully",
            });
        }
        catch (error) {
            next(error);
            console.log(error);
        }
    }),
];
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }
        const user = yield userModel_1.UserModel.findOne({ email });
        if (!user) {
            return res
                .status(400)
                .json({ message: "User not found" });
        }
        const ispasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!ispasswordValid) {
            return res
                .status(400)
                .json({ message: "Password is incorrect" });
        }
        const tocken = jsonwebtoken_1.default.sign({ id: user._id }, "secretkey123", {
            expiresIn: "90d",
        });
        res.status(200).json({
            tocken: tocken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
// export const shortURL= async()=>{
// }
