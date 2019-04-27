import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule } from '@angular/common/http';
import { BannerComponent } from "./banner.component";

@NgModule({
    imports: [BrowserModule, HttpClientModule],
    declarations: [BannerComponent],
    exports: [BannerComponent]
})

export class BannerModule {}
