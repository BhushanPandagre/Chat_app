import React, { useEffect, useRef } from "react";
import moment from "moment";

const Message = ({ m, user }) => {
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [m]);

  return (
    <div
      className={`message_wrapper ${m.sender._id === user._id && "own"}`}
      ref={scrollRef}
    >
      <h5 className={m.sender._id === user._id ? "me" : "friend"}>
        <div className="chat_name">
          {m.sender._id === user._id ? "me:" : m.sender.username}
        </div>
        <br />
        {m.pic && <img src={m.pic} alt={m.content} />}
        {m.content}
        <br />
        <small>{moment(m.createdAt).fromNow()}</small>
      </h5>
    </div>
  );
};

export default Message;
