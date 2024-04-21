import React from "react";
import { BsUpload } from "react-icons/bs";

const MessageForm = ({
  sendMessage,
  newMessage,
  typingHandler,
  postDetails,
  loading,
}) => {
  return (
    <form className="message_form" onSubmit={sendMessage}>
      <label htmlFor="img">
        <BsUpload className="upload-icon" />
      </label>
      <input
        type="file"
        id="img"
        accept="image/*"
        className="displayNone"
        onChange={(e) => postDetails(e.target.files[0])}
      />
      <div>
        <input
          type="text"
          placeholder="Enter a message"
          onChange={typingHandler}
          value={newMessage}
        />
      </div>
      <div>
        <button className="btn" disabled={loading}>
          Send
        </button>
      </div>
    </form>
  );
};

export default MessageForm;
