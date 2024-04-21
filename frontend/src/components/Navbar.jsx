import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChatState } from "../../Contest/ChatProvider";
import { toast } from "react-toastify";
import GroupChatModal from "./GroupChatModal";
import { FaBell } from "react-icons/fa";
import { TiMessages, TiMessage } from "react-icons/ti";
import moment from "moment";
import { getSenderName } from "../config/ChatLogics";

const Navbar = () => {
  const [openNotification, setOpenNotification] = useState(false);
  const { user, notification, setSelectedChat, fetchAgain, setFetchAgain } =
    ChatState();
  const navigate = useNavigate();

  const logout = async () => {
    await fetch("/api/user/logout");
    localStorage.removeItem("userInfo");
    navigate("/login", { replace: true });
    toast.success("Logout successful");
  };

  const updateSelectedChat = async (notif) => {
    const res = await fetch(`/api/notification/${notif.chat._id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    await res.json();

    setFetchAgain(!fetchAgain);
  };

  return (
    <nav>
      <div>
        {user ? (
          <div className="groupchat_con">
            <h3>
              <Link to="/">Chat</Link>
            </h3>
            <GroupChatModal>
              <h3>New Group</h3>
            </GroupChatModal>
          </div>
        ) : (
          <h3> Bhushan Pandagre </h3>
        )}
      </div>
      <div>
        {user ? (
          <div className="flexContainer">
            <div className="notification-wrapper">
              {openNotification && (
                <>
                  <div
                    className="backdrop"
                    onClick={() => setOpenNotification(false)}
                  ></div>
                  <div className="notification-card">
                    {!notification.length && "No New Messages"}
                    {notification?.map((notif) => (
                      <div
                        style={{ cursor: "pointer" }}
                        key={notif._id}
                        onClick={() => {
                          setSelectedChat(notif.chat);
                          updateSelectedChat(notif);
                          setOpenNotification(false);
                        }}
                      >
                        {notif.chat.isGroupChat ? (
                          <div className="message-card">
                            <div className="message-icon">
                              <TiMessages />
                            </div>
                            <div>
                              <div className="sender-name">
                                {notif.chat.chatName}
                              </div>
                              <div className="notif-wrapper">
                                <small className="notif-message">
                                  {notif.content || (notif.pic && "photo")}
                                </small>
                                <small className="notif-date">
                                  {moment(notif.createdAt).fromNow()}
                                </small>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="message-card">
                            <div className="message-icon">
                              <TiMessage />
                            </div>
                            <div>
                              <div className="sender-name">
                                {getSenderName(user, notif.chat.users)}
                              </div>
                              <div className="notif-wrapper">
                                <small className="notif-message">
                                  {notif.content || (notif.pic && "photo")}
                                </small>
                                <small className="notif-date">
                                  {moment(notif.createdAt).fromNow()}
                                </small>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
              <FaBell
                className="notification-icon"
                onClick={() => {
                  setOpenNotification((prevState) => !prevState);
                  setFetchAgain(!fetchAgain);
                }}
              />
              {notification?.length > 0 && (
                <span
                  className="notification-badge"
                  onClick={() => setOpenNotification((prevState) => !prevState)}
                >
                  {notification.length}
                </span>
              )}
            </div>
            <Link to="/profile">Profile</Link>
            <button className="btn" onClick={logout}>
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
