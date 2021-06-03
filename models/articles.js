const mongoose = require("mongoose");
const marked = require("marked");
const slugify = require("slugify");
const createDomPurifier = require("dompurify");
const { JSDOM } = require("jsdom");
const dompurifier = createDomPurifier(new JSDOM().window); // it allow us to create html and purify it by using jsdom window object

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  markdown: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  santizedHTML: {
    type: String,
    required: true,
  },
});

//pre validate our model
articleSchema.pre("validate", function (next) {
  //this if for creating slug from title
  if (this.title) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true, //remove any special character from title to make slug
    });
  }
  //this if for sanitizing the markdown text from malicious code
  if (this.markdown) {
    //dompurifier.sanitize will sanitize malicious code and marked(object) will convert string in html
    this.santizedHTML = dompurifier.sanitize(marked(this.markdown));
  }
  next();
});

module.exports = mongoose.model("Article", articleSchema);
