import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [file, setFile] = useState({
    email: "",
    password: "",
    error: null,
    loading: false,
  });
  const { email, password, error, loading } = file;

  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFile({ ...file, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFile({ ...file, loading: true });

    if (!email || !password) {
      setFile({ ...file, loading: false, error: "All fields are required" });
      toast.warning("All fields are required");
      return;
    }

    const res = await fetch("/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (data.success === false) {
      setFile({
        ...file,
        error: data.message,
        loading: false,
      });
      toast.error(data.message);
      return;
    }
    setFile({
      username: "",
      email: "",
      password: "",
      error: null,
      loading: false,
    });
    localStorage.setItem("userInfo", JSON.stringify(data));
    toast.success("Logging successful");
    navigate("/", { replace: true });
  };

  return (
    <div className="background_container_login">
      <section>
        <h3>Log into your account</h3>
        <form className="form" onSubmit={handleSubmit}>
          <div className="input_container">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
            />
          </div>
          <div className="input_container">
            <label>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={handleChange}
            />
            {showPassword ? (
              <AiFillEyeInvisible
                className="show_password"
                onClick={() => setShowPassword((prevState) => !prevState)}
              />
            ) : (
              <AiFillEye
                className="show_password"
                onClick={() => setShowPassword((prevState) => !prevState)}
              />
            )}
          </div>
          {error && <p className="error">{error}</p>}
          <div className="btn_container">
            <button className="btn" disabled={loading} onClick={handleSubmit}>
              {loading ? "Logging in ..." : "Login"}
            </button>
          </div>
          <div className="btn_container">
            {/* <button
              className="btn"
              disabled={loading}
              onClick={() => {
                setFile({
                  ...file,
                  email: "guestuser@gmail.com",
                  password: "123456",
                });
              }}
            >
              <>Guest User</>
            </button> */}
          </div>
        </form>
      </section>
    </div>
  );
};

export default Login;
