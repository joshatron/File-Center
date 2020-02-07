import { NgModule } from "@angular/core";
import { FileRepository } from "./file.repository";
import { ConfigRepository } from "./config.repository";
import { HttpClientModule } from "@angular/common/http";
import { RestDataSource } from "./rest.datasource";

@NgModule({
    imports: [HttpClientModule],
    providers: [FileRepository, ConfigRepository, RestDataSource]
})

export class ModelModule {}
