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

    $('#head-checkbox').prop('checked', false);
    $('#head-checkbox').change(function() {
        $('.file-checkbox').prop('checked', this.checked);
    });

    $('#download-files').click(function() {
        window.open('/api/downloadZip?files=["9780134494272.epub"]', '_blank');
    });

    //Insert table data
    $.get("/api/files", function(files) {
        files.forEach(file => {
            let icon = '';
            if(file.type === 'directory') {
                icon = '<i class="fas fa-folder" style="padding-right: 0.25rem;"></i>';
            }
            $('#files tbody').append(
                '<tr>' +
                    '<td><input type="checkbox" class="file-checkbox"></td>' +
                    '<td>' + icon + file.name + '</td>' + 
                    '<td>' + getPrettySize(file.size) + '</td>' +
                    '<td>' +
                        '<a href="/api/download?file=' + file.name + '" download>' +
                            '<button class="btn btn-outline-primary float-right">' + 
                                '<i class="fas fa-download"></i> ' +
                                '<span class="d-none d-md-inline">Download</span>' +
                            '</button>' +
                        '</a>' +
                    '</td>' +
                '</tr>'
            )
        });

        $('.file-checkbox').change(function() {
            $('#head-checkbox').prop('checked', true);
            $('.file-checkbox').each(function() {
                if(!this.checked) {
                    $('#head-checkbox').prop('checked', false);
                }
            });
        });

        $('#files').DataTable({
            "paging": false,
            "info": false,
            "autoWidth": false,
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
                    "width": "20%"
                },
                {
                    "orderable": false, 
                    "searchable": false,
                    "width": "20%"
                }
            ]
        });
    });
});