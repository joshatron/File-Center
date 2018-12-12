import { Component } from '@angular/core';
import { Model } from "./model";

@Component({
    selector: 'file-center',
    templateUrl: './app.component.html',
})

export class AppComponent {
    title = 'file-center';
    model = new Model();

    getTitle() {
        return this.model.title
    }
}
