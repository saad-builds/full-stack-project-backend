// const mongoose = require("mongoose");

// mongoose.connect(
//     process.env.MONGODB_URI
// ).then(() => {
//      console.log("Db Connected");
// }).catch((err) => {
//      console.log("error Connecting", err)
// })

const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
  console.log("DB Connected");
};

module.exports = connectDB;

