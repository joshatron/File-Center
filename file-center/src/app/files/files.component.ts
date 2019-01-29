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
    search: string = "";
    fileSort: number = 1;
    sizeSort: number = 0;

    constructor(private repository: FileRepository) {}

    get files(): File[] {
        if(this.fileSort == 1) {
            return this.repository.getFiles().filter(file => file.name.toLowerCase().includes(this.search.toLowerCase())).sort(function(a,b) {
                if(a.name.toLowerCase() < b.name.toLowerCase()) {return -1;}
                if(a.name.toLowerCase() > b.name.toLowerCase()) {return 1;}
                return 0;
            });
        }
        else if(this.fileSort == 2) {
            return this.repository.getFiles().filter(file => file.name.toLowerCase().includes(this.search.toLowerCase())).sort(function(a,b) {
                if(a.name.toLowerCase() > b.name.toLowerCase()) {return -1;}
                if(a.name.toLowerCase() < b.name.toLowerCase()) {return 1;}
                return 0;
            });
        }
        else if(this.sizeSort == 1) {
            return this.repository.getFiles().filter(file => file.name.toLowerCase().includes(this.search.toLowerCase())).sort((a,b) => a.size - b.size);
        }
        else if(this.sizeSort == 2) {
            return this.repository.getFiles().filter(file => file.name.toLowerCase().includes(this.search.toLowerCase())).sort((a,b) => b.size - a.size);
        }
        else {
            return this.repository.getFiles().filter(file => file.name.toLowerCase().includes(this.search.toLowerCase()));
        }
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

    updateSearch(event: any) {
        this.search = event.target.value;
    }

    toggleFileSort() {
        this.sizeSort = 0;
        this.fileSort = (this.fileSort + 1) % 3;
    }

    toggleSizeSort() {
        this.fileSort = 0;
        this.sizeSort = (this.sizeSort + 1) % 3;
    }
}
