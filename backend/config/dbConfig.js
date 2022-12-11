const mongoose = require("mongoose");

// Setup MongoDB database

const dbConnect = async () => {
  try {
    await mongoose.connect(
      process.env.DB_LOCAL_URI,
      console.log("mongoDB connected successfully")
    );
  } catch (error) {
    console.log(`DB err ${error.message}`);
  }
};

module.exports = dbConnect;
