var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://heroku_f9jqr8qs:efv0pqfn8qdqhqcv7k6fr8fhg@ds161039.mlab.com:61039/heroku_f9jqr8qs";

mongoose.Promise = Promise;

var app = express();
var PORT = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({extended: false}));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.static("public"));

mongoose.connect(MONGODB_URI);
var db = mongoose.connection;

db.on("error", function (error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function () {
  console.log("Mongoose connection successful.");
});

require("./controllers/articlesController")(app);

app.listen(PORT, function () {
  console.log("App running on port", + PORT);
});
