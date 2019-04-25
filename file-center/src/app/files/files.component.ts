import { Component } from "@angular/core";
import { File } from "../model/file.model";
import { FileRepository } from "../model/file.repository";
import { faDownload, faFolder, faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: "files",
    templateUrl: "files.component.html"
})

export class FilesComponent {
    faDownload = faDownload;
    faFolder = faFolder;
    faCaretUp = faCaretUp;
    faCaretDown = faCaretDown;
    baseUrl: string = "http://localhost:8080";
    currentSearch: string = "";
    fileSort: number = 1;
    sizeSort: number = 0;

    constructor(private repository: FileRepository) {}

    get files(): File[] {
        let toReturn = this.repository.getFiles(this.currentSearch);

        if(this.fileSort == 1) {
            toReturn.sort(function(a,b) {
                if(a.name.toLowerCase() < b.name.toLowerCase()) {return -1;}
                if(a.name.toLowerCase() > b.name.toLowerCase()) {return 1;}
                return 0;
            });
        }
        else if(this.fileSort == 2) {
            toReturn.sort(function(a,b) {
                if(a.name.toLowerCase() > b.name.toLowerCase()) {return -1;}
                if(a.name.toLowerCase() < b.name.toLowerCase()) {return 1;}
                return 0;
            });
        }
        else if(this.sizeSort == 1) {
            toReturn.sort((a,b) => a.size - b.size);
        }
        else if(this.sizeSort == 2) {
            toReturn.sort((a,b) => b.size - a.size);
        }

        return toReturn;
    }

    changeDir(name: string) {
        this.repository.moveDownDir(name);
        this.currentSearch = "";
    }

    moveUpDir() {
        this.repository.moveUpDir();
        this.currentSearch = "";
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
        if(this.repository.getCurrentDir().length > 0) {
            return this.repository.getCurrentDir().reduce((accumulator, current) => accumulator + "/" + current);
        }
        else {
            return "";
        }
    }

    toggleSelected() {
        this.repository.toggleSelected(this.currentSearch);
    }

    isAllSelected(): boolean {
        return this.repository.isAllSelected(this.currentSearch);
    }

    updateSearch(event: any) {
        this.currentSearch = event.target.value;
    }

    toggleFileSort() {
        this.sizeSort = 0;
        if(this.fileSort == 1) {
            this.fileSort = 2;
        }
        else {
            this.fileSort = 1;
        }
    }

    toggleSizeSort() {
        this.fileSort = 0;
        if(this.sizeSort == 1) {
            this.sizeSort = 2;
        }
        else {
            this.sizeSort = 1;
        }
    }

    getFullFileName(file: string): string {
        return this.getCurrentDir() + "/" + file;
    }

    getSelectedFiles(): string {
        return JSON.stringify(this.repository.getFiles(this.currentSearch)
            .filter(file => file.selected == true)
            .map(file => {return this.getCurrentDir() + "/" + file.name;}));
    }
}
