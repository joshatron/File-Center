import { Component } from "@angular/core";

@Component({
    selector: "file-center",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"]
})
export class AppComponent {
    title = "file-center";

    getTitle() {
        return "Josh's File Center";
    }
}
