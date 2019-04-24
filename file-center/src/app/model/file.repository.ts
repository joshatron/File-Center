import { Injectable } from "@angular/core";
import { File } from "./file.model";
import { RestDataSource } from "./rest.datasource";

@Injectable()
export class FileRepository {
    private baseFiles: File[] = [];
    private files: File[] = [];
    private currentDir: string[] = [];

    constructor(private dataSource: RestDataSource) {
        dataSource.getFiles().subscribe(data => {this.baseFiles = data; this.files = this.baseFiles;});
    }

    getFiles(): File[] {
        return this.files;
    }

    getFiles(search: string): File[] {
        return this.files.filter(file => file.name.toLowerCase().includes(search.toLowerCase()));
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
            this.getFiles().forEach(file => file.selected = false);
        }
        else {
          this.getFiles().forEach(file => file.selected = true);
        }
    }

    toggleSelected(search: string) {
        if(this.isAllSelected(search)) {
            this.getFiles(search).forEach(file => file.selected = false);
        }
        else {
            this.getFiles(search).forEach(file => file.selected = true);
        }
    }

    isAllSelected(): boolean {
        return this.getFiles().every(file => file.selected);
    }

    isAllSelected(search: string): boolean {
        return this.getFiles(search).every(file => file.selected);
    }
}
