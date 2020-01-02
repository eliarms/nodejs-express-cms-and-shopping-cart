const mongoose = require("mongoose");

//Category Schema
var CategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  slug: {
    type: String,
    required: true,
    minlength: 3
  }
});

var Category = mongoose.model("Category", CategorySchema);

module.exports = { Category };
