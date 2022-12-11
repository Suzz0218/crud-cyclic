const express = require("express");
const router = express.Router();
const User = require("../model/user");
const Article = require("../model/article");
const bcrypt = require("bcryptjs");
const fs = require("fs");

const multer = require("multer");

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage }).single("image");

// Get all Users ==> /users

router.get("/users", (req, res) => {
  User.find().exec((err, users) => {
    if (err) {
      req.session.notify = { message: err.message };
      res.redirect("/users");
    } else {
      res.render("users", { title: "All users", users: users });
    }
    console.log(users);
  });
});

// Signup Route
router.post("/signup", upload, (req, res) => {
  let user = new User({
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    image: req.file.filename,
  });

  user.save((err, user) => {
    if (err) {
      (req.session.notify = { message: err.message, success: false }),
        res.redirect("/signup");
    } else {
      req.session.notify = {
        success: true,
        message: "Welcome to Postol!\nStart creating your articles.",
      };
      req.session.message = {
        user: user,
      };
      res.redirect("/signup");
    }
  });
});

// Get Login Page
router.get("/signin", (req, res) => {
  res.render("signin", { title: "Postol Authenticate" });
});

// Post -- Login Route
router.post("/signin", (req, res, next) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      return next(
        (req.session.notify = {
          message: "Internal server error",
          success: false,
        })
      );
    }
    console.log(user, { email: req.body.email, password: req.body.password });

    if (!user) {
      req.session.notify = {
        message: "User not found.",
        success: false,
      };
      res.redirect("/signin");
    } else {
      const comparePassword = bcrypt.compare(req.body.password, user.password);

      if (!comparePassword) {
        req.session.notify = {
          message: "Invalid password",
          success: false,
        };
        res.redirect("/signin");
      } else {
        req.session.message = {
          user: user,
        };
        req.session.notify = {
          message: "User logged in successfully",
          success: true,
        };
        res.redirect("/signin");
      }
    }
  });
});

// get updated profile
router.get("/profile/:id", (req, res) => {
  res.render("profile", { title: "Profile page" });
});

router.get("/updateprofile/:id", (req, res) => {
  res.render("updatedProfile", { title: "Update your profile" });
});

// Profile Update route
router.post("/updateprofile/:id", upload, (req, res) => {
  let id = req.params.id;
  let new_image = "";

  if (req.file) {
    new_image = req.file.filename;
    try {
      fs.unlinkSync("./uploads/" + req.body.old_image);
    } catch (err) {
      console.log(err);
    }
  } else {
    new_image = req.body.old_image;
  }

  User.findByIdAndUpdate(
    id,
    {
      fname: req.body.fname,
      lname: req.body.lname,
      email: req.body.email,
      image: new_image,
      password: req.body.password,
    },
    (err, user) => {
      if (err) {
        req.session.notify = { message: err.message };
        res.render("profile");
      } else {
        req.session.message = { user: user };
        res.redirect(`/signup`);
      }
      console.log(user);
    }
  );
});

// Delete profile ==> /delete/profile:id
router.get("/delete/profile/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      req.session.notify = { message: err.message };
      res.redirect(`/profile/${req.params.id}`);
    } else {
      req.session.notify = {
        message: "Users deleted successfully",
        title: "Postol Forum",
      };
      req.session.message = null;
      res.redirect("/signup");
    }
  });
});

// Get all articles ==> /index page
router.get("/", (req, res) => {
  Article.find()
    .populate("user", ["fname", "lname", "image"])
    .exec((err, articles) => {
      if (err) {
        req.session.message = { message: err.message };
        res.redirect("/");
      } else {
        res.render("index", {
          title: "Postol Forum",
          articles: articles,
        });
      }
    });
});

// Get articles by ID ==> /articles/:id
router.get("/article/:id", (req, res) => {
  Article.findById(req.params.id)
    .populate("user", ["fname", "lname", "image"])
    .exec((err, article) => {
      if (err) {
        req.session.notify = { message: err.message };
        res.render("article", { title: "Postol Forum" });
      } else {
        res.render("article", {
          title: `${article.headLine} Article`,
          article: article,
        });
      }
    });
});

// Get current user article ==> /myarticle
router.get("/myarticles/:id", (req, res) => {
  Article.find({ user: req.params.id })
    .populate("user", ["fname", "lname", "image"])
    .exec((err, articles) => {
      if (err) {
        req.session.notify = { message: err.message };
        res.render("myarticles", { title: "Postol Forum" });
      } else {
        res.render("myarticles", {
          title: `My articles`,
          articles: articles,
        });
      }
    });
});

// Get Write page ==> /write/:id
router.get("/write/:id", (req, res) => {
  User.findById(req.params.id).exec((err, user) => {
    if (err) {
      req.session.notify = { message: err.message };
      res.render("write");
    } else {
      res.render("write", {
        title: `${user.fname} Page`,
        user: user,
      });
      req.session.message = { user: user };
    }
  });
});

router.get("/myarticle/:id", (req, res) => {
  Article.findById(req.params.id)
    .populate("user", ["fname", "lname", "image"])
    .exec((err, article) => {
      if (err) {
        req.session.notify = { message: err.message };
        res.render("article", { title: "Postol Forum" });
      } else {
        res.render("myarticle", {
          title: `My article`,
          article: article,
        });
      }
      console.log(article);
    });
});

router.post("/write/:id", (req, res) => {
  let article = new Article({
    headLine: req.body.headLine,
    subHead: req.body.subHead,
    content: req.body.content,
    createdBy: req.body.createdBy,
    user: req.params.id,
  });

  article.save((err, article) => {
    if (err) {
      req.session.notify = { message: err.message };
      res.redirect(`/write/${req.params.id}`);
    } else {
      res.render("myarticle", {
        title: `${article.createdBy} Article`,
        article: article,
      });
      console.log(article);
    }
  });
});

router.post("/myarticle/:id", (req, res) => {
  const { headLine, subHead, content, createdBy } = req.body;

  const updateArticle = {
    headLine,
    subHead,
    content,
    createdBy,
    user: req.params.id,
  };

  Article.findByIdAndUpdate(req.params.id, updateArticle, (err, article) => {
    if (err) {
      req.session.notify = { message: err.message };
      res.render("write");
    } else {
      res.render("myarticle", {
        title: `My article`,
        article: article,
      });
    }
  });
});

router.get("/delete/article/:id", (req, res) => {
  Article.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      req.session.notify = { message: err.message };
      res.render("article", { title: "Postol Forum" });
    } else {
      req.session.notify = {
        success: true,
        message: "Article deleted successfully",
      };
      res.redirect("/");
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.message = null;
  res.redirect("/signup");
});

module.exports = router;
