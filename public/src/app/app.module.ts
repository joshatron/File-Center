import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FilesModule } from "./files/files.module";
import { BannerModule } from "./banner/banner.module";

import { AppComponent } from "./app.component";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FilesModule, BannerModule],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule {}
