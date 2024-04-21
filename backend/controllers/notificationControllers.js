import Notification from "../models/notificationModel.js";

const allNotification = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      receiver: req.user.id,
      unread: true,
    })
      .sort({ updatedAt: -1 })
      .lean();

    const lastNotification = await Notification.aggregate([
      {
        $match: {
          receiver: req.user.id,
        },
      },
      { $sort: { updatedAt: -1 } },
      { $group: { _id: "$chat._id", doc: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$doc" } },
    ]);
    res.json({ notifications, lastNotification });
  } catch (error) {
    next(error);
  }
};

const updateNotification = async (req, res, next) => {
  try {
    const notification = await Notification.updateMany(
      {
        "chat._id": req.params.id,
        receiver: req.user.id,
      },
      { unread: false },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    next(error);
  }
};

export { allNotification, updateNotification };
