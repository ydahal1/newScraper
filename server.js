const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

//scraping tools
var axios = require("axios"); // Promised based http libray like jquery ajax
var cheerio = require("cheerio");


//Require models
var db = require("./models");

const PORT = process.env.PORT || 3010;

const app = express();

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));

//Connect to mongo db
// mongoose.connect("mongodb://localhost/bbc", {useNewUrlParser: true});
mongoose.connect("mongodb://heroku_fbr8025m:8g6sklcu1pf69pl2pmj14oipsu@ds163822.mlab.com:63822/heroku_fbr8025m");


// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));


//Scrape 
app.get("/scrape", function(req, res){
    console.log("test");
    //grab the body of html
    axios.get("http://www.bbc.com").then( function(response){
    //and load into cheerio
    var $ = cheerio.load(response.data);


    //grabbing the headings and links to articles ############################
    $(".module--news-sport h3").each(function(i, element){
        //empty result obj
        var result = {};
    
    //putting heading and text inside result object
    result.title = $(this).children("a").text().trim();
    result.url = "http://www.bbc.com" + $(this).children("a").attr("href");

    // console.log(result.title);
    // console.log(result.link);
    // console.log("hello");
    db.Article.create(result).then(function(dbArticle){
        console.log(dbArticle);
    })
    
    .catch(function(err) {
        // If an error occurred, send it to the client
        return res.json(err);
      });
    });
    
    res.send('<script>alert("Done scrapping articles"); window.location.href="/"; </script>');
    
    });
});

//Route for handling delete
app.post("/deleteArticle/:id", function(req, res){
    console.log(req.params.id);
    db.Article.remove({_id : req.params.id})
        .then(function(dbArticle){
            res.json(dbArticle);
            // res.redirect("/");
            // req.get('/apple');
            location.reload();

        })
        .catch(function(err){s
            // console.log(err);
        });

   
});


//Routes for getting all elements from db ##############################
app.get("/articles", function(req, res){
    db.Article.find({})
        .then( function(dbArticle){
            res.json(dbArticle);
        })
        .catch(function(err){
            res.json(err);
        });
});

//Route for getting individual article ############################
app.get("/articles/:id", function(req, res){
    db.Article.find({_id : req.params.id})
        .populate("note")
        .then(function(dbArticle){
            res.json(dbArticle);
        })
        .catch(function(err){s
            console.log(err);
        });
});

//Route for saving the article note
app.post("/articles/:id", function(req, res){
    console.log(req.body);
    db.Note.create(req.body).then( function(dbNote){
        return db.Article.findOneAndUpdate({_id : req.params.id}, {note : dbNote._id}, {new : true});
    }).then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
        console.log("$$$$$$$$$$$$$$$$$$$$ " + dbArticle)
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

//Routing for individual notes
app.get("/notes/:id", function(req, res){
    // db.Note.find
})

app.listen(PORT, function(){
    console.log("Server running in port " + PORT);
})
