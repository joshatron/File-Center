import { Injectable } from "@angular/core";
import { File } from "./file.model";
import { StaticDataSource } from "./static.datasource";

@Injectable()
export class FileRepository {
    private baseFiles: File[] = [];
    private files: File[] = [];
    private currentDir: string[] = [];

    constructor(private dataSource: StaticDataSource) {
        dataSource.getFiles().subscribe(data => this.baseFiles = data);
        this.files = this.baseFiles;
    }

    getFiles(): File[] {
        return this.files;
    }

    getCurrentDir(): string[] {
        return this.currentDir;
    }

    getFile(name: string): File {
        return this.files.find(f => f.name == name);
    }

    moveDownDir(name: string): File[] {
        if(this.getFile(name).type === "directory") {
            this.files = this.getFile(name).files;
            this.currentDir.push(name);
            return this.files;
        }
    }

    moveUpDir(): File[] {
        this.files = this.baseFiles;
        this.currentDir.pop();
        this.currentDir.forEach(name => this.files = this.getFile(name).files);
        return this.files;
    }

    inBaseDir(): boolean {
        return this.currentDir.length == 0;
    }

    toggleSelected() {
        if(this.isAllSelected()) {
            this.files.forEach(file => file.selected = false);
        }
        else {
          this.files.forEach(file => file.selected = true);
        }
    }

    isAllSelected(): boolean {
        return this.files.every(file => file.selected);
    }
}
