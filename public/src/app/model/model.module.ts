import { NgModule } from "@angular/core";
import { FileRepository } from "./file.repository";
import { HttpClientModule } from "@angular/common/http";
import { RestDataSource } from "./rest.datasource";

@NgModule({
    imports: [HttpClientModule],
    providers: [FileRepository, RestDataSource]
})

export class ModelModule {}
