export const getSenderPic = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1].pic : users[0].pic;
};

export const getSenderName = (loggedUser, users) => {
  return users[0]._id === loggedUser._id
    ? users[1].username
    : users[0].username;
};

export const getSenderOnlineStatue = (loggedUser, users) => {
  return users[0]._id === loggedUser._id
    ? users[1].isOnline
    : users[0].isOnline;
};

export const getSenderEmail = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1].email : users[0].email;
};

export const getSenderId = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[0]._id : users[1]._id;
};

export const getOtherUsersId = (loggedUser, users) => {
  return users
    .filter((user) => user._id !== loggedUser._id)
    .map((user) => user._id);
};
