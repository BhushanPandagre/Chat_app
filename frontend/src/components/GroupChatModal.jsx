import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import Tooltip from "./Tooltip";
import { toast } from "react-toastify";
import { ChatState } from "../../Contest/ChatProvider";
import UserListItem from "./UserListItem";
import UserBadgeItem from "./UserBadgeItem";
import Lottie from "lottie-react";
import spinnerAnimation from "../animations/spinner.json";

const GroupChatModal = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, chats, setChats } = ChatState();

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleSearch = async (query) => {
    if (!query) return;
    if (query) {
      setLoading(true);
      const res = await fetch(`/api/user?search=${query}`);
      const data = await res.json();

      if (data.success === false) {
        setLoading(false);
        toast.error("Error Occurred!", {
          position: "bottom-left",
        });
        return;
      }

      setSearchResult(data);
      setLoading(false);
    }
  };

  const handleGroup = (user) => {
    if (selectedUsers.includes(user)) {
      toast.warning("User already added", {
        position: "top",
      });
      return;
    }
    setSelectedUsers([...selectedUsers, user]);
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers.length) {
      toast.warning("Please fill all the fields", {
        position: "top",
      });
      return;
    }

    const res = await fetch("/api/chat/group", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({
        name: groupChatName,
        users: JSON.stringify(selectedUsers.map((u) => u._id)),
      }),
    });
    const data = await res.json();

    if (data.success === false) {
      toast.error("Failed to create the chat", {
        position: "bottom",
      });
      return;
    }

    setChats([data, ...chats]);
    toggleModal();
    toast.success("New group chat created!", {
      position: "bottom",
    });
  };

  return (
    <Tooltip text={"Click to start a group chat"}>
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
              <h2 className="modal-title">Create Group Chat</h2>
              <div className="modal-input">
                <input
                  type="text"
                  placeholder="Chat Name"
                  className="input-field"
                  onChange={(e) => setGroupChatName(e.target.value)}
                />
              </div>
              <div className="modal-input2">
                <input
                  type="text"
                  placeholder="Add Users eg: John, Frank, Jane"
                  className="input-field"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <div className="userbadgeitem_con">
                {selectedUsers?.map((u) => (
                  <UserBadgeItem
                    key={u._id}
                    user={u}
                    handleFunction={() => handleDelete(u)}
                  />
                ))}
              </div>

              <div className="userlistitem_con">
                {loading ? (
                  <Lottie
                    animationData={spinnerAnimation}
                    loop
                    autoplay
                    style={{
                      width: 50,
                      height: 50,
                      marginLeft: "50%",
                    }}
                  />
                ) : (
                  searchResult
                    ?.slice(0, 3)
                    .map((user) => (
                      <UserListItem
                        key={user._id}
                        user={user}
                        handleFunction={() => handleGroup(user)}
                      />
                    ))
                )}
              </div>
              <div className="modal-footer">
                <button onClick={handleSubmit} className="submit-button">
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Tooltip>
  );
};

export default GroupChatModal;
