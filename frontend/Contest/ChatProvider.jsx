import React, { createContext, useContext, useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import loadingAnimation from "../src/animations/loading.json";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchAgain, setFetchAgain] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [notification, setNotification] = useState([]);
  const [lastNotification, setLastNotification] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingChatId, setTypingChatId] = useState(null);
  const [typingSenderName, setTypingSenderName] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);
    setLoading(false);
  }, [navigate, fetchAgain]);

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        fetchAgain,
        setFetchAgain,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        notification,
        setNotification,
        lastNotification,
        setLastNotification,
        isTyping,
        setIsTyping,
        typingChatId,
        setTypingChatId,
        typingSenderName,
        setTypingSenderName,
      }}
    >
      {loading ? (
        <Lottie
          animationData={loadingAnimation}
          loop
          autoplay
          style={{
            width: 100,
            height: 100,
            marginLeft: 750,
            marginTop: 300,
          }}
        />
      ) : (
        children
      )}
    </ChatContext.Provider>
  );
};

export const ChatState = () => useContext(ChatContext);

export const ProtectedRoute = () => {
  const { user } = ChatState();
  return user ? <Outlet /> : <Navigate to="/login" replace={true} />;
};
