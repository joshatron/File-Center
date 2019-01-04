import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FilesModule } from "./files/files.module";

import { AppComponent } from "./app.component";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FilesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
