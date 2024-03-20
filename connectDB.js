const mongoose = require("mongoose");

async function connect() {
  try {
    await mongoose.connect(
        process.env.DatabaseURI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        connectTimeoutMS : 120000,
      }
    );
    console.log("Connect database successfully");
  } catch (error) {
    console.log("Connect database failure");
  }
}

module.exports = { connect };
