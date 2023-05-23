import * as dotenv from "dotenv";
import * as http from "http";
import { Server, Socket } from "socket.io";
import User from "./models/User";

dotenv.config();
const port = process.env.PORT;
const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "https://messenger-clone-juliardactub.vercel.app"],
  },
});

type SocketWithUsername = Socket & {
  userID?: "";
  firstName?: "";
  lastName?: "";
  username?: "";
  avatar?: "";
};

io.use((socket: SocketWithUsername, next) => {
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

io.on("connection", async (socket: SocketWithUsername) => {
  await User.findOneAndUpdate({ username: socket.username }, { online: true, socketID: socket.id });
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

  socket.on("disconnect", async () => {
    await User.findOneAndUpdate({ username: socket.username }, { online: false });
    console.log(`⚡️[SocketIO]: ${socket.username} disconnected.`);
    io.emit("online");
  });
});

httpServer.listen(port, () => {
  console.log(`⚡️[SocketIO]: SocketIO is running at wss://localhost:${port}`);
});
