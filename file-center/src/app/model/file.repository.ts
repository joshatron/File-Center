import { Injectable } from "@angular/core";
import { File } from "./file.model";
import { StaticDataSource } from "./static.datasource";

@Injectable()
export class FileRepository {
    private files: File[] = [];

    constructor(private dataSource: StaticDataSource) {
        dataSource.getFiles().subscribe(data => this.files = data);
    }

    getFiles(): File[] {
        return this.files;
    }

    getFile(name: string): File {
        return this.files.find(f => f.name == name);
    }
}
