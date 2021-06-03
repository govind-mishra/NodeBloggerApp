const express = require("express");
const articleModel = require("../models/articles");

const router = express.Router();

router.get("/new", (req, res) => {
  res.render("articles/new", { article: new articleModel() });
});

router.get("/:slug", async (req, res) => {
  const savedArticle = await articleModel.findOne({ slug: req.params.slug });
  if (savedArticle == null) {
    res.redirect("/");
  }
  res.render("articles/show", { article: savedArticle });
});

router.get("/edit/:id", async (req, res) => {
  const editedArticle = await articleModel.findById(req.params.id);
  if (editedArticle == null) {
    res.redirect("/");
  }
  res.render("articles/edit", { article: editedArticle });
});

/**
 * Here we can not pass saveEditArticle as a middlewear
 * between path and req,res callback because middlewear will always execute first
 * than any other code in req,res callback and we want the req.article variable before
 * we call the saveEditArticle
 */
//below code is wrong
/* router.put("/:id", saveEditArticle, async (req, res) => {
  const editedArticle = await articleModel.findById(req.params.id);
  
}); */
router.put(
  "/:id",
  async (req, res, next) => {
    const editedArticle = await articleModel.findById(req.params.id);
    req.article = editedArticle;
    next(); // this next will call the next function in pipeline that is saveEditArticle
  },
  saveEditArticle("edit")
);

router.post(
  "/",
  async (req, res) => {
    const newArticle = new articleModel();
    req.article = newArticle;
    next(); // this next will call the next function in pipeline that is saveEditArticle
  },
  saveEditArticle("new")
);

router.delete("/:id", async (req, res) => {
  await articleModel.findByIdAndDelete(req.params.id);
  res.redirect("/");
});

/**
 * below function return set of middlewear that is return the function that takes
 * req and response and do bunch of stuff
 * @param {string} path this can be edit/new we use it to redirect
 * our page if the error occured wheather in new or edit page
 */
function saveEditArticle(path) {
  return async (req, res) => {
    let { article } = req;
    article.title = req.body.title.trim();
    article.description = req.body.description.trim();
    article.markdown = req.body.markdown.trim();
    try {
      article = await article.save();
      res.redirect(`/articles/${article.slug}`);
    } catch (error) {
      res.render(`articles/${path}`, { article: article });
    }
  };
}

module.exports = router;
