import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { errorHandlerMiddleware } from "./middleware/errorMiddleware.js";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import path from "path";
import Notification from "./models/notificationModel.js";
import connectDatabase from "./database/database.js";
dotenv.config();
connectDatabase();

const app = express();
const __dirname = path.resolve();

app.use(express.json()); // to accept json data in the body
app.use(cookieParser());

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/notification", notificationRoutes);

app.use(errorHandlerMiddleware);

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

const PORT = process.env.PORT || 6000;

const server = app.listen(
  PORT,
  console.log(`Server is running on port ${PORT}`.yellow.bold)
);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://127.0.0.1:5173",
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room, user) => {
    socket.join(room);
    console.log(`userId "${user._id}" joined room: ${room}`);
  });

  socket.on("typing", (data) => {
    data.recipientId.forEach((id) => {
      io.to(id).emit("typing", data);
    });
  });

  socket.on("stop typing", (data) => {
    data.recipientId.forEach((id) => {
      io.to(id).emit("stop typing", data);
    });
  });

  socket.on("new message", async (newMessageReceived) => {
    var chat = newMessageReceived.chat;

    if (!chat.users) return console.log("Chat.users not defined");

    chat.users.forEach(async (user) => {
      const { _id, ...messageWithoutId } = newMessageReceived;
      var messageForEachUser = { ...messageWithoutId, receiver: user._id };

      if (user._id == messageForEachUser.sender._id) {
        messageForEachUser = {
          ...messageWithoutId,
          unread: false,
          receiver: user._id,
        };
      }

      await Notification.create(messageForEachUser);

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
