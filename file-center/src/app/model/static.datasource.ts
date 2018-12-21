import { Injectable } from "@angular/core";
import { File } from "./file.model";
import { Observable, from } from "rxjs";

@Injectable()
export class StaticDataSource {
    private files: File[] = [
        new File("file1.txt", 1300, "file"),
        new File("file2.txt", 5260, "file"),
        new File("file3.txt", 1600000, "file"),
        new File("folder1", 762, "directory"),
    ];

    getFiles(): Observable<File[]> {
        return from([this.files]);
    }
}
