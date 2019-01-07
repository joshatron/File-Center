import { Injectable } from "@angular/core";
import { File } from "./file.model";
import { Observable, from } from "rxjs";

@Injectable()
export class StaticDataSource {
    private internalInternalFiles: File[] = [
        new File("subsubfile1.txt", 462, "file", undefined),
    ];

    private internalFiles: File[] = [
        new File("subfile1.txt", 300, "file", undefined),
        new File("subfolder1", 462, "directory", this.internalInternalFiles),
    ];

    private files: File[] = [
        new File("file1.txt", 1300, "file", undefined),
        new File("file2.txt", 5260, "file", undefined),
        new File("file3.txt", 1600000, "file", undefined),
        new File("folder1", 762, "directory", this.internalFiles),
    ];

    getFiles(): Observable<File[]> {
        return from([this.files]);
    }
}
