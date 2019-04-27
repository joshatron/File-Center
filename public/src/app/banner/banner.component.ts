import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Component({
    selector: "banner",
    templateUrl: "banner.component.html",
    styleUrls: ["./banner.component.css"]
})

export class BannerComponent {
    banner: string = "";

    constructor(private http: HttpClient) {
        this.http.get("/api/banner", {responseType: "text"}).subscribe(data => this.banner = data);
    }
}
