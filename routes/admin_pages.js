var express = require("express");
var router = express.Router();
//var Page = require("../models/page");
var { Page } = require("../models/page");
/*
 * GET pages index
 */
router.get("/", (req, res) => {
  Page.find({})
    .sort({ sorting: 1 })
    .exec(function(err, pages) {
      res.render("admin/pages", {
        title: "Welcome Admin",
        pages: pages
      });
    });
});

/*
 * GET add page
 */

router.get("/add-page", (req, res) => {
  var title = "";
  var slug = "";
  var content = "";
  res.render("admin/add_page", {
    title: title,
    slug: slug,
    content: content
  });
});

/*
 * GET post page
 */

router.post("/add-page", (req, res) => {
  req.checkBody("title", "Title must have a value").notEmpty();
  req.checkBody("content", "Content must have a value").notEmpty();
  var title = req.body.title;
  var content = req.body.content;
  var slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
  if (slug == "") slug = title.replace(/\s+/g, "-").toLowerCase();

  var errors = req.validationErrors();
  if (errors) {
    //console.log("errors");
    res.render("admin/add_page", {
      errors: errors,
      title: title,
      slug: slug,
      content: content
    });
  } else {
    Page.findOne({ slug: slug }, function(err, page) {
      if (page) {
        req.flash("danger", "Page slug exists, choose another");
        res.render("admin/add_page", {
          title: title,
          slug: slug,
          content: content
        });
      } else {
        var page = new Page({
          title: title,
          slug: slug,
          content: content,
          sorting: 100
        });
        page.save(function(err) {
          if (err) return console.log(err);
          req.flash("success", "Page added!");
          res.redirect("/admin/pages");
        });
      }
    });
  }
});

/*
 * POST Edit page
 */

router.post("/edit-page/:id", (req, res) => {
  req.checkBody("title", "Title must have a value").notEmpty();
  req.checkBody("content", "Content must have a value").notEmpty();
  var title = req.body.title;
  var content = req.body.content;
  var id = req.params.id;
  var slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
  if (slug == "") slug = title.replace(/\s+/g, "-").toLowerCase();

  var errors = req.validationErrors();
  if (errors) {
    //console.log("errors");
    res.render("admin/edit_page", {
      errors: errors,
      title: title,
      slug: slug,
      content: content,
      id: id
    });
  } else {
    Page.findOne({ slug: slug, _id: { $ne: id } }, function(err, page) {
      if (page) {
        req.flash("danger", "Page slug exists, choose another");
        res.render("admin/edit_page", {
          title: title,
          slug: slug,
          content: content,
          id: id
        });
      } else {
        Page.findById(id, function(err, page) {
          if (err) return console.log(err);

          (page.title = title),
            (page.slug = slug),
            (page.content = content),
            page.save(function(err) {
              if (err) return console.log(err);
              req.flash("success", "Page edited!");
              res.redirect("/admin/pages/edit-page/" + id);
            });
        });
      }
    });
  }
});

/*
 * post reorder pages
 */
//grab the id of the page and assign the count value to the sorting field
router.post("/reorder-pages", (req, res) => {
  var ids = req.body["id[]"];
  var count = 0;
  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    count++;
    (function(count) {
      Page.findById(id, function(err, page) {
        page.sorting = count;
        page.save(function(err) {
          if (err) return console.log(err);
        });
      });
    })(count);
  }
});
//GET edit page

router.get("/edit-page/:id", (req, res) => {
  Page.findById(req.params.id, function(err, page) {
    if (err) return console.log(err);

    res.render("admin/edit_page", {
      title: page.title,
      slug: page.slug,
      content: page.content,
      id: page._id
    });
  });
});

/*
 * GET delete page
 */
router.get("/delete-page/:id", (req, res) => {
  Page.findByIdAndRemove(parseInt(req.params.id), function(err) {
    if (err) {
      req.flash("danger ", "Oops An Error occured!");
      res.redirect("/admin/pages/");
      return console.log(err);
    }
    req.flash("success ", "Page Deleted!");
    res.redirect("/admin/pages/");
  });
});
//Exports route
module.exports = router;
