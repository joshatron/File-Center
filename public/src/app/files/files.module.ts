import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModelModule } from "../model/model.module";
import { FilesComponent } from "./files.component";

@NgModule({
    imports: [ModelModule, BrowserModule, FormsModule, FontAwesomeModule],
    declarations: [FilesComponent],
    exports: [FilesComponent]
})

export class FilesModule {}
