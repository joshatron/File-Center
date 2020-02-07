import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { File } from "./file.model";
import { Config } from "./config.model";

@Injectable()
export class RestDataSource {

    constructor(private http: HttpClient) {}

    getFiles(): Observable<File[]> {
        return this.http.get<File[]>("/api/files");
    }

    getConfig(): Observable<Config> {
        return this.http.get<Config>("/api/config");
    }
}
