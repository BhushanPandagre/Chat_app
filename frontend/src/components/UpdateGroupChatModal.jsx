import React, { useEffect, useRef, useState } from "react";
import { ChatState } from "../../Contest/ChatProvider";
import UserBadgeItem from "./UserBadgeItem";
import UserListItem from "./UserListItem";
import { IoMdClose } from "react-icons/io";
import Tooltip from "./Tooltip";
import { toast } from "react-toastify";
import Lottie from "lottie-react";
import spinnerAnimation from "../animations/spinner.json";

const UpdateGroupChatModal = ({ children, fetchMessages }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState();
  const [renameLoading, setRenameLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const [img, setImg] = useState("");

  const { user, selectedChat, setSelectedChat, fetchAgain, setFetchAgain } =
    ChatState();

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const fileRef = useRef();

  const handleRename = async () => {
    if (!groupChatName)
      return toast.warning("Please fill the input", {
        position: "top",
      });

    if (selectedChat.groupAdmin._id !== user._id)
      return toast.error(
        `Only admin (${selectedChat.groupAdmin.username}) can rename the group!`
      );

    setRenameLoading(true);

    const config = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({
        chatId: selectedChat._id,
        chatName: groupChatName,
      }),
    };

    const res = await fetch("/api/chat/rename", config);
    const data = await res.json();

    if (data.success === false) {
      setRenameLoading(false);
      toast.error("Error renaming chat");
      return;
    }

    setSelectedChat(data);
    setFetchAgain(!fetchAgain);
    setRenameLoading(false);
    setGroupChatName("");
    toast.success("Group name updated successfully", {
      position: "top",
    });
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

  const handleAddUser = async (user1) => {
    if (selectedChat.users.includes(user1))
      return toast.error("User already in the group");

    if (selectedChat.groupAdmin._id !== user._id)
      return toast.error(
        `Only admin (${selectedChat.groupAdmin.username}) can add someone`
      );

    setLoading(true);

    const config = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({
        chatId: selectedChat._id,
        userId: user1._id,
      }),
    };

    const res = await fetch("/api/chat/groupadd", config);
    const data = await res.json();

    if (data.success === false) {
      setLoading(false);
      toast.error("Failed to add the user", {
        position: "bottom",
      });
      return;
    }

    setSelectedChat(data);
    setFetchAgain(!fetchAgain);
    setLoading(false);
  };

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id)
      return toast.error(
        `Only admin (${selectedChat.groupAdmin.username}) can remove someone!`
      );

    const confirm = window.confirm(
      `Are you sure you want to remove ${user1.username} from the group?`
    );

    if (!confirm) return;

    if (confirm) {
      setLoading(true);
      const config = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          chatId: selectedChat._id,
          userId: user1._id,
        }),
      };

      const res = await fetch("/api/chat/groupremove", config);
      const data = await res.json();

      if (data.success === false) {
        setLoading(false);
        toast.error("Failed to remove the user", {
          position: "bottom",
        });
        return;
      }

      user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    }
  };

  const postPic = (pics) => {
    if (pics === undefined) return toast.warning("Please select an image!");

    if (selectedChat.groupAdmin._id !== user._id)
      return toast.error(
        `Only admin (${selectedChat.groupAdmin.username}) can update the group image!`
      );

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chatting-app");
      data.append("cloud_name", "mern-chat-application");
      fetch(
        "https://api.cloudinary.com/v1_1/mern-chat-application/image/upload",
        {
          method: "post",
          body: data,
        }
      )
        .then((res) => res.json())
        .then((data) => {
          setImg(data.url.toString());
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      return toast.warning("Please select an image!");
    }
  };

  useEffect(() => {
    if (img) {
      const UploadImg = async () => {
        const config = {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            chatId: selectedChat._id,
            pic: img,
          }),
        };

        const res = await fetch("/api/chat/changepic", config);
        const data = await res.json();

        if (data.success === false)
          return toast.error("Failed to update image");

        setSelectedChat(data);
        setFetchAgain(!fetchAgain);
        setImg("");
        toast.success("Profile picture updated");
      };
      UploadImg();
    }
  }, [img]);

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
                {selectedChat.chatName.toUpperCase()}
              </h2>
              {/* image */}
              <div className="img_container">
                <Tooltip text={"Click to update image"}>
                  <img
                    src={selectedChat.pic}
                    alt="avatar"
                    onClick={() => fileRef.current.click()}
                  />
                </Tooltip>
                <div className="overlay">
                  <input
                    type="file"
                    ref={fileRef}
                    accept="image/*"
                    className="displayNone"
                    onChange={(e) => postPic(e.target.files[0])}
                  />
                </div>
              </div>

              <div className="modal-input">
                <input
                  type="text"
                  placeholder="Chat Name"
                  className="input-field"
                  onChange={(e) => setGroupChatName(e.target.value)}
                />
                <button
                  className="inside-button"
                  disabled={renameLoading}
                  onClick={handleRename}
                >
                  {renameLoading ? "Updating in ..." : "Update"}
                </button>
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
                {selectedChat.users?.map((u) => (
                  <UserBadgeItem
                    key={u._id}
                    user={u}
                    handleFunction={() => handleRemove(u)}
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
                        handleFunction={() => handleAddUser(user)}
                      />
                    ))
                )}
              </div>
              <div className="modal-footer">
                <button
                  onClick={() => handleRemove(user)}
                  className="submit-button"
                >
                  Leave Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateGroupChatModal;
