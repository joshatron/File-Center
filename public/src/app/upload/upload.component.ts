import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { FileUploader } from 'ng2-file-upload';

@Component({
    selector: "upload",
    templateUrl: "upload.component.html",
    styleUrls: ["./upload.component.css"]
})

export class UploadComponent {
    public uploader:FileUploader = new FileUploader({url: "/api/upload", autoUpload: true});
    public hasDropZoneOver:boolean = false;

    constructor() {
        this.uploader.onCompleteItem = (item, response, status, header) => {
            if (status === 200) {
                window.location.reload();
            }
        }
    }

    public fileOver(e:any):void {
        this.hasDropZoneOver = e;
    }
}
