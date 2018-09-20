//Grab all articles ####################################################
$.getJSON("/articles", function(data){
    for(var i = 0; i < data.length ; i++){
        $("#displayArticles").append("<div class='display-div'><p>" + data[i].title + "</p>" +
        "<button class='btn btn-success addNote' data-id = '"  + data[i]._id + "'>Add Note</button>&nbsp;" + 
        "<button class='btn btn-success readNews' url = '"  + data[i].url + "'>Read News</button>&nbsp;" +
        "<button class='btn btn-success deleteArticle' url = '"  + data[i].url + "' data-title='" + data[i].title + "' data-id = '"  + data[i]._id + "'>Delete</button></div>");
    }
});

//Event listiner for delete button click
$(document).on("click", ".deleteArticle", function(event){
    event.preventDefault();
    var thisId = $(this).attr("data-id");
    var thisUrl = $(this).attr("url");
    var thisTitle = $(this).attr("data-title");

    // console.log(thisId);
    // console.log(thisUrl);

    $.ajax({
        method : "POST",
        url: `/deleteArticle/${thisId}`,
        data : {
            title : thisTitle,
            id : thisId,
            url : thisUrl
        }
    })
    .then (function(data){
        console.log(data);
    })
});

//Listen to click event to read news #####################################
$(document).on("click", ".readNews", function(){
    var thisId = $(this).attr("url");

    // console.log("reading news like a boos");
    window.location.href=thisId;
});


//Listen for click events to add comments ################################
$(document).on("click",  ".addNote", function(){
    var thisId = $(this).attr("data-id");
    // console.log(thisId);

    //Make ajax call to the article clicked
    $.ajax({
        methond : "GET",
        url : "/articles/" + thisId
    })
    .then(function(data){
        // console.log(data);
        $("#noteDiv").empty();
        $("#noteDiv").append("<div><p>" + data[0].title + "</p>" +
        "<form><input id='noteTitle' class='form-control' placeholder='Note Title'>" + 
                "<textarea  id = 'noteBody' type='text' class='form-control' rows='5'></textarea>" + 
                "<button class='btn btn-success' id='saveNote' data-id='" + data[0]._id + "'>Submit</button>&nbsp;" + 
                "<button class='btn btn-success' id='deleteNote' data-id='" + data[0]._note + "'>Delete</button>" +
        "</form></div>");

        //if the note for the article already exists place them on note form
        if(data[0].note){
            $("#noteTitle").val(data[0].note.title); // not yet created
            $("#noteBody").val(data[0].note.body);  // not yet created
        }
    });
});

//Listen to click event to save the notes ###############################
$(document).on("click", "#saveNote", function(event){
    // alert("clicked");
    event.preventDefault();
    var thisId = $(this).attr("data-id");

    //Post this new note data
    $.ajax({
        method : "POST",
        url : `/articles/${thisId}`,
        data : {
            title : $("#noteTitle").val(),
            body : $("#noteBody").val()
        }
    })
        .then ( function(data){
        console.log(data);
        $("#noteDiv").empty();

    });
        $("#noteTitle").val("");
        $("#noteBody").val("");

});


//Event listiner to delete note
$(document).on("click", "#deleteNote", function(event){
    // alert("clicked");
    event.preventDefault();
    var thisId = $(this).attr("data-id");

    //Post this new note data
    $.ajax({
        method : "POST",
        url : `/articles/${thisId}`,
        data : {
            title : $("#noteTitle").val(),
            body : $("#noteBody").val()
        }
    })
        .then ( function(data){
        console.log(data);
        $("#noteDiv").empty();

    });
        $("#noteTitle").val("");
        $("#noteBody").val("");

});
