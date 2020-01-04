const mongoose = require("mongoose");

//Product Schema
var ProductSchema = new mongoose.Schema({
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
  },
  desc: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number
  },
  image: {
    type: String
  }
});

var Product = mongoose.model("Product", ProductSchema);

module.exports = { Product };
