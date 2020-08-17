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

Dropzone.autoDiscover = false;


$(function() {
    let path = window.location.pathname;
    if(path === "/") {
        path = "";
    } else {
        path = path.substring(13);
    }

    let banner = "";
    let uploads = false;
    let table = null;

    $.get("/api/configAdmin", function(config) {
        banner = config.banner;
        uploads = config.uploads;

        if(config.darkMode) {
            $('head').append('<link href="/public/css/bootstrap-dark.css" type="text/css" rel="stylesheet">');
        }

        displayBanner();

        if(!config.authenticated) {
            displayAuth();
        } else {
            displayUploads();
            getFiles();
        }
    });

    function displayBanner() {
        $('#banner').text(banner + " Admin");
    }

    function displayAuth() {
        $('#auth').append(
            '<div class="col form-group row mt-5">' +
                '<label class="col-1 col-form-label" for="web-password">Password:</label>' +
                '<div class="col-10">' +
                    '<input type="password" class="form-control" id="web-password">' +
                '</div>' +
                '<button id="auth-submit" type="submit" class="col-1 btn btn-outline-primary ">Submit</button>' +
            '</div>'
        );

        $('#auth-submit').click(function() {
            submitAuth();
        });

        $('#web-password').bind("enterKey",function(e){
            submitAuth();
        });
        $('#web-password').keyup(function(e){
            if(e.keyCode == 13) {
                $(this).trigger("enterKey");
            }
        });
    }

    function submitAuth() {
        $.ajax({
            url: '/authenticateAdmin',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({password: $('#web-password').val()}),
            success: function(response){
                hideAuth();
                displayUploads();
                getFiles();
            },
            error: function(xhr, status, error) {
                $('#web-password').val('');
                $('#web-password').addClass('is-invalid');
            }
        });
    }

    function hideAuth() {
        $('#auth').empty();
    }

    function displayUploads() {
        if(uploads) {
            $('#dropzone').addClass("dropzone");
            let url = "/api/web/upload";
            if(path !== "") {
                url = url + "/" + path;
            }
            var myDropzone = new Dropzone("#dropzone", { 
                url: url,
                maxFilesize: 1000000,
                timeout: 3600000,
                renameFile: function(file) {
                    //console.log(path + file.name);
                    //return path + file.name;
                    return file.name;
                },
                init: function(){
                    this.on("complete", function(file) {
                        this.removeFile(file);
                        getFiles();
                    });
                }
            });
        }
    }

    //Insert table data
    function getFiles() {
        $.get("/api/web/files", function(files) {
            path.split("/").forEach(function(folder) {
                for(file of files) {
                    if(file.name === folder) {
                        files = file.files;
                        break;
                    }
                }
            });

            if(table !== null) {
                table.destroy();
            }
            $('#file-table').empty();

            $('#file-table').append(
                '<table id="files" class="table table-striped table-sm">' +
                    '<thead>' +
                        '<tr>' +
                            '<th><input type="checkbox" id="head-checkbox"></th>' +
                            '<th>File</th>' +
                            '<th>Size</th>' +
                            '<th></th>' +
                            '<th>' +
                                '<button id="download-files" class="btn btn-outline-danger float-right" style="padding-right: 0.75rem;">' +
                                    '<i class="fas fa-trash" style="padding-right: 0rem;"></i>' +
                                '</button>' +
                            '</th>' +
                            '<th>' +
                                '<button id="download-files" class="btn btn-outline-primary float-right" style="padding-right: 0.75rem;">' +
                                    '<i class="fas fa-download" style="padding-right: 0rem;"></i>' +
                                '</button>' +
                            '</th>' +
                        '</tr>' +
                    '</thead>' +
                    '<tbody>' +
                    '</tbody>' +
                '</table>'
            );

            //Setup table headers
            $('#head-checkbox').prop('checked', false);
            $('#head-checkbox').change(function() {
                $('.file-checkbox').prop('checked', this.checked);
            });

            $('#download-files').click(function() {
                let toDownload = new Array();
                $('.file-checkbox').each(function() {
                    if(this.checked) {
                        toDownload.push(path + $(this).val());
                    }
                });
                window.open('/api/web/downloadZip?files=' + JSON.stringify(toDownload), '_blank');
            });

            if(path !== "") {
                $('#files tbody').append(
                    '<tr id="dir-up">' +
                        '<td></td>' +
                        '<td>..</td>' + 
                        '<td>' + path + '</td>' +
                        '<td></td>' +
                        '<td></td>' +
                        '<td></td>' +
                    '</tr>'
                );
            }

            $('#dir-up').click(function() {
                let pathParts = path.split("/");
                let pathAbove = path.substring(0, path.length - pathParts[pathParts.length - 2].length - 1);

                window.location.replace(window.location.origin + "/admin/files/" + pathAbove);
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
                        '<button id="' + path + file.name + '" class="btn btn-outline-primary float-right edit-file">' + 
                            '<i class="fas fa-pen"></i> ' +
                        '</button>' +
                    '</td>' +
                    '<td>' +
                        '<button id="' + path + file.name + '" class="btn btn-outline-danger float-right delete-file">' + 
                            '<i class="fas fa-trash"></i> ' +
                        '</button>' +
                    '</td>' +
                    '<td>' +
                        '<a href="/api/web/download?file=' + path + file.name + '" download>' +
                            '<button class="btn btn-outline-primary float-right">' + 
                                '<i class="fas fa-download"></i> ' +
                            '</button>' +
                        '</a>' +
                    '</td>' +
                '</tr>';

                $('#files tbody').append(row);
            });

            $('.delete-file').click(function() {
                $.ajax({
                    url: '/api/admin/delete',
                    type: 'DELETE',
                    contentType: 'application/json',
                    data: JSON.stringify({file: $(this).attr('id')}),
                    success: function(response){
                        getFiles();
                    },
                    error: function(xhr, status, error) {
                        console.log("Failed to delete file: " + status + ", " + error);
                    }
                });                
            });

            $('.dir').click(function() {
                window.location.replace(window.location.origin + "/admin/files/" + path + $(this).text());
            });

            $('.file-checkbox').change(function() {
                $('#head-checkbox').prop('checked', true);
                $('.file-checkbox').each(function() {
                    if(!this.checked) {
                        $('#head-checkbox').prop('checked', false);
                    }
                });
            });

            table = $('#files').DataTable({
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
                        "width": "60%"
                    },
                    {
                        "orderable": false, 
                        "searchable": false,
                        "width": "20%"
                    },
                    {
                        "orderable": false, 
                        "searchable": false,
                        "width": "5%"
                    },
                    {
                        "orderable": false, 
                        "searchable": false,
                        "width": "5%"
                    },
                    {
                        "orderable": false, 
                        "searchable": false,
                        "width": "5%"
                    }
                ]
            });
        });
    }
});
