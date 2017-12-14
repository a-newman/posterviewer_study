function gup(name) {
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var tmpURL = window.location.href;
    var results = regex.exec( tmpURL );
    if (results == null) return "";
    else return results[1];
}

$(document).ready(function() {
    var name = gup("name");
    var id = gup("id");
    $(".name").text(name);
    $(".id").text(id);

    var base = "http://people.csail.mit.edu/kimberli/poster/data/" + name + "/WhichYours/" + id;
    $("#img1").attr("src", base + "/A.gif");
    $("#img2").attr("src", base + "/B.gif");
    

});
