import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  _id: String,
  username: String,
  email: String,
  pic: String,
});

const ChatSchema = new mongoose.Schema({
  _id: String,
  chatName: String,
  isGroupChat: Boolean,
  users: [UserSchema],
  createdAt: Date,
  latestMessage: {
    _id: {
      type: String,
    },
  },
  updatedAt: Date,
});

const MessageSchema = new mongoose.Schema({
  chat: ChatSchema,
  content: String,
  createdAt: Date,
  pic: String,
  sender: UserSchema,
  unread: { type: Boolean, default: true },
  updatedAt: Date,
  receiver: String,
});

const Notification = mongoose.model("Notification", MessageSchema);

export default Notification;
