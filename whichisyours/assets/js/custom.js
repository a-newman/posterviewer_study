var POSTER_USED;

function gup(name) {
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var tmpURL = window.location.href;
    var results = regex.exec( tmpURL );
    if (results == null) return "";
    else return results[1];
}

function parse_matching_file(str) {
    str = str.trim();
    var pairings = str.split("\n");
    var mapping = {}
    pairings.forEach(function(elt, i) {
        var arr = elt.split(", ");
        mapping[arr[0]] = arr[1];
    })
    return mapping;
}

function playGif() {
    console.log("playing gif");
    $(this).find('.gif').show();
    $(this).find('.static-img').hide();
}

function hideGif() {
    console.log("hiding gif");
    $(this).find('.gif').hide();
    $(this).find('.static-img').show();
}

$(document).ready(function() {
    $('.gif').hide();
    var name = gup("name");
    var id = gup("id");
    $(".name").text(name);
    $(".id").text(id);

    // figure out which poster this cooresponds to 
    $.ajax({
        url: "data/" + name + "/WhichYours/files_used.txt", 
        dataType: "text"
    }).then(function(data) {
        var mapping = parse_matching_file(data); 
        var poster = mapping[id].trim() + '.jpg';
        var posterUrl = "assets/imgs/" + poster;
        // fill in the static images with the original poster, resized 
        $('.static-img').attr('src', posterUrl);
    });


    // fill in the images 
    var base = "data/" + name + "/WhichYours/" + id;
    $("#gif1").attr("src", base + "/A.gif");
    $("#gif2").attr("src", base + "/B.gif");

    $('.gif-container').hover(playGif, hideGif);    

});