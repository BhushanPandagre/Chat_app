import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { ChatState } from "../../Contest/ChatProvider";
import {
  getSenderEmail,
  getSenderName,
  getSenderPic,
} from "../config/ChatLogics";

const UserProfileModal = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user, selectedChat } = ChatState();

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div>
      <span onClick={toggleModal} className="open-modal-button">
        {children}
      </span>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-background"></div>
            <span className="modal-placeholder"></span>
            <div className="modal-box">
              <div className="button-wrapper">
                <IoMdClose className="close-button" onClick={toggleModal} />
              </div>
              <h2 className="modal-title">
                {!selectedChat.isGroupChat && (
                  <>{getSenderName(user, selectedChat.users)}</>
                )}
              </h2>

              <div className="img_container">
                <img
                  src={
                    !selectedChat.isGroupChat &&
                    getSenderPic(user, selectedChat.users)
                  }
                  alt="image"
                />
              </div>

              <div className="profile_email_con">
                {!selectedChat.isGroupChat && (
                  <>Email: {getSenderEmail(user, selectedChat.users)}</>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileModal;
