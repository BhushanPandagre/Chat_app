import React, { useEffect, useRef, useState } from "react";
import { ChatState } from "../../Contest/ChatProvider";
import { toast } from "react-toastify";
import moment from "moment";
import Tooltip from "../components/Tooltip";

const Profile = () => {
  const [img, setImg] = useState("");
  const { user, fetchAgain, setFetchAgain } = ChatState();
  const fileRef = useRef();

  const postPic = (pics) => {
    if (pics === undefined) return toast.warning("Please select an image!");

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "lzpuztnj");
      data.append("cloudName", "djvtl7yhj");
      fetch("https://api.cloudinary.com/v1_1/djvtl7yhj/image/upload", {
        method: "post",
        body: data,
      })
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
        const res = await fetch("/api/user/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ img }),
        });
        const data = await res.json();

        if (data.success === false) {
          toast.error(data.message);
          return;
        }
        localStorage.setItem("userInfo", JSON.stringify(data));
        setFetchAgain(!fetchAgain);
        toast.success("Profile picture updated");
        setImg("");
      };
      UploadImg();
    }
  }, [img]);

  return (
    <section className="profile_container">
      <div className="img_container">
        <Tooltip text={"Click to update profile image"}>
          <img
            src={user.pic}
            alt="avatar"
            onClick={() => fileRef.current.click()}
          />
        </Tooltip>
        <div className="overlay">
          <input
            type="file"
            ref={fileRef}
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => postPic(e.target.files[0])}
          />
        </div>
      </div>
      <div className="text_container">
        <h3>{user.username}</h3>
        <p>{user.email}</p>
        <hr />
        <small>
          Joined on: {moment(user.createdAt).format("DD/MM/YYYY HH:mm")}
        </small>
      </div>
    </section>
  );
};

export default Profile;
