var express = require("express");
var router = express.Router();

router.get("/", (req, res) => {
  res.render("index", {
    title: "Welcome Home"
  });
});

//Exports route
module.exports = router;
