import React from "react";
import { ChatState } from "../../Contest/ChatProvider";

const User = ({ user, accessSelectedChat }) => {
  const { selectedChat } = ChatState();
  return (
    <>
      <div className="user_wrapper">
        <div
          className={`user_info ${selectedChat && "usersDisplayNone"}`}
          onClick={() => accessSelectedChat(user._id)}
        >
          <div className="user_detail">
            <img src={user.pic} alt="image" className="avatar" />
            <div className="user_detail_2">
              <h4 className="truncate2">{user.username}</h4>
              <h5 className="truncate2"> Email: {user.email}</h5>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default User;
