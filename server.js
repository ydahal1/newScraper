var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

// var PORT = 3000;
var port = process.env.PORT ||3010;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

mongoose.Promise = Promise;
var databaseUri = 'mongodb://heroku_p5fxpphq:fcd9c00qhan4mifs7bvi74k4eg@ds111063.mlab.com:11063/heroku_p5fxpphq';
if(process.env.MONGODB_URI){
	databaseUri=process.env.MONGODB_URI;
}
mongoose.connect(databaseUri,{
	useMongoClient:true
});

var test = mongoose.connection;
test.on('error',function(err){
  console.log('Mongoose Error:', err);
})


// Routes

// A GET route for scraping the echojs website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("http://www.nytimes.com/section/world?action=click&pgtype=Homepage&region=TopBar&module=HPMiniNav&contentCollection=World&WT.nav=page").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    // console.log(response.data);
    var $ = cheerio.load(response.data);
    var results = new Array();
    $(".story-body").each(function(i, element) {
      var result = {};
      result.title = $(this)
        .children(".headline")
        .text().replace(/ +(?= )/g,'').replace(/\n/g,'');
      result.summary = $(this)
        .children(".summary")
        .text();
      // Create a new Article using the `result` object built from scraping
      if (result.title.length > 5){
        console.log(result);
        results.push(result);
      }
    });
    res.json(results);
  });
});

app.post("/api/save", function(req, res){
  // console.log(req.body);
  db.Article
    .create(req.body)
    .then(function(dbArticle) {
      
      //res.send("Scrape Complete");
      console.log("Article saved"); //CHECK SERVER.JS
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article
    .find({})
    .then(function(dbArticle){
      res.json(dbArticle)
    })
    .catch(function(err){
      res.json(err);
    });

});


app.delete("/api/article/:id", function(req, res){
  db.Article
    .remove({"_id":req.params.id})
    .then(function(dbArticle){
      res.json(dbArticle)
    })
});


app.get("/articles/:id", function(req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
  db.Article
    .findOne({"_id":req.params.id})
    .populate("comment")
    .then(function(dbArticle){
      res.json(dbArticle)
    })
    .catch(function(err){
      res.json(err);
    });

});

//----------------- creating a comment 
app.post("/api/new_comment/:id", function(req, res) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
    db.Comment
    .create(req.body)
    .then(function(dbComment){
      //res.json(dbArticle)
      return db.Article.findOneAndUpdate(
        {_id:req.params.id},
        {comment:dbComment._id},
        {new:true} //---------------- returns the new updated version of the table
        );
    })
    .then(function(dbArticle){
      res.json(dbArticle);
    })
    .catch(function(err){
      res.json(err);
    });
});

//------------- delete a note
app.delete("/comment/:id", function(req, res){
  db.Comment
  .remove({"_id":req.params.id})
  .then(function(dbArticle){
    res.json(dbArticle)
  })
});




// Start the server
app.listen(port, function() {
  console.log("App running on port " + port + "!");
});
