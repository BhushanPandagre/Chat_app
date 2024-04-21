import { errorHandler } from "../middleware/errorMiddleware.js";
import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";

const accessChat = async (req, res, next) => {
  const { userId } = req.body;

  if (!userId)
    return next(errorHandler(400, "UserId param not sent with request"));

  try {
    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "username pic email",
    });

    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);

      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users"
      );

      res.status(200).send(FullChat);
    }
  } catch (error) {
    next(error);
  }
};

const fetchChats = async (req, res, next) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users")
      .populate("groupAdmin")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "username pic email",
        });

        res.status(200).send(results);
      });
  } catch (error) {
    next(error);
  }
};

const createGroupChat = async (req, res, next) => {
  if (!req.body.users || !req.body.name)
    return res.status(400).send({ message: "Please fill all the field" });

  var users = JSON.parse(req.body.users);

  users.push(req.user);

  if (users.length < 2)
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      isGroupChat: true,
      users,
      groupAdmin: req.user,
      pic: "https://alppetro.co.id/dist/assets/images/default.jpg",
    });

    const fullGroupChat = await Chat.findOne({
      _id: groupChat._id,
    })
      .populate("users")
      .populate("groupAdmin");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    next(error);
  }
};

const renameGroup = async (req, res, next) => {
  const { chatId, chatName } = req.body;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName,
      },
      {
        new: true,
      }
    )
      .populate("users")
      .populate("groupAdmin");

    if (!updatedChat) {
      next(errorHandler(404, "Chat Not Found"));
    } else {
      res.json(updatedChat);
    }
  } catch (error) {
    next(error);
  }
};

const addToGroup = async (req, res, next) => {
  const { chatId, userId } = req.body;

  try {
    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      { new: true }
    )
      .populate("users")
      .populate("groupAdmin");

    if (!added) {
      next(errorHandler(404, "Chat Not Found"));
    } else {
      res.json(added);
    }
  } catch (error) {
    next(error);
  }
};

const removeFromGroup = async (req, res, next) => {
  const { chatId, userId } = req.body;

  try {
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      { new: true }
    )
      .populate("users")
      .populate("groupAdmin");

    if (!removed) {
      next(errorHandler(404, "Chat Not Found"));
    } else {
      res.json(removed);
    }
  } catch (error) {
    next(error);
  }
};

const changeGroupPic = async (req, res, next) => {
  const { chatId, pic } = req.body;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        pic,
      },
      {
        new: true,
      }
    )
      .populate("users")
      .populate("groupAdmin");

    if (!updatedChat) {
      next(errorHandler(404, "Chat Not Found"));
    } else {
      res.json(updatedChat);
    }
  } catch (error) {
    next(error);
  }
};

export {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
  changeGroupPic,
};
