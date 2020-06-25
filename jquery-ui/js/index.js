$(function() {
    $.get("/api/config", function(config) {
        $('#banner').text(config.banner);
    })

    $('#files').DataTable({
        "paging": false,
        "info": false,
        "order": [[ 1, "asc" ]],
        "columns": [
            {
                "orderable": false, 
                "searchable": false,
                "width": "5%"
            },
            {
                "orderable": true, 
                "searchable": true,
                "width": "55%"
            },
            {
                "orderable": false, 
                "searchable": false,
                "width": "15%"
            },
            {
                "orderable": false, 
                "searchable": false,
                "width": "25%"
            }
        ]
    });
});