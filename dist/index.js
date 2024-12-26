"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes/routes"));
const postRoute_1 = __importDefault(require("./routes/postRoute"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const Port = process.env.PORT;
console.log(Port);
const DB_URL = process.env.DBURL;
console.log(DB_URL);
app.use((0, cors_1.default)({ origin: process.env.FRONTENDURL }));
app.use(express_1.default.json());
app.use("/api/auth", routes_1.default);
app.use("/api/auth", postRoute_1.default);
mongoose_1.default
    .connect(DB_URL)
    .then(() => console.log("connected to mongoDB"))
    .catch((error) => console.error("failed to connect to mongoDb", error));
app.listen(Port, () => {
    console.log(`server is running in ${Port}`);
});
exports.default = app;
