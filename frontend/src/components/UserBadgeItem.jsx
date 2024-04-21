import React from "react";
import { IoMdClose } from "react-icons/io";

const UserBadgeItem = ({ user, handleFunction }) => {
  return (
    <div onClick={handleFunction} className="userbadgeitem_wrapper">
      {user.username}
      <IoMdClose className="close-icon" />
    </div>
  );
};

export default UserBadgeItem;
