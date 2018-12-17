import { Component } from '@angular/core';
import { Model } from "./model";
import { faDownload, faFolder } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'file-center',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    faDownload = faDownload;
    faFolder = faFolder;
    title = 'file-center';
    model = new Model();

    getTitle() {
        return this.model.title;
    }

    getFiles() {
        return this.model.files;
    }

    getPrettySize(size) {
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
}
