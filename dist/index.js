"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const dotenv = __importStar(require("dotenv"));
const https = __importStar(require("https"));
const fs = __importStar(require("fs"));
const socket_io_1 = require("socket.io");
const User_1 = __importDefault(require("./models/User"));
dotenv.config();
const port = process.env.PORT;
const httpsServer = https.createServer({
    key: fs.readFileSync("key.pem", "utf-8"),
    cert: fs.readFileSync("cert.pem", "utf-8"),
});
const io = new socket_io_1.Server(httpsServer, {
    cors: {
        origin: "*",
    },
});
io.use((socket, next) => {
    const { _id, firstName, lastName, username, avatar } = socket.handshake.auth;
    if (!username) {
        return next(new Error("invalid username"));
    }
    socket.userID = _id;
    socket.firstName = firstName;
    socket.lastName = lastName;
    socket.username = username;
    socket.avatar = avatar;
    next();
});
io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
    yield User_1.default.findOneAndUpdate({ username: socket.username }, { online: true, socketID: socket.id });
    io.emit("online");
    console.log(`⚡️[SocketIO]: ${socket.username} connected.`);
    socket.on("send", ({ message, to }) => {
        socket.to(to).emit("send", {
            message,
            fromSocketID: socket.id,
            fromUserName: socket.username,
            fromFirstName: socket.firstName,
            fromAvatar: socket.avatar,
        });
    });
    socket.on("typing", ({ to, message }) => {
        socket.to(to).emit("typing", {
            message,
            fromSocketID: socket.id,
            fromUserID: socket.userID,
            fromUserName: socket.username,
            fromFirstName: socket.firstName,
        });
    });
    socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
        yield User_1.default.findOneAndUpdate({ username: socket.username }, { online: false });
        console.log(`⚡️[SocketIO]: ${socket.username} disconnected.`);
        io.emit("online");
    }));
}));
httpsServer.listen(port, () => {
    console.log(`⚡️[SocketIO]: SocketIO is running at wss://localhost:${port}`);
});
