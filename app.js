var express = require("express");
var path = require("path");
const Joi = require("joi");
var mongoose = require("mongoose");
var pages = require("./routes/pages");
var adminPages = require("./routes/admin_pages");
var adminCategories = require("./routes/admin_categories");
var adminProducts = require("./routes/admin_products");
var bodyParser = require("body-parser");
var session = require("express-session");
var expressValidator = require("express-validator");
var fileUpload = require("express-fileupload");
var { mongoose } = require("./config/database");

// Init app
var app = express();

//view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//set public folder
app.use(express.static(path.join(__dirname, "public")));
//set global error variable
app.locals.errors = null;

//Express fileUpload middleware
app.use(fileUpload());
//body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//Express session middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true
    //cookie: { secure: true }
  })
);

//Express Validator midlleware
app.use(
  expressValidator({
    errorFormatter: function (param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    },
    customValidators: {
      isImage: function (value, filename) {
        var extension = (path.extname(filename)).toLowerCase();
        switch (extension) {
          case '.jpg':
            return '.jpg';
          case '.jpeg':
            return '.jpeg';
          case '.png':
            return '.png';
          case '':
            return '.jpg';
          default:
            return false;
        }
      }
    }
  })
);

// Epress messages
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

app.use("/", pages);
app.use("/admin/pages", adminPages);
app.use("/admin/categories", adminCategories);
app.use("/admin/products", adminProducts);
//start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("server is up on port 3000");
});
