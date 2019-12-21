const mongoose = require("mongoose");

//Page Schema
var PageSchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true
  },
  sorting: {
    type: Number
  }
});

//function to find paged based on slug
PageSchema.statics.findSlug = function(slug) {
  var Page = this;
  //find pages from slug
  return Page.findOne({ slug }).then(page => {
    if (!page) {
      return Promise.reject();
    }
    return User.findOne({
      slug: slug
    });
  });
};

var Page = mongoose.model("Page", PageSchema);

module.exports = { Page };
