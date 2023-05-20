"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
mongoose_1.default.connect(process.env.DB_URI ? process.env.DB_URI : "");
const schema = new mongoose_1.default.Schema({
    username: { type: String, unique: true, required: true, dropDups: true },
    password: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    online: { type: Boolean },
    avatar: { type: String },
    socketID: { type: String },
});
exports.default = mongoose_1.default.models.users || mongoose_1.default.model("users", schema);
