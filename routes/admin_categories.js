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

router.post("/edit-category/:id", (req, res) => {
  req.checkBody("title", "Title must have a value").notEmpty();

  var title = req.body.title;
  var id = req.params.id;
  var slug = title.replace(/\s+/g, "-").toLowerCase();

  var errors = req.validationErrors();
  if (errors) {
    console.log("errors");
    res.render("admin/edit_category", {
      errors: errors,
      title: title,
      id: id
    });
  } else {
    Category.findOne({ slug: slug, _id: { $ne: id } }, function(err, category) {
      if (category) {
        req.flash("danger", "Category title exists, choose another");
        res.render("admin/edit_category", {
          title: title,
          id: id
        });
      } else {
        Category.findById(id, function(err, category) {
          if (err) return console.log(err);

          (category.title = title),
            (category.slug = slug),
            category.save(function(err) {
              if (err) return console.log(err);
              req.flash("success", "Category edited!");
              res.redirect("/admin/categories/edit-category/" + id);
            });
        });
      }
    });
  }
});

//GET edit Category

router.get("/edit-category/:id", (req, res) => {
  Category.findById(req.params.id, function(err, category) {
    if (err) return console.log(err);

    res.render("admin/edit_category", {
      title: category.title,
      id: category._id
    });
  });
});

/*
 * GET delete category
 */
router.get("/delete-category/:id", (req, res) => {
  Category.findByIdAndRemove(req.params.id, function(err) {
    if (err) return console.log(err);
    req.flash("success ", "Category Deleted!");
    res.redirect("/admin/categories/");
  });
});
//Exports route
module.exports = router;
