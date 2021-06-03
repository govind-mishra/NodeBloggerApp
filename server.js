const express = require("express");
const mongoose = require("mongoose"); //connect with db
const articleRouter = require("./routes/articles");
const articles = require("./models/articles");
const methodOverride = require("method-override");

const server = express();

mongoose.connect("mongodb://localhost/blog", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

server.set("view engine", "ejs");
server.use(
  express.urlencoded({
    extended: false,
  })
);
server.use(methodOverride("_method"));
server.use("/articles", articleRouter); //all the routes in article will append after /article

server.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      var method = req.body._method;
      return method;
    }
  })
);
server.get("/", async (req, res) => {
  const allArticle = await articles.find().sort({
    createdAt: "desc",
  }); //find in mongo gives all data same as get in other db
  res.render("articles/index", { articles: allArticle });
  /**
   * pass value in index.ejs by writing second argument in render
   * we can get this value in index.ejs by writing <%=variable %>
   */
});

server.listen("5000", () => {
  console.log(`now listening server at port 5000`);
});
