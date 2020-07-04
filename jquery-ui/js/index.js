function getPrettySize(size) {
    if(size >= 1000000000000) {
        return (size / 1000000000000).toFixed(1) + ' TB';
    }
    else if(size >= 1000000000) {
        return (size / 1000000000).toFixed(1) + ' GB';
    }
    else if(size >= 1000000) {
        return (size / 1000000).toFixed(1) + ' MB';
    }
    else if(size >= 1000) {
        return (size / 1000).toFixed(1) + ' KB';
    }
    else {
        return size + ' B';
    }
}

$(function() {
    // Insert Banner
    $.get("/api/config", function(config) {
        $('#banner').text(config.banner);
    });

    //Insert table data
    $.get("/api/files", function(files) {
        files.forEach(file => {
            let icon = '';
            if(file.type === 'directory') {
                icon = '<i class="fas fa-folder" style="padding-right: 0.25rem;"></i>';
            }
            $('#files tbody').append(
                '<tr>\n' +
                    '<td><input type="checkbox"></td>\n' +
                    '<td>' + icon + file.name + '</td>' + 
                    '<td>' + getPrettySize(file.size) + '</td>' +
                    '<td><button class="btn btn-outline-primary float-right"><i class="fas fa-download"></i> Download</button></td>' +
                '</tr>'
            )
        });

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
});