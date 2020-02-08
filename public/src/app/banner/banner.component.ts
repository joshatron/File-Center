import { Component } from "@angular/core";
import { Config } from "../model/config.model";
import { ConfigRepository } from "../model/config.repository";

@Component({
    selector: "banner",
    templateUrl: "banner.component.html",
    styleUrls: ["./banner.component.css"]
})

export class BannerComponent {
    constructor(private repository: ConfigRepository) {}

    get banner(): string {
        return this.repository.getBanner();
    }
}
