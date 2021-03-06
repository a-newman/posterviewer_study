var POSTER_USED;
var SURVEY_LINK = 'https://docs.google.com/forms/d/e/1FAIpQLSdWexhBPoZ-jD7g4ZLj9-Q7BdTC0LjYn397j_WiWAMKFSpWqw/viewform?usp=pp_url&entry.926476235={{name}}&entry.2102778111'

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
    var name = gup("subject");
    var id = gup("id");
    $(".name").text(name);
    $(".id").text(id);

    // add the survey link
    nameFormatted = name.charAt(0).toUpperCase() + name.slice(1); // make the name uppercase
    nameFormatted = encodeURIComponent(nameFormatted);
    link = SURVEY_LINK.replace("{{name}}", nameFormatted);
    $('#form-link').attr('href', link);

    // figure out which poster this cooresponds to 
    $.ajax({
        url: "../assets/data/" + name + "/WhichYours/files_used.txt", 
        dataType: "text"
    }).then(function(data) {
        var mapping = parse_matching_file(data); 
        var poster = mapping[id].trim() + '.jpg';
        var posterUrl = "assets/imgs/" + poster;
        // fill in the static images with the original poster, resized 
        $('.static-img').attr('src', posterUrl);
    });


    // fill in the images 
    var base = "../assets/data/" + name + "/WhichYours/" + id;
    $("#gif1").attr("src", base + "/A.gif");
    $("#gif2").attr("src", base + "/B.gif");

    $('.gif-container').hover(playGif, hideGif);    

});
