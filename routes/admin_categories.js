var express = require("express");
var router = express.Router();
var { Category } = require("../models/category");
/*
 * GET Categories index
 */
router.get("/", (req, res) => {
  Category.find(function(err, categories) {
    if (err) return console.log(err);
    res.render("admin/categories", {
      title: "Admin Categories",
      categories: categories
    });
  });
});

/*
 * GET add category
 */

router.get("/add-category", (req, res) => {
  var title = "";
  res.render("admin/add_category", {
    title: title
  });
});

/*
 * GET post category
 */

router.post("/add-category", (req, res) => {
  req.checkBody("title", "Title must have a value").notEmpty();

  var title = req.body.title;

  var slug = req.body.title.replace(/\s+/g, "-").toLowerCase();
  var errors = req.validationErrors();
  if (errors) {
    //console.log("errors");
    res.render("admin/add_category", {
      errors: errors,
      title: title
    });
  } else {
    Category.findOne({ slug: slug }, function(err, category) {
      if (category) {
        req.flash("danger", "Category title exists, choose another");
        res.render("admin/add_category", {
          title: title
        });
      } else {
        var category = new Category({
          title: title,
          slug: slug
        });
        category.save(function(err) {
          if (err) return console.log(err);
          req.flash("success", "Category added!");
          res.redirect("/admin/categories");
        });
      }
    });
  }
});

/*
 * POST Edit Category
 */

router.post("/edit-page/:slug", (req, res) => {
  req.checkBody("title", "Title must have a value").notEmpty();
  req.checkBody("content", "Content must have a value").notEmpty();
  var title = req.body.title;
  var content = req.body.content;
  var id = req.body.id;
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
              res.redirect("/admin/pages/edit-page/" + page.slug);
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

router.get("/edit-page/:slug", (req, res) => {
  Page.findOne({ slug: req.params.slug }, function(err, page) {
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
  Page.findByIdAndRemove(req.params.id, function(err) {
    if (err) return console.log(err);
    req.flash("success ", "Page Deleted!");
    res.redirect("/admin/pages/");
  });
});
//Exports route
module.exports = router;
