var mongoose = require("mongoose");
//initate the connection string
mongoose.Promise = global.Promise;
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/NodeShopping",
  { useNewUrlParser: true }
);

module.exports = { mongoose };
