import { Component } from '@angular/core';
import { Model } from "./model";

@Component({
    selector: 'file-center',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'file-center';
    model = new Model();

    getTitle() {
        return this.model.title;
    }

    getFiles() {
        return this.model.files;
    }
}
