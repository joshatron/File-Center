$(function() {
    $.get("/api/config", function(config) {
        $('#banner').text(config.banner);
    })
});