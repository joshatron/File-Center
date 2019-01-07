import { Component } from "@angular/core";
import { File } from "../model/file.model";
import { FileRepository } from "../model/file.repository";
import { faDownload, faFolder } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: "files",
    templateUrl: "files.component.html"
})

export class FilesComponent {
    faDownload = faDownload;
    faFolder = faFolder;

    constructor(private repository: FileRepository) {}

    get files(): File[] {
        return this.repository.getFiles();
    }

    changeDir(name: string) {
        this.repository.moveDownDir(name);
    }

    moveUpDir() {
        this.repository.moveUpDir();
    }

    inBaseDir(): boolean {
        return this.repository.inBaseDir();
    }

    getPrettySize(size: number): string {
        if(size >= 1000000000000) {
            return (size / 1000000000000).toFixed(1) + ' TB';
        }
        else if(size >= 1000000000) {
            return (size / 1000000000).toFixed(1) + ' GB';
        }
        else if(size >= 1000000) {
            return (size / 1000000).toFixed(1) + ' MB';
        }
        else if(size >= 1000) {
            return (size / 1000).toFixed(1) + ' KB';
        }
        else {
            return size + ' B';
        }
    }

    getCurrentDir(): string {
        return this.repository.getCurrentDir().reduce((accumulator, current) => accumulator + "/" + current);
    }

    toggleSelected() {
        this.repository.toggleSelected();
    }

    isAllSelected(): boolean {
        return this.repository.isAllSelected();
    }
}
