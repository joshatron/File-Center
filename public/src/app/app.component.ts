import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Component({
    selector: "file-center",
    templateUrl: "./app.component.html"
})
export class AppComponent {
    title = "file-center";
    banner: string = "";

    constructor(private http: HttpClient) {
        this.http.get("/api/banner", {responseType: "text"}).subscribe(data => this.banner = data);
    }
}
