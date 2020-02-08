import { Component } from "@angular/core";
import { Config } from "./model/config.model";
import { ConfigRepository } from "./model/config.repository";

@Component({
    selector: "file-center",
    templateUrl: "./app.component.html"
})
export class AppComponent {
    title = "file-center";

    constructor(private repository: ConfigRepository) {}

    get uploads(): boolean {
        return this.repository.getUploads();
    }
}
