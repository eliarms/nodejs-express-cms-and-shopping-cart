var express = require("express");
var router = express.Router();
var mkdirp = require("mkdirp");
var fs = require("fs-extra");
var resizeimg = require("resize-img");

//Get Product model
var { Product } = require("../models/product");
//Get Category model
var { Category } = require("../models/category");
/*
 * GET product index
 */
router.get("/", (req, res) => {
  let count = 0;
  Product.count((err, c) => {
    count = c;
  });
  Product.find(function (err, products) {

    res.render("admin/products", {
      title: "Admin | Product",
      count: count,
      products: products
    });
  });
});

/*
 * GET add product
 */

router.get("/add-product", (req, res) => {
  var title = "";
  var desc = "";
  var price = "";
  Category.find(function (err, categories) {
    res.render("admin/add_product", {
      title: title,
      desc: desc,
      price: price,
      categories: categories
    });
  })

});

/*
 * GET post product
 */

router.post("/add-product", (req, res) => {
  req.checkBody("title", "Title must have a value").notEmpty();
  req.checkBody("content", "Content must have a value").notEmpty();
  var title = req.body.title;
  var content = req.body.content;
  var slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
  if (slug == "") slug = title.replace(/\s+/g, "-").toLowerCase();

  var errors = req.validationErrors();
  if (errors) {
    //console.log("errors");
    res.render("admin/add_product", {
      errors: errors,
      title: title,
      slug: slug,
      content: content
    });
  } else {
    product.findOne({ slug: slug }, function (err, product) {
      if (product) {
        req.flash("danger", "product slug exists, choose another");
        res.render("admin/add_product", {
          title: title,
          slug: slug,
          content: content
        });
      } else {
        var product = new product({
          title: title,
          slug: slug,
          content: content,
          sorting: 100
        });
        product.save(function (err) {
          if (err) return console.log(err);
          req.flash("success", "product added!");
          res.redirect("/admin/products");
        });
      }
    });
  }
});

/*
 * POST Edit product
 */

router.post("/edit-product/:id", (req, res) => {
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
    res.render("admin/edit_product", {
      errors: errors,
      title: title,
      slug: slug,
      content: content,
      id: id
    });
  } else {
    product.findOne({ slug: slug, _id: { $ne: id } }, function (err, product) {
      if (product) {
        req.flash("danger", "product slug exists, choose another");
        res.render("admin/edit_product", {
          title: title,
          slug: slug,
          content: content,
          id: id
        });
      } else {
        product.findById(id, function (err, product) {
          if (err) return console.log(err);

          (product.title = title),
            (product.slug = slug),
            (product.content = content),
            product.save(function (err) {
              if (err) return console.log(err);
              req.flash("success", "product edited!");
              res.redirect("/admin/products/edit-product/" + id);
            });
        });
      }
    });
  }
});

/*
 * post reorder products
 */
//grab the id of the product and assign the count value to the sorting field
router.post("/reorder-products", (req, res) => {
  var ids = req.body["id[]"];
  var count = 0;
  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    count++;
    (function (count) {
      product.findById(id, function (err, product) {
        product.sorting = count;
        product.save(function (err) {
          if (err) return console.log(err);
        });
      });
    })(count);
  }
});
//GET edit product

router.get("/edit-product/:id", (req, res) => {
  product.findById(req.params.id, function (err, product) {
    if (err) return console.log(err);

    res.render("admin/edit_product", {
      title: product.title,
      slug: product.slug,
      content: product.content,
      id: product._id
    });
  });
});

/*
 * GET delete product
 */
router.get("/delete-product/:id", (req, res) => {
  product.findByIdAndRemove(parseInt(req.params.id), function (err) {
    if (err) {
      req.flash("danger ", "Oops An Error occured!");
      res.redirect("/admin/products/");
      return console.log(err);
    }
    req.flash("success ", "product Deleted!");
    res.redirect("/admin/products/");
  });
});
//Exports route
module.exports = router;
