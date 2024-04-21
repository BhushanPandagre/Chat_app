import mongoose from "mongoose";

const connectDatabase = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("Sucessfully connected  to database");
    })
    .catch((err) => {
      console.log(`Error in connecting ${err}`);
    });
};

export default connectDatabase;
