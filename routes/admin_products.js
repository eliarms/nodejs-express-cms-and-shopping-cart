var express = require("express");
var router = express.Router();
var mkdirp = require("mkdirp");
var fs = require("fs-extra");
var resizeImg = require("resize-img");

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
  });

});

/*
 * POST add product
 */
router.post('/add-product', function (req, res) {

  var imageFile = req.files ? req.files.image.name : "";

  req.checkBody('title', 'Title must have a value.').notEmpty();
  req.checkBody('desc', 'Description must have a value.').notEmpty();
  req.checkBody('price', 'Price must have a value.').isDecimal();
  req.checkBody('image', 'You must upload an image').isImage(imageFile);

  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();
  var desc = req.body.desc;
  var price = req.body.price;
  var category = req.body.category;

  var errors = req.validationErrors();

  if (errors) {
    Category.find(function (err, categories) {
      res.render('admin/add_product', {
        errors: errors,
        title: title,
        desc: desc,
        categories: categories,
        price: price
      });
    });
  } else {
    Product.findOne({ slug: slug }, function (err, product) {
      if (product) {
        req.flash('danger', 'Product title exists, choose another.');
        Category.find(function (err, categories) {
          res.render('admin/add_product', {
            title: title,
            desc: desc,
            categories: categories,
            price: price
          });
        });
      } else {

        var price2 = parseFloat(price).toFixed(2);

        var product = new Product({
          title: title,
          slug: slug,
          desc: desc,
          price: price2,
          category: category,
          image: imageFile
        });

        product.save(function (err) {
          if (err)
            return console.log(err);

          mkdirp('public/product_images/' + product._id, function (err) {
            return console.log(err);
          });

          mkdirp('public/product_images/' + product._id + '/gallery', function (err) {
            return console.log(err);
          });

          mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function (err) {
            return console.log(err);
          });

          if (imageFile != "") {
            var productImage = req.files.image;
            var path = 'public/product_images/' + product._id + '/' + imageFile;

            productImage.mv(path, function (err) {
              return console.log(err);
            });
          }

          req.flash('success', 'Product added!');
          res.redirect('/admin/products');
        });
      }
    });
  }

});

//GET edit product

router.get("/edit-product/:id", (req, res) => {
  var errors;
  if (req.session.errors) {
    errors = req.session.errors;
    req.session.errors = null;
  }
  Category.find(function (err, categories) {

    product.findById(req.params.id, function (err, product) {
      if (err) {
        console.log(err);
        res.redirect('/admin/products');
      } else {
        var galleryDir = 'public/product_images/' + product._id + '/gallery';
        var galleryImages = null;
        fs.readdirSync(galleryDir, function (err, files) {
          if (err) {
            console.log(err);
          }
          else {
            galleryImages = files;
            res.render('admin/edit_product', {
              title: product.title,
              desc: product.desc,
              categories: product.categories,
              category: product.category.replace(/\s+/g, '-').toLowerCase();
              price: product.price,
              galleryImages: galleryImages,
              id: product._id
            });
          }

        });
      }
    });
  });
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
