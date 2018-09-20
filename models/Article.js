var mongoose = require("mongoose");
//Saving reference to Schema constructor
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    title : {
        type : String,
        required : true
    },
    url : {
        type : String,
        required : true
    },
    note : {
        type : Schema.Types.ObjectId,
        ref: "Note"
    }
});

var Article = mongoose.model("Article",ArticleSchema );

//Export module
module.exports = Article;