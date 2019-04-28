import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule } from '@angular/common/http';
import { FileUploadModule } from "ng2-file-upload";
import { UploadComponent } from "./upload.component";

@NgModule({
    imports: [BrowserModule, HttpClientModule, FileUploadModule],
    declarations: [UploadComponent],
    exports: [UploadComponent]
})

export class UploadModule {}
