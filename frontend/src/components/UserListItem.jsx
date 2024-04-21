import React from "react";

const UserListItem = ({ user, handleFunction }) => {
  return (
    <div onClick={handleFunction} className="userlistitem_wrapper">
      <img src={user.pic} alt="image" className="image" />
      <div className="userList_detail">
        <p className="username">{user?.username}</p>
        <p className="email">Email: {user?.email}</p>
      </div>
    </div>
  );
};

export default UserListItem;
