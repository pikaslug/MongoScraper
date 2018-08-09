var request = require("request");
var cheerio = require("cheerio");

var Comment = require("../models/comment.js");
var Article = require("../models/article.js");

module.exports = function (app) {

  app.get('/', function (req, res) {
      res.redirect('/articles');
  });
  
  app.get('/clear', function (req, res) {
      // clear all articles from DB
      Article.remove({}, function(err){
        if(err){
          alert('there was an error clearing the articles')
        } else{
          res.redirect('/articles');
        }
      })
  });

  app.get("/scrape", function (req, res) {
    //use request dependecy to grab the body of the html
    request("https://www.berkeleyside.com/", function (error, response, html) {
      
      var $ = cheerio.load(html);
      $("div.post-content").each(function (i, element) {
        
        var title = $(this)
          .children("header")
          .children("h2")
          .children("a")
          .text();
        var link = $(this)
          .children("header")
          .children("h2")
          .children("a")
          .attr("href");
        var articleSnippet = $(this)
          .children("div")
          .children("p")
          .text();

        if (title && link && articleSnippet) {
          var result = {};

          result.title = title;
          result.link = link;
          result.articleSnippet = articleSnippet;

          Article.create(result, function (err, doc) {
            if (err) {
              console.log(err
              );
            } else {
              console.log(doc);
            }
          });
        }
      });
    });
    res.redirect("/");
  });

  app.get("/articles", function (req, res) {
    Article
      .find({}, function (error, doc) {
        if (error) {
          console.log(error);
        } else {
          res.render("index", {result: doc});
        }
      })
      .sort({'_id': -1});
  });

  app.get("/articles/:id", function (req, res) {
    Article.findOne({"_id": req.params.id})
      .populate("comment")
      .exec(function (error, doc) {
        if (error) {
          console.log(error);
        } else {
          res.render("comments", {result: doc});
        }
      });
  });

  app.post("/articles/:id", function (req, res) {
    Comment
      .create(req.body, function (error, doc) {
        if (error) {
          console.log(error);
        } else {
          Article.findOneAndUpdate({
            "_id": req.params.id
          }, {
            $push: {
              "comment": doc._id
            }
          }, {
            safe: true,
            upsert: true,
            new: true
          })
            .exec(function (err, doc) {
              if (err) {
                console.log(err);
              } else {
                res.redirect('back');
              }
            });
        }
      });
  });

  app.delete("/articles/:id/:commentid", function (req, res) {
    Comment
      .findByIdAndRemove(req.params.commentid, function (error, doc) {
        if (error) {
          console.log(error);
        } else {
          console.log(doc);
          Article.findOneAndUpdate({
            "_id": req.params.id
          }, {
            $pull: {
              "comment": doc._id
            }
          })
            .exec(function (err, doc) {
              if (err) {
                console.log(err);
              }
            });
        }
      });
  });

};
