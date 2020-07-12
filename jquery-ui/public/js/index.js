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

    //Setup table headers
    $('#head-checkbox').prop('checked', false);
    $('#head-checkbox').change(function() {
        $('.file-checkbox').prop('checked', this.checked);
    });

    $('#download-files').click(function() {
        let toDownload = new Array();
        $('.file-checkbox').each(function() {
            if(this.checked) {
                toDownload.push($(this).val());
            }
        });
        window.open('/api/downloadZip?files=' + JSON.stringify(toDownload), '_blank');
    });

    //Insert table data
    $.get("/api/files", function(files) {
        let path = window.location.pathname;
        if(path === "/") {
            path = "";
        } else {
            path = path.substring(7);
        }

        path.split("/").forEach(function(folder) {
            for(file of files) {
                if(file.name === folder) {
                    files = file.files;
                    break;
                }
            }
        });

        if(path !== "") {
            $('#files tbody').append(
                '<tr id="dir-up">' +
                    '<td></td>' +
                    '<td>..</td>' + 
                    '<td>' + path + '</td>' +
                    '<td></td>' +
                '</tr>'
            );
        }

        $('#dir-up').click(function() {
            let pathParts = path.split("/");
            let pathAbove = path.substring(0, path.length - pathParts[pathParts.length - 2].length - 1);

            window.location.replace(window.location.origin + "/files/" + pathAbove);
        });

        files.forEach(file => {
            let row = '<tr>' + 
                '<td><input type="checkbox" class="file-checkbox" value="' + file.name + '"></td>' +
                '<td';
            if(file.type === 'directory') {
                row = row + ' class="dir">' + 
                '<i class="fas fa-folder" style="padding-right: 0.25rem;"></i>';
            } else {
                row = row + '>';
            }
            row = row + file.name + '</td>' + 
                '<td>' + getPrettySize(file.size) + '</td>' +
                '<td>' +
                    '<a href="/api/download?file=' + file.name + '" download>' +
                        '<button class="btn btn-outline-primary float-right">' + 
                            '<i class="fas fa-download"></i> ' +
                            '<span class="d-none d-md-inline">Download</span>' +
                        '</button>' +
                    '</a>' +
                '</td>' +
            '</tr>';

            $('#files tbody').append(row);
        });

        $('.dir').click(function() {
            window.location.replace(window.location.origin + "/files/" + path + $(this).text());
        })

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
