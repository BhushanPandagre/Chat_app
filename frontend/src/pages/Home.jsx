import ChatPage from "../components/ChatPage";
import UsersPage from "../components/UsersPage";

const Home = () => {
  return (
    <div className="home_container">
      <UsersPage />
      <ChatPage />
    </div>
  );
};

export default Home;
