import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { File } from "./file.model";

@Injectable()
export class RestDataSource {
    baseUrl: string;

    constructor(private http: HttpClient) {
        this.baseUrl = `http://${location.hostname}:8080/api/`;
    }

    getFiles(): Observable<File[]> {
        return this.http.get<File[]>(this.baseUrl + "files");
    }
}
