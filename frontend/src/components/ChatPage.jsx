import React, { useEffect, useRef, useState } from "react";
import { ChatState } from "../../Contest/ChatProvider";
import {
  getOtherUsersId,
  getSenderName,
  getSenderOnlineStatue,
} from "../config/ChatLogics";
import { IoEye } from "react-icons/io5";
import MessageForm from "./MessageForm";
import UserProfileModal from "./UserProfileModal";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import Message from "./Message";
import { toast } from "react-toastify";
import io from "socket.io-client";
import Lottie from "lottie-react";
import typingAnimation from "../animations/typing.json";
import loadingAnimation from "../animations/loading.json";

const ENDPOINT = "https://mern-practice-1.onrender.com";
var socket, selectedChatCompare;

const ChatPage = () => {
  const [img, setImg] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const {
    user,
    selectedChat,
    setFetchAgain,
    fetchAgain,
    setNotification,
    setLastNotification,
    isTyping,
    setIsTyping,
    typingChatId,
    setTypingChatId,
    setTypingSenderName,
  } = ChatState();
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isTyping]);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", (data) => {
      if (data.recipientId.includes(user._id)) {
        setTypingChatId(data.chatId);
        setTypingSenderName(data.senderName);
        setIsTyping(true);
      }
    });

    socket.on("stop typing", (data) => {
      if (data.recipientId.includes(user._id)) {
        setTypingChatId(null);
        setTypingSenderName(null);
        setIsTyping(false);
      }
    });
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage && !img)
      return toast.warning("Invalid input!", {
        position: "top-left",
      });

    socket.emit("stop typing", {
      chatId: selectedChat._id,
      senderName: user.name,
      recipientId: getOtherUsersId(user, selectedChat?.users),
    });

    setLoading(true);
    setNewMessage("");
    setImg("");

    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        content: newMessage,
        pic: img,
        chatId: selectedChat._id,
      }),
    };

    const res = await fetch("/api/message", config);
    const data = await res.json();

    if (data.success === false) {
      setLoading(false);
      toast.error("Error sending message");
      return;
    }

    socket.emit("new message", data);
    setMessages((prevMessages) => [...prevMessages, data]);
    setLoading(false);
    setFetchAgain(!fetchAgain);
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", {
        chatId: selectedChat._id,
        senderName: user.username,
        recipientId: getOtherUsersId(user, selectedChat?.users),
      });
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;

    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", {
          chatId: selectedChat._id,
          senderName: user.name,
          recipientId: getOtherUsersId(user, selectedChat?.users),
        });
        setTyping(false);
      }
    }, timerLength);
  };

  const postDetails = (pics) => {
    setLoading(true);
    if (pics === undefined) return toast.warming("Please select an image!");

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
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else {
      toast.warning("Please select jpeg or png image");
      setLoading(false);
      return;
    }
  };

  const fetchMessages = async (e) => {
    if (!selectedChat) return;

    setMessageLoading(true);

    const config = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    const res = await fetch(`/api/message/${selectedChat._id}`, config);
    const data = await res.json();

    if (data.success === false) {
      setMessageLoading(false);
      toast.error("Error fetching messages");
      return;
    }

    setMessages(data);
    setMessageLoading(false);

    socket.emit("join chat", selectedChat._id, user);
  };

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message received", async (message) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare?._id !== message.chat?._id
      ) {
        // if (!notification.includes(newMessageReceived)) {
        //   setNotification([newMessageReceived, ...notification]);
        //   setFetchAgain(!fetchAgain);
        // }
        setFetchAgain((prevFetchAgain) => !prevFetchAgain);
      } else {
        const res = await fetch(`/api/notification/${message.chat?._id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        await res.json();
        setMessages((prevMessages) => [...prevMessages, message]);
        setFetchAgain((prevFetchAgain) => !prevFetchAgain);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchNotification = async () => {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const res = await fetch("/api/notification", config);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      setNotification(data.notifications);
      setLastNotification(data.lastNotification);
    };
    fetchNotification();
  }, [fetchAgain]);

  return (
    <div className="messages_container">
      {selectedChat ? (
        <>
          <div className="messages_user">
            <h3>
              {!selectedChat.isGroupChat ? (
                <div>
                  {user &&
                    selectedChat.users &&
                    getSenderName(user, selectedChat.users).toUpperCase()}
                </div>
              ) : (
                <div>{selectedChat.chatName.toUpperCase()}</div>
              )}
            </h3>
            {!selectedChat.isGroupChat ? (
              <div>
                <UserProfileModal>
                  <IoEye className="user_wrapper" />
                </UserProfileModal>
                <div
                  className={`user_status2 ${
                    !selectedChat.isGroupChat &&
                    user &&
                    selectedChat.users &&
                    (getSenderOnlineStatue(user, selectedChat.users)
                      ? "online"
                      : "offline")
                  }`}
                ></div>
              </div>
            ) : (
              <UpdateGroupChatModal fetchMessages={fetchMessages}>
                <IoEye />
              </UpdateGroupChatModal>
            )}
          </div>

          <div className="messages">
            {messageLoading ? (
              <Lottie
                animationData={loadingAnimation}
                loop
                autoplay
                className="lottie"
              />
            ) : (
              messages?.map((m) => (
                <Message
                  key={m._id}
                  m={m}
                  user={user}
                  selectedChat={selectedChat}
                />
              ))
            )}
            {isTyping && typingChatId === selectedChat._id && (
              <div className="typingAnimation">
                <Lottie
                  animationData={typingAnimation}
                  loop
                  autoplay
                  style={{
                    width: 50,
                    height: 50,
                    marginBottom: 15,
                    marginLeft: 0,
                  }}
                />
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <MessageForm
            sendMessage={sendMessage}
            typingHandler={typingHandler}
            newMessage={newMessage}
            postDetails={postDetails}
            loading={loading}
          />
        </>
      ) : (
        <h3 className="no_conv">
          Select a user or group to start conversation
        </h3>
      )}
    </div>
  );
};

export default ChatPage;
